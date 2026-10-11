import React, { useEffect, useState } from 'react';
import {
  Building2, Plus, Search, ShieldCheck, HeartPulse, RefreshCw,
  TrendingUp, Phone, Mail, ChevronRight, Eye, Edit3, Trash2,
  Calendar, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Account } from '../types';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & detail
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Account>>({
    company_name: '',
    primary_contact: '',
    email: '',
    phone: '',
    industry: 'Accounting & Financial Services',
    company_size: '51-200',
    location: '',
    current_services: 'Accounting & Tax Application Hosting',
    estimated_contract_value: 36000,
    contract_start_date: '2025-11-01',
    contract_end_date: '2026-11-01',
    account_status: 'Active',
    renewal_status: 'Up to date',
    expansion_opportunities: '',
    last_contacted_date: '2026-10-01',
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, [statusFilter]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.getAccounts(params);
      setAccounts(res);
    } catch (err: any) {
      alert('Failed to load accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (acc: Account) => {
    setSelectedAccount(acc);
    setDetailModalOpen(true);
    try {
      const res = await api.getAccountDetail(acc.id);
      setDetailData(res);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount(formData);
      setAddModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      alert('Error creating account: ' + err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await api.updateAccount(selectedAccount.id, formData);
      setEditModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      alert('Error updating account: ' + err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete account "${name}"?`)) return;
    try {
      await api.deleteAccount(id);
      loadAccounts();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filtered = accounts.filter((a) =>
    search ? a.company_name.toLowerCase().includes(search.toLowerCase()) || a.primary_contact.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Accounts & Health Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client health scoring (0-100), identify upsell opportunities, and protect contract renewals.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              company_name: '',
              primary_contact: '',
              email: '',
              phone: '',
              industry: 'Accounting & Financial Services',
              company_size: '51-200',
              location: '',
              current_services: 'Accounting & Tax Application Hosting',
              estimated_contract_value: 36000,
              contract_start_date: '2025-11-01',
              contract_end_date: '2026-11-01',
              account_status: 'Active',
              renewal_status: 'Up to date',
              expansion_opportunities: '',
              last_contacted_date: '2026-10-01',
              notes: ''
            });
            setAddModalOpen(true);
          }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accounts or contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Expanding">Expanding</option>
          </select>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-500">Loading customer accounts...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">No accounts found.</div>
        ) : (
          filtered.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{acc.company_name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{acc.primary_contact} • {acc.industry}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                      acc.health_score >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      acc.health_score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      Health: {acc.health_score}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Cloud Offerings:</span>
                  <p className="font-medium text-slate-800 line-clamp-2">{acc.current_services}</p>
                </div>

                {acc.expansion_opportunities && (
                  <div className="mt-2.5 text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-blue-900 uppercase font-bold block">Expansion Opportunity:</span>
                    <p className="text-[11px] text-blue-800 mt-0.5 line-clamp-2">{acc.expansion_opportunities}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Annual Value</span>
                    <span className="font-bold text-slate-900">${acc.estimated_contract_value.toLocaleString()}/yr</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Renewal</span>
                    <span className="font-semibold text-slate-700">{acc.renewal_status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleOpenDetail(acc)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View 360° Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedAccount(acc);
                        setFormData(acc);
                        setEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(acc.id, acc.company_name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACCOUNT 360 DETAIL MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedAccount ? `${selectedAccount.company_name} — 360° Account Overview` : 'Account Profile'}
        subtitle="Associated sales opportunities, outreach activity timeline, and contract renewals"
        maxWidth="2xl"
      >
        {selectedAccount && (
          <div className="space-y-4 text-xs">
            {/* Meta bar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Primary Contact</span>
                <span className="font-bold text-slate-800">{selectedAccount.primary_contact}</span>
                <span className="text-slate-500 text-[11px] block">{selectedAccount.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Footprint</span>
                <span className="font-bold text-slate-800">${selectedAccount.estimated_contract_value.toLocaleString()}/yr</span>
                <span className="text-slate-500 text-[11px] block">{selectedAccount.renewal_status}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Last Contacted</span>
                <span className="font-semibold text-slate-800">{selectedAccount.last_contacted_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Health</span>
                <span className="text-base font-bold text-emerald-600">{selectedAccount.health_score}/100</span>
              </div>
            </div>

            {/* Opportunities linked */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Related Deals in Pipeline:
              </h4>
              {detailData?.opportunities && detailData.opportunities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {detailData.opportunities.map((opp: any) => (
                    <div key={opp.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 block">{opp.name}</span>
                        <span className="text-[11px] text-slate-500">Close Target: {opp.expected_close_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">${opp.expected_deal_value.toLocaleString()}</span>
                        <span className="block text-[10px] text-blue-600 font-medium">{opp.stage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs py-2">No active pipeline deals for this account.</p>
              )}
            </div>

            {/* Activities linked */}
            <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recent Interactions & Follow-ups:
              </h4>
              {detailData?.activities && detailData.activities.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {detailData.activities.map((act: any) => (
                    <div key={act.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 block">{act.subject}</span>
                        <span className="text-[11px] text-slate-500">{act.date_time} • {act.activity_type}</span>
                      </div>
                      <StatusBadge status={act.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs py-2">No interactions logged.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT ACCOUNT MODAL */}
      <Modal
        isOpen={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        title={addModalOpen ? 'Add Customer Account' : 'Edit Account Details'}
        subtitle="Account health score will calculate automatically based on engagement recency."
        maxWidth="lg"
      >
        <form onSubmit={addModalOpen ? handleCreate : handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Contact *</label>
              <input
                type="text"
                required
                value={formData.primary_contact}
                onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Contract Value ($)</label>
              <input
                type="number"
                value={formData.estimated_contract_value}
                onChange={(e) => setFormData({ ...formData, estimated_contract_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Cloud Services *</label>
            <input
              type="text"
              required
              value={formData.current_services}
              onChange={(e) => setFormData({ ...formData, current_services: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={formData.account_status}
                onChange={(e) => setFormData({ ...formData, account_status: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Expanding">Expanding</option>
                <option value="Churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Renewal Status</label>
              <select
                value={formData.renewal_status}
                onChange={(e) => setFormData({ ...formData, renewal_status: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="Up to date">Up to date</option>
                <option value="Renewing Soon">Renewing Soon</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expansion & Upselling Opportunity</label>
            <input
              type="text"
              value={formData.expansion_opportunities || ''}
              onChange={(e) => setFormData({ ...formData, expansion_opportunities: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Propose Database Modernization and Disaster Recovery"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Save Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
