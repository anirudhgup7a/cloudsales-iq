from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
import datetime

# --- LEAD SCHEMAS ---
class LeadBase(BaseModel):
    company_name: str
    contact_name: str
    email: str
    phone: Optional[str] = None
    industry: str
    company_size: str
    location: Optional[str] = None
    lead_source: str
    required_services: str
    estimated_monthly_budget: float = 0.0
    current_infra: Optional[str] = None
    pain_points: Optional[str] = None
    purchase_timeline: str
    decision_maker_authority: str
    sales_owner: Optional[str] = "Priya Sharma"
    qualification_status: Optional[str] = "New"
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    lead_source: Optional[str] = None
    required_services: Optional[str] = None
    estimated_monthly_budget: Optional[float] = None
    current_infra: Optional[str] = None
    pain_points: Optional[str] = None
    purchase_timeline: Optional[str] = None
    decision_maker_authority: Optional[str] = None
    sales_owner: Optional[str] = None
    qualification_status: Optional[str] = None
    notes: Optional[str] = None

class LeadConvertRequest(BaseModel):
    opportunity_name: str
    expected_deal_value: float
    mrr: float = 0.0
    one_time_value: float = 0.0
    expected_close_date: str
    create_account: bool = True

class LeadResponse(LeadBase):
    id: int
    lead_score: int
    priority: str
    scoring_breakdown: Optional[str] = None
    recommended_next_action: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- ACCOUNT SCHEMAS ---
class AccountBase(BaseModel):
    company_name: str
    primary_contact: str
    email: str
    phone: Optional[str] = None
    industry: str
    company_size: str
    location: Optional[str] = None
    current_services: str
    estimated_contract_value: float = 0.0
    contract_start_date: Optional[str] = None
    contract_end_date: Optional[str] = None
    sales_owner: Optional[str] = "Priya Sharma"
    account_status: Optional[str] = "Active"
    renewal_status: Optional[str] = "Up to date"
    expansion_opportunities: Optional[str] = None
    last_contacted_date: Optional[str] = None
    notes: Optional[str] = None

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    company_name: Optional[str] = None
    primary_contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    current_services: Optional[str] = None
    estimated_contract_value: Optional[float] = None
    contract_start_date: Optional[str] = None
    contract_end_date: Optional[str] = None
    sales_owner: Optional[str] = None
    account_status: Optional[str] = None
    renewal_status: Optional[str] = None
    expansion_opportunities: Optional[str] = None
    last_contacted_date: Optional[str] = None
    notes: Optional[str] = None

class AccountResponse(AccountBase):
    id: int
    health_score: int
    health_breakdown: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- OPPORTUNITY SCHEMAS ---
class OpportunityBase(BaseModel):
    name: str
    lead_id: Optional[int] = None
    account_id: Optional[int] = None
    expected_deal_value: float
    mrr: float = 0.0
    one_time_value: float = 0.0
    probability: int = 20
    expected_close_date: str
    stage: str = "Discovery"
    proposed_service: str
    competitor: Optional[str] = None
    next_action: Optional[str] = None
    win_loss_reason: Optional[str] = None
    notes: Optional[str] = None
    sales_owner: Optional[str] = "Priya Sharma"

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityUpdate(BaseModel):
    name: Optional[str] = None
    lead_id: Optional[int] = None
    account_id: Optional[int] = None
    expected_deal_value: Optional[float] = None
    mrr: Optional[float] = None
    one_time_value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[str] = None
    stage: Optional[str] = None
    proposed_service: Optional[str] = None
    competitor: Optional[str] = None
    next_action: Optional[str] = None
    win_loss_reason: Optional[str] = None
    notes: Optional[str] = None
    sales_owner: Optional[str] = None

class OpportunityStageUpdate(BaseModel):
    stage: str
    probability: Optional[int] = None
    win_loss_reason: Optional[str] = None
    notes: Optional[str] = None

class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    account_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- ACTIVITY SCHEMAS ---
class ActivityBase(BaseModel):
    related_type: str
    related_id: int
    related_title: str
    activity_type: str
    subject: str
    date_time: str
    due_date: Optional[str] = None
    outcome: Optional[str] = None
    status: Optional[str] = "Pending"
    next_action: Optional[str] = None
    notes: Optional[str] = None
    sales_owner: Optional[str] = "Priya Sharma"

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    subject: Optional[str] = None
    date_time: Optional[str] = None
    due_date: Optional[str] = None
    outcome: Optional[str] = None
    status: Optional[str] = None
    next_action: Optional[str] = None
    notes: Optional[str] = None

