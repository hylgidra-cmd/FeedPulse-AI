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

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<ProjectAnalysisSummary | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedbacks' | 'upload'>('roadmap');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(err?.response?.data?.detail || 'Ma\'lumotlarni yuklashda xatolik');
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

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loyiha yuklanmoqda...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Loyiha topilmadi</h3>
        <Link to="/" className="text-emerald-600 underline text-sm mt-2 inline-block">
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Barcha loyihalar
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{project.description || 'Tavsif yo\'q'}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('upload')}
            className="gap-2 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV Yuklash</span>
          </Button>

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
          onClick={() => setActiveTab('feedbacks')}
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

      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Jami Sharhlar"
                value={summary.total_feedbacks}
                icon={<MessageSquare className="w-5 h-5" />}
                color="blue"
              />
              <MetricCard
                title="Salbiy Fikrlar"
                value={summary.negative_feedbacks}
                subtitle="Klasterlashga yo'naltirilgan"
                icon={<Frown className="w-5 h-5" />}
                color="rose"
              />
              <MetricCard
                title="Aniqlangan Muammolar"
                value={summary.clusters.length}
                subtitle="Groq Llama 3 tahlili"
                icon={<Flame className="w-5 h-5" />}
                color="amber"
              />
              <MetricCard
                title="Ijobiy Fikrlar"
                value={summary.positive_feedbacks}
                icon={<Smile className="w-5 h-5" />}
                color="emerald"
              />
            </div>
          )}

          {summary && summary.total_feedbacks > 0 && (
            <SentimentBar
              positive={summary.positive_feedbacks}
              neutral={summary.neutral_feedbacks}
              negative={summary.negative_feedbacks}
            />
          )}

          {summary && summary.clusters.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Eng Muhim Muammolar Klasteri (Roadmap Priority)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Foydalanuvchilar e'tirozlari bo'yicha guruhlangan va Jira/Linear topshiriqlari tayyorlangan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {summary.clusters.map((cluster, idx) => (
                  <ClusterCard key={cluster.id} cluster={cluster} rank={idx + 1} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Tahlil natijalari hali shakllanmagan
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                {feedbacks.length > 0
                  ? 'Bazadagi sharhlarni semantik klasterlash va Jira tasklarini hosil qilish uchun tugmani bosing.'
                  : 'Avval CSV formatida foydalanuvchilar fikr-mulohazalarini yuklang.'}
              </p>
              {feedbacks.length > 0 ? (
                <Button
                  onClick={handleTriggerAnalysis}
                  isLoading={isAnalyzing}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Tahlilni Boshlash</span>
                </Button>
              ) : (
                <Button onClick={() => setActiveTab('upload')} className="gap-2">
                  <Upload className="w-4 h-4" />
                  <span>CSV Yuklash</span>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedbacks' && (
        <FeedbackList feedbacks={feedbacks} isLoading={false} />
      )}

      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">CSV formatidagi sharhlarni yuklash</h3>
            <p className="text-xs text-slate-500 mb-6">
              Fayl ichidagi sharhlar avtomatik filtrlanadi (15 belgidan qisqalari chiqarib tashlanadi) va vektor bazaga saqlanadi.
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
    </div>
  );
};
