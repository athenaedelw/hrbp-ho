import React, { useState } from 'react';
import {
  EntityId,
  EntityConfig,
  DEFAULT_ENTITIES,
  MONTH_NAMES,
  MonthReportData,
  CriticalPositionItem,
  MainTrainingItem,
  HRIssueItem,
  ContractEmployeeItem,
  KeyPointActivityItem,
  DepartmentAttendance,
} from '../types/dashboard';
import {
  Users,
  UserMinus,
  Briefcase,
  GraduationCap,
  CalendarCheck2,
  AlertTriangle,
  Clock,
  ListTodo,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { calculateDaysRemaining } from '../utils/calculations';

interface DataEntryMatrixProps {
  data: MonthReportData;
  activeYear: number;
  activeMonth: number;
  initialTab?: string;
  entities?: EntityConfig[];
  onUpdateMonthData: (updated: MonthReportData) => void;
}

export const DataEntryMatrix: React.FC<DataEntryMatrixProps> = ({
  data,
  activeYear,
  activeMonth,
  initialTab = '1',
  entities = DEFAULT_ENTITIES,
  onUpdateMonthData,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const activeEntities = entities && entities.length > 0 ? entities : DEFAULT_ENTITIES;
  const entityList = activeEntities.map((e) => e.name);

  const tabs = [
    { id: '1', label: '1. Workforce Overview', icon: Users },
    { id: '2', label: '2. Turnover & Retention', icon: UserMinus },
    { id: '3', label: '3. Recruitment & Manpower', icon: Briefcase },
    { id: '4', label: '4. Learning & Development', icon: GraduationCap },
    { id: '5', label: '5. Attendance & Departments', icon: CalendarCheck2 },
    { id: '6', label: '6. Expiring Contracts (PKWT)', icon: Clock },
    { id: '7', label: '7. HR Strategic Issues', icon: AlertTriangle },
    { id: '8', label: '8. Key Point Activities', icon: ListTodo },
  ];

  const handleWorkforceChange = (entity: EntityId, field: string, value: number) => {
    const updated = { ...data };
    const curWf = { ...updated.workforce[entity] };
    (curWf as any)[field] = value;
    updated.workforce[entity] = curWf;
    onUpdateMonthData(updated);
  };

  const handleMovementChange = (entity: EntityId, field: string, value: any) => {
    const updated = { ...data };
    const curMv = { ...updated.headcountMovement[entity] };
    (curMv as any)[field] = value;
    updated.headcountMovement[entity] = curMv;
    onUpdateMonthData(updated);
  };

  const handleSegregationChange = (entity: EntityId, field: string, value: number) => {
    const updated = { ...data };
    const curSg = { ...updated.segregation[entity] };
    (curSg as any)[field] = value;
    updated.segregation[entity] = curSg;
    onUpdateMonthData(updated);
  };

  const handleTurnoverChange = (entity: EntityId, field: string, value: any) => {
    const updated = { ...data };
    const curTo = { ...updated.turnover[entity] };
    (curTo as any)[field] = value;
    updated.turnover[entity] = curTo;
    onUpdateMonthData(updated);
  };

  const handleRecruitmentChange = (entity: EntityId, field: string, value: any) => {
    const updated = { ...data };
    const curRc = { ...updated.recruitment[entity] };
    (curRc as any)[field] = value;
    updated.recruitment[entity] = curRc;
    onUpdateMonthData(updated);
  };

  const handleTrainingChange = (entity: EntityId, field: string, value: any) => {
    const updated = { ...data };
    const curTr = { ...updated.training[entity] };
    (curTr as any)[field] = value;
    updated.training[entity] = curTr;
    onUpdateMonthData(updated);
  };

  const handleAttendanceChange = (entity: EntityId, field: string, value: any) => {
    const updated = { ...data };
    const curAtt = { ...(updated.attendance?.[entity] || { presenceRate: 97, onTimeRate: 93, lateRate: 7, leaveRate: 3, avgWorkDays: 22 }) };
    (curAtt as any)[field] = value;
    if (!updated.attendance) updated.attendance = {} as any;
    updated.attendance[entity] = curAtt;
    onUpdateMonthData(updated);
  };

  const handleContractExpirySummaryChange = (
    entity: EntityId,
    bracket: 'h30' | 'h60' | 'h90',
    field: string,
    value: any
  ) => {
    const updated = { ...data };
    const curCe = { ...updated.contractExpiry[entity] };
    const curBracket = { ...curCe[bracket] };
    (curBracket as any)[field] = value;
    curCe[bracket] = curBracket;
    updated.contractExpiry[entity] = curCe;
    onUpdateMonthData(updated);
  };

  return (
    <div className="space-y-6 pb-16 text-slate-900">
      {/* Tab Switcher (Bright, High Contrast) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0 text-blue-600" />
          <span className="font-medium">
            Editing Period: <strong className="font-extrabold text-blue-950">{MONTH_NAMES[activeMonth]} {activeYear}</strong>. All entries auto-save immediately to your browser storage.
          </span>
        </div>
        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Auto-Save Active
        </span>
      </div>

      {/* ===================== TAB 1: WORKFORCE OVERVIEW ===================== */}
      {activeTab === '1' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Main Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">1. Workforce Overview</h3>
                <p className="text-xs font-medium text-slate-500">
                  Input headcount for Previous Month, Current Month, and view automated variance calculations
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Workforce Metric</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={3} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-black">{e}</span>
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Prev</span>
                          <span>Current</span>
                          <span className="text-slate-800">Diff</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* Total Headcount */}
                  <tr className="hover:bg-slate-50 font-bold text-slate-900 bg-blue-50/20">
                    <td className="py-3 px-4 font-black">Total Headcount</td>
                    {entityList.map((e) => {
                      const item = data.workforce[e] || { totalBulanLalu: 0, totalBulanIni: 0 };
                      const diff = (item.totalBulanIni || 0) - (item.totalBulanLalu || 0);
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={item.totalBulanLalu}
                              onChange={(ev) => handleWorkforceChange(e, 'totalBulanLalu', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-800 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={item.totalBulanIni}
                              onChange={(ev) => handleWorkforceChange(e, 'totalBulanIni', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-blue-400 rounded px-1.5 py-1 text-center text-blue-900 font-black focus:outline-none focus:border-blue-600"
                            />
                          </td>
                          <td className={`py-2 px-1 text-center font-black ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Permanent Staff */}
                  <tr className="hover:bg-slate-50 text-slate-800">
                    <td className="py-2.5 px-4 pl-6 text-slate-700">Permanent Staff</td>
                    {entityList.map((e) => {
                      const item = data.workforce[e] || { tetapBulanLalu: 0, tetapBulanIni: 0 };
                      const diff = (item.tetapBulanIni || 0) - (item.tetapBulanLalu || 0);
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={item.tetapBulanLalu}
                              onChange={(ev) => handleWorkforceChange(e, 'tetapBulanLalu', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={item.tetapBulanIni}
                              onChange={(ev) => handleWorkforceChange(e, 'tetapBulanIni', Number(ev.target.value))}
                              className="w-14 bg-white border border-emerald-400 rounded px-1.5 py-1 text-center text-emerald-800 font-bold"
                            />
                          </td>
                          <td className={`py-2 px-1 text-center font-bold ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Contract Staff */}
                  <tr className="hover:bg-slate-50 text-slate-800">
                    <td className="py-2.5 px-4 pl-6 text-slate-700">Contract Staff (PKWT)</td>
                    {entityList.map((e) => {
                      const item = data.workforce[e] || { kontrakBulanLalu: 0, kontrakBulanIni: 0 };
                      const diff = (item.kontrakBulanIni || 0) - (item.kontrakBulanLalu || 0);
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={item.kontrakBulanLalu}
                              onChange={(ev) => handleWorkforceChange(e, 'kontrakBulanLalu', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={item.kontrakBulanIni}
                              onChange={(ev) => handleWorkforceChange(e, 'kontrakBulanIni', Number(ev.target.value))}
                              className="w-14 bg-white border border-amber-400 rounded px-1.5 py-1 text-center text-amber-800 font-bold"
                            />
                          </td>
                          <td className={`py-2 px-1 text-center font-bold ${diff > 0 ? 'text-emerald-700' : diff < 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Open Vacancies */}
                  <tr className="hover:bg-slate-50 text-slate-800">
                    <td className="py-2.5 px-4 pl-6 text-slate-700">Open Vacancies</td>
                    {entityList.map((e) => {
                      const item = data.workforce[e] || { posisiKosongBulanLalu: 0, posisiKosongBulanIni: 0 };
                      const diff = (item.posisiKosongBulanIni || 0) - (item.posisiKosongBulanLalu || 0);
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={item.posisiKosongBulanLalu}
                              onChange={(ev) => handleWorkforceChange(e, 'posisiKosongBulanLalu', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={item.posisiKosongBulanIni}
                              onChange={(ev) => handleWorkforceChange(e, 'posisiKosongBulanIni', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-800 font-bold"
                            />
                          </td>
                          <td className="py-2 px-1 text-center font-medium text-slate-500">
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Movement Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">A. Headcount Movement & Causes</h3>
              <p className="text-xs font-medium text-slate-500">
                Beginning headcount, new hires, exits, internal transfers, and primary remarks
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[180px]">Movement Type</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={2} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-bold">{e}</span>
                        <div className="grid grid-cols-2 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Count</span>
                          <span>Remarks</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* Beginning */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">Beginning headcount</td>
                    {entityList.map((e) => {
                      const mv = data.headcountMovement[e] || { awalBulan: 0 };
                      return (
                        <td key={e} colSpan={2} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={mv.awalBulan}
                            onChange={(ev) => handleMovementChange(e, 'awalBulan', Number(ev.target.value))}
                            className="w-16 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold text-slate-900"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* New Hires */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-emerald-700">New Hires (+)</td>
                    {entityList.map((e) => {
                      const mv = data.headcountMovement[e] || { masuk: 0 };
                      return (
                        <td key={e} colSpan={2} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={mv.masuk}
                            onChange={(ev) => handleMovementChange(e, 'masuk', Number(ev.target.value))}
                            className="w-16 bg-white border-2 border-emerald-400 rounded px-1.5 py-1 text-center text-emerald-800 font-black"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Exits */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-rose-700">Departures / Exits (-)</td>
                    {entityList.map((e) => {
                      const mv = data.headcountMovement[e] || { keluar: 0 };
                      return (
                        <td key={e} colSpan={2} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={mv.keluar}
                            onChange={(ev) => handleMovementChange(e, 'keluar', Number(ev.target.value))}
                            className="w-16 bg-white border-2 border-rose-400 rounded px-1.5 py-1 text-center text-rose-800 font-black"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Transfers */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-amber-700">Internal Transfers (+/-)</td>
                    {entityList.map((e) => {
                      const mv = data.headcountMovement[e] || { mutasiInternal: 0 };
                      return (
                        <td key={e} colSpan={2} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={mv.mutasiInternal}
                            onChange={(ev) => handleMovementChange(e, 'mutasiInternal', Number(ev.target.value))}
                            className="w-16 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-amber-800 font-bold"
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Remarks */}
                  <tr className="hover:bg-slate-50 bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-700">Primary Cause / Remarks</td>
                    {entityList.map((e) => {
                      const mv = data.headcountMovement[e] || { catatan: '' };
                      return (
                        <td key={e} colSpan={2} className="py-1.5 px-1.5 border-l border-slate-200">
                          <input
                            type="text"
                            placeholder="Reason or notes..."
                            value={mv.catatan || ''}
                            onChange={(ev) => handleMovementChange(e, 'catatan', ev.target.value)}
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Segregation Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">B. Employee Segregation by Level</h3>
              <p className="text-xs font-medium text-slate-500">
                Non-Staff (Grade 1-2), Staff (Grade 3-4), Managerial (Grade 5≤)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Level / Career Grade</th>
                    {entityList.map((e) => (
                      <th key={e} className="py-3 px-3 text-center border-l border-slate-200 text-blue-700 font-black">
                        {e}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-800">Non-Staff (Grade 1-2)</td>
                    {entityList.map((e) => {
                      const sg = data.segregation[e] || { nonStaff: 0 };
                      return (
                        <td key={e} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={sg.nonStaff}
                            onChange={(ev) => handleSegregationChange(e, 'nonStaff', Number(ev.target.value))}
                            className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center text-slate-900 font-bold"
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-blue-800">Staff (Grade 3-4)</td>
                    {entityList.map((e) => {
                      const sg = data.segregation[e] || { staff: 0 };
                      return (
                        <td key={e} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={sg.staff}
                            onChange={(ev) => handleSegregationChange(e, 'staff', Number(ev.target.value))}
                            className="w-16 bg-white border border-blue-400 rounded px-2 py-1 text-center text-blue-900 font-bold"
                          />
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-purple-800">Managerial (Grade 5≤)</td>
                    {entityList.map((e) => {
                      const sg = data.segregation[e] || { managerial: 0 };
                      return (
                        <td key={e} className="py-1 px-2 border-l border-slate-200 text-center">
                          <input
                            type="number"
                            value={sg.managerial}
                            onChange={(ev) => handleSegregationChange(e, 'managerial', Number(ev.target.value))}
                            className="w-16 bg-white border border-purple-400 rounded px-2 py-1 text-center text-purple-900 font-bold"
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: TURNOVER & RETENTION ===================== */}
      {activeTab === '2' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">2. Turnover & Retention Analytics</h3>
              <p className="text-xs font-medium text-slate-500">
                Input monthly exits, voluntary vs. involuntary resignations, and turnover percentages
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Retention Metric</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={3} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-black">{e}</span>
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Current</span>
                          <span>Prev</span>
                          <span>YTD</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* Departures */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-rose-800">Total Departures / Exits</td>
                    {entityList.map((e) => {
                      const to = data.turnover[e] || { keluarBulanBerjalan: 0, keluarBulanSebelumnya: 0, keluarTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={to.keluarBulanBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'keluarBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-rose-400 rounded px-1.5 py-1 text-center text-rose-800 font-black"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={to.keluarBulanSebelumnya}
                              onChange={(ev) => handleTurnoverChange(e, 'keluarBulanSebelumnya', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={to.keluarTahunBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'keluarTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Voluntary */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 pl-6 text-slate-700">Voluntary Resignations</td>
                    {entityList.map((e) => {
                      const to = data.turnover[e] || { sukarelaBulanBerjalan: 0, sukarelaBulanSebelumnya: 0, sukarelaTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={to.sukarelaBulanBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'sukarelaBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-800 font-bold"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={to.sukarelaBulanSebelumnya}
                              onChange={(ev) => handleTurnoverChange(e, 'sukarelaBulanSebelumnya', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={to.sukarelaTahunBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'sukarelaTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Turnover Rate % */}
                  <tr className="hover:bg-slate-50 bg-blue-50/20 font-black text-slate-900">
                    <td className="py-2.5 px-4">Turnover Rate (%)</td>
                    {entityList.map((e) => {
                      const to = data.turnover[e] || { turnoverRateBulanBerjalan: 0, turnoverRateBulanSebelumnya: 0, turnoverRateTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              value={to.turnoverRateBulanBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'turnoverRateBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-blue-400 rounded px-1 py-1 text-center text-blue-900 font-black text-xs"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              step="0.01"
                              value={to.turnoverRateBulanSebelumnya}
                              onChange={(ev) => handleTurnoverChange(e, 'turnoverRateBulanSebelumnya', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700 text-xs"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              step="0.01"
                              value={to.turnoverRateTahunBerjalan}
                              onChange={(ev) => handleTurnoverChange(e, 'turnoverRateTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700 text-xs"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Turnover Reason Breakdown */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              A. Exit & Resignation Cause Analysis
            </h3>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Compensation, career opportunity, family/relocation, end of contract, etc.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Reason Category</th>
                    <th className="py-2.5 px-3 w-28 text-center">Count</th>
                    <th className="py-2.5 px-3 w-40 text-center">Trend vs. Prev Month</th>
                    <th className="py-2.5 px-3">HRBP Strategic Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.turnoverReasons.map((reason, idx) => (
                    <tr key={reason.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-800">{reason.kategori}</td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          value={reason.jumlah}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.turnoverReasons[idx].jumlah = Number(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center font-black text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <select
                          value={reason.tren}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.turnoverReasons[idx].tren = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800"
                        >
                          <option value="Increasing">Increasing</option>
                          <option value="Decreasing">Decreasing</option>
                          <option value="Stable">Stable</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={reason.komentar}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.turnoverReasons[idx].komentar = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          placeholder="HR analysis remarks..."
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: RECRUITMENT & VACANCIES ===================== */}
      {activeTab === '3' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">3. Recruitment & Manpower Requisitions</h3>
              <p className="text-xs font-medium text-slate-500">
                ERF, filled positions, active candidates in process, and fulfillment rates
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Recruitment Metric</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={3} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-black">{e}</span>
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Current</span>
                          <span>Target</span>
                          <span>YTD</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* ERF */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">ERF (Employee Requisition Form)</td>
                    {entityList.map((e) => {
                      const rc = data.recruitment[e] || { erfBulanBerjalan: 0, erfTarget: 0, erfTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={rc.erfBulanBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'erfBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.erfTarget}
                              onChange={(ev) => handleRecruitmentChange(e, 'erfTarget', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.erfTahunBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'erfTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Filled */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-emerald-800">Positions Filled</td>
                    {entityList.map((e) => {
                      const rc = data.recruitment[e] || { terisiBulanBerjalan: 0, terisiTarget: 0, terisiTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={rc.terisiBulanBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'terisiBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-emerald-400 rounded px-1.5 py-1 text-center text-emerald-800 font-black"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.terisiTarget}
                              onChange={(ev) => handleRecruitmentChange(e, 'terisiTarget', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.terisiTahunBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'terisiTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Fulfillment % */}
                  <tr className="hover:bg-slate-50 bg-blue-50/20 font-black text-slate-900">
                    <td className="py-2.5 px-4">Fulfillment Rate (%)</td>
                    {entityList.map((e) => {
                      const rc = data.recruitment[e] || { rateBulanBerjalan: 0, rateTarget: 100, rateTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={rc.rateBulanBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'rateBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-blue-400 rounded px-1 py-1 text-center text-blue-900 font-black text-xs"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.rateTarget}
                              onChange={(ev) => handleRecruitmentChange(e, 'rateTarget', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700 text-xs"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={rc.rateTahunBerjalan}
                              onChange={(ev) => handleRecruitmentChange(e, 'rateTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700 text-xs"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Critical Positions Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">A. Critical Open Vacancies Tracking</h3>
                <p className="text-xs font-medium text-slate-500">
                  Position, Entity, Priority, Current Status, Target Onboarding Date, Obstacles / Next Steps
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  const newPos: CriticalPositionItem = {
                    id: `cp-${Date.now()}`,
                    posisi: 'New Critical Position',
                    entitas: activeEntities[0]?.name || 'HO',
                    prioritas: 'High',
                    tahapSaatIni: 'Candidate Sourcing',
                    targetBergabung: 'End of Month',
                    kendala: 'Screening qualified candidates',
                  };
                  updated.criticalPositions.push(newPos);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Position Title</th>
                    <th className="py-2.5 px-3 w-28">Entity</th>
                    <th className="py-2.5 px-3 w-28">Priority</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3 w-36">Target Onboarding</th>
                    <th className="py-2.5 px-3">Obstacles / Action</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.criticalPositions.map((pos, idx) => (
                    <tr key={pos.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={pos.posisi}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].posisi = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={pos.entitas}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].entitas = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800"
                        >
                          {entityList.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={pos.prioritas}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].prioritas = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-extrabold text-slate-800"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={pos.tahapSaatIni}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].tahapSaatIni = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={pos.targetBergabung}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].targetBergabung = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={pos.kendala}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.criticalPositions[idx].kendala = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.criticalPositions = updated.criticalPositions.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 4: LEARNING & DEVELOPMENT ===================== */}
      {activeTab === '4' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">4. Learning & Development</h3>
              <p className="text-xs font-medium text-slate-500">
                Training sessions, attendees, training hours, and mandatory compliance rates
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Training Metric</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={3} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-black">{e}</span>
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Current</span>
                          <span>Target</span>
                          <span>YTD</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* Sessions */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">Sessions Completed</td>
                    {entityList.map((e) => {
                      const tr = data.training[e] || { sesiBulanBerjalan: 0, sesiTarget: 0, sesiTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={tr.sesiBulanBerjalan}
                              onChange={(ev) => handleTrainingChange(e, 'sesiBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={tr.sesiTarget}
                              onChange={(ev) => handleTrainingChange(e, 'sesiTarget', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={tr.sesiTahunBerjalan}
                              onChange={(ev) => handleTrainingChange(e, 'sesiTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* Hours */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-emerald-800">Training Hours</td>
                    {entityList.map((e) => {
                      const tr = data.training[e] || { jamBulanBerjalan: 0, jamTarget: 0, jamTahunBerjalan: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={tr.jamBulanBerjalan}
                              onChange={(ev) => handleTrainingChange(e, 'jamBulanBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border-2 border-emerald-400 rounded px-1.5 py-1 text-center text-emerald-900 font-black"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={tr.jamTarget}
                              onChange={(ev) => handleTrainingChange(e, 'jamTarget', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={tr.jamTahunBerjalan}
                              onChange={(ev) => handleTrainingChange(e, 'jamTahunBerjalan', Number(ev.target.value))}
                              className="w-14 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Training Programs */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">A. Main Training Programs & Certifications</h3>
                <p className="text-xs font-medium text-slate-500">
                  Course title, target audience, progress status, completion deadline, PIC
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  const newTr: MainTrainingItem = {
                    id: `tr-${Date.now()}`,
                    pelatihan: 'New Corporate Training Program',
                    kelompokSasaran: 'All HO Employees',
                    status: 'Scheduled',
                    batasWaktu: 'End of Next Month',
                    pic: 'HR L&D Specialist',
                  };
                  updated.mainTrainings.push(newTr);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Program</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Program Title</th>
                    <th className="py-2.5 px-3">Target Audience</th>
                    <th className="py-2.5 px-3 w-36">Status</th>
                    <th className="py-2.5 px-3 w-36">Due Date</th>
                    <th className="py-2.5 px-3">PIC</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.mainTrainings.map((trItem, idx) => (
                    <tr key={trItem.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={trItem.pelatihan}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.mainTrainings[idx].pelatihan = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={trItem.kelompokSasaran}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.mainTrainings[idx].kelompokSasaran = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={trItem.status}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.mainTrainings[idx].status = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Postponed">Postponed</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={trItem.batasWaktu}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.mainTrainings[idx].batasWaktu = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={trItem.pic}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.mainTrainings[idx].pic = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.mainTrainings = updated.mainTrainings.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: ATTENDANCE & DEPARTMENTS (NEW!) ===================== */}
      {activeTab === '5' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Department Breakdown Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  5. Attendance & Punctuality by Department
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Input and manage staff counts, on-time percentage, late percentage, and average delay for each department
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  if (!updated.departmentAttendance) updated.departmentAttendance = [];
                  const newDept: DepartmentAttendance = {
                    id: `dept-${Date.now()}`,
                    department: 'New Operational Division',
                    totalStaff: 15,
                    onTimeRate: 94.0,
                    lateRate: 6.0,
                    leaveAbsentRate: 2.0,
                    avgLateMinutes: 10,
                    entity: 'HO Total',
                  };
                  updated.departmentAttendance.push(newDept);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Department Name</th>
                    <th className="py-2.5 px-3 w-28 text-center">Staff Count</th>
                    <th className="py-2.5 px-3 w-32 text-center">On-Time (%)</th>
                    <th className="py-2.5 px-3 w-32 text-center">Late (%)</th>
                    <th className="py-2.5 px-3 w-32 text-center">Leave/Absent (%)</th>
                    <th className="py-2.5 px-3 w-32 text-center">Avg Delay (Mins)</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {(data.departmentAttendance || []).map((dept, idx) => (
                    <tr key={dept.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={dept.department}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.departmentAttendance[idx].department = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.totalStaff}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.departmentAttendance[idx].totalStaff = Number(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={dept.onTimeRate}
                          onChange={(e) => {
                            const updated = { ...data };
                            const val = Number(e.target.value);
                            updated.departmentAttendance[idx].onTimeRate = val;
                            updated.departmentAttendance[idx].lateRate = Number((100 - val).toFixed(1));
                            onUpdateMonthData(updated);
                          }}
                          className="w-20 bg-white border-2 border-emerald-400 rounded px-2 py-1 text-center font-black text-emerald-800"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={dept.lateRate}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.departmentAttendance[idx].lateRate = Number(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-20 bg-white border-2 border-amber-400 rounded px-2 py-1 text-center font-black text-amber-800"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={dept.leaveAbsentRate}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.departmentAttendance[idx].leaveAbsentRate = Number(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-700"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          value={dept.avgLateMinutes}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.departmentAttendance[idx].avgLateMinutes = Number(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-700"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.departmentAttendance = updated.departmentAttendance.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Entity Attendance Summary Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Entity Overall Presence Summary
            </h3>
            <p className="text-xs font-medium text-slate-500 mb-4">
              Overall presence percentage, on-time percentage, and late arrival rates across all 7 entities
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3 text-center">Presence Rate (%)</th>
                    <th className="py-2.5 px-3 text-center">On-Time Rate (%)</th>
                    <th className="py-2.5 px-3 text-center">Late Arrival (%)</th>
                    <th className="py-2.5 px-3 text-center">Leave/Sick (%)</th>
                    <th className="py-2.5 px-3">Verification Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {activeEntities.map((ent) => {
                    const e = ent.name;
                    const att = data.attendance?.[e] || { presenceRate: 97.0, onTimeRate: 93.0, lateRate: 7.0, leaveRate: 3.0, notes: 'Biometric logged' };
                    return (
                      <tr key={ent.id || e} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-black text-slate-900">
                          {e} - {ent.fullName}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={att.presenceRate}
                            onChange={(ev) => handleAttendanceChange(e, 'presenceRate', Number(ev.target.value))}
                            className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={att.onTimeRate}
                            onChange={(ev) => handleAttendanceChange(e, 'onTimeRate', Number(ev.target.value))}
                            className="w-20 bg-white border-2 border-emerald-400 rounded px-2 py-1 text-center font-black text-emerald-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={att.lateRate}
                            onChange={(ev) => handleAttendanceChange(e, 'lateRate', Number(ev.target.value))}
                            className="w-20 bg-white border-2 border-amber-400 rounded px-2 py-1 text-center font-black text-amber-800"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={att.leaveRate}
                            onChange={(ev) => handleAttendanceChange(e, 'leaveRate', Number(ev.target.value))}
                            className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={att.notes || ''}
                            onChange={(ev) => handleAttendanceChange(e, 'notes', ev.target.value)}
                            placeholder="Biometric verification notes..."
                            className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 6: EXPIRING CONTRACTS ===================== */}
      {activeTab === '6' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">6. Expiring Contract Monitoring (Summary by Entity)</h3>
              <p className="text-xs font-medium text-slate-500">
                Number of contracts expiring within next 30 days, 31-60 days, and 61-90 days
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[160px]">Expiry Window</th>
                    {entityList.map((e) => (
                      <th key={e} colSpan={3} className="py-2 px-2 text-center border-l border-slate-200">
                        <span className="text-blue-700 font-bold">{e}</span>
                        <div className="grid grid-cols-3 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-200 pt-1">
                          <span>Total</span>
                          <span>Pending</span>
                          <span>Done</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {/* 30 days */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-rose-800">&lt; 30 Days Left</td>
                    {entityList.map((e) => {
                      const ce = data.contractExpiry[e]?.h30 || { jumlahKontrak: 0, keputusanTertunda: 0, keputusanSelesai: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={ce.jumlahKontrak}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h30', 'jumlahKontrak', Number(ev.target.value))}
                              className="w-12 bg-white border border-rose-300 rounded px-1 py-1 text-center font-bold text-rose-800"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={ce.keputusanTertunda}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h30', 'keputusanTertunda', Number(ev.target.value))}
                              className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={ce.keputusanSelesai}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h30', 'keputusanSelesai', Number(ev.target.value))}
                              className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>

                  {/* 31-60 days */}
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-amber-800">31–60 Days Left</td>
                    {entityList.map((e) => {
                      const ce = data.contractExpiry[e]?.h60 || { jumlahKontrak: 0, keputusanTertunda: 0, keputusanSelesai: 0 };
                      return (
                        <React.Fragment key={e}>
                          <td className="py-1 px-1 border-l border-slate-200">
                            <input
                              type="number"
                              value={ce.jumlahKontrak}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h60', 'jumlahKontrak', Number(ev.target.value))}
                              className="w-12 bg-white border border-amber-300 rounded px-1 py-1 text-center font-bold text-amber-800"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={ce.keputusanTertunda}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h60', 'keputusanTertunda', Number(ev.target.value))}
                              className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700"
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input
                              type="number"
                              value={ce.keputusanSelesai}
                              onChange={(ev) => handleContractExpirySummaryChange(e, 'h60', 'keputusanSelesai', Number(ev.target.value))}
                              className="w-12 bg-white border border-slate-300 rounded px-1 py-1 text-center text-slate-700"
                            />
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Contracts Table */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">A. Individual Contract Register</h3>
                <p className="text-xs font-medium text-slate-500">
                  Staff name, Entity/Role, Contract End Date, Days remaining (auto-calculated), Recommendation, Status, PIC
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  const newContract: ContractEmployeeItem = {
                    id: `cnt-${Date.now()}`,
                    nama: 'New Contract Staff',
                    entitasJabatan: `${activeEntities[0]?.name || 'HO'} - Specialist`,
                    tanggalAkhir: '2026-12-31',
                    sisaHari: calculateDaysRemaining('2026-12-31'),
                    rekomendasi: 'Extend',
                    statusKeputusan: 'Pending Approval',
                    pic: 'HRBP KNC',
                  };
                  updated.contractList.push(newContract);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contract</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Entity / Role</th>
                    <th className="py-2.5 px-3 w-36">Contract End Date</th>
                    <th className="py-2.5 px-3 w-28 text-center">Days Left</th>
                    <th className="py-2.5 px-3 w-40">Recommendation</th>
                    <th className="py-2.5 px-3 w-36">Approval Status</th>
                    <th className="py-2.5 px-3">HR PIC</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.contractList.map((cnt, idx) => (
                    <tr key={cnt.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={cnt.nama}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].nama = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={cnt.entitasJabatan}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].entitasJabatan = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="date"
                          value={cnt.tanggalAkhir}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].tanggalAkhir = e.target.value;
                            updated.contractList[idx].sisaHari = calculateDaysRemaining(e.target.value);
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded font-black ${
                            cnt.sisaHari <= 30
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : cnt.sisaHari <= 60
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {cnt.sisaHari} Days
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={cnt.rekomendasi}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].rekomendasi = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-800"
                        >
                          <option value="Extend">Extend</option>
                          <option value="Permanent Convert">Permanent Convert</option>
                          <option value="End Contract">End Contract</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={cnt.statusKeputusan}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].statusKeputusan = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className={`w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold ${
                            cnt.statusKeputusan === 'Approved' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          <option value="Pending Approval">Pending Approval</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={cnt.pic}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.contractList[idx].pic = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.contractList = updated.contractList.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 7: HR ISSUES ===================== */}
      {activeTab === '7' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">7. HR Strategic Issues & Mitigation Action Plans</h3>
                <p className="text-xs font-medium text-slate-500">
                  Risk log, impact/root cause, mitigation plan, PIC, target date, and resolution status
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  const nextNo = updated.hrIssues.length + 1;
                  const newIssue: HRIssueItem = {
                    id: `isu-${Date.now()}`,
                    no: nextNo,
                    isu: 'New HR Strategic Risk',
                    dampak: 'Operational or compliance impact',
                    tindakan: 'Planned mitigation actions',
                    pic: 'HR Specialist',
                    batasWaktu: 'End of Current Month',
                    status: 'Open',
                  };
                  updated.hrIssues.push(newIssue);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Issue</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-2 w-12 text-center">No</th>
                    <th className="py-2.5 px-3">Issue / Strategic Risk</th>
                    <th className="py-2.5 px-3">Impact / Root Cause</th>
                    <th className="py-2.5 px-3">Mitigation Action Plan</th>
                    <th className="py-2.5 px-3 w-36">PIC</th>
                    <th className="py-2.5 px-3 w-32">Due Date</th>
                    <th className="py-2.5 px-3 w-32">Status</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.hrIssues.map((issue, idx) => (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          value={issue.isu}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].isu = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 resize-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          value={issue.dampak}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].dampak = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 resize-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          value={issue.tindakan}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].tindakan = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 resize-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={issue.pic}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].pic = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={issue.batasWaktu}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].batasWaktu = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={issue.status}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.hrIssues[idx].status = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className={`w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold ${
                            issue.status === 'Resolved' || issue.status === 'Selesai'
                              ? 'text-emerald-700'
                              : issue.status === 'In Progress' || issue.status === 'Proses'
                              ? 'text-blue-700'
                              : 'text-rose-700'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.hrIssues = updated.hrIssues.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 8: KEY POINT ACTIVITIES ===================== */}
      {activeTab === '8' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">8. Key Point Activities & Strategic Milestones</h3>
                <p className="text-xs font-medium text-slate-500">
                  Strategic HR deliverables, project timeline, PIC, and status
                </p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...data };
                  const nextNo = updated.keyActivities.length + 1;
                  const newAct: KeyPointActivityItem = {
                    id: `act-${Date.now()}`,
                    no: nextNo,
                    monthRaised: `${MONTH_NAMES[activeMonth]} ${activeYear}`,
                    actionItem: 'New Strategic HR Initiative',
                    pic: 'HRBP Lead HO',
                    dueDate: 'End of Month',
                    status: 'In Progress',
                  };
                  updated.keyActivities.push(newAct);
                  onUpdateMonthData(updated);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Initiative</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-2 w-12 text-center">NO</th>
                    <th className="py-2.5 px-3 w-36">MONTH RAISED</th>
                    <th className="py-2.5 px-3">ACTION ITEM / INITIATIVE</th>
                    <th className="py-2.5 px-3 w-44">PIC</th>
                    <th className="py-2.5 px-3 w-36">DUE DATE</th>
                    <th className="py-2.5 px-3 w-36">STATUS</th>
                    <th className="py-2.5 px-2 w-12 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {data.keyActivities.map((act, idx) => (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={act.monthRaised}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.keyActivities[idx].monthRaised = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <textarea
                          rows={2}
                          value={act.actionItem}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.keyActivities[idx].actionItem = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 resize-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={act.pic}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.keyActivities[idx].pic = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={act.dueDate}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.keyActivities[idx].dueDate = e.target.value;
                            onUpdateMonthData(updated);
                          }}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={act.status}
                          onChange={(e) => {
                            const updated = { ...data };
                            updated.keyActivities[idx].status = e.target.value as any;
                            onUpdateMonthData(updated);
                          }}
                          className={`w-full bg-white border border-slate-300 rounded px-2 py-1 font-bold ${
                            act.status === 'Completed'
                              ? 'text-emerald-700'
                              : act.status === 'In Progress'
                              ? 'text-blue-700'
                              : 'text-slate-800'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => {
                            const updated = { ...data };
                            updated.keyActivities = updated.keyActivities.filter((_, i) => i !== idx);
                            onUpdateMonthData(updated);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
