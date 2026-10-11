import React, { useEffect, useState } from 'react';
import {
  RefreshCw, Plus, Search, Edit3, Trash2, Calendar, Shield,
  AlertTriangle, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Renewal } from '../types';
import { Modal } from '../components/Modal';

const RISK_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Low: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'Upcoming': <Clock className="w-3.5 h-3.5 text-blue-500" />,
  'In Progress': <RefreshCw className="w-3.5 h-3.5 text-amber-500" />,
  'Renewed': <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  'Churned': <XCircle className="w-3.5 h-3.5 text-red-500" />,
  'At Risk': <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
};

const emptyForm = (): Partial<Renewal> => ({
  account_id: 0, contract_name: '', renewal_date: '', estimated_value: 0,
  status: 'Upcoming', risk_category: 'Low', renewal_owner: 'Priya Sharma', notes: ''
});

export const RenewalsPage: React.FC = () => {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Renewal | null>(null);
  const [form, setForm] = useState<Partial<Renewal>>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [timeframe]);

  const load = async () => {
    try { setLoading(true); setRenewals(await api.getRenewals(timeframe)); }
    catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editing) { await api.updateRenewal(editing.id, form); }
      else { await api.createRenewal(form); }
      setShowModal(false); setEditing(null); setForm(emptyForm());
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this renewal record?')) return;
    try { await api.deleteRenewal(id); await load(); }
    catch (e: any) { alert(e.message); }
  };

  const openEdit = (r: Renewal) => {
    setEditing(r);
    setForm({
      account_id: r.account_id, contract_name: r.contract_name, renewal_date: r.renewal_date?.split('T')[0],
      estimated_value: r.estimated_value, status: r.status, risk_category: r.risk_category,
      renewal_owner: r.renewal_owner, notes: r.notes
    });
    setShowModal(true);
  };

  const filtered = renewals.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.contract_name.toLowerCase().includes(q) ||
      (r.account_name || '').toLowerCase().includes(q) ||
      r.renewal_owner.toLowerCase().includes(q);
  });

  const totalValue = renewals.reduce((s, r) => s + r.estimated_value, 0);
  const atRiskValue = renewals.filter(r => r.risk_category === 'High' || r.risk_category === 'Critical')
    .reduce((s, r) => s + r.estimated_value, 0);
  const dueCount = renewals.filter(r => {
    if (!r.renewal_date) return false;
    const diff = (new Date(r.renewal_date).getTime() - Date.now()) / (1000 * 86400);
    return diff <= 30 && diff >= 0;
  }).length;

  const fmtCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');

  const getDaysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 86400));
    if (diff < 0) return <span className="text-red-600 font-semibold">{Math.abs(diff)}d overdue</span>;
    if (diff <= 7) return <span className="text-red-500 font-semibold">{diff}d</span>;
    if (diff <= 30) return <span className="text-amber-600 font-semibold">{diff}d</span>;
    return <span className="text-slate-600">{diff}d</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Renewals & Health</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track contract renewals, manage risk, and prevent churn</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(emptyForm()); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Add Renewal
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Total Renewals</p><p className="text-xl font-bold text-slate-900">{renewals.length}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center"><Shield className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Total Value</p><p className="text-xl font-bold text-slate-900">{fmtCurrency(totalValue)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">At-Risk Value</p><p className="text-xl font-bold text-red-600">{fmtCurrency(atRiskValue)}</p></div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-xs font-medium text-slate-500">Due ≤30 Days</p><p className="text-xl font-bold text-amber-600">{dueCount}</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search renewals..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
        </div>
        <select value={timeframe} onChange={e => setTimeframe(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700">
          <option value="all">All Timeframes</option>
          <option value="30">Next 30 Days</option>
          <option value="60">Next 60 Days</option>
          <option value="90">Next 90 Days</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No renewals found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Contract</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Account</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Value</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Renewal Date</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Days Left</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Risk</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => {
                  const risk = RISK_STYLES[r.risk_category] || RISK_STYLES.Low;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{r.contract_name}</p>
                        <p className="text-xs text-slate-400">{r.renewal_owner}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{r.account_name || `Account #${r.account_id}`}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{fmtCurrency(r.estimated_value)}</td>
                      <td className="px-5 py-3.5 text-center text-sm text-slate-600">
                        {r.renewal_date ? new Date(r.renewal_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm">{r.renewal_date ? getDaysUntil(r.renewal_date) : '—'}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold ${risk.bg} ${risk.text} border ${risk.border}`}>
                          {r.risk_category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          {STATUS_ICONS[r.status]} {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-600 transition" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition" title="Delete">
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

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Renewal' : 'Add Renewal'} onClose={() => { setShowModal(false); setEditing(null); }} width="max-w-lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account ID *</label>
                <input type="number" value={form.account_id || ''} onChange={e => setForm({ ...form, account_id: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contract Name *</label>
                <input type="text" value={form.contract_name || ''} onChange={e => setForm({ ...form, contract_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Renewal Date *</label>
                <input type="date" value={form.renewal_date || ''} onChange={e => setForm({ ...form, renewal_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Estimated Value (₹)</label>
                <input type="number" value={form.estimated_value || 0} onChange={e => setForm({ ...form, estimated_value: +e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                <select value={form.status || 'Upcoming'} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {['Upcoming', 'In Progress', 'Renewed', 'Churned', 'At Risk'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Risk Category</label>
                <select value={form.risk_category || 'Low'} onChange={e => setForm({ ...form, risk_category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                  {['Low', 'Medium', 'High', 'Critical'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Renewal Owner</label>
              <input type="text" value={form.renewal_owner || ''} onChange={e => setForm({ ...form, renewal_owner: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-200">
            <button onClick={() => { setShowModal(false); setEditing(null); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.contract_name}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
