import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  MessageSquare,
  AlertTriangle,
  Smile,
  Frown,
  Flame,
  CheckCircle2,
  Globe,
  FileDown,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { projectsApi } from '../api/projects';
import { analysisApi } from '../api/analysis';
import { Project, ProjectAnalysisSummary, Feedback, UploadStats } from '../types';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/dashboard/MetricCard';
import { SentimentBar } from '../components/dashboard/SentimentBar';
import { ClusterCard } from '../components/dashboard/ClusterCard';
import { FeedbackList } from '../components/dashboard/FeedbackList';
import { CsvDropzone } from '../components/upload/CsvDropzone';
import { AppStoreModal } from '../components/upload/AppStoreModal';
import { ExportReportModal } from '../components/dashboard/ExportReportModal';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<ProjectAnalysisSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedbacks' | 'upload'>('roadmap');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'negative' | 'neutral' | 'positive'>('all');
  const [clusterFilter, setClusterFilter] = useState<'all' | 'open' | 'resolved' | 'critical'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAppStoreOpen, setIsAppStoreOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setError(null);
      const [projData, summaryData, fbsData] = await Promise.all([
        projectsApi.getById(id),
        analysisApi.getClusters(id).catch(() => null),
        projectsApi.getFeedbacks(id).catch(() => []),
      ]);
      setProject(projData);
      setSummary(summaryData);
      setFeedbacks(fbsData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Ma\'lumotlarni yuklashda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleTriggerAnalysis = async () => {
    if (!id) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      await analysisApi.triggerAnalysis(id);
      await loadData();
      setActiveTab('roadmap');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'AI tahlil jarayonida xatolik yuz berdi.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadCsv = async (file: File) => {
    if (!id) return;
    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const stats = await projectsApi.uploadCsv(id, file);
      setUploadSuccess(stats);
      await loadData();
    } catch (err) {
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleResolve = async (clusterId: string) => {
    if (!id) return;
    try {
      const updated = await analysisApi.toggleClusterResolved(id, clusterId);
      setSummary((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          clusters: prev.clusters.map((c) => (c.id === clusterId ? updated : c)),
        };
      });
    } catch (err: any) {
      console.error('Failed to toggle resolve', err);
    }
  };

  const handleCardClick = (target: 'all' | 'negative' | 'clusters' | 'positive') => {
    if (target === 'clusters') {
      setActiveTab('roadmap');
      setTimeout(() => {
        document.getElementById('clusters-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setFeedbackFilter(target);
      setActiveTab('feedbacks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loyiha tahlillari yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-900">Loyiha topilmadi</h2>
        <Link to="/dashboard" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
          Barcha loyihalarga qaytish
        </Link>
      </div>
    );
  }

  const filteredClusters = summary?.clusters.filter((c) => {
    if (clusterFilter === 'open') return !c.is_resolved;
    if (clusterFilter === 'resolved') return c.is_resolved;
    if (clusterFilter === 'critical') return c.severity === 'critical';
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/dashboard" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Barcha loyihalar</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{project.description || 'Tavsif yo\'q'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAppStoreOpen(true)}
            className="gap-1.5 text-xs text-slate-700 hover:text-emerald-700 border-emerald-200 bg-emerald-50/50"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>App Store'dan Real Sharhlar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('upload')}
            className="gap-1.5 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Yuklash</span>
          </Button>

          {summary && summary.clusters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="gap-1.5 text-xs text-slate-700 hover:text-blue-700"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span>Hisobot Eksporti</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerAnalysis}
            isLoading={isAnalyzing}
            className="gap-2 text-xs shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Tahlilni Ishga Tushirish</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Interactive KPI Metric Cards (Always Clickable) */}
      {summary && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Jami Sharhlar"
              value={summary.total_feedbacks}
              subtitle="Barcha fikr-mulohazalar"
              icon={<MessageSquare className="w-5 h-5" />}
              color="blue"
              onClick={() => handleCardClick('all')}
              isActive={activeTab === 'feedbacks' && feedbackFilter === 'all'}
              actionHint="Barchasini ko'rish →"
            />
            <MetricCard
              title="Salbiy Fikrlar"
              value={summary.negative_feedbacks}
              subtitle="Klasterlashga yo'naltirilgan"
              icon={<Frown className="w-5 h-5" />}
              color="rose"
              onClick={() => handleCardClick('negative')}
              isActive={activeTab === 'feedbacks' && feedbackFilter === 'negative'}
              actionHint="Salbiylarni ko'rish →"
            />
            <MetricCard
              title="Aniqlangan Muammolar"
              value={summary.clusters.length}
              subtitle="Groq Llama 3 tahlili"
              icon={<Flame className="w-5 h-5" />}
              color="amber"
              onClick={() => handleCardClick('clusters')}
              isActive={activeTab === 'roadmap'}
              actionHint="Roadmapga o'tish →"
            />
            <MetricCard
              title="Ijobiy Fikrlar"
              value={summary.positive_feedbacks}
              subtitle="Mijozlar maqtovlari"
              icon={<Smile className="w-5 h-5" />}
              color="emerald"
              onClick={() => handleCardClick('positive')}
              isActive={activeTab === 'feedbacks' && feedbackFilter === 'positive'}
              actionHint="Ijobiylarni ko'rish →"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'roadmap'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>AI Muammolar & Jira Roadmap ({summary?.clusters?.length || 0})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('feedbacks');
            setFeedbackFilter('all');
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'feedbacks'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Barcha Sharhlar ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Yangi CSV Qo'shish</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6" id="clusters-section">
          {summary && summary.total_feedbacks > 0 && (
            <SentimentBar
              positive={summary.positive_feedbacks}
              neutral={summary.neutral_feedbacks}
              negative={summary.negative_feedbacks}
            />
          )}

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Eng Muhim Muammolar Klasteri (Roadmap Priority)
                </h2>
                <p className="text-xs text-slate-500">
                  Foydalanuvchilar e'tirozlari bo'yicha guruhlangan va Jira/Linear topshiriqlari tayyorlangan.
                </p>
              </div>

              {/* Cluster Filter Buttons */}
              {summary && summary.clusters.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {(
                    [
                      { id: 'all', label: `Barchasi (${summary.clusters.length})` },
                      {
                        id: 'open',
                        label: `Ochiq (${summary.clusters.filter((c) => !c.is_resolved).length})`,
                      },
                      {
                        id: 'resolved',
                        label: `Hal qilingan (${summary.clusters.filter((c) => c.is_resolved).length})`,
                      },
                      {
                        id: 'critical',
                        label: `Kritik (${summary.clusters.filter((c) => c.severity === 'critical').length})`,
                      },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setClusterFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        clusterFilter === f.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {summary && summary.clusters.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredClusters.length > 0 ? (
                  filteredClusters.map((cluster, idx) => (
                    <ClusterCard
                      key={cluster.id}
                      cluster={cluster}
                      rank={idx + 1}
                      onToggleResolve={handleToggleResolve}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-xl text-xs">
                    Tanlangan filtr bo'yicha muammolar topilmadi.
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900">Tahlil natijalari hali shakllanmagan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Avval CSV formatida foydalanuvchilar fikr-mulohazalarini yuklang yoki App Store'dan torting.
                </p>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAppStoreOpen(true)}
                    className="gap-2 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>App Store</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveTab('upload')}
                    className="gap-2 text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>CSV Yuklash</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedbacks' && (
        <FeedbackList
          feedbacks={feedbacks}
          isLoading={false}
          initialFilter={feedbackFilter}
          onFilterChange={setFeedbackFilter}
        />
      )}

      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto py-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Mijozlar Fikrlarini Yuklash</h2>
            <p className="text-xs text-slate-500 mb-6">
              Mijozlar sharhlarini CSV formatida yuklang. Tizim avtomatik ravishda reyting va matnni aniqlaydi.
            </p>

            <CsvDropzone onUpload={handleUploadCsv} isLoading={isUploading} />

            {uploadSuccess && (
              <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Muvaffaqiyatli yuklandi!</span>
                </div>
                <p>{uploadSuccess.message}</p>
                <div className="pt-2 flex gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setActiveTab('roadmap');
                      handleTriggerAnalysis();
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Darhol AI Tahlilni Boshlash</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App Store Modal */}
      {id && (
        <AppStoreModal
          isOpen={isAppStoreOpen}
          onClose={() => setIsAppStoreOpen(false)}
          projectId={id}
          onSuccess={async (stats: UploadStats) => {
            setUploadSuccess(stats);
            await loadData();
            setActiveTab('feedbacks');
          }}
        />
      )}

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        summary={summary}
        feedbacks={feedbacks}
      />
    </div>
  );
};
