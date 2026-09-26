import React, { useState, useEffect } from 'react';
import { Feedback } from '../../types';
import { Badge } from '../ui/Badge';
import { Search, Star, MessageSquare, Smartphone } from 'lucide-react';

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading: boolean;
  initialFilter?: 'all' | 'negative' | 'neutral' | 'positive';
  onFilterChange?: (filter: 'all' | 'negative' | 'neutral' | 'positive') => void;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  isLoading,
  initialFilter = 'all',
  onFilterChange,
}) => {
  const [filter, setFilter] = useState<'all' | 'negative' | 'neutral' | 'positive'>(initialFilter);
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleFilterClick = (newFilter: 'all' | 'negative' | 'neutral' | 'positive') => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const availableSources = Array.from(new Set(feedbacks.map((f) => f.source).filter(Boolean)));

  const formatSourceLabel = (src: string) => {
    if (!src) return 'Noma\'lum';
    if (src.startsWith('app_store:')) {
      return `🍎 ${src.replace('app_store:', '')}`;
    }
    if (src === 'app_store') return '🍎 App Store';
    if (src === 'csv') return '📄 CSV Fayl';
    return src;
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesFilter = filter === 'all' || fb.sentiment === filter;
    const matchesRating = ratingFilter === 'all' || fb.rating === ratingFilter;
    const matchesSource = sourceFilter === 'all' || fb.source === sourceFilter;
    const matchesSearch =
      fb.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fb.author_name && fb.author_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesRating && matchesSource && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Sharhlar matni yoki mijoz ismida qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Badges & Rating */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sentiment Filter */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl">
            {(
              [
                { id: 'all', label: 'Barchasi' },
                { id: 'negative', label: 'Salbiy 🔴' },
                { id: 'neutral', label: 'Neytral ⚪' },
                { id: 'positive', label: 'Ijobiy 🟢' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => handleFilterClick(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* App / Source Filter (if multiple) */}
          {availableSources.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Barcha ilovalar</option>
                {availableSources.map((src) => (
                  <option key={src} value={src}>
                    {formatSourceLabel(src)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Barcha yulduzlar</option>
              <option value="5">5 ★ yulduz</option>
              <option value="4">4 ★ yulduz</option>
              <option value="3">3 ★ yulduz</option>
              <option value="2">2 ★ yulduz</option>
              <option value="1">1 ★ yulduz</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subheader status bar */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Filtr bo'yicha ko'rsatilmoqda:{' '}
          <strong className="text-slate-800 font-bold">{filteredFeedbacks.length}</strong> ta sharh (umumiy{' '}
          {feedbacks.length} tadan)
        </span>
        {(filter !== 'all' || ratingFilter !== 'all' || sourceFilter !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              handleFilterClick('all');
              setRatingFilter('all');
              setSourceFilter('all');
              setSearchTerm('');
            }}
            className="text-emerald-600 hover:underline font-medium text-[11px]"
          >
            Filtrni tozalash
          </button>
        )}
      </div>

      {/* Feedbacks Scrollable Feed */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span>Sharhlar yuklanmoqda...</span>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">Mos keluvchi sharhlar topilmadi</p>
            <p className="text-slate-400 mt-1">Filtr yoki qidiruv so'zini o'zgartirib ko'ring.</p>
          </div>
        ) : (
          filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">
                    {fb.author_name || 'App Store Foydalanuvchisi'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                    {formatSourceLabel(fb.source)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {fb.rating && (
                    <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {fb.rating}/5
                    </span>
                  )}
                  {fb.sentiment && (
                    <Badge variant={fb.sentiment}>
                      {fb.sentiment === 'positive'
                        ? 'Ijobiy'
                        : fb.sentiment === 'negative'
                        ? 'Salbiy'
                        : 'Neytral'}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{fb.content}</p>

              {fb.created_at && (
                <span className="text-[10px] text-slate-400 self-end">
                  {new Date(fb.created_at).toLocaleDateString('uz-UZ')}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
