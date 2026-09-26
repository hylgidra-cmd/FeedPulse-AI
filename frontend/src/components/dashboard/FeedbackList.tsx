import React, { useState } from 'react';
import { Feedback } from '../../types';
import { Badge } from '../ui/Badge';
import { Search } from 'lucide-react';

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading: boolean;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({ feedbacks, isLoading }) => {
  const [filter, setFilter] = useState<'all' | 'negative' | 'neutral' | 'positive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesFilter = filter === 'all' || fb.sentiment === filter;
    const matchesSearch =
      fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fb.author_name && fb.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sharhlar ichidan qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'negative', 'neutral', 'positive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'all' ? 'Barchasi' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Yuklanmoqda...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Mos keluvchi sharhlar topilmadi.
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div key={fb.id} className="p-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-slate-700">{fb.author_name || 'Mijoz'}</span>
                <div className="flex items-center gap-2">
                  {fb.rating && (
                    <span className="text-amber-500 font-bold">★ {fb.rating}/5</span>
                  )}
                  {fb.sentiment && (
                    <Badge variant={fb.sentiment}>{fb.sentiment}</Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{fb.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
