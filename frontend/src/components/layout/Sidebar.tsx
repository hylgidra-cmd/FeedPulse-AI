import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderKanban,
  Sparkles,
  Globe,
  Smartphone,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { Project } from '../../types';

interface SidebarProps {
  onNewProjectClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewProjectClick }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    projectsApi.getAll().then(setProjects).catch(() => {});
  }, [location.pathname]);

  const handleSeedDataLife = async () => {
    setIsSeeding(true);
    try {
      const proj = await projectsApi.seedDemo();
      navigate(`/projects/${proj.id}`);
    } catch (err) {
      console.error('Failed to seed demo project', err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-5">
        <div>
          <button
            onClick={onNewProjectClick}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Yangi Loyiha</span>
          </button>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>Barcha Loyihalar</span>
          </NavLink>
        </nav>

        {/* 1-Click Data Life Quick-Start */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-3 rounded-2xl border border-emerald-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              DATA LIFE IT Academy
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug mb-2.5">
            <strong>DATA LIFE</strong> loyihasini 1-bosishda tayyor kurslar va real sharhlar bilan oching.
          </p>
          <button
            type="button"
            onClick={handleSeedDataLife}
            disabled={isSeeding}
            className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 text-emerald-200" />
            <span>{isSeeding ? 'Yuklanmoqda...' : 'Data Life-ni Ochish'}</span>
          </button>
        </div>

        {/* User's Projects List */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mening Loyihalarim ({projects.length})
            </span>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto">
            {projects.length === 0 ? (
              <p className="text-[11px] text-slate-400 px-2 italic">Hali loyiha yo'q</p>
            ) : (
              projects.map((p) => {
                const isActive = location.pathname === `/projects/${p.id}`;
                return (
                  <NavLink
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {p.platform === 'ios' ? (
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{p.name}</span>
                    </div>
                    {p.feedbacks_count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded-full font-medium">
                        {p.feedbacks_count}
                      </span>
                    )}
                  </NavLink>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Integration & API Key notice */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold mb-1">
          <Code2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Webhook & API Ulanish</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Istalgan veb-sayt (masalan <em>datalife.uz</em>) yoki botingizni integratsiya qiling.
        </p>
      </div>
    </aside>
  );
};
