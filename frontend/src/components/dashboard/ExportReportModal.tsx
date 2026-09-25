import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, Printer } from 'lucide-react';
import { Project, ProjectAnalysisSummary, Feedback, IssueCluster } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  summary: ProjectAnalysisSummary | null;
  feedbacks: Feedback[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  project,
  summary,
}) => {
  const downloadCsvReport = () => {
    if (!summary || !project) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Cluster ID,Title,Severity,Feedback Count,Impact %,Root Cause\r\n';

    summary.clusters.forEach((c: IssueCluster) => {
      const title = `"${(c.title || '').replace(/"/g, '""')}"`;
      const rootCause = `"${(c.root_cause || '').replace(/"/g, '""')}"`;
      const impact = (c.impact_percentage || 0).toFixed(1);
      csvContent += `${c.id},${title},${c.severity},${c.feedback_count},${impact}%,${rootCause}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_AI_Roadmap_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    if (!project || !summary) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const clustersHtml = summary.clusters
      .map(
        (c: IssueCluster, idx: number) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #0f172a; font-size: 16px;">#${idx + 1} ${c.title}</h3>
            <span style="background: ${c.severity === 'critical' || c.severity === 'high' ? '#fee2e2' : '#fef3c7'}; color: ${c.severity === 'critical' || c.severity === 'high' ? '#991b1b' : '#92400e'}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase;">
              ${c.severity}
            </span>
          </div>
          <p style="color: #475569; font-size: 13px; margin: 4px 0 12px 0;"><strong>Ta'sir doirasi:</strong> ${c.feedback_count} ta sharh (${(c.impact_percentage || 0).toFixed(1)}%)</p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 13px; color: #334155; margin-bottom: 12px;">
            <strong>Ildiz sabab:</strong> ${c.root_cause}
          </div>
          <pre style="background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 11px; white-space: pre-wrap; font-family: monospace;">${c.jira_markdown}</pre>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.name} - FeedPulse AI Hisoboti</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; max-width: 800px; margin: 0 auto; }
            h1 { margin-bottom: 4px; color: #059669; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
            .stats { display: flex; gap: 16px; margin-bottom: 24px; }
            .stat-box { flex: 1; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; text-align: center; }
            .stat-val { font-size: 20px; font-weight: bold; color: #0f172a; }
            .stat-lbl { font-size: 12px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FeedPulse AI - Mahsulot Roadmap Hisoboti</h1>
            <p style="color: #64748b; margin: 0; font-size: 14px;">Loyiha: <strong>${project.name}</strong> | Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
          </div>
          <div class="stats">
            <div class="stat-box"><div class="stat-val">${summary.total_feedbacks}</div><div class="stat-lbl">Jami Sharhlar</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #dc2626;">${summary.negative_feedbacks}</div><div class="stat-lbl">Salbiy Fikrlar</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #d97706;">${summary.clusters.length}</div><div class="stat-lbl">Aniqlangan Muammolar</div></div>
            <div class="stat-box"><div class="stat-val" style="color: #16a34a;">${summary.positive_feedbacks}</div><div class="stat-lbl">Ijobiy Fikrlar</div></div>
          </div>
          <h2>Eng Muhim Muammolar Klasteri</h2>
          ${clustersHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tahlil Hisobotini Eksport Qilish">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Ushbu loyiha bo'yicha sun'iy intellekt tahlili natijalarini rahbarlar va muhandislar uchun qulay formatlarda yuklab oling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={downloadCsvReport}
            className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Excel / CSV Formatida</span>
            <span className="text-[11px] text-slate-500 mt-1">Klasterlar, ildiz sabablar va ta'sir foizlari jadvali</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-900">PDF / Chop Etish (Print)</span>
            <span className="text-[11px] text-slate-500 mt-1">Rasmiy xulosa, grafika va Jira chiptalari bilan PDF</span>
          </button>
        </div>

        <div className="pt-2 flex justify-end border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Yopish
          </Button>
        </div>
      </div>
    </Modal>
  );
};
