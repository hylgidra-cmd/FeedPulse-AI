import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Download, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { UploadStats } from '../../types';

interface AppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: (stats: UploadStats) => void;
}

interface PresetApp {
  name: string;
  icon: string;
  category: string;
  id: string;
}

const PRESET_APPS: PresetApp[] = [
  { name: 'Telegram', icon: '💬', category: 'Messenger', id: '686449807' },
  { name: 'Spotify', icon: '🎵', category: 'Musiqa', id: '324684580' },
  { name: 'WhatsApp', icon: '🟢', category: 'Messenger', id: '310633997' },
  { name: 'ChatGPT', icon: '🤖', category: 'AI', id: '6448311069' },
  { name: 'Instagram', icon: '📸', category: 'Ijtimoiy tarmoq', id: '389801252' },
  { name: 'YouTube', icon: '▶️', category: 'Video', id: '544007664' },
  { name: 'Netflix', icon: '🎬', category: 'Kino & Serial', id: '363590051' },
  { name: 'Uber', icon: '🚗', category: 'Taksi xizmati', id: '368677368' },
];

export const AppStoreModal: React.FC<AppStoreModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}) => {
  const [appId, setAppId] = useState('');
  const [selectedAppName, setSelectedAppName] = useState('');
  const [country, setCountry] = useState('us');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectApp = (app: PresetApp) => {
    setAppId(app.id);
    setSelectedAppName(`${app.icon} ${app.name}`);
    setError(null);
  };

  const handleFetch = async () => {
    if (!appId.trim()) {
      setError('Iltimos, yuqoridagi ilovalardan birini tanlang yoki App Store ID kiriting.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const stats = await projectsApi.scrapeAppStore(projectId, appId.trim(), country);
      onSuccess(stats);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'App Store sharhlarini olishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App Store'dan Real Sharhlarni Yuklab Olish">
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>8 ta Mashhur Global Kompaniya (1-Click tanlash):</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2.5">
            Har bir ilova bo'yicha Apple App Store rasmiy bazasidan eng so'nggi 50 ta real foydalanuvchi sharhi avtomatik tortib olinadi.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_APPS.map((app) => {
              const isSelected = appId === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => selectApp(app)}
                  className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{app.icon}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <div className="mt-1.5">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{app.name}</p>
                    <span className="text-[10px] text-slate-600 font-medium">{app.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanlangan Apple App Store ID:
            </label>
            <input
              type="text"
              placeholder="Masalan: 686449807"
              value={appId}
              onChange={(e) => {
                setAppId(e.target.value);
                setSelectedAppName('');
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {selectedAppName && (
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
                Tanlandi: {selectedAppName}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Birlamchi Hudud:
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="us">Global (AQSH)</option>
              <option value="gb">Buyuk Britaniya</option>
              <option value="ca">Kanada</option>
              <option value="de">Germaniya</option>
              <option value="uz">O'zbekiston</option>
            </select>
          </div>
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
            <span>{selectedAppName ? `${selectedAppName} Sharhlarini Olish` : 'Sharhlarni Tortib Olish'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
