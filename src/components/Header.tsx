import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  FileSpreadsheet,
  FileText,
  Presentation,
  Download,
  CheckCircle2,
  RotateCcw,
  Upload,
  Database,
  ChevronDown,
  BarChart3,
  Edit3,
  Sliders,
  Cloud,
  CloudOff,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { EntityId, EntityConfig, DEFAULT_ENTITIES, MONTH_NAMES } from '../types/dashboard';
import { DEFAULT_LOGO_SVG } from '../data/defaultData';

interface HeaderProps {
  years: number[];
  activeYear: number;
  activeMonth: number;
  activeEntity: 'ALL' | EntityId;
  viewMode: 'dashboard' | 'matrix' | 'document';
  logoUrl: string | null;
  lastSaved: string | null;
  syncStatus?: 'synced' | 'saving' | 'offline' | 'error';
  lastSyncTime?: string | null;
  onOpenStorageModal?: () => void;
  onForceSync?: () => Promise<void>;
  entities?: EntityConfig[];
  onOpenEntitiesModal?: () => void;
  onYearChange: (year: number) => void;
  onAddYear: () => void;
  onMonthChange: (month: number) => void;
  onEntityChange: (entity: 'ALL' | EntityId) => void;
  onViewModeChange: (mode: 'dashboard' | 'matrix' | 'document') => void;
  onOpenLogoModal: () => void;
  onExportCsv: () => void;
  onExportPptx: () => void;
  onPrintPdf: () => void;
  onResetData: () => void;
  onExportJsonBackup: () => void;
  onImportJsonBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  years,
  activeYear,
  activeMonth,
  activeEntity,
  viewMode,
  logoUrl,
  lastSaved,
  syncStatus = 'synced',
  lastSyncTime,
  onOpenStorageModal,
  onForceSync,
  entities = DEFAULT_ENTITIES,
  onOpenEntitiesModal,
  onYearChange,
  onAddYear,
  onMonthChange,
  onEntityChange,
  onViewModeChange,
  onOpenLogoModal,
  onExportCsv,
  onExportPptx,
  onPrintPdf,
  onResetData,
  onExportJsonBackup,
  onImportJsonBackup,
}) => {
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const displayLogo = logoUrl || DEFAULT_LOGO_SVG;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Corporate Branding & Quick Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div
              onClick={onOpenLogoModal}
              className="cursor-pointer group relative p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-blue-500 transition-all shadow-sm"
              title="Click to customize or upload HRBP Nusaraya company logo"
            >
              <img
                src={displayLogo}
                alt="HRBP Nusaraya Logo"
                className="h-10 max-w-[210px] object-contain group-hover:opacity-95 transition-opacity"
              />
              <div className="absolute inset-0 rounded-xl bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[10px] font-bold text-blue-700 bg-white/95 px-2 py-0.5 rounded shadow border border-blue-200">
                  Change Logo
                </span>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
                  Head Office Only
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {entities.length} Active Mining Entities
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                Executive HR Dashboard & Monthly Report
              </h1>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Dynamic Cloud Sync Status Badge */}
            <button
              onClick={onOpenStorageModal}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                syncStatus === 'saving'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : syncStatus === 'offline'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Click to view Cloud Database (Firestore) & Storage Settings"
            >
              {syncStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : syncStatus === 'offline' ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Saved Locally (Offline)</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Synced (Firestore)</span>
                  {lastSyncTime && <span className="text-[10px] text-emerald-600 font-normal">· {lastSyncTime}</span>}
                </>
              )}
            </button>

            {/* Prominent Lock & Save to Cloud Button */}
            {onForceSync && (
              <button
                onClick={onForceSync}
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                title="Lock all entered data, logo, and customizations to Firebase Cloud so it's permanently stored and displayed to the public"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>Lock & Save to Cloud</span>
              </button>
            )}

            {/* Export PowerPoint */}
            <button
              onClick={onExportPptx}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all hover:scale-[1.02] shadow-sm"
              title="Download complete 7-slide PowerPoint presentation (.pptx)"
            >
              <Presentation className="w-4 h-4 text-amber-600" />
              <span>Download PPTX</span>
            </button>

            {/* Download PDF (1 Page) */}
            <button
              onClick={onPrintPdf}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 transition-all hover:scale-[1.02] shadow-sm"
              title="Download Dashboard as a 1-page PDF document"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Download PDF</span>
            </button>

            {/* Export CSV (Google Sheets ready) */}
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all hover:scale-[1.02] shadow-sm"
              title="Export monthly dataset formatted for Google Sheets & Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {/* Data & Backup Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDataMenuOpen(!dataMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
                title="Data & Backup Management"
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Data & Cloud</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {dataMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setDataMenuOpen(false)}
                >
                  <button
                    onClick={onOpenStorageModal}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cloud & Storage Settings</span>
                  </button>

                  {onForceSync && (
                    <button
                      onClick={() => onForceSync()}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Push to Firestore Cloud Now</span>
                    </button>
                  )}

                  <div className="h-px bg-slate-200 my-1"></div>

                  <button
                    onClick={onExportCsv}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Sheets / Excel CSV</span>
                  </button>

                  <button
                    onClick={onExportJsonBackup}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restore from JSON Backup</span>
                  </button>

                  <div className="h-px bg-slate-200 my-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to reset all data back to the default sample template?')) {
                        onResetData();
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reset to Default Template</span>
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={onImportJsonBackup}
              />
            </div>
          </div>
        </div>

        {/* Secondary Bar: Mode Switcher + Month/Year Bar + Entity Filter */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* View Modes */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => onViewModeChange('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Interactive Analytics</span>
            </button>
            <button
              onClick={() => onViewModeChange('matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Monthly Data Entry</span>
            </button>
            <button
              onClick={() => onViewModeChange('document')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'document'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Document Format</span>
            </button>
          </div>

          {/* Year & Month Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-blue-600 mr-2" />
              <select
                value={activeYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white text-slate-800 font-medium">
                    Year {y}
                  </option>
                ))}
              </select>
              <button
                onClick={onAddYear}
                className="ml-2 text-[10px] text-blue-700 hover:text-blue-800 font-bold px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 border border-blue-200 transition-colors"
                title="Add subsequent fiscal year"
              >
                + Year
              </button>
            </div>

            {/* Month select dropdown */}
            <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <select
                value={activeMonth}
                onChange={(e) => onMonthChange(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx} className="bg-white text-slate-800 font-medium">
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Entity Selector Ribbon */}
        <div className="mt-2.5 pt-2 flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
              <Building2 className="w-3 h-3 text-slate-400" />
              Entity:
            </span>

            <button
              onClick={() => onEntityChange('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 ${
                activeEntity === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Consolidated HO ({entities.length} Entities)
            </button>

            {entities.map((ent) => {
              const isSelected = activeEntity === ent.name;
              return (
                <button
                  key={ent.id || ent.name}
                  onClick={() => onEntityChange(ent.name)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 text-white ring-2 ring-blue-500 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                  title={ent.fullName}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ent.color }}
                  />
                  <span>{ent.name}</span>
                </button>
              );
            })}
          </div>

          {/* Edit Entities Trigger */}
          {onOpenEntitiesModal && (
            <button
              onClick={onOpenEntitiesModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 shadow-xs"
              title="Edit entity names, company titles, colors, or add/delete entities"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Entities</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
