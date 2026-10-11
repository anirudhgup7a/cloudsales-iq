import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False, index=True)
    contact_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)  # 1-10, 11-50, 51-200, 201-500, 500+
    location = Column(String(100), nullable=True)
    lead_source = Column(String(50), nullable=False)  # LinkedIn, Referral, Inbound Email, Cold Outreach, Partner, Website
    required_services = Column(String(255), nullable=False)
    estimated_monthly_budget = Column(Float, default=0.0)
    current_infra = Column(String(150), nullable=True)  # On-premise, Shared Hosting, AWS, Azure, Hybrid
    pain_points = Column(Text, nullable=True)
    purchase_timeline = Column(String(50), nullable=False)  # Immediate (<30d), 1-3 Months, 3-6 Months, Exploratory (>6m)
    decision_maker_authority = Column(String(50), nullable=False)  # Final Decision Maker, Tech Evaluator, Influencer, Gatekeeper
    sales_owner = Column(String(100), default="Priya Sharma")
    qualification_status = Column(String(50), default="New", index=True)  # New, Contacted, Qualified, Disqualified, Converted
    lead_score = Column(Integer, default=0)
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    scoring_breakdown = Column(Text, nullable=True)  # JSON string
    recommended_next_action = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    opportunities = relationship("Opportunity", back_populates="lead", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False, unique=True, index=True)
    primary_contact = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    location = Column(String(100), nullable=True)
    current_services = Column(String(255), nullable=False)
    estimated_contract_value = Column(Float, default=0.0)  # Annualized / Total value
    contract_start_date = Column(String(30), nullable=True)
    contract_end_date = Column(String(30), nullable=True)
    sales_owner = Column(String(100), default="Priya Sharma")
    account_status = Column(String(50), default="Active")  # Active, At Risk, Churned, Expanding
    health_score = Column(Integer, default=80)
    health_breakdown = Column(Text, nullable=True)  # JSON string
    renewal_status = Column(String(50), default="Up to date")
    expansion_opportunities = Column(String(255), nullable=True)
    last_contacted_date = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    opportunities = relationship("Opportunity", back_populates="account")
    renewals = relationship("Renewal", back_populates="account", cascade="all, delete-orphan")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"), nullable=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="SET NULL"), nullable=True)
    expected_deal_value = Column(Float, nullable=False, default=0.0)  # Total deal value
    mrr = Column(Float, default=0.0)  # Monthly recurring revenue
    one_time_value = Column(Float, default=0.0)  # Setup / migration fee
    probability = Column(Integer, nullable=False, default=20)  # 0 to 100 %
    expected_close_date = Column(String(30), nullable=False)
    stage = Column(String(50), nullable=False, default="Discovery", index=True)
    # Stages: New, Contacted, Discovery, Qualified, Solution Proposed, Negotiation, Closed Won, Closed Lost
    proposed_service = Column(String(150), nullable=False)
    competitor = Column(String(100), nullable=True)
    next_action = Column(String(255), nullable=True)
    win_loss_reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    sales_owner = Column(String(100), default="Priya Sharma")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    lead = relationship("Lead", back_populates="opportunities")
    account = relationship("Account", back_populates="opportunities")
    stage_history = relationship("OpportunityStageHistory", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunityStageHistory(Base):
    __tablename__ = "opportunity_stage_history"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False)
    from_stage = Column(String(50), nullable=False)
    to_stage = Column(String(50), nullable=False)
    probability = Column(Integer, default=0)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(String(255), nullable=True)

    opportunity = relationship("Opportunity", back_populates="stage_history")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    related_type = Column(String(30), nullable=False)  # "lead", "account", "opportunity"
    related_id = Column(Integer, nullable=False)
    related_title = Column(String(150), nullable=False)
    activity_type = Column(String(50), nullable=False)  # Call, Email, LinkedIn, Meeting, Demo, Proposal Follow-up, Renewal Discussion, Other
    subject = Column(String(200), nullable=False)
    date_time = Column(String(30), nullable=False)
    due_date = Column(String(30), nullable=True)
    outcome = Column(String(255), nullable=True)
    status = Column(String(30), default="Pending", index=True)  # Pending, Completed, Overdue
    next_action = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    sales_owner = Column(String(100), default="Priya Sharma")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class CloudService(Base):
    __tablename__ = "cloud_services"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)  # Public Cloud & AWS Services, Infrastructure & Compute, Managed Hosting
    name = Column(String(150), nullable=False)
    summary = Column(Text, nullable=False)
    typical_use_cases = Column(Text, nullable=False)
    min_monthly_budget = Column(Float, default=500.0)
    key_benefits = Column(Text, nullable=False)  # JSON list
    questions_to_ask = Column(Text, nullable=False)  # JSON list
    active = Column(Boolean, default=True)


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)
    lead_id = Column(Integer, nullable=True)
    account_id = Column(Integer, nullable=True)
    industry = Column(String(100), nullable=False)
    company_size = Column(String(50), nullable=False)
    existing_infra = Column(String(150), nullable=False)
    business_problem = Column(Text, nullable=False)
    workload_type = Column(String(100), nullable=False)
    approx_monthly_budget = Column(Float, default=1000.0)
    data_sensitivity = Column(String(50), nullable=False)
    expected_scalability = Column(String(50), nullable=False)
    availability_requirements = Column(String(50), nullable=False)
    migration_urgency = Column(String(50), nullable=False)
    preferred_deployment = Column(String(50), nullable=False)
    
    # Recommendation results
    recommended_category = Column(String(100), nullable=False)
    recommended_services = Column(Text, nullable=False)  # JSON list
    fit_rationale = Column(Text, nullable=False)
    business_benefits = Column(Text, nullable=False)  # JSON list
    assumptions = Column(Text, nullable=False)
    trade_offs = Column(Text, nullable=False)
    next_questions = Column(Text, nullable=False)  # JSON list
    missing_info = Column(Text, nullable=True)
    estimated_tier = Column(String(50), default="Mid-tier")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    customer_name = Column(String(150), nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_email = Column(String(120), nullable=False)
    lead_id = Column(Integer, nullable=True)
    opportunity_id = Column(Integer, nullable=True)
    account_id = Column(Integer, nullable=True)
    recommended_services = Column(String(255), nullable=False)
    scope_and_assumptions = Column(Text, nullable=False)
    business_benefits = Column(Text, nullable=False)
    one_time_charges = Column(Float, default=0.0)
    recurring_monthly_charges = Column(Float, default=0.0)
    contract_duration_months = Column(Integer, default=12)
    important_exclusions = Column(Text, nullable=True)
    status = Column(String(50), default="Draft", index=True)  # Draft, Ready for Review, Sent, Accepted, Rejected, Expired
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expiry_date = Column(String(30), nullable=False)
    disclaimer = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)


class Renewal(Base):
    __tablename__ = "renewals"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    contract_name = Column(String(150), nullable=False)
    renewal_date = Column(String(30), nullable=False, index=True)
    estimated_value = Column(Float, default=0.0)
    status = Column(String(50), default="Upcoming", index=True)  # Upcoming, In Negotiation, Renewed, At Risk, Lapsed
    risk_category = Column(String(30), default="Low")  # Low, Medium, High, Critical
    last_contact_date = Column(String(30), nullable=True)
    next_follow_up = Column(String(30), nullable=True)
    renewal_owner = Column(String(100), default="Priya Sharma")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("Account", back_populates="renewals")


class SalesTarget(Base):
    __tablename__ = "sales_targets"

    id = Column(Integer, primary_key=True, index=True)
    period = Column(String(50), default="Current Month", unique=True)
    target_amount = Column(Float, default=150000.0)
    fiscal_quarter = Column(String(20), default="Q4")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