class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- CLOUD SERVICE & ADVISOR SCHEMAS ---
class CloudServiceResponse(BaseModel):
    id: int
    category: str
    name: str
    summary: str
    typical_use_cases: str
    min_monthly_budget: float
    key_benefits: List[str]
    questions_to_ask: List[str]
    active: bool

    model_config = ConfigDict(from_attributes=True)

class AssessmentRequest(BaseModel):
    customer_name: str
    lead_id: Optional[int] = None
    account_id: Optional[int] = None
    industry: str
    company_size: str
    existing_infra: str
    business_problem: str
    workload_type: str
    approx_monthly_budget: float
    data_sensitivity: str
    expected_scalability: str
    availability_requirements: str
    migration_urgency: str
    preferred_deployment: str

class AssessmentResponse(AssessmentRequest):
    id: Optional[int] = None
    recommended_category: str
    recommended_services: List[str]
    fit_rationale: str
    business_benefits: List[str]
    assumptions: str
    trade_offs: str
    next_questions: List[str]
    missing_info: Optional[str] = None
    estimated_tier: str
    created_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- PROPOSAL SCHEMAS ---
class ProposalBase(BaseModel):
    customer_name: str
    contact_name: str
    contact_email: str
    lead_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    account_id: Optional[int] = None
    recommended_services: str
    scope_and_assumptions: str
    business_benefits: str
    one_time_charges: float = 0.0
    recurring_monthly_charges: float = 0.0
    contract_duration_months: int = 12
    important_exclusions: Optional[str] = None
    status: Optional[str] = "Draft"
    expiry_date: str
    notes: Optional[str] = None

class ProposalCreate(ProposalBase):
    pass

class ProposalUpdate(BaseModel):
    status: Optional[str] = None
    one_time_charges: Optional[float] = None
    recurring_monthly_charges: Optional[float] = None
    contract_duration_months: Optional[int] = None
    scope_and_assumptions: Optional[str] = None
    business_benefits: Optional[str] = None
    important_exclusions: Optional[str] = None
    notes: Optional[str] = None

class ProposalResponse(ProposalBase):
    id: int
    reference: str
    created_at: datetime.datetime
    disclaimer: str

    model_config = ConfigDict(from_attributes=True)


# --- RENEWAL SCHEMAS ---
class RenewalBase(BaseModel):
    account_id: int
    contract_name: str
    renewal_date: str
    estimated_value: float = 0.0
    status: Optional[str] = "Upcoming"
    risk_category: Optional[str] = "Low"
    last_contact_date: Optional[str] = None
    next_follow_up: Optional[str] = None
    renewal_owner: Optional[str] = "Priya Sharma"
    notes: Optional[str] = None

class RenewalCreate(RenewalBase):
    pass

class RenewalUpdate(BaseModel):
    status: Optional[str] = None
    risk_category: Optional[str] = None
    estimated_value: Optional[float] = None
    renewal_date: Optional[str] = None
    last_contact_date: Optional[str] = None
    next_follow_up: Optional[str] = None
    notes: Optional[str] = None

class RenewalResponse(RenewalBase):
    id: int
    created_at: datetime.datetime
    account_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- TARGET & REPORT SCHEMAS ---
class SalesTargetUpdate(BaseModel):
    target_amount: float
    fiscal_quarter: Optional[str] = "Q4"

class SalesTargetResponse(BaseModel):
    id: int
    period: str
    target_amount: float
    fiscal_quarter: str

    model_config = ConfigDict(from_attributes=True)

class DashboardKPIs(BaseModel):
    total_leads: int
    qualified_leads: int
    open_opportunities: int
    open_pipeline_value: float
    weighted_forecast_revenue: float
    closed_won_revenue: float
    monthly_sales_target: float
    target_achievement_pct: float
    upcoming_followups_count: int
    overdue_followups_count: int
    renewals_due_30d_count: int
    at_risk_accounts_count: int
