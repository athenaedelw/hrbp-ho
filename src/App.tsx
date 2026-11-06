import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  EntityId,
  EntityConfig,
  DEFAULT_ENTITIES,
  MONTH_NAMES,
  MonthReportData,
  YearData,
} from './types/dashboard';
import {
  createInitialYearData,
  createInitialMonthData,
} from './data/defaultData';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { DataEntryMatrix } from './components/DataEntryMatrix';
import { ReportDocumentView } from './components/ReportDocumentView';
import { LogoModal } from './components/LogoModal';
import { ManageEntitiesModal } from './components/ManageEntitiesModal';
import { StorageModal } from './components/StorageModal';
import {
  saveDashboardToCloud,
  loadDashboardFromCloud,
  subscribeToCloudDashboard,
  testFirestoreConnection,
} from './services/firebase';
import {
  exportMonthlyReportCsv,
  generatePptxReport,
  downloadDashboardPdf,
} from './utils/exportUtils';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  clearLocalStorage,
  resolveSyncState,
  createDefaultProductionState,
} from './utils/storageHelper';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    return loadFromLocalStorage() || createDefaultProductionState();
  });

  const [viewMode, setViewMode] = useState<'dashboard' | 'matrix' | 'document'>('dashboard');
  const [matrixInitialTab, setMatrixInitialTab] = useState<string>('1');
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isEntitiesModalOpen, setIsEntitiesModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isInitialMount = React.useRef(true);
  const isRemoteUpdate = React.useRef(false);
  const hasInitialCloudSyncRef = React.useRef(false);
  const stateRef = React.useRef(appState);
  stateRef.current = appState;

  // Flush state immediately on page close / refresh to guarantee zero data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage(stateRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 1. Initial Firestore connection test & Real-time Live Subscription
  useEffect(() => {
    let isSubscribed = true;

    testFirestoreConnection().then((ok) => {
      if (!ok && isSubscribed) {
        setCloudSyncStatus('offline');
      }
    });

    const unsubscribe = subscribeToCloudDashboard(
      (cloudState) => {
        if (!isSubscribed) return;
        hasInitialCloudSyncRef.current = true;

        const { state: resolvedState, shouldPushToCloud } = resolveSyncState(stateRef.current, cloudState);

        if (!shouldPushToCloud) {
          isRemoteUpdate.current = true;
          setAppState(resolvedState);
          saveToLocalStorage(resolvedState);
          setCloudSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        } else {
          // Local has newer edits or cloud was unseeded: push local to cloud
          saveDashboardToCloud(stateRef.current)
            .then(() => {
              if (isSubscribed) {
                setCloudSyncStatus('synced');
                setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
              }
            })
            .catch((err) => console.warn('Cloud sync error:', err));
        }
      },
      (err) => {
        console.warn('Real-time subscription error:', err);
        if (isSubscribed) {
          hasInitialCloudSyncRef.current = true; // Fallback to local
          setCloudSyncStatus('offline');
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // 2. Dual Persistence: LocalStorage (Immediate) + Firebase Firestore (Dynamic Debounced Cloud Save)
  useEffect(() => {
    // LocalStorage immediate cache
    saveToLocalStorage(appState);

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Guard: Do not overwrite Firestore before initial cloud state has been checked
    if (!hasInitialCloudSyncRef.current) {
      return;
    }

    // Debounced Firestore auto-save on any data/entity/logo mutation
    setCloudSyncStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await saveDashboardToCloud(appState);
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setCloudSyncStatus('synced');
        setLastSyncTime(now);
      } catch (err) {
        console.error('Firestore auto-save error:', err);
        setCloudSyncStatus('offline');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [appState]);

  const currentYearData: YearData = appState.data[appState.activeYear] || createInitialYearData();
  const currentMonthData: MonthReportData =
    currentYearData[appState.activeMonth] || createInitialMonthData(appState.activeMonth);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleUpdateMonthData = useCallback(
    (updatedMonthData: MonthReportData) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const isoStr = now.toISOString();

      setAppState((prev) => {
        const yearData = prev.data[prev.activeYear]
          ? { ...prev.data[prev.activeYear] }
          : createInitialYearData();
        yearData[prev.activeMonth] = updatedMonthData;

        return {
          ...prev,
          savedAt: timeStr,
          updatedAt: isoStr,
          data: {
            ...prev.data,
            [prev.activeYear]: yearData,
          },
        };
      });
    },
    []
  );

  const handleYearChange = (year: number) => {
    setAppState((prev) => {
      const existingYearData = prev.data[year];
      return {
        ...prev,
        activeYear: year,
        updatedAt: new Date().toISOString(),
        data: {
          ...prev.data,
          [year]: existingYearData || createInitialYearData(),
        },
      };
    });
    showToast(`Switched to Fiscal Year ${year}`);
  };

  const handleAddYear = () => {
    const nextYear = Math.max(...appState.years) + 1;
    setAppState((prev) => ({
      ...prev,
      years: [...prev.years, nextYear].sort((a, b) => a - b),
      activeYear: nextYear,
      updatedAt: new Date().toISOString(),
      data: {
        ...prev.data,
        [nextYear]: createInitialYearData(),
      },
    }));
    showToast(`Fiscal Year ${nextYear} reporting workbook created!`);
  };

  const handleForceCloudSync = async () => {
    try {
      setCloudSyncStatus('saving');
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const isoStr = now.toISOString();
      const updatedState = {
        ...appState,
        savedAt: timeStr,
        updatedAt: isoStr,
      };
      setAppState(updatedState);
      saveToLocalStorage(updatedState);
      await saveDashboardToCloud(updatedState, { syncFirestore: true });
      setCloudSyncStatus('synced');
      setLastSyncTime(timeStr);
      showToast('✓ All inputs, interface settings & logo locked! Ready for public republishing.');
    } catch (err) {
      console.error('Force sync error:', err);
      setCloudSyncStatus('offline');
      showToast('Saved to local & server storage.');
      throw err;
    }
  };

  const handlePullCloud = async () => {
    try {
      const cloudData = await loadDashboardFromCloud();
      if (cloudData && cloudData.data) {
        isRemoteUpdate.current = true;
        setAppState((prev) => ({
          ...prev,
          ...cloudData,
        }));
        setCloudSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        showToast('Latest dashboard data loaded!');
      } else {
        showToast('No remote dashboard data found.');
      }
    } catch (err) {
      console.error('Pull cloud error:', err);
      showToast('Could not fetch remote data.');
      throw err;
    }
  };

  const handleMonthChange = (monthIdx: number) => {
    setAppState((prev) => ({
      ...prev,
      activeMonth: monthIdx,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleEntityChange = (entity: 'ALL' | EntityId) => {
    setAppState((prev) => ({
      ...prev,
      activeEntity: entity,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSaveLogo = (newLogoUrl: string | null) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const isoStr = now.toISOString();
    setAppState((prev) => {
      const next = {
        ...prev,
        logoUrl: newLogoUrl,
        savedAt: timeStr,
        updatedAt: isoStr,
      };
      saveToLocalStorage(next);
      saveDashboardToCloud(next, { syncFirestore: true }).catch((e) => console.warn('Logo save error:', e));
      return next;
    });
    showToast('✓ Company logo saved & locked!');
  };

  const handleSaveEntities = (
    updatedEntities: EntityConfig[],
    nameMigrations: Record<string, string>
  ) => {
    setAppState((prev) => {
      const hasRenames = Object.keys(nameMigrations).length > 0;
      let nextData = prev.data;

      if (hasRenames) {
        nextData = JSON.parse(JSON.stringify(prev.data));
        Object.keys(nextData).forEach((yearKey) => {
          const yr = nextData[Number(yearKey)];
          if (!yr) return;
          Object.keys(yr).forEach((monthKey) => {
            const mData: MonthReportData = yr[Number(monthKey)];
            if (!mData) return;

            Object.entries(nameMigrations).forEach(([oldCode, newCode]) => {
              if (oldCode === newCode) return;

              // Workforce
              if (mData.workforce && mData.workforce[oldCode]) {
                mData.workforce[newCode] = { ...mData.workforce[oldCode] };
                delete mData.workforce[oldCode];
              }
              // Headcount Movement
              if (mData.headcountMovement && mData.headcountMovement[oldCode]) {
                mData.headcountMovement[newCode] = { ...mData.headcountMovement[oldCode] };
                delete mData.headcountMovement[oldCode];
              }
              // Segregation
              if (mData.segregation && mData.segregation[oldCode]) {
                mData.segregation[newCode] = { ...mData.segregation[oldCode] };
                delete mData.segregation[oldCode];
              }
              // Turnover
              if (mData.turnover && mData.turnover[oldCode]) {
                mData.turnover[newCode] = { ...mData.turnover[oldCode] };
                delete mData.turnover[oldCode];
              }
              // Recruitment
              if (mData.recruitment && mData.recruitment[oldCode]) {
                mData.recruitment[newCode] = { ...mData.recruitment[oldCode] };
                delete mData.recruitment[oldCode];
              }
              // Training
              if (mData.training && mData.training[oldCode]) {
                mData.training[newCode] = { ...mData.training[oldCode] };
                delete mData.training[oldCode];
              }
              // Attendance
              if (mData.attendance && mData.attendance[oldCode]) {
                mData.attendance[newCode] = { ...mData.attendance[oldCode] };
                delete mData.attendance[oldCode];
              }
              // Contract Expiry summary
              if (mData.contractExpiry && mData.contractExpiry[oldCode]) {
                mData.contractExpiry[newCode] = { ...mData.contractExpiry[oldCode] };
                delete mData.contractExpiry[oldCode];
              }
              // Critical positions
              if (mData.criticalPositions) {
                mData.criticalPositions.forEach((cp) => {
                  if (cp.entitas === oldCode) cp.entitas = newCode;
                });
              }
              // Contract list
              if (mData.contractList) {
                mData.contractList.forEach((cnt) => {
                  if (cnt.entitasJabatan.startsWith(oldCode + ' ') || cnt.entitasJabatan === oldCode) {
                    cnt.entitasJabatan = cnt.entitasJabatan.replace(oldCode, newCode);
                  }
                });
              }
              // Department attendance
              if (mData.departmentAttendance) {
                mData.departmentAttendance.forEach((dept) => {
                  if (dept.entity === oldCode) dept.entity = newCode;
                });
              }
            });
          });
        });
      }

      // Check if activeEntity needs updating
      let nextActiveEntity = prev.activeEntity;
      if (nextActiveEntity !== 'ALL' && nameMigrations[nextActiveEntity]) {
        nextActiveEntity = nameMigrations[nextActiveEntity];
      } else if (nextActiveEntity !== 'ALL' && !updatedEntities.some((e) => e.name === nextActiveEntity)) {
        nextActiveEntity = 'ALL';
      }

      const next = {
        ...prev,
        entities: updatedEntities,
        activeEntity: nextActiveEntity,
        savedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toISOString(),
        data: nextData,
      };
      saveToLocalStorage(next);
      saveDashboardToCloud(next, { syncFirestore: true }).catch((e) => console.warn('Entities save error:', e));
      return next;
    });

    setIsEntitiesModalOpen(false);
    showToast('✓ Entities configuration locked & saved! All records migrated.');
  };

  const handleResetData = () => {
    const resetState = createDefaultProductionState();
    setAppState(resetState);
    clearLocalStorage();
    showToast('All records reset to default executive template!');
  };

  const handleExportCsv = () => {
    exportMonthlyReportCsv(
      currentMonthData,
      appState.activeYear,
      appState.activeMonth,
      appState.entities || DEFAULT_ENTITIES
    );
    showToast('Monthly CSV report downloaded successfully!');
  };

  const handleExportPptx = async () => {
    try {
      showToast('Generating executive PowerPoint (.pptx) presentation...');
      await generatePptxReport(
        currentMonthData,
        appState.activeYear,
        appState.activeMonth,
        appState.logoUrl,
        appState.entities || DEFAULT_ENTITIES
      );
      showToast('PowerPoint (.pptx) presentation downloaded successfully!');
    } catch (err) {
      console.error('PPTX export error:', err);
      showToast('Unable to generate PowerPoint deck. Please retry.');
    }
  };

  const handleDownloadDashboardPdf = async () => {
    try {
      showToast('Generating 1-page Dashboard PDF...');

      const monthName = MONTH_NAMES[appState.activeMonth];
      const entitySuffix = appState.activeEntity === 'ALL' ? 'Consolidated_HO' : appState.activeEntity;
      const filename = `HRBP_Nusaraya_Dashboard_${monthName}_${appState.activeYear}_${entitySuffix}.pdf`;

      await downloadDashboardPdf(
        currentMonthData,
        appState.activeYear,
        appState.activeMonth,
        appState.activeEntity,
        appState.entities || DEFAULT_ENTITIES,
        appState.logoUrl,
        filename
      );
      showToast('1-Page Dashboard PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Unable to generate Dashboard PDF. Please retry.');
    }
  };

  const handleExportJsonBackup = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HRBP_Nusaraya_Backup_${appState.activeYear}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON data backup downloaded!');
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.data && parsed.years) {
          if (!parsed.entities || !Array.isArray(parsed.entities) || parsed.entities.length === 0) {
            parsed.entities = DEFAULT_ENTITIES;
          }
          setAppState(parsed);
          showToast('Data successfully restored from backup file!');
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Failed to read the backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNavigateToTab = (tabId: string) => {
    setMatrixInitialTab(tabId);
    setViewMode('matrix');
  };

  const activeEntities = appState.entities && appState.entities.length > 0 ? appState.entities : DEFAULT_ENTITIES;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* High-Contrast Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Corporate Header */}
      <Header
        years={appState.years}
        activeYear={appState.activeYear}
        activeMonth={appState.activeMonth}
        activeEntity={appState.activeEntity}
        viewMode={viewMode}
        logoUrl={appState.logoUrl}
        lastSaved={appState.savedAt}
        syncStatus={cloudSyncStatus}
        lastSyncTime={lastSyncTime}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        onForceSync={handleForceCloudSync}
        entities={activeEntities}
        onOpenEntitiesModal={() => setIsEntitiesModalOpen(true)}
        onYearChange={handleYearChange}
        onAddYear={handleAddYear}
        onMonthChange={handleMonthChange}
        onEntityChange={handleEntityChange}
        onViewModeChange={setViewMode}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        onExportCsv={handleExportCsv}
        onExportPptx={handleExportPptx}
        onPrintPdf={handleDownloadDashboardPdf}
        onResetData={handleResetData}
        onExportJsonBackup={handleExportJsonBackup}
        onImportJsonBackup={handleImportJsonBackup}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'dashboard' && (
          <ExecutiveDashboard
            currentMonthData={currentMonthData}
            fullYearData={currentYearData}
            activeYear={appState.activeYear}
            activeMonth={appState.activeMonth}
            activeEntity={appState.activeEntity}
            entities={activeEntities}
            logoUrl={appState.logoUrl}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {viewMode === 'matrix' && (
          <DataEntryMatrix
            data={currentMonthData}
            activeYear={appState.activeYear}
            activeMonth={appState.activeMonth}
            initialTab={matrixInitialTab}
            entities={activeEntities}
            onUpdateMonthData={handleUpdateMonthData}
          />
        )}

        {viewMode === 'document' && (
          <ReportDocumentView
            data={currentMonthData}
            activeYear={appState.activeYear}
            activeMonth={appState.activeMonth}
            logoUrl={appState.logoUrl}
            entities={activeEntities}
            onPrint={() => window.print()}
          />
        )}
      </main>

      {/* Corporate Footer (Non-printable) */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            HRBP Nusaraya Head Office Executive Portal &copy; {appState.activeYear} · Entities: {activeEntities.map((e) => e.name).join(', ')}
          </span>
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Dynamic Cloud Sync (Firebase Firestore) & Local Storage (Offline Cache) active
          </span>
        </div>
      </footer>

      {/* Logo Customizer Modal */}
      <LogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogo={appState.logoUrl}
        onSaveLogo={handleSaveLogo}
      />

      {/* Manage Entities Modal */}
      <ManageEntitiesModal
        isOpen={isEntitiesModalOpen}
        onClose={() => setIsEntitiesModalOpen(false)}
        currentEntities={activeEntities}
        onSaveEntities={handleSaveEntities}
      />

      {/* Dynamic Data Storage & Cloud Persistence Settings Modal */}
      <StorageModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        syncStatus={cloudSyncStatus}
        lastSyncTime={lastSyncTime}
        onForceSync={handleForceCloudSync}
        onPullCloud={handlePullCloud}
        onExportCsv={handleExportCsv}
        onExportJsonBackup={handleExportJsonBackup}
      />
    </div>
  );
}
