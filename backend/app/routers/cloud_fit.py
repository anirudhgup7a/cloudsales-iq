import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import CloudService, Assessment, Opportunity, OpportunityStageHistory, Account
from app.schemas.schemas import CloudServiceResponse, AssessmentRequest, AssessmentResponse
from app.services.cloud_fit import evaluate_cloud_fit, DEMO_PRESETS

router = APIRouter(prefix="/api/advisor", tags=["Cloud Fit Advisor"])

@router.get("/services", response_model=List[CloudServiceResponse])
def get_cloud_services(db: Session = Depends(get_db)):
    services = db.query(CloudService).filter(CloudService.active == True).all()
    results = []
    for s in services:
        results.append(CloudServiceResponse(
            id=s.id,
            category=s.category,
            name=s.name,
            summary=s.summary,
            typical_use_cases=s.typical_use_cases,
            min_monthly_budget=s.min_monthly_budget,
            key_benefits=json.loads(s.key_benefits) if s.key_benefits else [],
            questions_to_ask=json.loads(s.questions_to_ask) if s.questions_to_ask else [],
            active=s.active
        ))
    return results


@router.get("/presets")
def get_demo_presets():
    """Returns the 3 signature scenarios required by the specification."""
    return DEMO_PRESETS


@router.post("/evaluate", response_model=AssessmentResponse)
def evaluate_assessment(request: AssessmentRequest):
    """
    Evaluates customer requirements and generates transparent,
    consultative cloud recommendations with trade-offs.
    """
    result = evaluate_cloud_fit(request.model_dump())
    return AssessmentResponse(**result)


@router.post("/save")
def save_assessment_and_create_opportunity(
    data: Dict[str, Any],
    create_opportunity: bool = True,
    db: Session = Depends(get_db)
):
    """
    Persists evaluation to database and optionally converts into an Opportunity.
    """
    eval_result = evaluate_cloud_fit(data)

    assessment = Assessment(
        customer_name=eval_result["customer_name"],
        lead_id=data.get("lead_id"),
        account_id=data.get("account_id"),
        industry=eval_result["industry"],
        company_size=eval_result["company_size"],
        existing_infra=eval_result["existing_infra"],
        business_problem=eval_result["business_problem"],
        workload_type=eval_result["workload_type"],
        approx_monthly_budget=eval_result["approx_monthly_budget"],
        data_sensitivity=eval_result["data_sensitivity"],
        expected_scalability=eval_result["expected_scalability"],
        availability_requirements=eval_result["availability_requirements"],
        migration_urgency=eval_result["migration_urgency"],
        preferred_deployment=eval_result["preferred_deployment"],
        recommended_category=eval_result["recommended_category"],
        recommended_services=json.dumps(eval_result["recommended_services"]),
        fit_rationale=eval_result["fit_rationale"],
        business_benefits=json.dumps(eval_result["business_benefits"]),
        assumptions=eval_result["assumptions"],
        trade_offs=eval_result["trade_offs"],
        next_questions=json.dumps(eval_result["next_questions"]),
        missing_info=eval_result["missing_info"],
        estimated_tier=eval_result["estimated_tier"]
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    opportunity_id = None
    if create_opportunity:
        monthly_val = float(eval_result["approx_monthly_budget"] or 2000.0)
        annual_val = monthly_val * 12.0
        opp_name = f"{eval_result['customer_name']} - {eval_result['recommended_category']}"
        
        opp = Opportunity(
            name=opp_name,
            lead_id=data.get("lead_id"),
            account_id=data.get("account_id"),
            expected_deal_value=annual_val,
            mrr=monthly_val,
            one_time_value=round(monthly_val * 0.75, 2),
            probability=50,
            expected_close_date="2026-11-30",
            stage="Qualified",
            proposed_service=", ".join(eval_result["recommended_services"][:2]),
            next_action="Schedule consultative proposal presentation and technical review",
            notes=f"Generated via Cloud Fit Advisor (Assessment #{assessment.id})"
        )
        db.add(opp)
        db.commit()
        db.refresh(opp)
        opportunity_id = opp.id

        db.add(OpportunityStageHistory(
            opportunity_id=opp.id,
            from_stage="New",
            to_stage="Qualified",
            probability=50,
            notes="Created from Cloud Fit Advisor Assessment"
        ))
        db.commit()

    return {
        "status": "success",
        "message": f"Cloud Fit Assessment #{assessment.id} saved successfully.",
        "assessment_id": assessment.id,
        "opportunity_id": opportunity_id,
        "recommendation": eval_result
    }


@router.get("/history")
def get_assessment_history(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).order_by(desc(Assessment.created_at)).all()
    out = []
    for a in assessments:
        out.append({
            "id": a.id,
            "customer_name": a.customer_name,
            "industry": a.industry,
            "workload_type": a.workload_type,
            "recommended_category": a.recommended_category,
            "recommended_services": json.loads(a.recommended_services) if a.recommended_services else [],
            "approx_monthly_budget": a.approx_monthly_budget,
            "estimated_tier": a.estimated_tier,
            "created_at": a.created_at
        })
    return out
