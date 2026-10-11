import React, { useEffect, useState } from 'react';
import {
  GitPullRequest, Plus, Search, Filter, Kanban, Table as TableIcon,
  DollarSign, TrendingUp, Award, Calendar, CheckCircle2, XCircle,
  ChevronRight, ArrowRight, Clock, Building2, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Opportunity } from '../types';
import { StageBadge } from '../components/Badge';
import { Modal } from '../components/Modal';

const STAGES = [
  'New',
  'Contacted',
  'Discovery',
  'Qualified',
  'Solution Proposed',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // Modals
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const [newStage, setNewStage] = useState('');
  const [newProb, setNewProb] = useState(50);
  const [winLossReason, setWinLossReason] = useState('');

  const [formData, setFormData] = useState<Partial<Opportunity>>({
    name: '',
    expected_deal_value: 36000,
    mrr: 3000,
    one_time_value: 2500,
    probability: 35,
    expected_close_date: '2026-11-30',
    stage: 'Discovery',
    proposed_service: 'AWS Migration & Cloud Assessment',
    sales_owner: 'Priya Sharma',
    next_action: 'Schedule discovery architecture session'
  });

  useEffect(() => {
    loadPipeline();
  }, [stageFilter]);

  const loadPipeline = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (stageFilter) params.stage = stageFilter;
      const [oppsRes, sumRes] = await Promise.all([
        api.getOpportunities(params),
        api.getPipelineSummary()
      ]);
      setOpportunities(oppsRes);
      setSummary(sumRes);
    } catch (err: any) {
      alert('Failed to load opportunities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      await api.updateOpportunityStage(selectedOpp.id, {
        stage: newStage,
        probability: newProb,
        win_loss_reason: winLossReason
      });
      setStageModalOpen(false);
      loadPipeline();
    } catch (err: any) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createOpportunity(formData);
      setAddModalOpen(false);
      loadPipeline();
    } catch (err: any) {
      alert('Failed to create opportunity: ' + err.message);
    }
  };

  const openStageModal = (opp: Opportunity, targetStage?: string) => {
    setSelectedOpp(opp);
    setNewStage(targetStage || opp.stage);
    setNewProb(opp.probability);
    setWinLossReason(opp.win_loss_reason || '');
    setStageModalOpen(true);
  };

  const filteredOpps = opportunities.filter((o) =>
    search ? o.name.toLowerCase().includes(search.toLowerCase()) || (o.account_name && o.account_name.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Pipeline & Forecasting</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive Kanban pipeline tracking consultative deals from Discovery to Closed Won.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Kanban / Table */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Pipeline Forecasting Header Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Open Pipeline</span>
            <span className="text-xl font-bold text-slate-900">${summary.open_pipeline_value.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{summary.open_opportunities_count} active open deals</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">Weighted Forecast</span>
            <span className="text-xl font-bold text-indigo-700">${summary.weighted_forecast_revenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Sum of (Value × Probability)</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Closed Won Revenue</span>
            <span className="text-xl font-bold text-emerald-700">${summary.closed_won_revenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Booked recurring + one-time</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Closed Lost Value</span>
            <span className="text-xl font-bold text-slate-500">${summary.closed_lost_revenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Excluded from open pipeline</span>
          </div>
        </div>
      )}

      {/* Search and Stage Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals by name or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {viewMode === 'table' && (
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-4 items-start min-h-[600px]">
          {STAGES.map((stage) => {
            const stageOpps = filteredOpps.filter((o) => o.stage === stage);
            const totalStageVal = stageOpps.reduce((sum, o) => sum + o.expected_deal_value, 0);

            return (
              <div key={stage} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-2.5 flex flex-col gap-2 min-w-[210px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 block truncate">{stage}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">${totalStageVal.toLocaleString()}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {stageOpps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 overflow-y-auto max-h-[700px] pr-0.5">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={() => openStageModal(opp)}
                      className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition cursor-pointer space-y-2 group"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                          {opp.name}
                        </h4>
                        {opp.account_name && (
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{opp.account_name}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="font-bold text-slate-900">${opp.expected_deal_value.toLocaleString()}</span>
                        <span className="font-semibold text-emerald-600 text-[10px]">{opp.probability}% win</span>
                      </div>

                      <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 line-clamp-1">
                        Next: {opp.next_action || 'Review requirement specs'}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="truncate">{opp.proposed_service.split(',')[0]}</span>
                        <span>{opp.expected_close_date.slice(5)}</span>
                      </div>
                    </div>
                  ))}
                  {stageOpps.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">Deal Name</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">MRR / One-Time</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4">Target Close</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOpps.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{opp.name}</span>
                    <span className="text-slate-500 text-[11px]">{opp.proposed_service}</span>
                  </td>
                  <td className="py-3 px-4"><StageBadge stage={opp.stage} /></td>
                  <td className="py-3 px-4 font-bold text-slate-900">${opp.expected_deal_value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">${opp.mrr.toLocaleString()}/mo • ${opp.one_time_value.toLocaleString()} setup</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">{opp.probability}%</td>
                  <td className="py-3 px-4 text-slate-500">{opp.expected_close_date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openStageModal(opp)}
                      className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold"
                    >
                      Update Stage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UPDATE OPPORTUNITY STAGE MODAL */}
      <Modal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        title={selectedOpp ? `Update Deal Stage: ${selectedOpp.name}` : 'Update Stage'}
        subtitle="Manage deal progression, update probability, and log win/loss reasons."
        maxWidth="lg"
      >
        <form onSubmit={handleStageChangeSubmit} className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Deal Value</span>
              <span className="block text-sm font-bold text-slate-900">${selectedOpp?.expected_deal_value.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Current Stage</span>
              <span className="block font-semibold text-blue-600">{selectedOpp?.stage}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Close Date</span>
              <span className="block font-medium text-slate-700">{selectedOpp?.expected_close_date}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Stage *</label>
            <select
              value={newStage}
              onChange={(e) => {
                setNewStage(e.target.value);
                if (e.target.value === 'Closed Won') setNewProb(100);
                else if (e.target.value === 'Closed Lost') setNewProb(0);
                else if (e.target.value === 'Negotiation') setNewProb(80);
                else if (e.target.value === 'Solution Proposed') setNewProb(65);
                else if (e.target.value === 'Qualified') setNewProb(50);
                else if (e.target.value === 'Discovery') setNewProb(35);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Close Probability % ({newProb}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={newProb}
              onChange={(e) => setNewProb(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {(newStage === 'Closed Won' || newStage === 'Closed Lost') && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {newStage === 'Closed Won' ? 'Why was this deal won? *' : 'Why was this deal lost? *'}
              </label>
              <textarea
                required
                rows={3}
                value={winLossReason}
                onChange={(e) => setWinLossReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                placeholder={
                  newStage === 'Closed Won'
                    ? 'e.g. Won on consultative cloud fit recommendations and competitive TCO vs on-prem hardware.'
                    : 'e.g. Lost to internal on-prem refurbishment due to CFO CapEx preference.'
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStageModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Save Stage Progression
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE OPPORTUNITY MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Create New Opportunity"
        subtitle="Add a new deal directly to the sales pipeline."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateOpportunity} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Opportunity Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. TechCorp - AWS Container Modernization"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Deal Value *</label>
              <input
                type="number"
                required
                value={formData.expected_deal_value}
                onChange={(e) => setFormData({ ...formData, expected_deal_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Recurring Revenue (MRR)</label>
              <input
                type="number"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Cloud Service *</label>
              <input
                type="text"
                required
                value={formData.proposed_service}
                onChange={(e) => setFormData({ ...formData, proposed_service: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Close Date *</label>
              <input
                type="date"
                required
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Action</label>
            <input
              type="text"
              value={formData.next_action || ''}
              onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Schedule discovery architecture review call"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Add Deal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
