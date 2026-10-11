import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, Plus, CheckCircle2, Clock, AlertCircle, Phone,
  Mail, Users, Presentation, FileText, RefreshCw, Copy,
  Check, Filter, ChevronRight, MessageSquare, Share2
} from 'lucide-react';
import { api } from '../services/api';
import { Activity } from '../types';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [scripts, setScripts] = useState<{ call_scripts: any[]; email_templates: any[] } | null>(null);

  // Modals & tabs
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [nextActionText, setNextActionText] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'scripts'>('queue');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Activity>>({
    related_type: 'lead',
    related_id: 1,
    related_title: 'Prospective Client',
    activity_type: 'Call',
    subject: '',
    date_time: '2026-10-14 11:00',
    due_date: '2026-10-14',
    status: 'Pending',
    sales_owner: 'Priya Sharma',
    notes: ''
  });

  useEffect(() => {
    loadActivities();
    loadScripts();
  }, [statusFilter, typeFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.activity_type = typeFilter;
      const res = await api.getActivities(params);
      setActivities(res);
    } catch (err: any) {
      alert('Failed to load activities: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScripts = async () => {
    try {
      const res = await api.getSalesScripts();
      setScripts(res);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createActivity(formData);
      setAddModalOpen(false);
      loadActivities();
    } catch (err: any) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;
    try {
      await api.completeActivity(selectedActivity.id, outcomeText, nextActionText);
      setCompleteModalOpen(false);
      loadActivities();
    } catch (err: any) {
      alert('Error completing activity: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await api.deleteActivity(id);
      loadActivities();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case 'Email': return <Mail className="w-3.5 h-3.5 text-amber-600" />;
      case 'LinkedIn': return <Share2 className="w-3.5 h-3.5 text-sky-600" />;
      case 'Meeting': return <Users className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Product Demonstration': return <Presentation className="w-3.5 h-3.5 text-purple-600" />;
      case 'Proposal Follow-up': return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Renewal Discussion': return <RefreshCw className="w-3.5 h-3.5 text-rose-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Activities & Outreach Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log client calls, demos, follow-ups, and copy proven B2B sales battlecard scripts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'queue' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Tasks Queue</span>
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'scripts' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Sales Battlecards</span>
            </button>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Activity</span>
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Filter Queue:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending Tasks</option>
                <option value="Overdue">Overdue Tasks</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="">All Activity Types</option>
                <option value="Call">Phone Calls</option>
                <option value="Email">Emails</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Meeting">Meetings</option>
                <option value="Product Demonstration">Demonstrations</option>
                <option value="Proposal Follow-up">Proposal Follow-ups</option>
                <option value="Renewal Discussion">Renewal Discussions</option>
              </select>
            </div>
            <span className="text-slate-400 text-[11px]">{activities.length} total tasks</span>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading activities queue...</div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No activities found matching criteria.</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      {getActivityIcon(act.activity_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{act.subject}</h4>
                        <StatusBadge status={act.status} />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        <strong className="text-slate-800">{act.related_title}</strong> ({act.related_type})
                      </p>
                      {act.outcome && (
                        <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                          Outcome: {act.outcome}
                        </p>
                      )}
                      {act.next_action && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Next Action: {act.next_action}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right text-[11px]">
                      <span className="text-slate-500 block">Due: <b>{act.due_date || act.date_time}</b></span>
                      <span className="text-slate-400 text-[10px]">{act.activity_type}</span>
                    </div>

                    {act.status !== 'Completed' && (
                      <button
                        onClick={() => {
                          setSelectedActivity(act);
                          setOutcomeText('');
                          setNextActionText(act.next_action || '');
                          setCompleteModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(act.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* SALES BATTLECARDS & OUTREACH SCRIPTS TAB */
        <div className="space-y-6">
          <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-xs text-blue-900">
            <strong>Consultative Sales Enablement:</strong> Pre-tested discovery call scripts and email outreach templates ready for copy-pasting during sales calls.
          </div>

          {scripts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Phone Discovery Scripts */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Consultative Phone Discovery Scripts</span>
                </h3>
                {scripts.call_scripts.map((script, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-900">{script.title}</h4>
                        <span className="text-[10px] text-slate-500">Target Persona: {script.persona}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${script.opening}\n\n${script.value_prop}`, `call-${idx}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        {copiedIndex === `call-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === `call-${idx}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Opening Pitch:</span>
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 italic">"{script.opening}"</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Consultative Value Proposition:</span>
                      <p className="text-slate-700 bg-blue-50/40 p-2.5 rounded border border-blue-100">"{script.value_prop}"</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Key Qualification Questions:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                        {script.qualification_questions.map((q: string, i: number) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email Templates */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Outreach & Follow-Up Email Templates</span>
                </h3>
                {scripts.email_templates.map((tpl, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="font-bold text-slate-900">{tpl.title}</h4>
                        <span className="text-[11px] text-slate-500">Subject: <b>{tpl.subject}</b></span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${tpl.subject}\n\n${tpl.body}`, `email-${idx}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                      >
                        {copiedIndex === `email-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIndex === `email-${idx}` ? 'Copied' : 'Copy Email'}</span>
                      </button>
                    </div>

                    <pre className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {tpl.body}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPLETE ACTIVITY MODAL */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Complete Activity & Log Outcome"
        subtitle={`Record client feedback and queue next follow-up`}
        maxWidth="md"
      >
        <form onSubmit={handleComplete} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Activity Outcome *</label>
            <textarea
              required
              rows={3}
              value={outcomeText}
              onChange={(e) => setOutcomeText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Conducted remote demo. Client agreed with proposed multi-user hosting tier."
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Action Required</label>
            <input
              type="text"
              value={nextActionText}
              onChange={(e) => setNextActionText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Send formal proposal by Friday"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCompleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
            >
              Mark Completed
            </button>
          </div>
        </form>
      </Modal>

      {/* SCHEDULE ACTIVITY MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Schedule New Sales Activity"
        subtitle="Log calls, demos, or proposal follow-ups"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject / Task Title *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Architecture discovery call with VP of Engineering"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Activity Type *</label>
              <select
                value={formData.activity_type}
                onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="LinkedIn">LinkedIn Outreach</option>
                <option value="Meeting">Meeting</option>
                <option value="Product Demonstration">Demonstration</option>
                <option value="Proposal Follow-up">Proposal Follow-up</option>
                <option value="Renewal Discussion">Renewal Discussion</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Due Date *</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value, date_time: `${e.target.value} 10:00` })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Organization *</label>
            <input
              type="text"
              required
              value={formData.related_title}
              onChange={(e) => setFormData({ ...formData, related_title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. QuantaBio Therapeutics"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
              Schedule Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
