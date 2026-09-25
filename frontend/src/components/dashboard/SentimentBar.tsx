import React from 'react';

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
}

export const SentimentBar: React.FC<SentimentBarProps> = ({ positive, neutral, negative }) => {
  const total = positive + neutral + negative;
  if (total === 0) {
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-400">Sharhlar hali mavjud emas.</p>
      </div>
    );
  }

  const posPct = Math.round((positive / total) * 100);
  const neuPct = Math.round((neutral / total) * 100);
  const negPct = 100 - posPct - neuPct;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-semibold text-slate-800">Fikrlar Ohangi (Sentiment Nisbati)</h5>
        <span className="text-xs text-slate-500 font-medium">Jami {total} ta sharh</span>
      </div>

      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div
          style={{ width: `${posPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Ijobiy: ${posPct}%`}
        />
        <div
          style={{ width: `${neuPct}%` }}
          className="bg-amber-400 transition-all duration-500"
          title={`Neytral: ${neuPct}%`}
        />
        <div
          style={{ width: `${negPct}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Salbiy: ${negPct}%`}
        />
      </div>

      <div className="flex items-center justify-between text-xs mt-3 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>Ijobiy: <strong>{posPct}%</strong> ({positive})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
          <span>Neytral: <strong>{neuPct}%</strong> ({neutral})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Salbiy: <strong>{negPct}%</strong> ({negative})</span>
        </div>
      </div>
    </div>
  );
};
