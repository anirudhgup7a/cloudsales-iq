import io
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.models import Proposal, Opportunity, Lead, Account
from app.schemas.schemas import ProposalCreate, ProposalUpdate, ProposalResponse

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

router = APIRouter(prefix="/api/proposals", tags=["Proposals"])

@router.get("", response_model=List[ProposalResponse])
def get_proposals(
    status: Optional[str] = None,
    customer: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Proposal)
    if status:
        query = query.filter(Proposal.status == status)
    if customer:
        query = query.filter(Proposal.customer_name.ilike(f"%{customer}%"))
    return query.order_by(desc(Proposal.created_at)).all()


@router.post("", response_model=ProposalResponse)
def create_proposal(prop_in: ProposalCreate, db: Session = Depends(get_db)):
    data = prop_in.model_dump()
    count = db.query(Proposal).count() + 1
    year = datetime.datetime.utcnow().year
    reference = f"CSP-{year}-{count:03d}"

    data["reference"] = reference
    if not data.get("disclaimer"):
        data["disclaimer"] = "CloudSales IQ Educational Portfolio Demo: All sample pricing is illustrative demonstration data and requires technical and commercial validation."

    prop = Proposal(**data)
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.get("/{prop_id}", response_model=ProposalResponse)
def get_proposal(prop_id: int, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return prop


@router.put("/{prop_id}", response_model=ProposalResponse)
def update_proposal(prop_id: int, prop_in: ProposalUpdate, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    for field, val in prop_in.model_dump(exclude_unset=True).items():
        setattr(prop, field, val)

    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{prop_id}")
def delete_proposal(prop_id: int, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
    db.delete(prop)
    db.commit()
    return {"status": "success", "message": f"Proposal {prop_id} deleted"}


@router.get("/{prop_id}/pdf")
def download_proposal_pdf(prop_id: int, db: Session = Depends(get_db)):
    prop = db.query(Proposal).filter(Proposal.id == prop_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=12
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )
    bold_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#94a3b8"),
        alignment=1  # Centered
    )

    elements = []

    # Header
    elements.append(Paragraph("CLOUDSALES IQ — TECHNICAL PROPOSAL", title_style))
    elements.append(Paragraph(f"Proposal Reference: <b>{prop.reference}</b> | Status: <b>{prop.status}</b> | Valid Until: <b>{prop.expiry_date}</b>", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=14))

    # Client Meta Box
    client_info = [
        [
            Paragraph("<b>Client Organization:</b>", body_style),
            Paragraph(prop.customer_name, bold_style),
            Paragraph("<b>Created Date:</b>", body_style),
            Paragraph(str(prop.created_at.strftime("%Y-%m-%d")), body_style)
        ],
        [
            Paragraph("<b>Primary Contact:</b>", body_style),
            Paragraph(prop.contact_name, body_style),
            Paragraph("<b>Term Duration:</b>", body_style),
            Paragraph(f"{prop.contract_duration_months} Months", body_style)
        ],
        [
            Paragraph("<b>Contact Email:</b>", body_style),
            Paragraph(prop.contact_email, body_style),
            Paragraph("<b>Sales Specialist:</b>", body_style),
            Paragraph("Priya Sharma", body_style)
        ]
    ]
    client_table = Table(client_info, colWidths=[110, 160, 100, 160])
    client_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 14))

    # Proposed Solution & Services
    elements.append(Paragraph("1. Recommended Cloud Solution", heading_style))
    elements.append(Paragraph(f"<b>Proposed Offerings:</b> {prop.recommended_services}", body_style))
    elements.append(Spacer(1, 8))

    # Scope & Assumptions
    elements.append(Paragraph("2. Scope of Work & Architectural Assumptions", heading_style))
    elements.append(Paragraph(prop.scope_and_assumptions, body_style))
    elements.append(Spacer(1, 8))

    # Business Benefits
    elements.append(Paragraph("3. Projected Business & Operational Benefits", heading_style))
    elements.append(Paragraph(prop.business_benefits, body_style))
    elements.append(Spacer(1, 10))

    # Commercial Pricing Table (One-time vs Recurring clearly distinguished)
    elements.append(Paragraph("4. Commercial Investment Summary", heading_style))
    annual_mrr = prop.recurring_monthly_charges * 12.0
    total_term_val = prop.one_time_charges + (prop.recurring_monthly_charges * prop.contract_duration_months)

    pricing_data = [
        [Paragraph("<b>Charge Component</b>", bold_style), Paragraph("<b>Billing Frequency</b>", bold_style), Paragraph("<b>Amount (USD)</b>", bold_style)],
        [Paragraph("Setup, Migration & Onboarding Fee", body_style), Paragraph("One-time (Due at signing)", body_style), Paragraph(f"${prop.one_time_charges:,.2f}", bold_style)],
        [Paragraph("Managed Cloud Services & Hosting", body_style), Paragraph("Monthly Recurring (MRR)", body_style), Paragraph(f"${prop.recurring_monthly_charges:,.2f} / month", bold_style)],
        [Paragraph("Annualized Recurring Run-Rate (ARR)", body_style), Paragraph("Annualized equivalent", body_style), Paragraph(f"${annual_mrr:,.2f} / year", body_style)],
        [Paragraph("<b>Estimated Total Term Value</b>", bold_style), Paragraph(f"<b>{prop.contract_duration_months} Month Term Commitment</b>", bold_style), Paragraph(f"<b>${total_term_val:,.2f}</b>", bold_style)]
    ]
    pricing_table = Table(pricing_data, colWidths=[240, 160, 130])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor("#f8fafc")]),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor("#e0e7ff")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(pricing_table)
    elements.append(Spacer(1, 12))

    # Exclusions
    if prop.important_exclusions:
        elements.append(Paragraph("5. Specific Out-of-Scope Exclusions", heading_style))
        elements.append(Paragraph(prop.important_exclusions, body_style))
        elements.append(Spacer(1, 10))

    # Sign-off Blocks
    elements.append(Paragraph("6. Authorization & Agreement", heading_style))
    sign_data = [
        [Paragraph("<b>Client Authorized Signature:</b>", body_style), Paragraph("<b>Provider Authorized Signature:</b>", body_style)],
        [Paragraph("<br/><br/>_____________________________________<br/>Name: " + prop.contact_name + "<br/>Date:", body_style),
         Paragraph("<br/><br/>_____________________________________<br/>Name: Priya Sharma, Sales Specialist<br/>Date:", body_style)]
    ]
    sign_table = Table(sign_data, colWidths=[265, 265])
    sign_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(sign_table)
    elements.append(Spacer(1, 14))

    # Footer Disclaimer
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=6))
    elements.append(Paragraph("DISCLOSURE: " + prop.disclaimer, disclaimer_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Proposal_{prop.reference}.pdf"}
    )
