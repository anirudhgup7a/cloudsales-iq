import React, { useEffect, useState } from 'react';
import {
  FileText, Plus, Search, Download, Trash2, Edit3, X, Eye,
  CheckCircle2, Clock, XCircle, DollarSign, Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { Proposal } from '../types';
import { Modal } from '../components/Modal';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: <Edit3 className="w-3.5 h-3.5" /> },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="w-3.5 h-3.5" /> },
  Accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  Expired: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Calendar className="w-3.5 h-3.5" /> },
};

const emptyForm = (): Partial<Proposal> => ({
  customer_name: '', contact_name: '', contact_email: '',
  recommended_services: '', scope_and_assumptions: '', business_benefits: '',
  one_time_charges: 0, recurring_monthly_charges: 0, contract_duration_months: 12,
  important_exclusions: '', status: 'Draft', notes: '',
  disclaimer: 'This proposal is generated for demonstration purposes as part of the CloudSales IQ portfolio project. All figures, services, and customer details are entirely fictional.'
});

export const ProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [form, setForm] = useState<Partial<Proposal>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [viewProposal, setViewProposal] = useState<Proposal | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setLoading(true); setProposals(await api.getProposals()); }
    catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) {
        await api.updateProposal(editing.id, form);
      } else {
        await api.createProposal(form);
      }
      setShowModal(false); setEditing(null); setForm(emptyForm());
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this proposal?')) return;
    try { await api.deleteProposal(id); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const openEdit = (p: Proposal) => {
    setEditing(p);
    setForm({
      customer_name: p.customer_name, contact_name: p.contact_name, contact_email: p.contact_email,
      recommended_services: p.recommended_services, scope_and_assumptions: p.scope_and_assumptions,
      business_benefits: p.business_benefits, one_time_charges: p.one_time_charges,
      recurring_monthly_charges: p.recurring_monthly_charges, contract_duration_months: p.contract_duration_months,
      important_exclusions: p.important_exclusions, status: p.status, notes: p.notes,
      disclaimer: p.disclaimer
    });
    setShowModal(true);
  };

  const filtered = proposals.filter(p => {
    const matchesSearch = !search || p.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      p.recommended_services.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = proposals.reduce((s, p) => s + p.recurring_monthly_charges * p.contract_duration_months + p.one_time_charges, 0);
  const activeCount = proposals.filter(p => p.status === 'Sent' || p.status === 'Draft').length;
  const acceptedCount = proposals.filter(p => p.status === 'Accepted').length;

  const fmtCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proposals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Create, manage, and track client proposals</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm()); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Total Proposals</p><p className="text-xl font-bold text-slate-900">{proposals.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Total Contract Value</p><p className="text-xl font-bold text-slate-900">{fmtCurrency(totalValue)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-violet-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Active / Accepted</p><p className="text-xl font-bold text-slate-900">{activeCount} / {acceptedCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search proposals..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
          <option value="all">All Statuses</option>
          {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No proposals found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Services</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Monthly</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">One-time</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Duration</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => {
                  const st = STATUS_STYLES[p.status] || STATUS_STYLES.Draft;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{p.reference}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{p.customer_name}</p>
                        <p className="text-xs text-slate-400">{p.contact_name}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[200px] truncate">{p.recommended_services}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{fmtCurrency(p.recurring_monthly_charges)}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{fmtCurrency(p.one_time_charges)}</td>
                      <td className="px-5 py-3.5 text-center text-slate-600">{p.contract_duration_months}mo</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.text}`}>
                          {st.icon} {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setViewProposal(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <a href={api.getPdfUrl(p.id)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition" title="Download PDF">
                            <Download className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewProposal && (
        <Modal title={`Proposal ${viewProposal.reference}`} onClose={() => setViewProposal(null)} width="max-w-3xl">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500 font-medium">Customer</p><p className="font-semibold text-slate-900">{viewProposal.customer_name}</p></div>
              <div><p className="text-xs text-slate-500 font-medium">Contact</p><p className="text-sm text-slate-700">{viewProposal.contact_name} ({viewProposal.contact_email})</p></div>
              <div><p className="text-xs text-slate-500 font-medium">Status</p><p className="text-sm font-semibold">{viewProposal.status}</p></div>
              <div><p className="text-xs text-slate-500 font-medium">Created</p><p className="text-sm text-slate-600">{new Date(viewProposal.created_at).toLocaleDateString()}</p></div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Recommended Services</h3>
              <p className="text-sm text-slate-700">{viewProposal.recommended_services}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Scope & Assumptions</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewProposal.scope_and_assumptions}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Business Benefits</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewProposal.business_benefits}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Monthly Charges</p>
                <p className="text-lg font-bold text-blue-900">{fmtCurrency(viewProposal.recurring_monthly_charges)}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center">
                <p className="text-xs text-violet-600 font-medium">One-time Charges</p>
                <p className="text-lg font-bold text-violet-900">{fmtCurrency(viewProposal.one_time_charges)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">Duration</p>
                <p className="text-lg font-bold text-emerald-900">{viewProposal.contract_duration_months} months</p>
              </div>
            </div>
            {viewProposal.important_exclusions && (
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-amber-800 mb-1">Important Exclusions</h3>
                <p className="text-sm text-amber-700">{viewProposal.important_exclusions}</p>
              </div>
            )}
            <p className="text-[11px] text-slate-400 italic border-t border-slate-200 pt-3">{viewProposal.disclaimer}</p>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Proposal' : 'New Proposal'} onClose={() => { setShowModal(false); setEditing(null); }} width="max-w-2xl">
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer Name *</label>
                <input type="text" value={form.customer_name || ''} onChange={e => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Name *</label>
                <input type="text" value={form.contact_name || ''} onChange={e => setForm({ ...form, contact_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Email *</label>
                <input type="email" value={form.contact_email || ''} onChange={e => setForm({ ...form, contact_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select value={form.status || 'Draft'} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Recommended Services *</label>
              <textarea value={form.recommended_services || ''} onChange={e => setForm({ ...form, recommended_services: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Scope & Assumptions</label>
              <textarea value={form.scope_and_assumptions || ''} onChange={e => setForm({ ...form, scope_and_assumptions: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Benefits</label>
              <textarea value={form.business_benefits || ''} onChange={e => setForm({ ...form, business_benefits: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monthly Charges (₹)</label>
                <input type="number" value={form.recurring_monthly_charges || 0} onChange={e => setForm({ ...form, recurring_monthly_charges: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">One-time Charges (₹)</label>
                <input type="number" value={form.one_time_charges || 0} onChange={e => setForm({ ...form, one_time_charges: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duration (months)</label>
                <input type="number" value={form.contract_duration_months || 12} onChange={e => setForm({ ...form, contract_duration_months: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Important Exclusions</label>
              <textarea value={form.important_exclusions || ''} onChange={e => setForm({ ...form, important_exclusions: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200">
            <button onClick={() => { setShowModal(false); setEditing(null); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.customer_name || !form.contact_name}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : editing ? 'Update Proposal' : 'Create Proposal'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
