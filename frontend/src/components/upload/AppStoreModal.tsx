import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, AlertCircle, Info, Sparkles } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { UploadStats } from '../../types';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: (stats: UploadStats) => void;
}

const PRESET_APPS = [
  { name: 'Telegram', id: '686449807', category: 'Messenger' },
  { name: 'Spotify', id: '324684580', category: 'Musiqa' },
  { name: 'WhatsApp', id: '310633997', category: 'Messenger' },
  { name: 'ChatGPT', id: '6448311069', category: 'AI' },
  { name: 'Instagram', id: '389801252', category: 'Social' },
  { name: 'YouTube', id: '544007664', category: 'Video' },
  { name: 'Netflix', id: '363590051', category: 'Kino' },
  { name: 'Uber', id: '368677368', category: 'Taksi' },
];

export const AppStoreModal: React.FC<AppStoreModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const [appId, setAppId] = useState('686449807');
  const [selectedName, setSelectedName] = useState('Telegram');
  const [country, setCountry] = useState('us');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectApp = (app: typeof PRESET_APPS[0]) => {
    setAppId(app.id);
    setSelectedName(app.name);
  };

  const handleFetch = async () => {
    if (!appId.trim()) {
      setError('Iltimos, App Store ilova ID-sini kiriting yoki yuqoridagi ilovalardan birini tanlang.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const stats = await projectsApi.scrapeAppStore(projectId, appId.trim(), country);
      if (stats.total_inserted === 0) {
        setError("Ushbu ilova bo'yicha yozma sharhlar topilmadi. Boshqa ilovani tanlab ko'ring.");
        return;
      }
      onSuccess(stats);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'App Store sharhlarini olishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App Store'dan Jonli Sharhlarni Tortib Olish">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Dunyodagi eng yirik kompaniyalarning haqiqiy mijozlari yozgan sharhlarini to'g'ridan-to'g'ri Apple App Store serverlaridan 1 ta bosishda yuklang.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Mashhur Kompaniyalar (1-Click tanlash):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectApp(app)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  appId === app.id
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{app.name}</div>
                <div className="text-[10px] text-slate-500">{app.category}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apple App Store ID:
            </label>
            <input
              type="text"
              placeholder="Masalan: 686449807"
              value={appId}
              onChange={(e) => {
                setAppId(e.target.value);
                setSelectedName('');
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hudud (Country):
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="us">Global (Avtomatik)</option>
              <option value="gb">Buyuk Britaniya (gb)</option>
              <option value="de">Germaniya (de)</option>
              <option value="au">Avstraliya (au)</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Tanlandi: <strong>{selectedName || appId}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-700">~50 ta so'nggi sharh</span>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="text-xs">
            Bekor qilish
          </Button>
          <Button
            onClick={handleFetch}
            isLoading={isLoading}
            className="gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Yuklanmoqda...' : 'Sharhlarni Tortib Olish'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
