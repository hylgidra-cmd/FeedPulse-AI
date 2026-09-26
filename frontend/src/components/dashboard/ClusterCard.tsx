import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { IssueCluster } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ClusterCardProps {
  cluster: IssueCluster;
  rank: number;
}

export const ClusterCard: React.FC<ClusterCardProps> = ({ cluster, rank }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyJira = () => {
    if (cluster.jira_markdown) {
      navigator.clipboard.writeText(cluster.jira_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              #{rank}
            </span>
            <h4 className="text-base font-bold text-slate-900 leading-snug">{cluster.title}</h4>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={cluster.severity}>
              {cluster.severity.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Ta'sir doirasi (Impact):</span>
            <span className="font-semibold text-slate-800">
              {cluster.impact_percentage}% ({cluster.feedback_count} ta sharh)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(5, cluster.impact_percentage))}%` }}
              className={`h-full rounded-full ${
                cluster.severity === 'critical'
                  ? 'bg-rose-500'
                  : cluster.severity === 'high'
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 mb-4">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Ildiz sabab (Root Cause):
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">{cluster.root_cause}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
                <ChevronDown className="w-3.5 h-3.5 mr-1" /> Foydalanuvchilar fikrlari ({cluster.sample_feedbacks?.length || 0})
              </>
            )}
          </Button>

          <Button
            variant={copied ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleCopyJira}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Nusxalandi!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Jira Taskni Nusxalash
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-200 p-6 space-y-4">
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Klasterga kiritilgan sharhlar namunalari:
            </h5>
            <div className="space-y-2">
              {cluster.sample_feedbacks && cluster.sample_feedbacks.length > 0 ? (
                cluster.sample_feedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
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
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Hosil qilingan Jira Task (Markdown):
              </h5>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap leading-relaxed">
                {cluster.jira_markdown}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
