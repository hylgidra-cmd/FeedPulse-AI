import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  MessageSquare,
  Flame,
  ArrowRight,
  Smartphone,
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Key,
  BookOpen,
} from 'lucide-react';
import { projectsApi } from '../api/projects';
import { Project, WebsiteInspectResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const PRESET_APPS = [
  { name: 'Telegram', icon: '💬', category: 'Messenger', id: '686449807' },
  { name: 'Spotify', icon: '🎵', category: 'Musiqa', id: '324684580' },
  { name: 'WhatsApp', icon: '🟢', category: 'Messenger', id: '310633997' },
  { name: 'ChatGPT', icon: '🤖', category: 'AI', id: '6448311069' },
  { name: 'Instagram', icon: '📸', category: 'Ijtimoiy tarmoq', id: '389801252' },
  { name: 'YouTube', icon: '▶️', category: 'Video', id: '544007664' },
  { name: 'Netflix', icon: '🎬', category: 'Kino & Serial', id: '363590051' },
  { name: 'Uber', icon: '🚗', category: 'Taksi xizmati', id: '368677368' },
];

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPlatform, setNewProjectPlatform] = useState('general');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [quickSeedingApp, setQuickSeedingApp] = useState<string | null>(null);

  // Live Website Inspector State
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState<WebsiteInspectResponse | null>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleQuickAppSeed = async (app: typeof PRESET_APPS[0]) => {
    // Check if project already exists
    const existing = projects.find((p) =>
      p.name.toLowerCase().includes(app.name.toLowerCase())
    );
    if (existing) {
      navigate(`/projects/${existing.id}`);
      return;
    }

    setQuickSeedingApp(app.name);
    try {
      const created = await projectsApi.create(
        `${app.icon} ${app.name}`,
        `${app.name} (${app.category}) ilovasi bo'yicha mijozlar sharhlari va muammolari tahlili.`,
        'ios'
      );
      await projectsApi.scrapeAppStore(created.id, app.id, 'us');
      navigate(`/projects/${created.id}`);
    } catch (err) {
      console.error('Failed to quick seed app', err);
    } finally {
      setQuickSeedingApp(null);
    }
  };

  const handleInspectUrl = async () => {
    if (!websiteUrl.trim()) {
      setInspectError('Iltimos, avval veb-sayt manzilini (URL) kiriting.');
      return;
    }

    setIsInspecting(true);
    setInspectError(null);
    setInspectResult(null);

    try {
      const result = await projectsApi.inspectWebsite(websiteUrl.trim());
      setInspectResult(result);

      // Auto-fill project title and description if empty
      if (!newProjectName && result.site_title) {
        setNewProjectName(result.site_title);
      }
      if (!newProjectDesc && result.detected_courses && result.detected_courses.length > 0) {
        setNewProjectDesc(
          `Ta'lim platformasi. Aniqlangan kurslar: ${result.detected_courses.join(', ')}`
        );
      } else if (!newProjectDesc && result.site_description) {
        setNewProjectDesc(result.site_description);
      }
    } catch (err: any) {
      setInspectError(err?.response?.data?.detail || 'Saytni tekshirishda xatolik yuz berdi.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      const created = await projectsApi.create(
        newProjectName,
        newProjectDesc,
        newProjectPlatform,
        websiteUrl.trim() || undefined
      );
      setNewProjectName('');
      setNewProjectDesc('');
      setWebsiteUrl('');
      setInspectResult(null);
      setIsModalOpen(false);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSeedDataLife = async () => {
    setIsLoading(true);
    try {
      const proj = await projectsApi.seedDemo();
      navigate(`/projects/${proj.id}`);
    } catch (err) {
      console.error('Failed to seed demo project', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border border-slate-700/50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              VoC to Roadmap AI
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Mahsulot Loyihalari</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Mijozlar sharhlari (Veb-saytlar, App Store, Play Store, CSV) tahlili va mahsulot roadmapi uchun Jira topshiriqlari.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Loyiha</span>
          </Button>
        </div>
      </div>

      {/* 8 Popular Global Apps Quick Launch Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              8 ta Mashhur Global Ilova (1-bosishda 50 ta real sharh bilan ochish):
            </h3>
            <p className="text-[11px] text-slate-500">
              Apple App Store rasmiy bazasidan eng so'nggi 50 ta haqiqiy mijoz sharhini yuklab, sun'iy intellekt orqali klasterlaydi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {PRESET_APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => handleQuickAppSeed(app)}
              disabled={quickSeedingApp !== null}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-center transition-all flex flex-col items-center justify-center gap-1 group bg-slate-50/50 hover:shadow-xs disabled:opacity-50"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">{app.name}</span>
              <span className="text-[9px] text-emerald-700 font-semibold">
                {quickSeedingApp === app.name ? 'Yuklanmoqda...' : '50 ta sharh'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Loyihalar mavjud emas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Birinchi mahsulotingizni qo'shing yoki tayyor <strong>DATA LIFE IT Academy</strong> loyihasini 1-bosishda oching.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleSeedDataLife}
              variant="outline"
              className="gap-2 text-xs border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>⚡ DATA LIFE IT Academy</span>
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs">
              <Plus className="w-4 h-4" />
              <span>Birinchi loyihani yaratish</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    {proj.platform === 'ios' ? (
                      <>
                        <Smartphone className="w-3 h-3 text-slate-500" /> iOS App
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-600" /> B2B SaaS / Web
                      </>
                    )}
                  </span>
                  {proj.website_url && (
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                      {proj.website_url.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1.5">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {proj.description || 'Tavsif berilmagan'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{proj.feedbacks_count}</span>{' '}
                    <span className="text-[11px] text-slate-400">sharh</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold">{proj.clusters_count}</span>{' '}
                    <span className="text-[11px] text-slate-400">muammo</span>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal with Website Inspector & API Key */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi Mahsulot Loyihasi & Veb-sayt Ulanish"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Platforma turi
            </label>
            <select
              value={newProjectPlatform}
              onChange={(e) => setNewProjectPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="general">B2B SaaS / Veb-sayt / Kurs sayti</option>
              <option value="ios">iOS App Store</option>
              <option value="android">Google Play Store</option>
              <option value="discord">Discord / Community</option>
            </select>
          </div>

          {/* Website URL Input & Live Inspector */}
          {newProjectPlatform === 'general' && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Veb-sayt URL manzili (O'qitish yoki SaaS sayti):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://datalife.uz"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleInspectUrl}
                  isLoading={isInspecting}
                  className="gap-1.5 text-xs flex-shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Saytni Tekshirish</span>
                </Button>
              </div>

              {inspectError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{inspectError}</span>
                </div>
              )}

              {/* Inspector Result Box */}
              {inspectResult && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      {inspectResult.site_title}
                    </span>
                    {inspectResult.is_educational && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Ta'lim sayti
                      </span>
                    )}
                  </div>

                  {/* Detected Courses/Videos */}
                  {inspectResult.detected_courses && inspectResult.detected_courses.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-700 mb-1">
                        Aniqlangan kurslar va yo'nalishlar ({inspectResult.detected_courses.length} ta):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectResult.detected_courses.map((course, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            ✓ {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Alert Box */}
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      inspectResult.has_reviews
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {inspectResult.has_reviews ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold mb-0.5">
                          {inspectResult.has_reviews
                            ? 'Sharhlar aniqlandi!'
                            : "Saytda ochiq sharhlar va izohlar (reviews) topilmadi"}
                        </p>
                        <p className="text-[11px]">{inspectResult.diagnostic_message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Generated API Key Preview */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      Loyihaga avtomatik API Key beriladi
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">
                      fp_live_... (Avtomatik ulanadi)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Loyiha Nomi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: DATA LIFE IT Academy"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tavsif (Description)
            </label>
            <textarea
              rows={2}
              placeholder="Ushbu mahsulot yoki kurs haqida qisqacha ma'lumot..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Bekor qilish
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating} className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Loyihani yaratish</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
