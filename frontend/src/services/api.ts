import {
  Lead, Account, Opportunity, Activity, CloudService,
  AssessmentResult, Proposal, Renewal, DashboardData, AnalyticsData
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });
  if (!res.ok) {
    let errMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const err = await res.json();
      if (err.detail) errMessage = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {
      // fallback to status text
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Dashboard & Analytics
  getDashboard: () => fetchJson<DashboardData>('/reports/dashboard'),
  getAnalytics: () => fetchJson<AnalyticsData>('/reports/analytics'),

  // Leads
  getLeads: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<Lead[]>(`/leads${qs}`);
  },
  getLead: (id: number) => fetchJson<Lead>(`/leads/${id}`),
  createLead: (lead: Partial<Lead>) => fetchJson<Lead>('/leads', { method: 'POST', body: JSON.stringify(lead) }),
  updateLead: (id: number, lead: Partial<Lead>) => fetchJson<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(lead) }),
  deleteLead: (id: number) => fetchJson<{ status: string; message: string }>(`/leads/${id}`, { method: 'DELETE' }),
  convertLead: (id: number, data: any) => fetchJson<{ status: string; opportunity_id: number; account_id?: number }>(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),

  // Opportunities / Pipeline
  getOpportunities: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<Opportunity[]>(`/opportunities${qs}`);
  },
  getPipelineSummary: () => fetchJson<any>('/opportunities/pipeline/summary'),
  createOpportunity: (opp: Partial<Opportunity>) => fetchJson<Opportunity>('/opportunities', { method: 'POST', body: JSON.stringify(opp) }),
  updateOpportunity: (id: number, opp: Partial<Opportunity>) => fetchJson<Opportunity>(`/opportunities/${id}`, { method: 'PUT', body: JSON.stringify(opp) }),
  updateOpportunityStage: (id: number, stageData: { stage: string; probability?: number; win_loss_reason?: string; notes?: string }) =>
    fetchJson<Opportunity>(`/opportunities/${id}/stage`, { method: 'PATCH', body: JSON.stringify(stageData) }),
  deleteOpportunity: (id: number) => fetchJson<{ status: string }>(`/opportunities/${id}`, { method: 'DELETE' }),

  // Cloud Fit Advisor
  getAdvisorServices: () => fetchJson<CloudService[]>('/advisor/services'),
  getAdvisorPresets: () => fetchJson<Record<string, any>>('/advisor/presets'),
  evaluateAssessment: (req: any) => fetchJson<AssessmentResult>('/advisor/evaluate', { method: 'POST', body: JSON.stringify(req) }),
  saveAssessment: (data: any, createOpportunity = true) =>
    fetchJson<any>(`/advisor/save?create_opportunity=${createOpportunity}`, { method: 'POST', body: JSON.stringify(data) }),
  getAssessmentHistory: () => fetchJson<any[]>('/advisor/history'),

  // Activities & Follow-ups
  getActivities: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<Activity[]>(`/activities${qs}`);
  },
  createActivity: (act: Partial<Activity>) => fetchJson<Activity>('/activities', { method: 'POST', body: JSON.stringify(act) }),
  completeActivity: (id: number, outcome: string, nextAction?: string) =>
    fetchJson<Activity>(`/activities/${id}/complete?outcome=${encodeURIComponent(outcome)}` + (nextAction ? `&next_action=${encodeURIComponent(nextAction)}` : ''), { method: 'PATCH' }),
  deleteActivity: (id: number) => fetchJson<{ status: string }>(`/activities/${id}`, { method: 'DELETE' }),
  getSalesScripts: () => fetchJson<{ call_scripts: any[]; email_templates: any[] }>('/activities/scripts'),

  // Accounts
  getAccounts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchJson<Account[]>(`/accounts${qs}`);
  },
  getAccountDetail: (id: number) => fetchJson<{ account: Account; opportunities: any[]; activities: any[]; renewals: any[] }>(`/accounts/${id}`),
  createAccount: (acc: Partial<Account>) => fetchJson<Account>('/accounts', { method: 'POST', body: JSON.stringify(acc) }),
  updateAccount: (id: number, acc: Partial<Account>) => fetchJson<Account>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(acc) }),
  deleteAccount: (id: number) => fetchJson<{ status: string }>(`/accounts/${id}`, { method: 'DELETE' }),

  // Renewals
  getRenewals: (timeframe = 'all') => fetchJson<Renewal[]>(`/renewals?timeframe=${timeframe}`),
  createRenewal: (ren: Partial<Renewal>) => fetchJson<Renewal>('/renewals', { method: 'POST', body: JSON.stringify(ren) }),
  updateRenewal: (id: number, ren: Partial<Renewal>) => fetchJson<Renewal>(`/renewals/${id}`, { method: 'PUT', body: JSON.stringify(ren) }),
  deleteRenewal: (id: number) => fetchJson<{ status: string }>(`/renewals/${id}`, { method: 'DELETE' }),

  // Proposals
  getProposals: () => fetchJson<Proposal[]>('/proposals'),
  createProposal: (prop: Partial<Proposal>) => fetchJson<Proposal>('/proposals', { method: 'POST', body: JSON.stringify(prop) }),
  updateProposal: (id: number, prop: Partial<Proposal>) => fetchJson<Proposal>(`/proposals/${id}`, { method: 'PUT', body: JSON.stringify(prop) }),
  deleteProposal: (id: number) => fetchJson<{ status: string }>(`/proposals/${id}`, { method: 'DELETE' }),
  getPdfUrl: (id: number) => `${API_BASE}/proposals/${id}/pdf`,

  // Settings & Targets
  getTarget: () => fetchJson<any>('/settings/target'),
  updateTarget: (target_amount: number, fiscal_quarter?: string) =>
    fetchJson<any>('/settings/target', { method: 'PUT', body: JSON.stringify({ target_amount, fiscal_quarter }) }),
  resetDemoData: () => fetchJson<any>('/settings/reset-demo', { method: 'POST' }),
  getHealth: () => fetchJson<any>('/settings/health')
};
