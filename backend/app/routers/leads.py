import io
import csv
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.models.models import Lead, Account, Opportunity, OpportunityStageHistory
from app.schemas.schemas import LeadCreate, LeadUpdate, LeadResponse, LeadConvertRequest, OpportunityResponse
from app.services.scoring import calculate_lead_score

router = APIRouter(prefix="/api/leads", tags=["Leads"])

@router.get("", response_model=List[LeadResponse])
def get_leads(
    search: Optional[str] = None,
    source: Optional[str] = None,
    industry: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Lead)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Lead.company_name.ilike(search_fmt),
                Lead.contact_name.ilike(search_fmt),
                Lead.email.ilike(search_fmt)
            )
        )
    if source:
        query = query.filter(Lead.lead_source == source)
    if industry:
        query = query.filter(Lead.industry == industry)
    if priority:
        query = query.filter(Lead.priority == priority)
    if status:
        query = query.filter(Lead.qualification_status == status)

    # Sorting
    sort_col = getattr(Lead, sort_by, Lead.created_at)
    if order == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    return query.offset(skip).limit(limit).all()


@router.post("", response_model=LeadResponse)
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    lead_data = lead_in.model_dump()
    score, priority, breakdown, next_action = calculate_lead_score(lead_data)
    
    lead_data["lead_score"] = score
    lead_data["priority"] = priority
    lead_data["scoring_breakdown"] = breakdown
    lead_data["recommended_next_action"] = next_action

    db_lead = Lead(**lead_data)
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


@router.get("/export/csv")
def export_leads_csv(
    source: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Lead)
    if source:
        query = query.filter(Lead.lead_source == source)
    if priority:
        query = query.filter(Lead.priority == priority)
    if status:
        query = query.filter(Lead.qualification_status == status)

    leads = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Company Name", "Contact Name", "Email", "Phone",
        "Industry", "Company Size", "Lead Source", "Required Services",
        "Estimated Monthly Budget", "Purchase Timeline", "Decision Authority",
        "Status", "Score", "Priority", "Recommended Next Action"
    ])

    for l in leads:
        writer.writerow([
            l.id, l.company_name, l.contact_name, l.email, l.phone or "",
            l.industry, l.company_size, l.lead_source, l.required_services,
            f"${l.estimated_monthly_budget:,.2f}", l.purchase_timeline,
            l.decision_maker_authority, l.qualification_status,
            l.lead_score, l.priority, l.recommended_next_action or ""
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cloudsales_leads.csv"}
    )


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(lead_id: int, lead_in: LeadUpdate, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(lead, field, val)

    # Recalculate score based on updated values
    lead_dict = {
        "required_services": lead.required_services,
        "estimated_monthly_budget": lead.estimated_monthly_budget,
        "purchase_timeline": lead.purchase_timeline,
        "decision_maker_authority": lead.decision_maker_authority,
        "company_size": lead.company_size,
        "phone": lead.phone,
        "pain_points": lead.pain_points,
        "current_infra": lead.current_infra
    }
    score, priority, breakdown, next_action = calculate_lead_score(lead_dict)
    lead.lead_score = score
    lead.priority = priority
    lead.scoring_breakdown = breakdown
    lead.recommended_next_action = next_action

    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    db.delete(lead)
    db.commit()
    return {"status": "success", "message": f"Lead {lead_id} successfully deleted"}


@router.post("/{lead_id}/convert")
def convert_lead_to_opportunity(lead_id: int, conv: LeadConvertRequest, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    account_id = None
    if conv.create_account:
        # Check if account exists with this company name
        existing_acc = db.query(Account).filter(Account.company_name == lead.company_name).first()
        if existing_acc:
            account_id = existing_acc.id
        else:
            new_acc = Account(
                company_name=lead.company_name,
                primary_contact=lead.contact_name,
                email=lead.email,
                phone=lead.phone,
                industry=lead.industry,
                company_size=lead.company_size,
                location=lead.location,
                current_services=lead.required_services,
                estimated_contract_value=conv.expected_deal_value,
                sales_owner=lead.sales_owner,
                account_status="Active",
                renewal_status="Up to date",
                health_score=85,
                notes=f"Converted from Lead #{lead.id}"
            )
            db.add(new_acc)
            db.commit()
            db.refresh(new_acc)
            account_id = new_acc.id

    # Create Opportunity
    opp = Opportunity(
        name=conv.opportunity_name,
        lead_id=lead.id,
        account_id=account_id,
        expected_deal_value=conv.expected_deal_value,
        mrr=conv.mrr,
        one_time_value=conv.one_time_value,
        probability=40,
        expected_close_date=conv.expected_close_date,
        stage="Discovery",
        proposed_service=lead.required_services,
        sales_owner=lead.sales_owner,
        next_action="Schedule in-depth technical requirements discovery call",
        notes=lead.notes
    )
    db.add(opp)

    # Update lead status
    lead.qualification_status = "Converted"
    db.commit()
    db.refresh(opp)

    # Log stage history
    db.add(OpportunityStageHistory(
        opportunity_id=opp.id,
        from_stage="New",
        to_stage="Discovery",
        probability=40,
        notes=f"Created upon conversion of Lead #{lead.id}"
    ))
    db.commit()

    return {
        "status": "success",
        "message": f"Lead {lead.company_name} converted successfully to Opportunity #{opp.id}",
        "opportunity_id": opp.id,
        "account_id": account_id
    }
