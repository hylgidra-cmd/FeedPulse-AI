import React from 'react';
import { Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../../types';

interface AppHeaderProps {
  user?: User | null;
  onLogout: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">FeedPulse</span>
          <span className="ml-1 text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            AI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-800">{user.full_name || user.email}</span>
            </div>
            <button
              onClick={onLogout}
              title="Chiqish"
              className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
