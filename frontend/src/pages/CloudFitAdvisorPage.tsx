import React, { useEffect, useState } from 'react';
import {
  Sparkles, CheckCircle2, HelpCircle, AlertTriangle, ArrowRight,
  Save, RotateCcw, Building2, Server, Cpu, Shield, Clock,
  DollarSign, FileText, Check, ListChecks, History
} from 'lucide-react';
import { api } from '../services/api';
import { AssessmentResult } from '../types';

export const CloudFitAdvisorPage: React.FC = () => {
  const [presets, setPresets] = useState<Record<string, any>>({});
  const [activePreset, setActivePreset] = useState<string>('accounting_firm');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form input state
  const [formData, setFormData] = useState<any>({
    customer_name: 'Apex Tax & Accounting Advisory LLC',
    industry: 'Accounting & Financial Services',
    company_size: '11-50',
    existing_infra: 'Aging On-Premise Windows Server in office closet',
    business_problem: 'Tax season remote access lags; partner concerns over data loss, ransomware risks, and lack of nightly encrypted offsite backups.',
    workload_type: 'Accounting & Tax Software (QuickBooks Enterprise, Drake, Lacerte)',
    approx_monthly_budget: 1200.0,
    data_sensitivity: 'High (Financial records, SSNs, Client PII)',
    expected_scalability: 'Predictable seasonal surges (Jan-April) requiring flexible concurrent user licenses',
    availability_requirements: '99.9% uptime during business hours with dedicated phone support',
    migration_urgency: 'Immediate (<30 days, prior to tax filing cycle)',
    preferred_deployment: 'Fully Managed Cloud Hosting'
  });

  // Recommendation output state
  const [recommendation, setRecommendation] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    loadPresetsAndEvaluate();
  }, []);

  const loadPresetsAndEvaluate = async () => {
    try {
      const p = await api.getAdvisorPresets();
      setPresets(p);
      if (p['accounting_firm']) {
        setFormData(p['accounting_firm']);
        const res = await api.evaluateAssessment(p['accounting_firm']);
        setRecommendation(res);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleApplyPreset = async (presetKey: string) => {
    setActivePreset(presetKey);
    const selected = presets[presetKey];
    if (selected) {
      setFormData(selected);
      try {
        setLoading(true);
        const res = await api.evaluateAssessment(selected);
        setRecommendation(res);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.evaluateAssessment(formData);
      setRecommendation(res);
    } catch (err: any) {
      alert('Evaluation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPipeline = async () => {
    try {
      setSaving(true);
      const res = await api.saveAssessment(formData, true);
      setSaveSuccess(`Assessment saved! Created Opportunity #${res.opportunity_id} in Active Pipeline.`);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Signature Feature Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Consultative Selling Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Cloud Fit Advisor — Technical Architecture Recommendation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Rule-based consultation engine that maps prospective customer requirements to appropriate cloud offerings.
            Generates explainable technical fit rationales, assumptions, architectural trade-offs, and critical qualification questions for the sales interview.
          </p>
        </div>

        {/* 3 Ready-to-Use Signature Demo Scenarios */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Load Ready-to-Demonstrate Consultation Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleApplyPreset('accounting_firm')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                activePreset === 'accounting_firm'
                  ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">1. Accounting Firm</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">QuickBooks/Drake Desktop Cloud</p>
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset('startup_aws')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                activePreset === 'startup_aws'
                  ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">2. Startup AWS Migration</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">Monolith to Aurora & Autoscaling</p>
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset('ai_gpu')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                activePreset === 'ai_gpu'
                  ? 'bg-blue-600/30 border-blue-400 text-white ring-1 ring-blue-400'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">3. Dedicated AI GPU</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">Reserved H100 Cluster & K8s</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
          <a href="/pipeline" className="text-emerald-700 underline hover:text-emerald-900">
            View in Pipeline &rarr;
          </a>
        </div>
      )}

      {/* Main 2-Column Consultation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 10-Point Assessment Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Requirements Assessment</h3>
              <p className="text-[11px] text-slate-500">Edit any parameter to re-run consultation logic</p>
            </div>
          </div>

          <form onSubmit={handleEvaluate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prospective Client Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Size</label>
                <select
                  value={formData.company_size}
                  onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Infrastructure</label>
              <input
                type="text"
                value={formData.existing_infra}
                onChange={(e) => setFormData({ ...formData, existing_infra: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Pain Point / Challenge</label>
              <textarea
                rows={2}
                value={formData.business_problem}
                onChange={(e) => setFormData({ ...formData, business_problem: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application or Workload Type</label>
              <input
                type="text"
                value={formData.workload_type}
                onChange={(e) => setFormData({ ...formData, workload_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approx. Monthly Budget ($)</label>
                <input
                  type="number"
                  value={formData.approx_monthly_budget}
                  onChange={(e) => setFormData({ ...formData, approx_monthly_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Migration Urgency</label>
                <select
                  value={formData.migration_urgency}
                  onChange={(e) => setFormData({ ...formData, migration_urgency: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Immediate (<30 days)">Immediate (&lt;30 days)</option>
                  <option value="1-3 Months">1-3 Months</option>
                  <option value="3-6 Months">3-6 Months</option>
                  <option value="Exploratory">Exploratory</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data Sensitivity / Compliance</label>
                <input
                  type="text"
                  value={formData.data_sensitivity}
                  onChange={(e) => setFormData({ ...formData, data_sensitivity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Availability & SLA Goal</label>
                <input
                  type="text"
                  value={formData.availability_requirements}
                  onChange={(e) => setFormData({ ...formData, availability_requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Model...' : 'Re-Evaluate Cloud Fit'}</span>
            </button>
          </form>
        </div>

        {/* Right: Transparent Recommendation Output */}
        <div className="lg:col-span-7 space-y-4">
          {recommendation ? (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                    Recommended Offering Category:
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {recommendation.recommended_category}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Estimated Sizing: <span className="font-semibold text-slate-700">{recommendation.estimated_tier}</span>
                  </p>
                </div>
                <button
                  onClick={handleSaveToPipeline}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Creating Deal...' : 'Save to Sales Pipeline'}</span>
                </button>
              </div>

              {/* Specific Services */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Recommended Service Modules:
                </span>
                <div className="flex flex-wrap gap-2">
                  {recommendation.recommended_services.map((svc) => (
                    <span
                      key={svc}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span>{svc}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Fit Rationale */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                  Why this solution fits stated requirements:
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {recommendation.fit_rationale}
                </p>
              </div>

              {/* Projected Business Benefits */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Projected Business & Operational Benefits:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recommendation.business_benefits.map((benefit, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-white flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assumptions & Trade-offs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 block">Architectural Assumptions:</span>
                  <p className="text-slate-600 leading-relaxed">{recommendation.assumptions}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
                  <span className="font-bold text-amber-900 block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Technical Trade-Offs to Disclose:</span>
                  </span>
                  <p className="text-amber-800 leading-relaxed">{recommendation.trade_offs}</p>
                </div>
              </div>

              {/* 4 Critical Questions for Sales Rep to Ask Next */}
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Critical Consultative Questions for Sales Representative to Ask:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-900">
                  {recommendation.next_questions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing Information Requiring Validation */}
              {recommendation.missing_info && (
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Missing Information Needing Engineering Validation: </span>
                  <span>{recommendation.missing_info}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
              Select a scenario or fill the assessment form to generate a cloud recommendation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
