import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, AlertCircle, Info } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { UploadStats } from '../../types';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: (stats: UploadStats) => void;
}

const PRESET_APPS = [
  { name: 'Telegram', id: '686449807' },
  { name: 'Spotify', id: '324684580' },
  { name: 'Duolingo', id: '570060128' },
  { name: 'WhatsApp', id: '310633997' },
];

export const AppStoreModal: React.FC<AppStoreModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const [appId, setAppId] = useState('686449807');
  const [country, setCountry] = useState('us');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("Ushbu ilova yoki tanlangan hudud bo'yicha yozma sharhlar topilmadi. Iltimos, hududni AQSH (us) qilib tanlang.");
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
    <Modal isOpen={isOpen} onClose={onClose} title="App Store'dan Sharhlarni Yuklab Olish">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Istalgan iOS ilovasining jonli sharhlarini to'g'ridan-to'g'ri Apple App Store rasmiy serverlaridan avtomatik tortib oling.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tezkor tanlash (1-Click bilan ilovani belgilang):
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => setAppId(app.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  appId === app.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {app.name} ({app.id})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apple App Store ID:
            </label>
            <input
              type="text"
              placeholder="Masalan: 686449807"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
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
              <option value="us">AQSH (us) — Tavsiya etiladi</option>
              <option value="gb">Buyuk Britaniya (gb)</option>
              <option value="de">Germaniya (de)</option>
              <option value="uz">O'zbekiston (uz)</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Maslahat:</strong> Eng ko'p va sifatli yozma sharhlar <strong>AQSH (us)</strong> do'konida bo'ladi. O'zbekiston hududida yozma sharhlar bo'lmasa, tizim avtomatik global sharhlarni yuklaydi.
          </span>
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
