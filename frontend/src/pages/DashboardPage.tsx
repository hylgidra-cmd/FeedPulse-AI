import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, MessageSquare, Flame, ArrowRight, Smartphone, Globe } from 'lucide-react';
import { projectsApi } from '../api/projects';
import { Project } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPlatform, setNewProjectPlatform] = useState('general');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreating(true);
    try {
      await projectsApi.create(newProjectName, newProjectDesc, newProjectPlatform);
      setNewProjectName('');
      setNewProjectDesc('');
      setIsModalOpen(false);
      await fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mahsulot Loyihalari</h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Mijozlar sharhlari (App Store, Play Store, CSV) tahlili va mahsulot roadmapi uchun Jira tasklar.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Loyiha</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Loyihalar mavjud emas</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Birinchi mahsulotingizni qo'shing va mijozlar sharhlarini tahlil qilishni boshlang.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Birinchi loyihani yaratish</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              to={`/projects/${proj.id}`}
              className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500/50 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    {proj.platform === 'ios' ? (
                      <Smartphone className="w-3 h-3 text-slate-500" />
                    ) : (
                      <Globe className="w-3 h-3 text-slate-500" />
                    )}
                    {proj.platform || 'General'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {proj.description || 'Loyiha tavsifi kiritilmagan.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{proj.feedbacks_count} sharh</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>{proj.clusters_count} muammo</span>
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yangi Mahsulot Loyihasi"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Loyiha Nomi *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Fintech Mobile App"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Platforma turi
            </label>
            <select
              value={newProjectPlatform}
              onChange={(e) => setNewProjectPlatform(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="general">B2B SaaS / Web</option>
              <option value="ios">iOS App Store</option>
              <option value="android">Google Play Store</option>
              <option value="discord">Discord / Community</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tavsif
            </label>
            <textarea
              rows={3}
              placeholder="Ushbu mahsulot haqida qisqacha ma'lumot..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Loyihani yaratish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
