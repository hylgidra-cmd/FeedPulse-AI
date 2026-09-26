import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { IssueCluster } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ClusterCardProps {
  cluster: IssueCluster;
  rank: number;
  onToggleResolve?: (clusterId: string) => void;
}

export const ClusterCard: React.FC<ClusterCardProps> = ({ cluster, rank, onToggleResolve }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyJira = () => {
    if (cluster.jira_markdown) {
      navigator.clipboard.writeText(cluster.jira_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isResolved = cluster.is_resolved;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isResolved
          ? 'bg-slate-50/70 border-slate-200 opacity-80'
          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <span
              className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isResolved
                  ? 'bg-slate-300 text-slate-700'
                  : 'bg-slate-900 text-white shadow-sm'
              }`}
            >
              #{rank}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4
                  className={`text-base font-bold leading-snug ${
                    isResolved ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}
                >
                  {cluster.title}
                </h4>
                {isResolved && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hal qilindi
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <Badge variant={cluster.severity}>
              {cluster.severity.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Impact Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Mijozlar e'tirozining ulushi (Impact):</span>
            <span className="font-bold text-slate-800">
              {cluster.impact_percentage}% ({cluster.feedback_count} ta sharh)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(8, cluster.impact_percentage))}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isResolved
                  ? 'bg-slate-400'
                  : cluster.severity === 'critical'
                  ? 'bg-rose-500'
                  : cluster.severity === 'high'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Root Cause Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4">
          <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Muammoning Tub Sababi (Root Cause):
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">{cluster.root_cause}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" /> Sharhlarni berkitish
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" /> Mijozlar fikrlari ({cluster.sample_feedbacks?.length || 0})
                </>
              )}
            </Button>

            {onToggleResolve && (
              <button
                type="button"
                onClick={() => onToggleResolve(cluster.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors flex items-center gap-1.5 ${
                  isResolved
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {isResolved ? (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Qaytadan ochish
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hal qilindi deb belgilash
                  </>
                )}
              </button>
            )}
          </div>

          <Button
            variant={copied ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleCopyJira}
            className="gap-1.5 text-xs shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nusxalandi!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Jira / Linear Taskni Olish</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-200 p-5 sm:p-6 space-y-4">
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Mijozlar e'tirozidan real namunalar:
            </h5>
            <div className="space-y-2">
              {cluster.sample_feedbacks && cluster.sample_feedbacks.length > 0 ? (
                cluster.sample_feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">{fb.author_name || 'Mijoz'}</span>
                      {fb.rating && (
                        <span className="text-amber-500 font-bold">★ {fb.rating}/5</span>
                      )}
                    </div>
                    <p className="text-slate-600 italic">"{fb.content}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Namunalar mavjud emas.</p>
              )}
            </div>
          </div>

          {cluster.jira_markdown && (
            <div>
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Hosil qilingan Jira / Linear Markdown Taski:
              </h5>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                {cluster.jira_markdown}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
