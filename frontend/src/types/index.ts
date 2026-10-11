export interface Lead {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  industry: string;
  company_size: string;
  location?: string;
  lead_source: string;
  required_services: string;
  estimated_monthly_budget: number;
  current_infra?: string;
  pain_points?: string;
  purchase_timeline: string;
  decision_maker_authority: string;
  sales_owner: string;
  qualification_status: string;
  lead_score: number;
  priority: 'High' | 'Medium' | 'Low';
  scoring_breakdown?: string;
  recommended_next_action?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  company_name: string;
  primary_contact: string;
  email: string;
  phone?: string;
  industry: string;
  company_size: string;
  location?: string;
  current_services: string;
  estimated_contract_value: number;
  contract_start_date?: string;
  contract_end_date?: string;
  sales_owner: string;
  account_status: string;
  health_score: number;
  health_breakdown?: string;
  renewal_status: string;
  expansion_opportunities?: string;
  last_contacted_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: number;
  name: string;
  lead_id?: number;
  account_id?: number;
  account_name?: string;
  expected_deal_value: number;
  mrr: number;
  one_time_value: number;
  probability: number;
  expected_close_date: string;
  stage: string;
  proposed_service: string;
  competitor?: string;
  next_action?: string;
  win_loss_reason?: string;
  notes?: string;
  sales_owner: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  related_type: 'lead' | 'account' | 'opportunity';
  related_id: number;
  related_title: string;
  activity_type: string;
  subject: string;
  date_time: string;
  due_date?: string;
  outcome?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  next_action?: string;
  notes?: string;
  sales_owner: string;
  created_at: string;
}

export interface CloudService {
  id: number;
  category: string;
  name: string;
  summary: string;
  typical_use_cases: string;
  min_monthly_budget: number;
  key_benefits: string[];
  questions_to_ask: string[];
  active: boolean;
}

export interface AssessmentResult {
  id?: number;
  customer_name: string;
  industry: string;
  company_size: string;
  existing_infra: string;
  business_problem: string;
  workload_type: string;
  approx_monthly_budget: number;
  data_sensitivity: string;
  expected_scalability: string;
  availability_requirements: string;
  migration_urgency: string;
  preferred_deployment: string;
  recommended_category: string;
  recommended_services: string[];
  fit_rationale: string;
  business_benefits: string[];
  assumptions: string;
  trade_offs: string;
  next_questions: string[];
  missing_info?: string;
  estimated_tier: string;
}

export interface Proposal {
  id: number;
  reference: string;
  customer_name: string;
  contact_name: string;
  contact_email: string;
  lead_id?: number;
  opportunity_id?: number;
  account_id?: number;
  recommended_services: string;
  scope_and_assumptions: string;
  business_benefits: string;
  one_time_charges: number;
  recurring_monthly_charges: number;
  contract_duration_months: number;
  important_exclusions?: string;
  status: string;
  created_at: string;
  expiry_date: string;
  disclaimer: string;
  notes?: string;
}

export interface Renewal {
  id: number;
  account_id: number;
  account_name?: string;
  contract_name: string;
  renewal_date: string;
  estimated_value: number;
  status: string;
  risk_category: 'Low' | 'Medium' | 'High' | 'Critical';
  last_contact_date?: string;
  next_follow_up?: string;
  renewal_owner: string;
  notes?: string;
  created_at: string;
}

export interface DashboardData {
  kpis: {
    total_leads: number;
    qualified_leads: number;
    open_opportunities: number;
    open_pipeline_value: number;
    weighted_forecast_revenue: number;
    closed_won_revenue: number;
    monthly_sales_target: number;
    target_achievement_pct: number;
    upcoming_followups_count: number;
    overdue_followups_count: number;
    renewals_due_30d_count: number;
    at_risk_accounts_count: number;
  };
  stage_distribution: Array<{ stage: string; count: number; value: number }>;
  service_pipeline: Array<{ service: string; value: number }>;
  lead_sources: Array<{ source: string; count: number }>;
  recent_activities: Array<{
    id: number;
    title: string;
    activity_type: string;
    subject: string;
    status: string;
    date_time: string;
    outcome?: string;
  }>;
  high_priority_leads: Array<{
    id: number;
    company_name: string;
    contact_name: string;
    score: number;
    required_services: string;
    budget: number;
    timeline: string;
  }>;
  at_risk_accounts: Array<{
    id: number;
    company_name: string;
    health_score: number;
    renewal_status: string;
    contract_val: number;
    notes?: string;
  }>;
  urgent_deals: Array<{
    id: number;
    name: string;
    stage: string;
    deal_value: number;
    probability: number;
    expected_close_date: string;
    next_action?: string;
  }>;
}

export interface AnalyticsData {
  conversion_funnel: {
    total_leads: number;
    qualified_leads: number;
    converted_leads: number;
    lead_to_qualified_pct: number;
    qualified_to_opp_pct: number;
    opportunity_win_rate_pct: number;
    closed_won_count: number;
    closed_lost_count: number;
  };
  deal_metrics: {
    average_deal_size: number;
    average_won_deal_size: number;
    total_pipeline_deals: number;
    open_deals_count: number;
  };
  activity_metrics: {
    total_activities: number;
    completed_activities: number;
    completion_rate_pct: number;
  };
  revenue_by_source: Array<{ source: string; revenue: number }>;
  revenue_by_stage: Array<{ stage: string; revenue: number }>;
}
