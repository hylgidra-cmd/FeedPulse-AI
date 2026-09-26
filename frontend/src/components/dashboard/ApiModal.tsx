import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Key, Copy, Check, Globe, Code2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';

interface ApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ApiModal: React.FC<ApiModalProps> = ({ isOpen, onClose, project }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const apiKey = project.api_key || `fp_live_${project.id.replace(/-/g, '').slice(0, 20)}`;
  const webhookUrl = `https://feedpulse-ai.onrender.com/api/v1/projects/${project.id}/feedbacks`;

  const domainLabel = project.website_url
    ? project.website_url.replace('https://', '').replace('http://', '').replace('/', '')
    : 'datalife.uz';

  const nodeSnippet = `// ${project.name} uchun sharhlarni avtomatik yuborish kodi:
async function sendFeedbackToFeedPulse(reviewData) {
  const response = await fetch("${webhookUrl}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": "${apiKey}"
    },
    body: JSON.stringify({
      content: reviewData.text, // "Python kursi amaliyoti zo'r o'tdi"
      rating: reviewData.stars, // 5
      author_name: reviewData.studentName, // "Sardor"
      source: "web:${domainLabel}"
    })
  });
  return response.json();
}`;

  const copyToClipboard = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Loyiha API & Webhook Integratsiyasi">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Ushbu API kalit va Webhook orqali <strong>{project.name}</strong> sayti, mobil ilovasi yoki Telegram botidan
          tushadigan barcha izoh va sharhlarni FeedPulse AI-ga avtomatik qabul qiling.
        </p>

        {/* API Key Box */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Loyiha API Kaliti (API Key):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-emerald-700 focus:outline-none"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(apiKey, setCopiedKey)}
              className="gap-1.5 text-xs flex-shrink-0"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Nusxalandi' : 'Nusxa olish'}</span>
            </Button>
          </div>
        </div>

        {/* Webhook Endpoint Box */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Mijoz sharhlari Webhook URL (POST):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(webhookUrl, setCopiedWebhook)}
              className="gap-1.5 text-xs flex-shrink-0"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook ? 'Nusxalandi' : 'Nusxa olish'}</span>
            </Button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              Saytingizga (JavaScript / Node.js) ulash namunasi:
            </label>
            <button
              onClick={() => copyToClipboard(nodeSnippet, setCopiedCode)}
              className="text-[11px] text-emerald-600 hover:underline font-semibold flex items-center gap-1"
            >
              {copiedCode ? 'Nusxalandi!' : 'Kodni nusxalash'}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-48">
            {nodeSnippet}
          </pre>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p>
            Sharhlar yuborilishi bilan, FeedPulse AI Llama 3 tahlil qilib, muammo ildizlarini Roadmap-da chiqaradi!
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Yopish
          </Button>
        </div>
      </div>
    </Modal>
  );
};
