from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc

from app.core.database import get_db
from app.models.models import Activity
from app.schemas.schemas import ActivityCreate, ActivityUpdate, ActivityResponse

router = APIRouter(prefix="/api/activities", tags=["Activities"])

SCRIPTS = {
    "call_scripts": [
        {
            "title": "Cold / Warm Discovery Call: Accounting Firm Hosting",
            "persona": "Managing Partner / CPA",
            "opening": "Hi [Contact Name], this is [Your Name] from the Cloud Solutions team. I noticed your firm recently expanded its tax and advisory practice. How are your accountants currently accessing QuickBooks and Drake during peak tax season?",
            "value_prop": "We help leading accounting practices transition their tax software and company files into a dedicated, SOC-2 compliant private cloud. Partners see zero crashes during April filing surges, and remote accountants can access desktops securely from any laptop without clumsy VPN disconnects.",
            "qualification_questions": [
                "How many CPAs and seasonal staff need concurrent access to your accounting software?",
                "What's your current backup routine for company files—is it manual or automated offsite snapshots?",
                "Have you experienced any latency or downtime during past tax seasons?"
            ],
            "close_to_next_step": "Would you be open to a 20-minute remote desktop walkthrough this Thursday at 10 AM to see how other firms run their entire tax suite in the cloud?"
        },
        {
            "title": "AWS Migration Discovery Call: SaaS / FinTech Founder",
            "persona": "CTO / Head of Engineering",
            "opening": "Hi [Contact Name], this is [Your Name] from CloudSales IQ. I saw that [Company Name] recently rolled out your new platform features. How is your current infrastructure handling database write concurrency and traffic surges?",
            "value_prop": "We partner with high-growth SaaS engineering teams to design Well-Architected AWS environments—migrating monolithic databases to Multi-AZ Amazon Aurora and containerizing services onto auto-scaling clusters so your engineers spend time building features rather than rebooting servers.",
            "qualification_questions": [
                "What is your target uptime SLA, and do you have automated failover in place if your primary host drops?",
                "Are your compliance auditors asking for SOC 2 or PCI-DSS Level 1 security architecture?",
                "What is your current monthly cloud spend, and have you benchmarked reserved capacity savings?"
            ],
            "close_to_next_step": "Can we schedule a 30-minute cloud assessment with one of our Principal Cloud Architects next Tuesday to review your architectural diagram and potential TCO savings?"
        },
        {
            "title": "High-Performance AI / GPU Compute Qualification Call",
            "persona": "VP of AI / Lead Machine Learning Engineer",
            "opening": "Hi [Contact Name], this is [Your Name]. I follow your team's work in generative model development. Are your engineers currently struggling with GPU spot instance preemptions or multi-week waitlists from cloud providers?",
            "value_prop": "We provide reserved, high-density NVIDIA A100 and H100 clusters with low-latency InfiniBand interconnects and fast NVMe scratch storage. Your training runs never get interrupted, and you pay transparent flat monthly rates with zero hidden network egress charges.",
            "qualification_questions": [
                "Which GPU architectures (A100, H100, L40S) and VRAM memory limits does your model training require?",
                "How many days does a standard training epoch run, and what is the cost when a spot instance is preempted?",
                "Do you need managed Kubernetes scheduling or bare-metal cluster access?"
            ],
            "close_to_next_step": "Let's spin up a sandbox benchmarking instance this week so your team can test throughput against your baseline. Does Wednesday afternoon work?"
        }
    ],
    "email_templates": [
        {
            "title": "Cold Outreach: Accounting Tax Season Readiness",
            "subject": "Quick question regarding [Company Name]'s tax software hosting",
            "body": "Hi [Contact Name],\n\nWith tax season approaching, many accounting partners we speak with are worried about on-premise server crashes, slow remote VPN connections, and ransomware vulnerabilities targeting client SSNs.\n\nWe provide dedicated, SOC-2 certified cloud hosting for QuickBooks Enterprise, Drake, and Lacerte—allowing your team to work seamlessly from anywhere with automated nightly snapshot backups.\n\nWould you have 10 minutes this week for a brief call to see if our managed cloud is a fit for [Company Name]?\n\nBest regards,\n[Your Name]\nCloud Solutions Specialist"
        },
        {
            "title": "Post-Discovery Follow-Up: AWS Cloud Modernization",
            "subject": "Cloud Assessment Summary & Next Steps for [Company Name]",
            "body": "Hi [Contact Name],\n\nThank you for taking the time to speak with me today about [Company Name]'s infrastructure roadmap.\n\nBased on our conversation, our Cloud Fit Advisor recommended an AWS Modernization path focused on:\n1. Transitioning your monolithic database to Amazon Aurora Multi-AZ for high availability.\n2. Containerizing services on AWS to achieve automated elasticity during traffic spikes.\n3. Establishing an encrypted landing zone aligned with SOC 2 compliance standards.\n\nI have attached our preliminary architectural scope. When would be a good time next week to review this with your lead architect?\n\nBest regards,\n[Your Name]"
        },
        {
            "title": "Contract Renewal & Executive Check-in",
            "subject": "Upcoming contract renewal & QBR for [Company Name]",
            "body": "Hi [Contact Name],\n\nI wanted to reach out ahead of your upcoming contract renewal on [Renewal Date]. Over the past year, your infrastructure maintained [99.98%] uptime.\n\nWe would love to schedule a 20-minute Quarterly Business Review to ensure your current sizing meets your upcoming growth plans, and share our multi-year renewal options which include preferred pricing locks and complementary backup retention.\n\nDoes next Tuesday at 2:00 PM work for an executive check-in?\n\nWarm regards,\n[Your Name]"
        }
    ]
}

@router.get("", response_model=List[ActivityResponse])
def get_activities(
    activity_type: Optional[str] = None,
    status: Optional[str] = None,
    related_type: Optional[str] = None,
    related_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Activity)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    if status:
        query = query.filter(Activity.status == status)
    if related_type:
        query = query.filter(Activity.related_type == related_type)
    if related_id:
        query = query.filter(Activity.related_id == related_id)

    return query.order_by(asc(Activity.due_date), desc(Activity.created_at)).all()


@router.get("/scripts")
def get_sales_scripts():
    """Provides ready-to-use phone scripts and email templates for B2B cloud sales."""
    return SCRIPTS


@router.post("", response_model=ActivityResponse)
def create_activity(act_in: ActivityCreate, db: Session = Depends(get_db)):
    act = Activity(**act_in.model_dump())
    db.add(act)
    db.commit()
    db.refresh(act)
    return act


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return act


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, act_in: ActivityUpdate, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")

    for field, val in act_in.model_dump(exclude_unset=True).items():
        setattr(act, field, val)

    db.commit()
    db.refresh(act)
    return act


@router.patch("/{activity_id}/complete", response_model=ActivityResponse)
def complete_activity(
    activity_id: int,
    outcome: Optional[str] = "Completed successfully",
    next_action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")

    act.status = "Completed"
    act.outcome = outcome
    if next_action:
        act.next_action = next_action

    db.commit()
    db.refresh(act)
    return act


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    act = db.query(Activity).filter(Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(act)
    db.commit()
    return {"status": "success", "message": f"Activity {activity_id} deleted"}
