import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface CsvDropzoneProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const CsvDropzone: React.FC<CsvDropzoneProps> = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError('Faqat .csv formatdagi fayllar qabul qilinadi.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Faylni yuklashda xatolik yuz berdi.');
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50/50'
            : selectedFile
            ? 'border-emerald-400 bg-slate-50'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-800 text-sm mb-1">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">
              {(selectedFile.size / 1024).toFixed(1)} KB • CSV fayl tanlandi
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-slate-500" />
            </div>
            <p className="font-medium text-slate-700 text-sm mb-1">
              CSV faylni bu yerga tashlang yoki <span className="text-emerald-600 underline">tanlang</span>
            </p>
            <p className="text-xs text-slate-400">
              Ustunlar: content (sharh), rating (baho 1-5), author (muallif)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-rose-600 text-sm bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            variant="primary"
          >
            Faylni yuklash va qayta ishlash
          </Button>
        </div>
      )}
    </div>
  );
};
