import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitPullRequest, Sparkles,
  CalendarCheck, Building2, FileText, RefreshCw, BarChart3,
  Settings, Menu, X, Cloud, RotateCcw, AlertCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

const navItems = [
  { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads & Qualification', path: '/leads', icon: Users },
  { name: 'Sales Pipeline', path: '/pipeline', icon: GitPullRequest },
  { name: 'Cloud Fit Advisor', path: '/advisor', icon: Sparkles, badge: 'Signature' },
  { name: 'Activities & Follow-ups', path: '/activities', icon: CalendarCheck },
  { name: 'Accounts & Retention', path: '/accounts', icon: Building2 },
  { name: 'Proposals', path: '/proposals', icon: FileText },
  { name: 'Renewals & Health', path: '/renewals', icon: RefreshCw },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Settings & Demo Data', path: '/settings', icon: Settings },
];

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuickReset = async () => {
    if (!window.confirm("Reset demonstration data to standard baseline? Any custom edits will revert to clean fictional records.")) return;
    try {
      setResetting(true);
      await api.resetDemoData();
      setToastMessage("Demo dataset successfully reset to baseline!");
      setTimeout(() => {
        setToastMessage(null);
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      alert("Reset error: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              CloudSales <span className="text-blue-400 font-extrabold">IQ</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">B2B Cloud Sales CRM</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sales Owner Profile & Quick Reset */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-700/60 flex items-center justify-center text-xs font-bold text-blue-200">
                PS
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">Priya Sharma</p>
                <p className="text-[10px] text-slate-400 truncate">Cloud Sales Specialist</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleQuickReset}
            disabled={resetting}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header / Disclosure Banner */}
        <header className="bg-white border-b border-slate-200/80 shrink-0">
          {/* Fictional demo disclosure strip */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-1 text-center text-[11px] text-amber-900 flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Independent Portfolio Project:</strong> All customer names, figures, targets, and metrics are simulated demonstration data.
            </span>
          </div>

          {/* Action Header */}
          <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>CloudSales IQ</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-800 font-semibold">B2B Sales Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/advisor')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Cloud Advisor</span>
              </button>
              <div className="text-right hidden md:block">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Target Attainment: Active Q4
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-slate-300 p-4 border-b border-slate-800 space-y-1 z-30">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded text-xs font-medium ${
                    isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
