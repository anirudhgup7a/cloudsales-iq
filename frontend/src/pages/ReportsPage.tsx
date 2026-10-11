import React, { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Users, DollarSign, Target,
  ArrowDown, ArrowUp, Filter, Layers, Award
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsData } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLoading(true); setData(await api.getAnalytics()); }
      catch (e: any) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmtCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-slate-400">
        <BarChart3 className="w-14 h-14 mx-auto mb-4 opacity-40" />
        <p className="font-medium text-lg">Could not load analytics data</p>
      </div>
    );
  }

  const funnel = data.conversion_funnel;
  const deals = data.deal_metrics;
  const activities = data.activity_metrics;

  const funnelData = [
    { name: 'Total Leads', value: funnel.total_leads, fill: '#94a3b8' },
    { name: 'Qualified', value: funnel.qualified_leads, fill: '#3b82f6' },
    { name: 'Converted', value: funnel.converted_leads, fill: '#06b6d4' },
    { name: 'Won', value: funnel.closed_won_count, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive performance insights and conversion metrics</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Lead → Qualified</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{funnel.lead_to_qualified_pct.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-1">{funnel.qualified_leads} / {funnel.total_leads} leads</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Qualified → Opp</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{funnel.qualified_to_opp_pct.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-1">{funnel.converted_leads} converted</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Win Rate</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{funnel.opportunity_win_rate_pct.toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-1">{funnel.closed_won_count} won / {funnel.closed_won_count + funnel.closed_lost_count} closed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-xs font-medium text-slate-500">Avg Deal Size</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{fmtCurrency(deals.average_deal_size)}</p>
          <p className="text-xs text-slate-400 mt-1">Won avg: {fmtCurrency(deals.average_won_deal_size)}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Conversion Funnel</h2>
          <p className="text-xs text-slate-400 mb-4">Lead to closed-won conversion progression</p>
          <div className="space-y-3">
            {funnelData.map((item, i) => {
              const maxVal = funnelData[0].value || 1;
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              return (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: item.fill }}
                    >
                      <span className="text-[10px] font-bold text-white">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Revenue by Lead Source</h2>
          <p className="text-xs text-slate-400 mb-4">Pipeline revenue contribution by acquisition channel</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.revenue_by_source}
                dataKey="revenue"
                nameKey="source"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                label={(entry: any) => `${entry.source || entry.name || ''} ${entry.percent ? (entry.percent * 100).toFixed(0) : 0}%`}
              >
                {data.revenue_by_source.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Stage */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-bold text-slate-800 mb-1">Pipeline Value by Stage</h2>
          <p className="text-xs text-slate-400 mb-4">Revenue distribution across pipeline stages</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.revenue_by_stage} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: any) => [fmtCurrency(Number(v) || 0), 'Pipeline Value']} />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {data.revenue_by_stage.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Completion & Deal Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-1">Activity Performance</h2>
            <p className="text-xs text-slate-400 mb-4">Follow-up and engagement completion rates</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-900">{activities.total_activities}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-1">Total</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-900">{activities.completed_activities}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">Completed</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-violet-900">{activities.completion_rate_pct.toFixed(0)}%</p>
                <p className="text-[11px] text-violet-600 font-medium mt-1">Rate</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800 mb-3">Deal Snapshot</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">Total Pipeline</p>
                <p className="text-lg font-bold text-slate-900">{deals.total_pipeline_deals}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">Open Deals</p>
                <p className="text-lg font-bold text-slate-900">{deals.open_deals_count}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">Avg Deal Size</p>
                <p className="text-lg font-bold text-slate-900">{fmtCurrency(deals.average_deal_size)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">Avg Won Deal</p>
                <p className="text-lg font-bold text-emerald-600">{fmtCurrency(deals.average_won_deal_size)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[11px] text-slate-400 italic py-4 border-t border-slate-200">
        All analytics data shown is from simulated demonstration records. CloudSales IQ is an independent portfolio project — no real customer data is involved.
      </p>
    </div>
  );
};
