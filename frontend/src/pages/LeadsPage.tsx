import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Search, Filter, Download, ArrowRight,
  Trash2, Edit3, Eye, CheckCircle2, AlertCircle, Building2,
  Clock, DollarSign, ShieldCheck, HelpCircle, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { Lead } from '../types';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<Lead>>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: 'Accounting & Financial Services',
    company_size: '11-50',
    location: '',
    lead_source: 'LinkedIn',
    required_services: 'Accounting & Tax Application Hosting',
    estimated_monthly_budget: 1500,
    current_infra: 'On-premise Windows Server',
    pain_points: '',
    purchase_timeline: '1-3 Months',
    decision_maker_authority: 'Final Decision Maker',
    sales_owner: 'Priya Sharma',
    notes: ''
  });

  const [convertData, setConvertData] = useState({
    opportunity_name: '',
    expected_deal_value: 18000,
    mrr: 1500,
    one_time_value: 1000,
    expected_close_date: '2026-11-30',
    create_account: true
  });

  useEffect(() => {
    loadLeads();
  }, [sourceFilter, priorityFilter, statusFilter]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (sourceFilter) params.source = sourceFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getLeads(params);
      setLeads(res);
    } catch (err: any) {
      alert('Failed to load leads: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (sourceFilter) params.source = sourceFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await api.getLeads(params);
      setLeads(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setAddModalOpen(false);
      loadLeads();
    } catch (err: any) {
      alert('Error creating lead: ' + err.message);
    }
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await api.updateLead(selectedLead.id, formData);
      setEditModalOpen(false);
      loadLeads();
    } catch (err: any) {
      alert('Error updating lead: ' + err.message);
    }
  };

  const handleDeleteLead = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete lead "${name}"?`)) return;
    try {
      await api.deleteLead(id);
      loadLeads();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await api.convertLead(selectedLead.id, convertData);
      setConvertModalOpen(false);
      alert(`Lead successfully converted to Opportunity!`);
      loadLeads();
    } catch (err: any) {
      alert('Conversion failed: ' + err.message);
    }
  };

  const openEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData(lead);
    setEditModalOpen(true);
  };

  const openConvert = (lead: Lead) => {
    setSelectedLead(lead);
    const annualVal = (lead.estimated_monthly_budget || 1500) * 12;
    setConvertData({
      opportunity_name: `${lead.company_name} - ${lead.required_services.split(',')[0]}`,
      expected_deal_value: annualVal,
      mrr: lead.estimated_monthly_budget || 1500,
      one_time_value: Math.round((lead.estimated_monthly_budget || 1500) * 0.75),
      expected_close_date: '2026-11-30',
      create_account: true
    });
    setConvertModalOpen(true);
  };

  const openDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailModalOpen(true);
  };

  // Parse scoring breakdown JSON
  let breakdownData: any = null;
  if (selectedLead?.scoring_breakdown) {
    try {
      breakdownData = JSON.parse(selectedLead.scoring_breakdown);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lead Management & Qualification</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic 0-100 scoring based on service fit, budget, authority, urgency, and scale.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/leads/export/csv"
            download
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => {
              setFormData({
                company_name: '',
                contact_name: '',
                email: '',
                phone: '',
                industry: 'Accounting & Financial Services',
                company_size: '11-50',
                location: '',
                lead_source: 'LinkedIn',
                required_services: 'Accounting & Tax Application Hosting',
                estimated_monthly_budget: 1500,
                current_infra: 'On-premise Server',
                pain_points: '',
                purchase_timeline: '1-3 Months',
                decision_maker_authority: 'Final Decision Maker',
                sales_owner: 'Priya Sharma',
                notes: ''
              });
              setAddModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Referral">Referral</option>
            <option value="Inbound Email">Inbound Email</option>
            <option value="Cold Outreach">Cold Outreach</option>
            <option value="Partner Network">Partner Network</option>
            <option value="Website">Website</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority (75+)</option>
            <option value="Medium">Medium Priority (50-74)</option>
            <option value="Low">Low Priority (&lt;50)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading prospects...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No matching leads found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try clearing your filters or create a new lead.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Cloud Requirement</th>
                  <th className="py-3 px-4">Budget / Timeline</th>
                  <th className="py-3 px-4 text-center">Lead Score</th>
                  <th className="py-3 px-4">Priority / Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{lead.company_name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{lead.contact_name} • {lead.email}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{lead.industry} • {lead.lead_source}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">{lead.required_services}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">Infra: {lead.current_infra || 'Not specified'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">${lead.estimated_monthly_budget.toLocaleString()}/mo</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{lead.purchase_timeline}</div>
                      <div className="text-slate-400 text-[10px]">{lead.decision_maker_authority}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                        {lead.lead_score}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div><PriorityBadge priority={lead.priority} /></div>
                      <div><StatusBadge status={lead.qualification_status} /></div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(lead)}
                          title="View explainable scoring & details"
                          className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openConvert(lead)}
                          title="Convert to Sales Opportunity"
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(lead)}
                          title="Edit lead"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.company_name)}
                          title="Delete lead"
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LEAD DETAIL & EXPLAINABLE SCORING MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedLead ? `${selectedLead.company_name} — Qualification Profile` : 'Lead Details'}
        subtitle="Transparent, deterministic 0-100 score breakdown across 6 scoring dimensions"
        maxWidth="2xl"
      >
        {selectedLead && (
          <div className="space-y-5">
            {/* Lead Meta Strip */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                <span className="font-semibold text-slate-800">{selectedLead.contact_name}</span>
                <span className="text-slate-500 block text-[11px]">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Industry & Size</span>
                <span className="font-semibold text-slate-800">{selectedLead.industry}</span>
                <span className="text-slate-500 block text-[11px]">{selectedLead.company_size} employees</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Budget</span>
                <span className="font-semibold text-slate-800">${selectedLead.estimated_monthly_budget.toLocaleString()}/mo</span>
                <span className="text-slate-500 block text-[11px]">{selectedLead.purchase_timeline}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Score</span>
                <span className="text-base font-bold text-blue-600">{selectedLead.lead_score} / 100</span>
                <PriorityBadge priority={selectedLead.priority} />
              </div>
            </div>

            {/* Explainable 6-Factor Scoring Breakdown */}
            {breakdownData && (
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Explainable Lead Scoring Matrix (100 pts total)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Service Fit */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Service Fit & Requirement Alignment</span>
                      <span>{breakdownData.service_fit?.score} / {breakdownData.service_fit?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(breakdownData.service_fit?.score / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Budget Feasibility</span>
                      <span>{breakdownData.budget?.score} / {breakdownData.budget?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(breakdownData.budget?.score / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Purchase Timeline & Urgency</span>
                      <span>{breakdownData.timeline?.score} / {breakdownData.timeline?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(breakdownData.timeline?.score / 20) * 100}%` }} />
                    </div>
                  </div>

                  {/* Authority */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Decision Authority Level</span>
                      <span>{breakdownData.authority?.score} / {breakdownData.authority?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(breakdownData.authority?.score / 15) * 100}%` }} />
                    </div>
                  </div>

                  {/* Company Scale */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Company Scale & Seat Potential</span>
                      <span>{breakdownData.company_scale?.score} / {breakdownData.company_scale?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${(breakdownData.company_scale?.score / 15) * 100}%` }} />
                    </div>
                  </div>

                  {/* Completeness */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>Profile Completeness & Contactability</span>
                      <span>{breakdownData.completeness?.score} / {breakdownData.completeness?.max}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${(breakdownData.completeness?.score / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Scoring Rationales */}
                {breakdownData.reasons && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">Deterministic Scoring Reasons:</span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {breakdownData.reasons.map((r: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Next Action */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">Recommended Next Sales Action:</span>
              <p className="text-xs text-blue-800 font-medium mt-1">
                {selectedLead.recommended_next_action || 'Schedule discovery call to validate technical requirements.'}
              </p>
            </div>

            {/* Pain points & Infra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-slate-700 block mb-1">Current Infrastructure:</span>
                <p className="text-slate-600">{selectedLead.current_infra || 'None specified'}</p>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="font-bold text-slate-700 block mb-1">Business Pain Points:</span>
                <p className="text-slate-600">{selectedLead.pain_points || 'None documented'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  openConvert(selectedLead);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Convert to Opportunity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT LEAD MODAL */}
      <Modal
        isOpen={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={addModalOpen ? 'Register Prospective B2B Lead' : 'Edit Lead Information'}
        subtitle="Lead score will recalculate automatically upon saving."
        maxWidth="2xl"
      >
        <form onSubmit={addModalOpen ? handleCreateLead : handleUpdateLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Apex CPA Advisory LLC"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Contact Name *</label>
              <input
                type="text"
                required
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="e.g. Robert Sterling"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="rsterling@apexcpa-demo.com"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry *</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Accounting & Financial Services">Accounting & Financial</option>
                <option value="Biotechnology / AI">Biotechnology / AI</option>
                <option value="FinTech / SaaS">FinTech / SaaS</option>
                <option value="Legal Services">Legal Services</option>
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Size *</label>
              <select
                value={formData.company_size}
                onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Source *</label>
              <select
                value={formData.lead_source}
                onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Inbound Email">Inbound Email</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Partner Network">Partner Network</option>
                <option value="Website">Website</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Required Cloud Services *</label>
              <input
                type="text"
                required
                value={formData.required_services}
                onChange={(e) => setFormData({ ...formData, required_services: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                placeholder="e.g. AWS Migration, Accounting Hosting"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Budget (USD) *</label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={formData.estimated_monthly_budget}
                onChange={(e) => setFormData({ ...formData, estimated_monthly_budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Timeline *</label>
              <select
                value={formData.purchase_timeline}
                onChange={(e) => setFormData({ ...formData, purchase_timeline: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Immediate (<30 days)">Immediate (&lt;30 days)</option>
                <option value="1-3 Months">1-3 Months</option>
                <option value="3-6 Months">3-6 Months</option>
                <option value="Exploratory (>6 months)">Exploratory (&gt;6 months)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Decision Authority *</label>
              <select
                value={formData.decision_maker_authority}
                onChange={(e) => setFormData({ ...formData, decision_maker_authority: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Final Decision Maker">Final Decision Maker (C-Level/Partner)</option>
                <option value="Tech Evaluator / IT Director">Tech Evaluator / IT Director</option>
                <option value="Influencer / Manager">Influencer / Team Manager</option>
                <option value="Gatekeeper / Unknown">Gatekeeper / Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Infrastructure Setup</label>
            <input
              type="text"
              value={formData.current_infra || ''}
              onChange={(e) => setFormData({ ...formData, current_infra: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. On-premise Dell PowerEdge server in office closet"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Business Pain Points</label>
            <textarea
              rows={2}
              value={formData.pain_points || ''}
              onChange={(e) => setFormData({ ...formData, pain_points: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Server freezes during tax filing hours; lack of offsite encrypted backups"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAddModalOpen(false);
                setEditModalOpen(false);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              {addModalOpen ? 'Score & Save Lead' : 'Update Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONVERT TO OPPORTUNITY MODAL */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Lead into Sales Opportunity"
        subtitle={`Promoting ${selectedLead?.company_name} to active deal pipeline`}
        maxWidth="lg"
      >
        <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Opportunity Name *</label>
            <input
              type="text"
              required
              value={convertData.opportunity_name}
              onChange={(e) => setConvertData({ ...convertData, opportunity_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Deal Value (Annual) *</label>
              <input
                type="number"
                required
                value={convertData.expected_deal_value}
                onChange={(e) => setConvertData({ ...convertData, expected_deal_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Recurring Revenue (MRR)</label>
              <input
                type="number"
                value={convertData.mrr}
                onChange={(e) => setConvertData({ ...convertData, mrr: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">One-Time Onboarding Fee</label>
              <input
                type="number"
                value={convertData.one_time_value}
                onChange={(e) => setConvertData({ ...convertData, one_time_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Close Date *</label>
              <input
                type="date"
                required
                value={convertData.expected_close_date}
                onChange={(e) => setConvertData({ ...convertData, expected_close_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="create_account"
              checked={convertData.create_account}
              onChange={(e) => setConvertData({ ...convertData, create_account: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="create_account" className="text-xs text-slate-700 font-medium">
              Automatically create Account record for <strong>{selectedLead?.company_name}</strong>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConvertModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Confirm Opportunity Conversion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
