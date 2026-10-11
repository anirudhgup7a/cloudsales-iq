from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.core.database import get_db
from app.models.models import Opportunity, OpportunityStageHistory, Account
from app.schemas.schemas import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse, OpportunityStageUpdate
)

router = APIRouter(prefix="/api/opportunities", tags=["Opportunities"])

STAGE_PROBABILITIES = {
    "New": 10,
    "Contacted": 20,
    "Discovery": 35,
    "Qualified": 50,
    "Solution Proposed": 65,
    "Negotiation": 80,
    "Closed Won": 100,
    "Closed Lost": 0
}

@router.get("", response_model=List[OpportunityResponse])
def get_opportunities(
    stage: Optional[str] = None,
    sales_owner: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)

    if stage:
        query = query.filter(Opportunity.stage == stage)
    if sales_owner:
        query = query.filter(Opportunity.sales_owner == sales_owner)
    if search:
        query = query.filter(Opportunity.name.ilike(f"%{search}%"))

    opps = query.order_by(desc(Opportunity.created_at)).all()
    results = []
    for o in opps:
        resp = OpportunityResponse.model_validate(o)
        if o.account:
            resp.account_name = o.account.company_name
        results.append(resp)
    return results


@router.get("/pipeline/summary")
def get_pipeline_summary(db: Session = Depends(get_db)):
    """
    Calculates open pipeline value, weighted forecast, closed-won revenue,
    and stage-by-stage distribution from real database records.
    Closed-won and closed-lost are excluded from open pipeline.
    """
    all_opps = db.query(Opportunity).all()

    open_stages = ["New", "Contacted", "Discovery", "Qualified", "Solution Proposed", "Negotiation"]

    open_pipeline_val = 0.0
    weighted_forecast_val = 0.0
    closed_won_val = 0.0
    closed_lost_val = 0.0
    open_count = 0

    stage_counts = {st: 0 for st in STAGE_PROBABILITIES.keys()}
    stage_values = {st: 0.0 for st in STAGE_PROBABILITIES.keys()}

    for o in all_opps:
        stage = o.stage
        deal_val = float(o.expected_deal_value or 0.0)
        prob = int(o.probability or 0)

        if stage in stage_counts:
            stage_counts[stage] += 1
            stage_values[stage] += deal_val

        if stage in open_stages:
            open_count += 1
            open_pipeline_val += deal_val
            weighted_forecast_val += deal_val * (prob / 100.0)
        elif stage == "Closed Won":
            closed_won_val += deal_val
        elif stage == "Closed Lost":
            closed_lost_val += deal_val

    # Construct stage breakdown list
    stage_breakdown = []
    for st in STAGE_PROBABILITIES.keys():
        stage_breakdown.append({
            "stage": st,
            "count": stage_counts[st],
            "total_value": stage_values[st],
            "default_probability": STAGE_PROBABILITIES[st]
        })

    return {
        "open_pipeline_value": round(open_pipeline_val, 2),
        "weighted_forecast_revenue": round(weighted_forecast_val, 2),
        "closed_won_revenue": round(closed_won_val, 2),
        "closed_lost_revenue": round(closed_lost_val, 2),
        "open_opportunities_count": open_count,
        "total_opportunities_count": len(all_opps),
        "stage_breakdown": stage_breakdown
    }


@router.post("", response_model=OpportunityResponse)
def create_opportunity(opp_in: OpportunityCreate, db: Session = Depends(get_db)):
    data = opp_in.model_dump()
    if data["stage"] in STAGE_PROBABILITIES and data.get("probability") == 20:
        data["probability"] = STAGE_PROBABILITIES[data["stage"]]

    opp = Opportunity(**data)
    db.add(opp)
    db.commit()
    db.refresh(opp)

    # Log initial stage
    db.add(OpportunityStageHistory(
        opportunity_id=opp.id,
        from_stage="Created",
        to_stage=opp.stage,
        probability=opp.probability,
        notes="Opportunity created"
    ))
    db.commit()

    resp = OpportunityResponse.model_validate(opp)
    if opp.account:
        resp.account_name = opp.account.company_name
    return resp


@router.get("/{opp_id}", response_model=OpportunityResponse)
def get_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    resp = OpportunityResponse.model_validate(opp)
    if opp.account:
        resp.account_name = opp.account.company_name
    return resp


@router.put("/{opp_id}", response_model=OpportunityResponse)
def update_opportunity(opp_id: int, opp_in: OpportunityUpdate, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    old_stage = opp.stage
    update_data = opp_in.model_dump(exclude_unset=True)

    for field, val in update_data.items():
        setattr(opp, field, val)

    if opp_in.stage and opp_in.stage != old_stage:
        # Default probability if not explicitly provided
        if opp_in.probability is None and opp.stage in STAGE_PROBABILITIES:
            opp.probability = STAGE_PROBABILITIES[opp.stage]
        db.add(OpportunityStageHistory(
            opportunity_id=opp.id,
            from_stage=old_stage,
            to_stage=opp.stage,
            probability=opp.probability,
            notes=opp.win_loss_reason or "Stage updated"
        ))

    db.commit()
    db.refresh(opp)
    resp = OpportunityResponse.model_validate(opp)
    if opp.account:
        resp.account_name = opp.account.company_name
    return resp


@router.patch("/{opp_id}/stage", response_model=OpportunityResponse)
def update_opportunity_stage(opp_id: int, stage_in: OpportunityStageUpdate, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    old_stage = opp.stage
    opp.stage = stage_in.stage

    if stage_in.probability is not None:
        opp.probability = stage_in.probability
    elif stage_in.stage in STAGE_PROBABILITIES:
        opp.probability = STAGE_PROBABILITIES[stage_in.stage]

    if stage_in.win_loss_reason:
        opp.win_loss_reason = stage_in.win_loss_reason

    db.add(OpportunityStageHistory(
        opportunity_id=opp.id,
        from_stage=old_stage,
        to_stage=opp.stage,
        probability=opp.probability,
        notes=stage_in.notes or stage_in.win_loss_reason or f"Moved from {old_stage} to {opp.stage}"
    ))

    db.commit()
    db.refresh(opp)
    resp = OpportunityResponse.model_validate(opp)
    if opp.account:
        resp.account_name = opp.account.company_name
    return resp


@router.delete("/{opp_id}")
def delete_opportunity(opp_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    db.delete(opp)
    db.commit()
    return {"status": "success", "message": f"Opportunity {opp_id} deleted"}
