import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, HelpCircle } from 'lucide-react';

interface SidebarProps {
  onNewProjectClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewProjectClick }) => {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <button
            onClick={onNewProjectClick}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Yangi Loyiha</span>
          </button>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Barcha Loyihalar</span>
          </NavLink>
        </nav>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold mb-1">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>FeedPulse AI haqida</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Mijozlar sharhlarini avtomatik klasterlab, Jira tasklarga aylantiring.
        </p>
      </div>
    </aside>
  );
};
