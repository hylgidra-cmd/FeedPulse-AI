import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'emerald' | 'rose' | 'amber' | 'blue' | 'slate';
  onClick?: () => void;
  isActive?: boolean;
  actionHint?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'slate',
  onClick,
  isActive = false,
  actionHint,
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20',
      hoverBorder: 'hover:border-emerald-300',
      textAccent: 'text-emerald-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      activeRing: 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/20',
      hoverBorder: 'hover:border-rose-300',
      textAccent: 'text-rose-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      activeRing: 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20',
      hoverBorder: 'hover:border-amber-300',
      textAccent: 'text-amber-600',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      activeRing: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20',
      hoverBorder: 'hover:border-blue-300',
      textAccent: 'text-blue-600',
    },
    slate: {
      iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
      activeRing: 'ring-2 ring-slate-500 border-slate-500 bg-slate-50/20',
      hoverBorder: 'hover:border-slate-300',
      textAccent: 'text-slate-600',
    },
  };

  const scheme = colorMap[color];
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all duration-200 text-left relative flex flex-col justify-between ${
        isClickable
          ? `cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] group ${scheme.hoverBorder}`
          : 'border-slate-200 shadow-sm'
      } ${isActive ? scheme.activeRing : 'border-slate-200 shadow-sm'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate mb-1">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h4>
        </div>
        <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform group-hover:scale-105 ${scheme.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-1">
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
        {trend && <p className="text-xs text-emerald-600 font-medium">{trend}</p>}

        {isClickable && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
            <span>{actionHint || "Ko'rish uchun bosing"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        )}
      </div>
    </div>
  );
};
