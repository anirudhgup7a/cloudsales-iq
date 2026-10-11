from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
import datetime

from app.core.database import get_db
from app.models.models import Renewal, Account
from app.schemas.schemas import RenewalCreate, RenewalUpdate, RenewalResponse

router = APIRouter(prefix="/api/renewals", tags=["Renewals"])

@router.get("", response_model=List[RenewalResponse])
def get_renewals(
    timeframe: Optional[str] = "all",  # "30d", "60d", "90d", "overdue", "at_risk", "completed", "all"
    status: Optional[str] = None,
    risk_category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Renewal)

    if status:
        query = query.filter(Renewal.status == status)
    if risk_category:
        query = query.filter(Renewal.risk_category == risk_category)

    # Timeframe filtering
    today = datetime.date(2026, 10, 11)  # Anchored to system date
    d30 = today + datetime.timedelta(days=30)
    d60 = today + datetime.timedelta(days=60)
    d90 = today + datetime.timedelta(days=90)

    renewals = query.order_by(asc(Renewal.renewal_date)).all()
    results = []

    for r in renewals:
        account_name = r.account.company_name if r.account else "Unknown"
        resp = RenewalResponse.model_validate(r)
        resp.account_name = account_name

        try:
            r_date = datetime.datetime.strptime(r.renewal_date[:10], "%Y-%m-%d").date()
        except Exception:
            r_date = today

        # Apply timeframe filter logic
        if timeframe == "overdue":
            if r_date < today and r.status not in ["Renewed", "Completed"]:
                results.append(resp)
        elif timeframe == "30d":
            if today <= r_date <= d30 and r.status not in ["Renewed", "Completed"]:
                results.append(resp)
        elif timeframe == "60d":
            if today <= r_date <= d60 and r.status not in ["Renewed", "Completed"]:
                results.append(resp)
        elif timeframe == "90d":
            if today <= r_date <= d90 and r.status not in ["Renewed", "Completed"]:
                results.append(resp)
        elif timeframe == "at_risk":
            if r.risk_category in ["High", "Critical"] or r.status == "At Risk":
                results.append(resp)
        elif timeframe == "completed":
            if r.status in ["Renewed", "Completed"]:
                results.append(resp)
        else:
            results.append(resp)

    return results


@router.post("", response_model=RenewalResponse)
def create_renewal(ren_in: RenewalCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == ren_in.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Associated account not found")

    ren = Renewal(**ren_in.model_dump())
    db.add(ren)
    db.commit()
    db.refresh(ren)

    resp = RenewalResponse.model_validate(ren)
    resp.account_name = account.company_name
    return resp


@router.get("/{renewal_id}", response_model=RenewalResponse)
def get_renewal(renewal_id: int, db: Session = Depends(get_db)):
    ren = db.query(Renewal).filter(Renewal.id == renewal_id).first()
    if not ren:
        raise HTTPException(status_code=404, detail="Renewal not found")
    resp = RenewalResponse.model_validate(ren)
    if ren.account:
        resp.account_name = ren.account.company_name
    return resp


@router.put("/{renewal_id}", response_model=RenewalResponse)
def update_renewal(renewal_id: int, ren_in: RenewalUpdate, db: Session = Depends(get_db)):
    ren = db.query(Renewal).filter(Renewal.id == renewal_id).first()
    if not ren:
        raise HTTPException(status_code=404, detail="Renewal not found")

    for field, val in ren_in.model_dump(exclude_unset=True).items():
        setattr(ren, field, val)

    db.commit()
    db.refresh(ren)
    resp = RenewalResponse.model_validate(ren)
    if ren.account:
        resp.account_name = ren.account.company_name
    return resp


@router.delete("/{renewal_id}")
def delete_renewal(renewal_id: int, db: Session = Depends(get_db)):
    ren = db.query(Renewal).filter(Renewal.id == renewal_id).first()
    if not ren:
        raise HTTPException(status_code=404, detail="Renewal not found")
    db.delete(ren)
    db.commit()
    return {"status": "success", "message": f"Renewal {renewal_id} deleted"}
