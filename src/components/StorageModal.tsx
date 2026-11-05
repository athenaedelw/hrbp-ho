import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  X,
  Server,
  Database,
  ExternalLink,
} from 'lucide-react';
import { firebaseConfig } from '../services/firebase';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  lastSyncTime: string | null;
  onForceSync: () => Promise<void>;
  onPullCloud: () => Promise<void>;
  onExportCsv: () => void;
  onExportJsonBackup: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  lastSyncTime,
  onForceSync,
  onPullCloud,
  onExportCsv,
  onExportJsonBackup,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setActionMessage('Uploading latest data to Firestore...');
    try {
      await onForceSync();
      setActionMessage('Data successfully saved to Firebase Firestore!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setActionMessage('Sync error: Check network connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullNow = async () => {
    setIsPulling(true);
    setActionMessage('Fetching latest updates from Firestore...');
    try {
      await onPullCloud();
      setActionMessage('Data refreshed from cloud!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      setActionMessage('Failed to fetch from cloud.');
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Dynamic Data Storage & Cloud Persistence</h2>
              <p className="text-xs text-slate-300">Firebase Firestore · Google Sheets · Local Storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback alert */}
        {actionMessage && (
          <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          {/* Storage Channel 1: Firebase Firestore (Active) */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Firebase Firestore Cloud Database</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Live Dynamic Sync
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Every time you input new data or adjust figures, changes are <strong>automatically saved to Firebase Firestore</strong> in real time. Anyone viewing the app or shared link sees updates immediately without republishing.
              </p>
              <div className="mt-2.5 pt-2 border-t border-emerald-200/80 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Project ID:</span>{' '}
                  <span className="font-semibold text-slate-800">{firebaseConfig.projectId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Last Synced:</span>{' '}
                  <span className="font-semibold text-slate-800">{lastSyncTime || 'Just now'}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync to Cloud Now</span>
                </button>
                <button
                  onClick={handlePullNow}
                  disabled={isPulling}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>Pull from Cloud</span>
                </button>
              </div>
            </div>
          </div>

          {/* Storage Channel 2: Google Sheets & Excel Export */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Google Sheets Integration</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  1-Click Export
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                Export your entire monthly dashboard dataset formatted specifically for Google Sheets and Microsoft Excel. You can open and import it directly into your Google Drive spreadsheet.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Google Sheets CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Storage Channel 3: Local Storage Offline Cache */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-700 text-white shrink-0 mt-0.5">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Browser Local Storage Cache</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">
                  Offline Fallback
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                An instant local backup is mirrored directly in your browser. This enables zero-latency page loading and ensures you never lose work even if you go offline.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={onExportJsonBackup}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download Complete JSON Backup</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Database: {firebaseConfig.firestoreDatabaseId || 'Default Firestore'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
