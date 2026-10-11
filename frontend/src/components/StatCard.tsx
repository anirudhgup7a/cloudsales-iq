import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  color = 'blue'
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            trend === 'down' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
            'bg-slate-100 text-slate-600'
          }`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};
