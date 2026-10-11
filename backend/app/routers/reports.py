import io
import csv
import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import Lead, Account, Opportunity, Activity, Renewal, SalesTarget, CloudService
from app.schemas.schemas import DashboardKPIs

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/dashboard")
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Returns live, calculated database metrics for the executive overview dashboard.
    Every number is computed directly from database tables.
    """
    # 1. Targets
    target_rec = db.query(SalesTarget).filter(SalesTarget.period == "Current Month").first()
    monthly_target = target_rec.target_amount if target_rec else 150000.0

    # 2. Leads counts
    total_leads = db.query(Lead).count()
    qualified_leads = db.query(Lead).filter(Lead.qualification_status == "Qualified").count()

    # 3. Opportunities calculations
    all_opps = db.query(Opportunity).all()
    open_stages = ["New", "Contacted", "Discovery", "Qualified", "Solution Proposed", "Negotiation"]

    open_pipeline_val = 0.0
    weighted_forecast_val = 0.0
    closed_won_val = 0.0
    open_opps_count = 0

    stage_distribution: Dict[str, Dict[str, Any]] = {
        "New": {"count": 0, "value": 0.0},
        "Contacted": {"count": 0, "value": 0.0},
        "Discovery": {"count": 0, "value": 0.0},
        "Qualified": {"count": 0, "value": 0.0},
        "Solution Proposed": {"count": 0, "value": 0.0},
        "Negotiation": {"count": 0, "value": 0.0},
        "Closed Won": {"count": 0, "value": 0.0},
        "Closed Lost": {"count": 0, "value": 0.0}
    }

    service_pipeline: Dict[str, float] = {}

    for o in all_opps:
        deal_val = float(o.expected_deal_value or 0.0)
        prob = int(o.probability or 0)
        st = o.stage

        if st in stage_distribution:
            stage_distribution[st]["count"] += 1
            stage_distribution[st]["value"] += deal_val

        if st in open_stages:
            open_opps_count += 1
            open_pipeline_val += deal_val
            weighted_forecast_val += deal_val * (prob / 100.0)

            # Map to category
            svc_name = o.proposed_service or "General Cloud"
            service_pipeline[svc_name] = service_pipeline.get(svc_name, 0.0) + deal_val
        elif st == "Closed Won":
            closed_won_val += deal_val

    target_achievement_pct = round((closed_won_val / monthly_target) * 100.0, 1) if monthly_target > 0 else 0.0

    # 4. Activities metrics
    upcoming_followups = db.query(Activity).filter(Activity.status == "Pending").count()
    overdue_followups = db.query(Activity).filter(Activity.status == "Overdue").count()
    recent_activities = db.query(Activity).order_by(desc(Activity.created_at)).limit(6).all()

    # 5. Renewals & Accounts
    today = datetime.date(2026, 10, 11)
    d30 = today + datetime.timedelta(days=30)
    all_renewals = db.query(Renewal).all()
    renewals_30d = 0
    for r in all_renewals:
        try:
            r_d = datetime.datetime.strptime(r.renewal_date[:10], "%Y-%m-%d").date()
            if today <= r_d <= d30 and r.status not in ["Renewed", "Completed"]:
                renewals_30d += 1
        except Exception:
            pass

    at_risk_accounts = db.query(Account).filter(Account.account_status == "At Risk").all()
    at_risk_count = len(at_risk_accounts)

    # 6. Lead Source Distribution
    all_leads = db.query(Lead).all()
    source_counts: Dict[str, int] = {}
    for l in all_leads:
        src = l.lead_source or "Other"
        source_counts[src] = source_counts.get(src, 0) + 1

    # 7. High Priority Leads
    high_priority_leads = db.query(Lead).filter(Lead.priority == "High").order_by(desc(Lead.lead_score)).limit(5).all()

    # 8. Deals needing immediate attention (in negotiation or closing within 15 days)
    urgent_deals = [o for o in all_opps if o.stage in ["Negotiation", "Solution Proposed"]]

    return {
        "kpis": {
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "open_opportunities": open_opps_count,
            "open_pipeline_value": round(open_pipeline_val, 2),
            "weighted_forecast_revenue": round(weighted_forecast_val, 2),
            "closed_won_revenue": round(closed_won_val, 2),
            "monthly_sales_target": monthly_target,
            "target_achievement_pct": target_achievement_pct,
            "upcoming_followups_count": upcoming_followups,
            "overdue_followups_count": overdue_followups,
            "renewals_due_30d_count": renewals_30d,
            "at_risk_accounts_count": at_risk_count
        },
        "stage_distribution": [
            {"stage": k, "count": v["count"], "value": round(v["value"], 2)}
            for k, v in stage_distribution.items()
        ],
        "service_pipeline": [
            {"service": k, "value": round(v, 2)}
            for k, v in service_pipeline.items()
        ],
        "lead_sources": [
            {"source": k, "count": v}
            for k, v in source_counts.items()
        ],
        "recent_activities": [
            {
                "id": a.id,
                "title": a.related_title,
                "activity_type": a.activity_type,
                "subject": a.subject,
                "status": a.status,
                "date_time": a.date_time,
                "outcome": a.outcome
            }
            for a in recent_activities
        ],
        "high_priority_leads": [
            {
                "id": l.id,
                "company_name": l.company_name,
                "contact_name": l.contact_name,
                "score": l.lead_score,
                "required_services": l.required_services,
                "budget": l.estimated_monthly_budget,
                "timeline": l.purchase_timeline
            }
            for l in high_priority_leads
        ],
        "at_risk_accounts": [
            {
                "id": acc.id,
                "company_name": acc.company_name,
                "health_score": acc.health_score,
                "renewal_status": acc.renewal_status,
                "contract_val": acc.estimated_contract_value,
                "notes": acc.notes
            }
            for acc in at_risk_accounts
        ],
        "urgent_deals": [
            {
                "id": o.id,
                "name": o.name,
                "stage": o.stage,
                "deal_value": o.expected_deal_value,
                "probability": o.probability,
                "expected_close_date": o.expected_close_date,
                "next_action": o.next_action
            }
            for o in urgent_deals[:5]
        ]
    }


@router.get("/analytics")
def get_detailed_analytics(db: Session = Depends(get_db)):
    """
    Computes rigorous sales funnel analytics:
    - Lead-to-qualified rate
    - Qualified-to-opportunity conversion rate
    - Opportunity win rate
    - Average deal size
    - Revenue breakdown by source & service
    - Follow-up completion rate
    """
    leads = db.query(Lead).all()
    opps = db.query(Opportunity).all()
    acts = db.query(Activity).all()

    total_leads = len(leads)
    qualified_leads = sum(1 for l in leads if l.qualification_status in ["Qualified", "Converted"])
    converted_leads = sum(1 for l in leads if l.qualification_status == "Converted")

    lead_to_qualified_pct = round((qualified_leads / total_leads * 100.0), 1) if total_leads > 0 else 0.0
    qualified_to_opp_pct = round((converted_leads / qualified_leads * 100.0), 1) if qualified_leads > 0 else 0.0

    closed_won_opps = [o for o in opps if o.stage == "Closed Won"]
    closed_lost_opps = [o for o in opps if o.stage == "Closed Lost"]
    total_closed = len(closed_won_opps) + len(closed_lost_opps)

    win_rate_pct = round((len(closed_won_opps) / total_closed * 100.0), 1) if total_closed > 0 else 0.0

    open_opps = [o for o in opps if o.stage not in ["Closed Won", "Closed Lost"]]
    avg_deal_size = round(sum(o.expected_deal_value for o in opps) / len(opps), 2) if opps else 0.0
    avg_won_deal_size = round(sum(o.expected_deal_value for o in closed_won_opps) / len(closed_won_opps), 2) if closed_won_opps else 0.0

    # Activity completion
    total_acts = len(acts)
    completed_acts = sum(1 for a in acts if a.status == "Completed")
    activity_completion_pct = round((completed_acts / total_acts * 100.0), 1) if total_acts > 0 else 0.0

    # Revenue by Lead Source
    source_revenue: Dict[str, float] = {}
    for o in opps:
        src = o.lead.lead_source if o.lead else "Existing Client / Direct"
        source_revenue[src] = source_revenue.get(src, 0.0) + o.expected_deal_value

    # Revenue by Stage
    stage_revenue: Dict[str, float] = {}
    for o in opps:
        stage_revenue[o.stage] = stage_revenue.get(o.stage, 0.0) + o.expected_deal_value

    return {
        "conversion_funnel": {
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "converted_leads": converted_leads,
            "lead_to_qualified_pct": lead_to_qualified_pct,
            "qualified_to_opp_pct": qualified_to_opp_pct,
            "opportunity_win_rate_pct": win_rate_pct,
            "closed_won_count": len(closed_won_opps),
            "closed_lost_count": len(closed_lost_opps)
        },
        "deal_metrics": {
            "average_deal_size": avg_deal_size,
            "average_won_deal_size": avg_won_deal_size,
            "total_pipeline_deals": len(opps),
            "open_deals_count": len(open_opps)
        },
        "activity_metrics": {
            "total_activities": total_acts,
            "completed_activities": completed_acts,
            "completion_rate_pct": activity_completion_pct
        },
        "revenue_by_source": [
            {"source": k, "revenue": round(v, 2)}
            for k, v in source_revenue.items()
        ],
        "revenue_by_stage": [
            {"stage": k, "revenue": round(v, 2)}
            for k, v in stage_revenue.items()
        ]
    }


@router.get("/export/csv")
def export_reports_csv(metric: str = "pipeline", db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)

    if metric == "pipeline":
        writer.writerow(["Opportunity Name", "Stage", "Deal Value", "MRR", "One-Time Value", "Probability", "Close Date", "Service"])
        for o in db.query(Opportunity).all():
            writer.writerow([o.name, o.stage, f"${o.expected_deal_value:,.2f}", f"${o.mrr:,.2f}", f"${o.one_time_value:,.2f}", f"{o.probability}%", o.expected_close_date, o.proposed_service])
    elif metric == "accounts":
        writer.writerow(["Company Name", "Industry", "Annual Value", "Health Score", "Status", "Renewal Status", "Primary Contact"])
        for a in db.query(Account).all():
            writer.writerow([a.company_name, a.industry, f"${a.estimated_contract_value:,.2f}", a.health_score, a.account_status, a.renewal_status, a.primary_contact])
    else:
        writer.writerow(["Activity ID", "Related Title", "Type", "Subject", "Status", "Due Date", "Outcome"])
        for act in db.query(Activity).all():
            writer.writerow([act.id, act.related_title, act.activity_type, act.subject, act.status, act.due_date, act.outcome or ""])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=cloudsales_{metric}_report.csv"}
    )
