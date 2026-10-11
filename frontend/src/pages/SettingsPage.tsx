import React, { useEffect, useState } from 'react';
import {
  Settings, Target, RotateCcw, CheckCircle2, AlertCircle,
  DollarSign, Calendar, Server, Shield, Info
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [target, setTarget] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetAmount, setTargetAmount] = useState(0);
  const [fiscalQuarter, setFiscalQuarter] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [t, h] = await Promise.all([api.getTarget(), api.getHealth()]);
      setTarget(t);
      setHealth(h);
      setTargetAmount(t?.target_amount || 0);
      setFiscalQuarter(t?.fiscal_quarter || '');
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveTarget = async () => {
    try {
      setSaving(true);
      await api.updateTarget(targetAmount, fiscalQuarter || undefined);
      showToast('Sales target updated successfully!');
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm('Reset all demonstration data to baseline? Custom entries will be replaced with clean fictional records.')) return;
    try {
      setResetting(true);
      await api.resetDemoData();
      showToast('Demo data successfully reset to baseline!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) { alert(e.message); }
    finally { setResetting(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fmtCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" /> {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Demo Data</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure sales targets, manage demo data, and view system health</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Target Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Sales Target Configuration</h2>
              <p className="text-xs text-slate-400">Set monthly revenue targets for pipeline tracking</p>
            </div>
          </div>

          {target && (
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-blue-600">Current Target</span>
                <span className="font-bold text-blue-900">{fmtCurrency(target.target_amount)}</span>
              </div>
              {target.fiscal_quarter && (
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-blue-600">Fiscal Quarter</span>
                  <span className="font-bold text-blue-900">{target.fiscal_quarter}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="font-medium text-blue-600">Achievement</span>
                <span className="font-bold text-blue-900">{(target.achievement_pct || 0).toFixed(1)}%</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Monthly Target Amount (₹)</label>
              <input type="number" value={targetAmount} onChange={e => setTargetAmount(+e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fiscal Quarter (optional)</label>
              <input type="text" value={fiscalQuarter} onChange={e => setFiscalQuarter(e.target.value)} placeholder="e.g. Q4 FY2024–25"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <button onClick={handleSaveTarget} disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
              {saving ? 'Saving...' : 'Update Sales Target'}
            </button>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Demo Data Management</h2>
              <p className="text-xs text-slate-400">Reset demonstration data to baseline records</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p>Resetting demo data will replace all existing records (leads, accounts, opportunities, activities, proposals, renewals) with the standard set of fictional demonstration data. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700">What gets reset:</h3>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />12+ realistic fictional leads with scoring</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Customer accounts with health scores</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" />Sales pipeline with varied stages</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Activities, proposals, and renewals</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Sales target reset to ₹500,000</li>
            </ul>
          </div>

          <button onClick={handleReset} disabled={resetting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2">
            <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reset All Demo Data'}
          </button>
        </div>
      </div>

      {/* System Health */}
      {health && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">System Health</h2>
              <p className="text-xs text-slate-400">Backend API and database connectivity status</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-800">API Status</p>
              <p className="text-sm font-bold text-emerald-900 mt-1">{health.status || 'Healthy'}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Server className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-blue-800">Database</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{health.database || 'SQLite'}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-violet-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-violet-800">Version</p>
              <p className="text-sm font-bold text-violet-900 mt-1">{health.version || '1.0.0'}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <Info className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-amber-800">Environment</p>
              <p className="text-sm font-bold text-amber-900 mt-1">{health.environment || 'Development'}</p>
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
        <h2 className="text-lg font-bold mb-2">About CloudSales IQ</h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          CloudSales IQ is an independent educational portfolio project built by <strong className="text-white">Anirudh Gupta</strong> to demonstrate expertise in cloud services, B2B sales intelligence, CRM design, consultative selling workflows, and full-stack development. This application is not affiliated with, endorsed by, or connected to any commercial entity.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400">Frontend</p>
            <p className="text-sm font-bold">React + TS</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400">Backend</p>
            <p className="text-sm font-bold">FastAPI</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400">Database</p>
            <p className="text-sm font-bold">SQLite / PostgreSQL</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-slate-400">Styling</p>
            <p className="text-sm font-bold">Tailwind CSS</p>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400 italic pb-4">
        All data in this platform is fictional. CloudSales IQ is an independent portfolio project for educational and demonstration purposes only.
      </p>
    </div>
  );
};
