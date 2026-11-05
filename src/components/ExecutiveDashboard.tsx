import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserMinus,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  CalendarCheck2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  EntityId,
  EntityConfig,
  DEFAULT_ENTITIES,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
  MonthReportData,
  YearData,
} from '../types/dashboard';
import { calculateConsolidatedMonth } from '../utils/calculations';
import { DEFAULT_LOGO_SVG } from '../data/defaultData';

interface ExecutiveDashboardProps {
  currentMonthData: MonthReportData;
  fullYearData: YearData;
  activeYear: number;
  activeMonth: number;
  activeEntity: 'ALL' | EntityId;
  entities?: EntityConfig[];
  logoUrl?: string | null;
  onNavigateToTab: (sectionId: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  currentMonthData,
  fullYearData,
  activeYear,
  activeMonth,
  activeEntity,
  entities = DEFAULT_ENTITIES,
  logoUrl,
  onNavigateToTab,
}) => {
  const consolidated = calculateConsolidatedMonth(currentMonthData, entities);

  const isAll = activeEntity === 'ALL';
  const wf = isAll ? consolidated.workforce : currentMonthData.workforce[activeEntity];
  const mv = isAll ? consolidated.headcountMovement : currentMonthData.headcountMovement[activeEntity];
  const sg = isAll ? consolidated.segregation : currentMonthData.segregation[activeEntity];
  const to = isAll ? consolidated.turnover : currentMonthData.turnover[activeEntity];
  const rc = isAll ? consolidated.recruitment : currentMonthData.recruitment[activeEntity];
  const tr = isAll ? consolidated.training : currentMonthData.training[activeEntity];
  const att = isAll ? consolidated.attendance : (currentMonthData.attendance?.[activeEntity] || consolidated.attendance);
  const ce = isAll ? consolidated.contractExpiry : currentMonthData.contractExpiry[activeEntity];

  const currentEntConfig = entities.find((e) => e.name === activeEntity);
  const entityTitle = isAll
    ? `Consolidated Head Office (All ${entities.length} Entities)`
    : `${activeEntity} - ${currentEntConfig?.fullName || activeEntity}`;

  const headcountDelta = (wf?.totalBulanIni || 0) - (wf?.totalBulanLalu || 0);
  const permanentRatio = wf?.totalBulanIni ? Math.round(((wf.tetapBulanIni || 0) / wf.totalBulanIni) * 100) : 0;
  const contractRatio = 100 - permanentRatio;

  // Annual Headcount Trend data (12 months)
  const annualHeadcountTrend = Array.from({ length: 12 }, (_, mIdx) => {
    const mData = fullYearData[mIdx];
    if (!mData) return { month: MONTH_SHORT_NAMES[mIdx], count: 0, turnover: 0 };
    if (isAll) {
      const c = calculateConsolidatedMonth(mData, entities);
      return { month: MONTH_SHORT_NAMES[mIdx], count: c.workforce.totalBulanIni, turnover: c.turnover.turnoverRateBulanBerjalan };
    } else {
      const w = mData.workforce[activeEntity];
      const t = mData.turnover[activeEntity];
      return {
        month: MONTH_SHORT_NAMES[mIdx],
        count: w?.totalBulanIni || 0,
        turnover: t?.turnoverRateBulanBerjalan || 0,
      };
    }
  });

  const maxHeadcount = Math.max(...annualHeadcountTrend.map((d) => d.count), 60);

  // Entity distribution
  const entityDistribution = entities.map((e) => {
    const w = currentMonthData.workforce[e.name] || { totalBulanIni: 0, tetapBulanIni: 0, kontrakBulanIni: 0 };
    return {
      entity: e.name,
      total: w.totalBulanIni || 0,
      tetap: w.tetapBulanIni || 0,
      kontrak: w.kontrakBulanIni || 0,
      color: e.color,
      fullName: e.fullName,
    };
  });
  const maxEntityHeadcount = Math.max(...entityDistribution.map((d) => d.total), 60);

  // Filtered critical positions
  const filteredCriticalPositions = isAll
    ? currentMonthData.criticalPositions
    : currentMonthData.criticalPositions.filter((p) => p.entitas === activeEntity);

  // Contracts expiring <= 60 days
  const criticalContracts = currentMonthData.contractList.filter((c) => {
    const matchesEntity = isAll ? true : c.entitasJabatan.includes(activeEntity);
    return matchesEntity && c.sisaHari <= 60;
  });

  // Department attendance list
  const deptAttendanceList = currentMonthData.departmentAttendance || [];

  const displayLogo = logoUrl || DEFAULT_LOGO_SVG;

  return (
    <div
      id="executive-dashboard-view"
      className="space-y-6 pb-12 animate-in fade-in duration-300 text-slate-900 bg-slate-50"
    >
      {/* Context Top Banner (Bright Modern Corporate) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-xs hidden sm:block">
            <img
              src={displayLogo}
              alt="HRBP Nusaraya Logo"
              className="h-11 max-w-[200px] object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Executive Monthly Report
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {MONTH_NAMES[activeMonth]} {activeYear}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {entityTitle}
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Executive performance metrics covering Workforce, Attendance & Punctuality, Retention, Talent Acquisition, Capability, and Compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateToTab('1')}
            data-html2canvas-ignore="true"
            className="no-print text-xs font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Update Monthly Data</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Scorecards (High Contrast for Elders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Headcount */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Headcount</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {wf?.totalBulanIni || 0}
            </span>
            <span className="text-xs font-bold text-slate-500">staff</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-600 font-medium">vs Prev Month ({wf?.totalBulanLalu || 0}):</span>
            <div
              className={`flex items-center gap-1 font-bold ${
                headcountDelta > 0
                  ? 'text-emerald-700'
                  : headcountDelta < 0
                  ? 'text-rose-700'
                  : 'text-slate-700'
              }`}
            >
              {headcountDelta > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : headcountDelta < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>
                {headcountDelta > 0 ? `+${headcountDelta}` : headcountDelta} net
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Permanent vs Contract Ratio */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employment Type</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-emerald-700">
                {wf?.tetapBulanIni || 0}
              </span>
              <span className="text-xs font-bold text-slate-600 ml-1">Permanent ({permanentRatio}%)</span>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-700">
                {wf?.kontrakBulanIni || 0}
              </span>
              <span className="text-xs font-bold text-slate-600 ml-1">Contract ({contractRatio}%)</span>
            </div>
          </div>
          {/* Progress Bar Stack */}
          <div className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200">
            <div
              className="bg-emerald-600 h-full transition-all duration-500"
              style={{ width: `${permanentRatio}%` }}
              title={`Permanent: ${permanentRatio}%`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${contractRatio}%` }}
              title={`Contract: ${contractRatio}%`}
            />
          </div>
          <div className="mt-2 text-[11px] font-semibold text-slate-500 flex justify-between">
            <span>Permanent: {wf?.tetapBulanIni || 0}</span>
            <span>Contract (PKWT): {wf?.kontrakBulanIni || 0}</span>
          </div>
        </div>

        {/* Card 3: Attendance & Punctuality (NEW HIGHLIGHT) */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attendance Rate</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-700 tracking-tight">
              {att?.presenceRate ?? 97.4}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {att?.onTimeRate ?? 93.2}% on-time
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-600 font-medium">Late Arrival Rate:</span>
            <span className="font-bold text-amber-700">
              {att?.lateRate ?? 6.8}% ({att?.leaveRate ?? 2.6}% leave/absent)
            </span>
          </div>
        </div>

        {/* Card 4: Monthly Turnover Rate */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Monthly Turnover</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <UserMinus className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-700 tracking-tight">
              {to?.turnoverRateBulanBerjalan ?? 0}%
            </span>
            <span className="text-xs font-bold text-slate-500">
              ({to?.keluarBulanBerjalan || 0} exits)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-600 font-medium">YTD Turnover:</span>
            <span className="font-bold text-slate-800">
              {to?.turnoverRateTahunBerjalan ?? 0}% ({to?.keluarTahunBerjalan || 0} total)
            </span>
          </div>
        </div>
      </div>

      {/* ======================= NEW SECTION: ATTENDANCE & PUNCTUALITY BY DEPARTMENT ======================= */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                <CalendarCheck2 className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Attendance & Punctuality Analytics by Department
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              Punctuality performance, on-time check-in vs. late arrival percentages, and average delay by division.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('5')}
            data-html2canvas-ignore="true"
            className="no-print text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto"
          >
            Edit Attendance &rarr;
          </button>
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Overall Presence</span>
            <span className="text-xl font-black text-slate-900">{att?.presenceRate ?? 97.4}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Biometric verified</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">On-Time Arrivals</span>
            <span className="text-xl font-black text-emerald-800">{att?.onTimeRate ?? 93.2}%</span>
            <span className="text-[10px] text-emerald-600 block mt-0.5">Met morning check-in</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Late Arrivals</span>
            <span className="text-xl font-black text-amber-800">{att?.lateRate ?? 6.8}%</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">Recorded delay</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Work Days in Month</span>
            <span className="text-xl font-black text-purple-900">{att?.avgWorkDays ?? 22} Days</span>
            <span className="text-[10px] text-purple-600 block mt-0.5">Official working schedule</span>
          </div>
        </div>

        {/* Department Attendance Bars & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Department Punctuality Comparison
            </h4>
            <div className="space-y-2.5">
              {deptAttendanceList.map((dept) => (
                <div key={dept.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{dept.department}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-bold text-emerald-700">{dept.onTimeRate}% on-time</span>
                      <span className="font-bold text-amber-700">{dept.lateRate}% late</span>
                    </div>
                  </div>
                  {/* Segmented bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${dept.onTimeRate}%` }}
                      title={`On-time: ${dept.onTimeRate}%`}
                    />
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${dept.lateRate}%` }}
                      title={`Late: ${dept.lateRate}%`}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{dept.totalStaff} staff members</span>
                    <span>Avg delay: {dept.avgLateMinutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="overflow-x-auto">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Breakdown & Governance
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2 px-2.5">Department</th>
                  <th className="py-2 px-2 text-center">Staff</th>
                  <th className="py-2 px-2 text-center">On-Time</th>
                  <th className="py-2 px-2 text-center">Late</th>
                  <th className="py-2 px-2 text-center">Avg Delay</th>
                  <th className="py-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {deptAttendanceList.map((dept) => {
                  const status =
                    dept.onTimeRate >= 95
                      ? { label: 'Excellent', cls: 'bg-emerald-100 text-emerald-800' }
                      : dept.onTimeRate >= 90
                      ? { label: 'Good', cls: 'bg-blue-100 text-blue-800' }
                      : { label: 'Attention', cls: 'bg-amber-100 text-amber-800' };

                  return (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 font-bold text-slate-900">{dept.department}</td>
                      <td className="py-2 px-2 text-center font-bold text-slate-600">{dept.totalStaff}</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">{dept.onTimeRate}%</td>
                      <td className="py-2 px-2 text-center font-bold text-amber-700">{dept.lateRate}%</td>
                      <td className="py-2 px-2 text-center text-slate-600">{dept.avgLateMinutes}m</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Charts - Headcount Distribution & 12-Month Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: Headcount Distribution Across Entities */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Headcount Distribution across Entities (HO)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Comparison of permanent vs. contract headcount per entity
              </p>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {MONTH_SHORT_NAMES[activeMonth]} {activeYear}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {entityDistribution.map((item) => {
              const tetapPct = item.total ? Math.round((item.tetap / item.total) * 100) : 0;
              const kontrakPct = 100 - tetapPct;

              return (
                <div key={item.entity} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-black text-slate-900">{item.entity}</span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        ({item.fullName})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-blue-700">Permanent: {item.tetap}</span>
                      <span className="text-amber-700">Contract: {item.kontrak}</span>
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.total} staff
                      </span>
                    </div>
                  </div>
                  {/* Segmented Bar */}
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex border border-slate-200">
                    <div
                      className="bg-blue-600 transition-all duration-300"
                      style={{ width: `${(item.tetap / maxEntityHeadcount) * 100}%` }}
                      title={`${item.entity} Permanent: ${item.tetap} (${tetapPct}%)`}
                    />
                    <div
                      className="bg-amber-500 transition-all duration-300"
                      style={{ width: `${(item.kontrak / maxEntityHeadcount) * 100}%` }}
                      title={`${item.entity} Contract: ${item.kontrak} (${kontrakPct}%)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" /> Permanent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Contract (PKWT)
              </span>
            </div>
            <span className="font-bold text-slate-900">
              Total HO: {consolidated.workforce.totalBulanIni} Staff
            </span>
          </div>
        </div>

        {/* Chart B: Annual Headcount Trend (12 Months Jan - Dec) */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  12-Month Headcount Trajectory ({activeYear})
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {isAll ? 'Consolidated Head Office' : `Entity ${activeEntity}`} (January – December)
                </p>
              </div>
              <span className="text-xs text-slate-700 bg-slate-100 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
                Peak: {maxHeadcount} Staff
              </span>
            </div>

            {/* Vertical column chart with interactive height */}
            <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1 border-b border-slate-200">
              {annualHeadcountTrend.map((bar, idx) => {
                const heightPct = Math.max(10, Math.min(100, Math.round((bar.count / maxHeadcount) * 100)));
                const isCurrent = idx === activeMonth;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-1.5 rounded shadow-lg whitespace-nowrap pointer-events-none z-20">
                      {MONTH_NAMES[idx]}: {bar.count} staff ({bar.turnover}% TO)
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-blue-700 to-blue-500 ring-2 ring-blue-300'
                          : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span
                      className={`text-[10px] mt-2 font-bold ${
                        isCurrent ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {bar.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Selected Month ({MONTH_NAMES[activeMonth]})
            </span>
            <span>Jan: {annualHeadcountTrend[0]?.count || 0}</span>
            <span>Dec: {annualHeadcountTrend[11]?.count || 0}</span>
          </div>
        </div>
      </div>

      {/* Row 3: Employee Segregation & Turnover Reason Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segregation by Grade */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Employee Level Segregation</h3>
              <p className="text-xs font-medium text-slate-500">By Career Grade & Seniority</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Total: {(sg?.nonStaff || 0) + (sg?.staff || 0) + (sg?.managerial || 0)}
            </span>
          </div>

          <div className="space-y-4">
            {/* Non-Staff */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-slate-700">Non-Staff (Grade 1-2)</span>
                <span className="text-slate-900">{sg?.nonStaff || 0} Staff</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full"
                  style={{
                    width: `${
                      wf?.totalBulanIni ? ((sg?.nonStaff || 0) / wf.totalBulanIni) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1.5 block">
                Operational, Administrative & Clerical personnel
              </span>
            </div>

            {/* Staff */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-blue-900">Staff & Officers (Grade 3-4)</span>
                <span className="text-blue-700">{sg?.staff || 0} Staff</span>
              </div>
              <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full"
                  style={{
                    width: `${
                      wf?.totalBulanIni ? ((sg?.staff || 0) / wf.totalBulanIni) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-blue-700 mt-1.5 block">
                Specialists, Engineers, Supervisors & Senior Staff
              </span>
            </div>

            {/* Managerial */}
            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200">
              <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                <span className="text-purple-900">Managerial & Executive (Grade 5≤)</span>
                <span className="text-purple-700">{sg?.managerial || 0} Staff</span>
              </div>
              <div className="w-full bg-purple-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full"
                  style={{
                    width: `${
                      wf?.totalBulanIni ? ((sg?.managerial || 0) / wf.totalBulanIni) * 100 : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-purple-700 mt-1.5 block">
                Department Heads, Senior Managers & Directorate
              </span>
            </div>
          </div>
        </div>

        {/* Turnover Reasons Analysis */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Exit & Resignation Root Cause Analysis
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Primary causes of turnover & trend comparison
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('2')}
              data-html2canvas-ignore="true"
              className="no-print text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              View Full Data &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentMonthData.turnoverReasons.map((reason) => (
              <div
                key={reason.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    {reason.kategori}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        reason.tren === 'Increasing' || reason.tren === 'Naik'
                          ? 'bg-rose-100 text-rose-800'
                          : reason.tren === 'Decreasing' || reason.tren === 'Turun'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {reason.tren}
                    </span>
                    <span className="text-sm font-black text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded">
                      {reason.jumlah}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 font-medium italic">
                  &ldquo;{reason.komentar || 'No additional remarks'}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Critical Positions, Contract Expiries & L&D */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Open Positions */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Critical Open Vacancies</h3>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                {filteredCriticalPositions.length} Positions
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Priority recruitment positions requiring urgent talent pipeline attention
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredCriticalPositions.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-slate-500">
                  No open critical positions recorded this period.
                </div>
              ) : (
                filteredCriticalPositions.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{pos.posisi}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                          pos.prioritas === 'High' || pos.prioritas === 'Tinggi'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {pos.prioritas}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
                      <span className="text-blue-700">{pos.entitas}</span>
                      <span>·</span>
                      <span>Target: {pos.targetBergabung}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 font-medium">
                      Status: <span className="text-slate-800 font-semibold">{pos.tahapSaatIni}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('3')}
            data-html2canvas-ignore="true"
            className="no-print w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <span>Manage Recruitment & Positions</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Contract Expiry Monitoring Widget */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Expiring Contracts</h3>
              </div>
              <span className="text-xs bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full font-bold">
                {ce?.h30?.jumlahKontrak || 0} within 30 days
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Fixed-term contract (PKWT) renewal & conversion decisions
            </p>

            {/* 30, 60, 90 day brackets */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-[10px] text-rose-700 block font-bold uppercase">&lt; 30 Days</span>
                <span className="text-xl font-black text-rose-900">{ce?.h30?.jumlahKontrak || 0}</span>
                <span className="text-[9px] text-slate-600 block mt-0.5 font-medium">
                  {ce?.h30?.keputusanTertunda || 0} Pending
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] text-amber-700 block font-bold uppercase">31-60 Days</span>
                <span className="text-xl font-black text-amber-900">{ce?.h60?.jumlahKontrak || 0}</span>
                <span className="text-[9px] text-slate-600 block mt-0.5 font-medium">
                  {ce?.h60?.keputusanTertunda || 0} Pending
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] text-blue-700 block font-bold uppercase">61-90 Days</span>
                <span className="text-xl font-black text-blue-900">{ce?.h90?.jumlahKontrak || 0}</span>
                <span className="text-[9px] text-slate-600 block mt-0.5 font-medium">
                  {ce?.h90?.keputusanTertunda || 0} Pending
                </span>
              </div>
            </div>

            {/* Urgent Employees */}
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {criticalContracts.slice(0, 3).map((cnt) => (
                <div
                  key={cnt.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cnt.nama}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cnt.sisaHari <= 30
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cnt.sisaHari} days left
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                    <span>{cnt.entitasJabatan}</span>
                    <span className="text-blue-700 font-bold">{cnt.rekomendasi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('6')}
            data-html2canvas-ignore="true"
            className="no-print w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <span>Full Contract Expiry Table</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* L&D & Capability Summary */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Learning & Development</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                {tr?.jamBulanBerjalan || 0} Hours
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Realization of competence & mandatory compliance training
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Completed Sessions</span>
                <span className="text-sm font-black text-slate-900">
                  {tr?.sesiBulanBerjalan || 0} / {tr?.sesiTarget || 0} Sessions
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Total Attendees</span>
                <span className="text-sm font-black text-slate-900">
                  {tr?.pesertaBulanBerjalan || 0} Staff
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Mandatory Safety / K3</span>
                <span className="text-sm font-black text-emerald-700">
                  {tr?.wajibRateBulanBerjalan || 0}% Completed
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-bold">Active HR Strategic Initiatives:</span>
              <span className="font-black text-blue-700 bg-white border border-blue-300 px-2.5 py-0.5 rounded-md">
                {currentMonthData.keyActivities.length} Actions
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('4')}
            data-html2canvas-ignore="true"
            className="no-print w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <span>View Training Programs & Actions</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
