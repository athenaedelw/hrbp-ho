import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, RotateCcw, X, Check, Sparkles } from 'lucide-react';
import { DEFAULT_LOGO_SVG } from '../data/defaultData';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logoUrl: string | null) => void;
}

export const LogoModal: React.FC<LogoModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogo || DEFAULT_LOGO_SVG);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        // Downscale image via canvas to keep payload small (<25KB) and ensure Firestore 1MB safety
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 380;
          const maxH = 90;
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimized = canvas.toDataURL('image/png');
            setLogoPreview(optimized);
          } else {
            setLogoPreview(rawUrl);
          }
        };
        img.onerror = () => {
          setLogoPreview(rawUrl);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setLogoPreview(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleResetDefault = () => {
    setLogoPreview(DEFAULT_LOGO_SVG);
  };

  const handleSave = () => {
    onSaveLogo(logoPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-slate-900">
      <div className="bg-white border-2 border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">HRBP Nusaraya Company Logo</h3>
              <p className="text-xs font-medium text-slate-500">Configure corporate branding for dashboard, PDF & PowerPoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Live Preview Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Logo Preview
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Executive Portal (Light)</span>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview Light"
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No logo uploaded</span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Presentation Slides</span>
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview Presentation"
                    className="max-h-12 max-w-full object-contain filter brightness-110 drop-shadow"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No logo</span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Method 1: Local File */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Upload from Computer (PNG, JPG, SVG, WEBP)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 transition-all text-xs font-bold group"
            >
              <Upload className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
              <span>Choose image file from your computer</span>
            </button>
          </div>

          {/* Upload Method 2: Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Or Enter Direct Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://company.com/assets/logo.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Default Preset */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              3. Default Official Emblem
            </label>
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-2 text-xs text-blue-800 hover:text-blue-900 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all font-bold w-full justify-center"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Use Official HRBP Nusaraya Emblem (Default)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Save & Apply Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
