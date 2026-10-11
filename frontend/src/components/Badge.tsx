import React from 'react';

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, string> = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${map[priority] || map.Medium}`}>
      {priority} Priority
    </span>
  );
};

export const StageBadge: React.FC<{ stage: string }> = ({ stage }) => {
  const map: Record<string, string> = {
    'Closed Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed Lost': 'bg-slate-100 text-slate-600 border-slate-300',
    'Negotiation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Solution Proposed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Qualified': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Discovery': 'bg-amber-50 text-amber-700 border-amber-200',
    'Contacted': 'bg-purple-50 text-purple-700 border-purple-200',
    'New': 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${map[stage] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {stage}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    Qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Converted: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    New: 'bg-sky-50 text-sky-700 border-sky-200',
    Disqualified: 'bg-slate-100 text-slate-500 border-slate-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'At Risk': 'bg-rose-50 text-rose-700 border-rose-200',
    Upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    Renewed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    'Ready for Review': 'bg-amber-50 text-amber-700 border-amber-200',
    Sent: 'bg-blue-50 text-blue-700 border-blue-200',
    Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${map[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
};
