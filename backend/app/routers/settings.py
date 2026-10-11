from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import SalesTarget, Lead, Opportunity, Account, Activity
from app.schemas.schemas import SalesTargetResponse, SalesTargetUpdate
from app.services.seeding import seed_database

router = APIRouter(prefix="/api/settings", tags=["Settings & Demo Management"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for service monitoring and deployment."""
    try:
        leads_count = db.query(Lead).count()
        opps_count = db.query(Opportunity).count()
        accounts_count = db.query(Account).count()
        return {
            "status": "healthy",
            "service": "CloudSales IQ API",
            "environment": "production-ready",
            "database": "connected",
            "counts": {
                "leads": leads_count,
                "opportunities": opps_count,
                "accounts": accounts_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check failed: {str(e)}")


@router.get("/target", response_model=SalesTargetResponse)
def get_sales_target(db: Session = Depends(get_db)):
    target = db.query(SalesTarget).filter(SalesTarget.period == "Current Month").first()
    if not target:
        target = SalesTarget(period="Current Month", target_amount=150000.0, fiscal_quarter="Q4")
        db.add(target)
        db.commit()
        db.refresh(target)
    return target


@router.put("/target", response_model=SalesTargetResponse)
def update_sales_target(update_in: SalesTargetUpdate, db: Session = Depends(get_db)):
    target = db.query(SalesTarget).filter(SalesTarget.period == "Current Month").first()
    if not target:
        target = SalesTarget(period="Current Month", target_amount=update_in.target_amount, fiscal_quarter=update_in.fiscal_quarter or "Q4")
        db.add(target)
    else:
        target.target_amount = update_in.target_amount
        if update_in.fiscal_quarter:
            target.fiscal_quarter = update_in.fiscal_quarter
    db.commit()
    db.refresh(target)
    return target


@router.post("/reset-demo")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Safely resets the demonstration data to the baseline realistic records.
    Prevents duplicate entries and ensures predictable state.
    """
    result = seed_database(db, force=True)
    return result
