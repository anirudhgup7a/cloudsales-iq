from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.core.database import get_db
from app.models.models import Account, Opportunity, Activity, Renewal
from app.schemas.schemas import AccountCreate, AccountUpdate, AccountResponse
from app.services.account_health import calculate_account_health

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])

@router.get("", response_model=List[AccountResponse])
def get_accounts(
    search: Optional[str] = None,
    status: Optional[str] = None,
    renewal_status: Optional[str] = None,
    sort_by: str = "health_score",
    order: str = "asc",
    db: Session = Depends(get_db)
):
    query = db.query(Account)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Account.company_name.ilike(search_fmt),
                Account.primary_contact.ilike(search_fmt),
                Account.industry.ilike(search_fmt)
            )
        )
    if status:
        query = query.filter(Account.account_status == status)
    if renewal_status:
        query = query.filter(Account.renewal_status == renewal_status)

    sort_col = getattr(Account, sort_by, Account.health_score)
    if order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(sort_col)

    return query.all()


@router.post("", response_model=AccountResponse)
def create_account(acc_in: AccountCreate, db: Session = Depends(get_db)):
    data = acc_in.model_dump()
    score, status_label, breakdown, expansion_advice = calculate_account_health(data)
    data["health_score"] = score
    data["health_breakdown"] = breakdown
    if not data.get("expansion_opportunities"):
        data["expansion_opportunities"] = expansion_advice

    acc = Account(**data)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


@router.get("/{account_id}")
def get_account_detail(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    opps = db.query(Opportunity).filter(Opportunity.account_id == account_id).all()
    acts = db.query(Activity).filter(Activity.related_type == "account", Activity.related_id == account_id).all()
    renewals = db.query(Renewal).filter(Renewal.account_id == account_id).all()

    return {
        "account": AccountResponse.model_validate(acc),
        "opportunities": [
            {
                "id": o.id,
                "name": o.name,
                "stage": o.stage,
                "expected_deal_value": o.expected_deal_value,
                "probability": o.probability,
                "expected_close_date": o.expected_close_date
            }
            for o in opps
        ],
        "activities": [
            {
                "id": a.id,
                "activity_type": a.activity_type,
                "subject": a.subject,
                "status": a.status,
                "date_time": a.date_time,
                "due_date": a.due_date
            }
            for a in acts
        ],
        "renewals": [
            {
                "id": r.id,
                "contract_name": r.contract_name,
                "renewal_date": r.renewal_date,
                "estimated_value": r.estimated_value,
                "status": r.status,
                "risk_category": r.risk_category
            }
            for r in renewals
        ]
    }


@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, acc_in: AccountUpdate, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    for field, val in acc_in.model_dump(exclude_unset=True).items():
        setattr(acc, field, val)

    score, status_label, breakdown, advice = calculate_account_health({
        "last_contacted_date": acc.last_contacted_date,
        "account_status": acc.account_status,
        "renewal_status": acc.renewal_status,
        "current_services": acc.current_services,
        "estimated_contract_value": acc.estimated_contract_value
    })
    acc.health_score = score
    acc.health_breakdown = breakdown

    db.commit()
    db.refresh(acc)
    return acc


@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(acc)
    db.commit()
    return {"status": "success", "message": f"Account {account_id} deleted"}
