import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, DollarSign, TrendingUp, Award, CalendarClock,
  AlertTriangle, ShieldAlert, ArrowUpRight, CheckCircle2,
  Sparkles, Layers, ChevronRight, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardData } from '../types';
import { StatCard } from '../components/StatCard';
import { PriorityBadge, StageBadge, StatusBadge } from '../components/Badge';

const STAGE_COLORS: Record<string, string> = {
  'New': '#94a3b8',
  'Contacted': '#c084fc',
  'Discovery': '#f59e0b',
  'Qualified': '#06b6d4',
  'Solution Proposed': '#3b82f6',
  'Negotiation': '#6366f1',
  'Closed Won': '#10b981',
  'Closed Lost': '#64748b'
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'all'>('month');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Calculating real-time sales intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white rounded-xl border border-rose-200 text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">Failed to Connect to Database</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, stage_distribution, service_pipeline, lead_sources, recent_activities, high_priority_leads, at_risk_accounts, urgent_deals } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner & Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Sales Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline value, consultative cloud opportunities, and forecast attainment.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
          {(['month', 'quarter', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                timeframe === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t === 'month' ? 'Current Month' : t === 'quarter' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Pipeline Value"
          value={`$${kpis.open_pipeline_value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          subtitle={`${kpis.open_opportunities} active deals across pipeline`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Weighted Forecast"
          value={`$${kpis.weighted_forecast_revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          subtitle="Sum of (Deal Value × Probability %)"
          icon={TrendingUp}
          badge="Probability Weighted"
          color="indigo"
        />
        <StatCard
          title="Closed Won Revenue"
          value={`$${kpis.closed_won_revenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          subtitle={`Target: $${kpis.monthly_sales_target.toLocaleString()} (${kpis.target_achievement_pct}% attained)`}
          icon={Award}
          badge={`${kpis.target_achievement_pct}%`}
          trend={kpis.target_achievement_pct >= 70 ? 'up' : 'neutral'}
          color="emerald"
        />
        <StatCard
          title="Leads & Qualification"
          value={`${kpis.qualified_leads} / ${kpis.total_leads}`}
          subtitle={`${Math.round((kpis.qualified_leads / kpis.total_leads) * 100 || 0)}% qualification conversion`}
          icon={Users}
          color="amber"
        />
      </div>

      {/* Secondary Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">Upcoming Follow-ups</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5">{kpis.upcoming_followups_count} Tasks</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">Overdue Follow-ups</p>
          <p className={`text-lg font-bold mt-0.5 ${kpis.overdue_followups_count > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {kpis.overdue_followups_count} Overdue
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">Renewals Due (30d)</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5">{kpis.renewals_due_30d_count} Contracts</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">At-Risk Accounts</p>
          <p className={`text-lg font-bold mt-0.5 ${kpis.at_risk_accounts_count > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {kpis.at_risk_accounts_count} Accounts
          </p>
        </div>
      </div>

      {/* Charts Section: Stage Pipeline & Cloud Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opportunity Distribution by Stage */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Opportunities by Sales Stage</h3>
              <p className="text-xs text-slate-500">Real database counts and total pipeline values</p>
            </div>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stage_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'value' ? `$${Number(val).toLocaleString()}` : `${val} deals`,
                    name === 'value' ? 'Total Value' : 'Deal Count'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {stage_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Lead Acquisition Channels</h3>
            <p className="text-xs text-slate-500 mb-4">Source breakdown from prospecting records</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lead_sources}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {lead_sources.map((entry, idx) => (
                      <Cell key={`source-cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100">
            {lead_sources.map((src, idx) => (
              <div key={src.source} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-slate-600 truncate">{src.source}: <b>{src.count}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cloud Fit Advisor Featured Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Signature Sales Feature
          </div>
          <h3 className="text-base font-bold tracking-tight">Cloud Fit Advisor & Consultative Solution Mapping</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Assess customer workload requirements and map them to AWS Modernization, Accounting & Tax Application Hosting, or Dedicated AI GPU Compute. Includes transparent assumptions and interview questions.
          </p>
        </div>
        <button
          onClick={() => navigate('/advisor')}
          className="shrink-0 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-2"
        >
          <span>Run Cloud Assessment</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Urgent Deals & High-Priority Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Deals Needing Immediate Attention */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Deals in Late Stage (Negotiation / Proposal)</h3>
              <p className="text-xs text-slate-500">Highest close probability needing final closing action</p>
            </div>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {urgent_deals.map((deal) => (
              <div key={deal.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{deal.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Next: {deal.next_action || 'Review contract terms'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StageBadge stage={deal.stage} />
                    <span className="text-[11px] text-slate-500">Close: {deal.expected_close_date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900">${deal.deal_value.toLocaleString()}</p>
                  <span className="text-[11px] font-semibold text-emerald-600">{deal.probability}% win prob</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High-Priority Qualified Leads */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">High-Priority Qualified Leads</h3>
              <p className="text-xs text-slate-500">Scored 75+ using transparent 6-factor rules</p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all leads
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {high_priority_leads.map((lead) => (
              <div key={lead.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{lead.company_name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{lead.contact_name} • {lead.required_services}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PriorityBadge priority="High" />
                    <span className="text-[11px] text-slate-500">{lead.timeline}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                    {lead.score}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">${lead.budget.toLocaleString()}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Accounts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Customer Accounts */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">At-Risk Accounts Requiring Intervention</h3>
              <p className="text-xs text-slate-500">Health scores below 50 due to renewal or support flags</p>
            </div>
            <button
              onClick={() => navigate('/accounts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View accounts
            </button>
          </div>
          {at_risk_accounts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No accounts currently flagged as at-risk.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {at_risk_accounts.map((acc) => (
                <div key={acc.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{acc.company_name}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5 font-medium">{acc.notes}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Contract Value: ${acc.contract_val.toLocaleString()}/yr</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Health: {acc.health_score}/100
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Status: {acc.renewal_status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales Activities */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Sales Interactions</h3>
              <p className="text-xs text-slate-500">Calls, meetings, demonstrations, and proposal reviews</p>
            </div>
            <button
              onClick={() => navigate('/activities')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all activities
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recent_activities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{act.subject}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.date_time}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={act.status} />
                  <span className="block text-[10px] text-slate-500 mt-1">{act.activity_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
