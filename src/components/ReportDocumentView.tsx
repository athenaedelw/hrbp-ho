import React from 'react';
import {
  EntityId,
  EntityConfig,
  DEFAULT_ENTITIES,
  MONTH_NAMES,
  MonthReportData,
} from '../types/dashboard';
import { calculateConsolidatedMonth } from '../utils/calculations';
import { DEFAULT_LOGO_SVG } from '../data/defaultData';
import { Printer } from 'lucide-react';

interface ReportDocumentViewProps {
  data: MonthReportData;
  activeYear: number;
  activeMonth: number;
  logoUrl: string | null;
  entities?: EntityConfig[];
  onPrint: () => void;
}

export const ReportDocumentView: React.FC<ReportDocumentViewProps> = ({
  data,
  activeYear,
  activeMonth,
  logoUrl,
  entities = DEFAULT_ENTITIES,
  onPrint,
}) => {
  const monthName = MONTH_NAMES[activeMonth];
  const activeEntities = entities && entities.length > 0 ? entities : DEFAULT_ENTITIES;
  const entityCodes = activeEntities.map((e) => e.name);
  const consolidated = calculateConsolidatedMonth(data, activeEntities);
  const displayLogo = logoUrl || DEFAULT_LOGO_SVG;

  const midpoint = Math.ceil(entityCodes.length / 2);
  const row1Entities: string[] = entityCodes.slice(0, midpoint);
  const row2Entities: string[] = entityCodes.slice(midpoint);

  return (
    <div className="space-y-6 pb-20 text-slate-900">
      {/* Action Bar (Screen Only) */}
      <div className="no-print flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Official Monthly Report (A4 Printable Document)</h2>
          <p className="text-xs font-medium text-slate-500">
            Rendered in the exact formal reporting layout for executive leadership and board meetings.
          </p>
        </div>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF (A4)</span>
        </button>
      </div>

      {/* Printable Document Sheet Container */}
      <div
        id="printable-report-document"
        className="bg-white text-slate-900 shadow-xl rounded-2xl sm:rounded-none max-w-5xl mx-auto p-8 sm:p-14 print:p-0 print:shadow-none print:max-w-none text-xs font-sans print:m-0 border border-slate-200 print:border-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div className="max-w-[240px]">
            <img
              src={displayLogo}
              alt="HRBP Nusaraya"
              className="h-12 object-contain"
            />
          </div>
          <div className="text-right">
            <h1 className="text-base font-black uppercase tracking-wider text-slate-950">
              MONTHLY HRBP REPORT
            </h1>
            <p className="text-xs font-extrabold text-blue-800 tracking-widest">
              HEAD OFFICE ONLY
            </p>
            <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
              Period: <span className="font-black text-slate-900">{monthName} {activeYear}</span>
            </p>
          </div>
        </div>

        {/* ======================= SECTION 1: WORKFORCE OVERVIEW ======================= */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-l-4 border-blue-900 pl-2">
            1. WORKFORCE OVERVIEW
          </h2>

          {/* Table Row 1: KNC, SMS, SST */}
          <div className="overflow-x-auto mb-3">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th rowSpan={2} className="border border-slate-700 p-2 text-left w-48 font-bold">Indicator</th>
                  {row1Entities.map((e) => (
                    <th key={e} colSpan={3} className="border border-slate-700 p-1.5 text-center font-black">
                      {e}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-800 text-[10px]">
                  {row1Entities.map((e) => (
                    <React.Fragment key={e}>
                      <th className="border border-slate-700 p-1 text-center font-medium">Prev Month</th>
                      <th className="border border-slate-700 p-1 text-center font-medium">Current Month</th>
                      <th className="border border-slate-700 p-1 text-center font-bold">Variance</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-700 p-2 font-black">Total Headcount</td>
                  {row1Entities.map((e) => {
                    const w = data.workforce[e] || { totalBulanLalu: 0, totalBulanIni: 0 };
                    const diff = (w.totalBulanIni || 0) - (w.totalBulanLalu || 0);
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.totalBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-black">{w.totalBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-black text-blue-900">{diff > 0 ? `+${diff}` : diff}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Permanent Staff</td>
                  {row1Entities.map((e) => {
                    const w = data.workforce[e] || { tetapBulanLalu: 0, tetapBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.tetapBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.tetapBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.tetapBulanIni || 0) - (w.tetapBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Contract Staff (PKWT)</td>
                  {row1Entities.map((e) => {
                    const w = data.workforce[e] || { kontrakBulanLalu: 0, kontrakBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.kontrakBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.kontrakBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.kontrakBulanIni || 0) - (w.kontrakBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Open Vacancies</td>
                  {row1Entities.map((e) => {
                    const w = data.workforce[e] || { posisiKosongBulanLalu: 0, posisiKosongBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.posisiKosongBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.posisiKosongBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.posisiKosongBulanIni || 0) - (w.posisiKosongBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table Row 2: SWK, PSM, IIM, SNB */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th rowSpan={2} className="border border-slate-700 p-2 text-left w-48 font-bold">Indicator</th>
                  {row2Entities.map((e) => (
                    <th key={e} colSpan={3} className="border border-slate-700 p-1.5 text-center font-black">
                      {e}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-800 text-[10px]">
                  {row2Entities.map((e) => (
                    <React.Fragment key={e}>
                      <th className="border border-slate-700 p-1 text-center font-medium">Prev Month</th>
                      <th className="border border-slate-700 p-1 text-center font-medium">Current Month</th>
                      <th className="border border-slate-700 p-1 text-center font-bold">Variance</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-700 p-2 font-black">Total Headcount</td>
                  {row2Entities.map((e) => {
                    const w = data.workforce[e] || { totalBulanLalu: 0, totalBulanIni: 0 };
                    const diff = (w.totalBulanIni || 0) - (w.totalBulanLalu || 0);
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.totalBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-black">{w.totalBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-black text-blue-900">{diff > 0 ? `+${diff}` : diff}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Permanent Staff</td>
                  {row2Entities.map((e) => {
                    const w = data.workforce[e] || { tetapBulanLalu: 0, tetapBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.tetapBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.tetapBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.tetapBulanIni || 0) - (w.tetapBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Contract Staff (PKWT)</td>
                  {row2Entities.map((e) => {
                    const w = data.workforce[e] || { kontrakBulanLalu: 0, kontrakBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.kontrakBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono font-bold">{w.kontrakBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.kontrakBulanIni || 0) - (w.kontrakBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className="border border-slate-700 p-2 pl-4 text-slate-800">Open Vacancies</td>
                  {row2Entities.map((e) => {
                    const w = data.workforce[e] || { posisiKosongBulanLalu: 0, posisiKosongBulanIni: 0 };
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.posisiKosongBulanLalu}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{w.posisiKosongBulanIni}</td>
                        <td className="border border-slate-700 p-1.5 text-center font-mono">{(w.posisiKosongBulanIni || 0) - (w.posisiKosongBulanLalu || 0)}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Segregation Table */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-slate-900 uppercase mb-2">
              B. Employee Segregation by Level
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-700 text-[11px]">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="border border-slate-700 p-2 text-left w-52 font-bold">Grade Level</th>
                    {entityCodes.map((e) => (
                      <th key={e} className="border border-slate-700 p-2 text-center font-black">{e}</th>
                    ))}
                    <th className="border border-slate-700 p-2 text-center font-black bg-blue-950">TOTAL HO</th>
                  </tr>
                </thead>
                <tbody className="font-medium">
                  <tr>
                    <td className="border border-slate-700 p-2 font-bold">Non-Staff (Grade 1-2)</td>
                    {entityCodes.map((e) => (
                      <td key={e} className="border border-slate-700 p-2 text-center font-mono">{data.segregation[e]?.nonStaff}</td>
                    ))}
                    <td className="border border-slate-700 p-2 text-center font-mono font-black bg-slate-100">{consolidated.segregation.nonStaff}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-700 p-2 font-bold">Staff & Officers (Grade 3-4)</td>
                    {entityCodes.map((e) => (
                      <td key={e} className="border border-slate-700 p-2 text-center font-mono">{data.segregation[e]?.staff}</td>
                    ))}
                    <td className="border border-slate-700 p-2 text-center font-mono font-black bg-slate-100">{consolidated.segregation.staff}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-700 p-2 font-bold">Managerial & Executive (Grade 5≤)</td>
                    {entityCodes.map((e) => (
                      <td key={e} className="border border-slate-700 p-2 text-center font-mono">{data.segregation[e]?.managerial}</td>
                    ))}
                    <td className="border border-slate-700 p-2 text-center font-mono font-black bg-slate-100">{consolidated.segregation.managerial}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="page-break"></div>

        {/* ======================= SECTION 2: ATTENDANCE & PUNCTUALITY (NEW!) ======================= */}
        <div className="mb-8 pt-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-l-4 border-blue-900 pl-2">
            2. ATTENDANCE & DEPARTMENT PUNCTUALITY
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="border border-slate-700 p-2 text-left font-bold">Department / Division</th>
                  <th className="border border-slate-700 p-2 text-center w-24 font-bold">Staff Count</th>
                  <th className="border border-slate-700 p-2 text-center w-32 font-bold">On-Time Rate (%)</th>
                  <th className="border border-slate-700 p-2 text-center w-28 font-bold">Late Rate (%)</th>
                  <th className="border border-slate-700 p-2 text-center w-32 font-bold">Leave/Absent (%)</th>
                  <th className="border border-slate-700 p-2 text-center w-28 font-bold">Avg Delay</th>
                  <th className="border border-slate-700 p-2 text-center w-28 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {(data.departmentAttendance || []).map((d) => (
                  <tr key={d.id}>
                    <td className="border border-slate-700 p-2 font-bold text-slate-900">{d.department}</td>
                    <td className="border border-slate-700 p-2 text-center font-mono font-bold">{d.totalStaff}</td>
                    <td className="border border-slate-700 p-2 text-center font-mono font-bold text-emerald-800">{d.onTimeRate}%</td>
                    <td className="border border-slate-700 p-2 text-center font-mono font-bold text-amber-800">{d.lateRate}%</td>
                    <td className="border border-slate-700 p-2 text-center font-mono">{d.leaveAbsentRate}%</td>
                    <td className="border border-slate-700 p-2 text-center font-mono">{d.avgLateMinutes} mins</td>
                    <td className="border border-slate-700 p-2 text-center font-bold">
                      <span className={d.onTimeRate >= 95 ? 'text-emerald-800' : 'text-slate-800'}>
                        {d.onTimeRate >= 95 ? 'Excellent' : d.onTimeRate >= 90 ? 'Good' : 'Needs Review'}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black">
                  <td className="border border-slate-700 p-2 uppercase">Head Office Average</td>
                  <td className="border border-slate-700 p-2 text-center font-mono font-bold">{consolidated.workforce.totalBulanIni}</td>
                  <td className="border border-slate-700 p-2 text-center font-mono font-black text-emerald-900">{consolidated.attendance.onTimeRate}%</td>
                  <td className="border border-slate-700 p-2 text-center font-mono font-black text-amber-900">{consolidated.attendance.lateRate}%</td>
                  <td className="border border-slate-700 p-2 text-center font-mono">{consolidated.attendance.leaveRate}%</td>
                  <td className="border border-slate-700 p-2 text-center font-mono">11 mins</td>
                  <td className="border border-slate-700 p-2 text-center text-emerald-900">Compliant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================= SECTION 3: TURNOVER & RETENTION ======================= */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-l-4 border-blue-900 pl-2">
            3. TURNOVER & RETENTION
          </h2>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th rowSpan={2} className="border border-slate-700 p-2 text-left w-52 font-bold">Turnover Indicator</th>
                  {entityCodes.map((e) => (
                    <th key={e} colSpan={3} className="border border-slate-700 p-1.5 text-center font-black">
                      {e}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-800 text-[10px]">
                  {entityCodes.map((e) => (
                    <React.Fragment key={e}>
                      <th className="border border-slate-700 p-1 text-center font-medium">Month</th>
                      <th className="border border-slate-700 p-1 text-center font-medium">Prev</th>
                      <th className="border border-slate-700 p-1 text-center font-bold">YTD</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr>
                  <td className="border border-slate-700 p-1.5 font-bold">Total Departures / Exits</td>
                  {entityCodes.map((e) => {
                    const to = data.turnover[e];
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1 text-center font-mono font-bold text-red-700">{to?.keluarBulanBerjalan}</td>
                        <td className="border border-slate-700 p-1 text-center font-mono">{to?.keluarBulanSebelumnya}</td>
                        <td className="border border-slate-700 p-1 text-center font-mono">{to?.keluarTahunBerjalan}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr className="bg-slate-100 font-black">
                  <td className="border border-slate-700 p-1.5">Turnover Rate (%)</td>
                  {entityCodes.map((e) => {
                    const to = data.turnover[e];
                    return (
                      <React.Fragment key={e}>
                        <td className="border border-slate-700 p-1 text-center font-mono text-blue-900">{to?.turnoverRateBulanBerjalan}%</td>
                        <td className="border border-slate-700 p-1 text-center font-mono">{to?.turnoverRateBulanSebelumnya}%</td>
                        <td className="border border-slate-700 p-1 text-center font-mono">{to?.turnoverRateTahunBerjalan}%</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reasons */}
          <table className="w-full border-collapse border border-slate-700 text-[11px]">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="border border-slate-700 p-2 text-left font-bold">Reason Category</th>
                <th className="border border-slate-700 p-2 text-center w-24 font-bold">Count</th>
                <th className="border border-slate-700 p-2 text-center w-36 font-bold">Trend</th>
                <th className="border border-slate-700 p-2 text-left font-bold">HRBP Analysis Remarks</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {data.turnoverReasons.map((r) => (
                <tr key={r.id}>
                  <td className="border border-slate-700 p-2 font-bold">{r.kategori}</td>
                  <td className="border border-slate-700 p-2 text-center font-mono font-bold">{r.jumlah}</td>
                  <td className="border border-slate-700 p-2 text-center">{r.tren}</td>
                  <td className="border border-slate-700 p-2 text-slate-700">{r.komentar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="page-break"></div>

        {/* ======================= SECTION 4: RECRUITMENT & CRITICAL POSITIONS ======================= */}
        <div className="mb-8 pt-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-l-4 border-blue-900 pl-2">
            4. RECRUITMENT & CRITICAL VACANCIES
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-slate-700 text-[11px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="border border-slate-700 p-2 text-left font-bold">Position</th>
                  <th className="border border-slate-700 p-2 text-center w-24 font-bold">Entity</th>
                  <th className="border border-slate-700 p-2 text-center w-24 font-bold">Priority</th>
                  <th className="border border-slate-700 p-2 text-left font-bold">Current Recruitment Stage</th>
                  <th className="border border-slate-700 p-2 text-center w-36 font-bold">Target Onboarding</th>
                  <th className="border border-slate-700 p-2 text-left font-bold">Obstacles / Action Required</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                {data.criticalPositions.map((cp) => (
                  <tr key={cp.id}>
                    <td className="border border-slate-700 p-2 font-bold text-slate-900">{cp.posisi}</td>
                    <td className="border border-slate-700 p-2 text-center font-black text-blue-800">{cp.entitas}</td>
                    <td className="border border-slate-700 p-2 text-center font-bold">
                      <span className={cp.prioritas === 'High' ? 'text-red-700 font-black' : 'text-slate-800'}>
                        {cp.prioritas}
                      </span>
                    </td>
                    <td className="border border-slate-700 p-2">{cp.tahapSaatIni}</td>
                    <td className="border border-slate-700 p-2 text-center">{cp.targetBergabung}</td>
                    <td className="border border-slate-700 p-2 text-slate-700">{cp.kendala}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================= SECTION 5: CONTRACT EXPIRY & HR ISSUES ======================= */}
        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2 border-l-4 border-blue-900 pl-2">
            5. EXPIRING CONTRACTS & STRATEGIC HR ISSUES
          </h2>

          <h3 className="text-xs font-black text-slate-900 uppercase mb-2">Expiring Contract Register</h3>
          <table className="w-full border-collapse border border-slate-700 text-[11px] mb-6">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="border border-slate-700 p-2 text-left font-bold">Employee Name</th>
                <th className="border border-slate-700 p-2 text-left font-bold">Entity / Role</th>
                <th className="border border-slate-700 p-2 text-center w-32 font-bold">Contract End</th>
                <th className="border border-slate-700 p-2 text-center w-24 font-bold">Days Left</th>
                <th className="border border-slate-700 p-2 text-center w-32 font-bold">Recommendation</th>
                <th className="border border-slate-700 p-2 text-center w-32 font-bold">Approval Status</th>
                <th className="border border-slate-700 p-2 text-left font-bold">HR PIC</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {data.contractList.map((cnt) => (
                <tr key={cnt.id}>
                  <td className="border border-slate-700 p-2 font-bold">{cnt.nama}</td>
                  <td className="border border-slate-700 p-2 text-slate-800">{cnt.entitasJabatan}</td>
                  <td className="border border-slate-700 p-2 text-center font-mono">{cnt.tanggalAkhir}</td>
                  <td className="border border-slate-700 p-2 text-center font-mono font-bold">
                    <span className={cnt.sisaHari <= 30 ? 'text-red-700 font-black' : 'text-slate-800'}>
                      {cnt.sisaHari} Days
                    </span>
                  </td>
                  <td className="border border-slate-700 p-2 text-center">{cnt.rekomendasi}</td>
                  <td className="border border-slate-700 p-2 text-center font-bold">
                    <span className={cnt.statusKeputusan === 'Approved' ? 'text-emerald-800' : 'text-amber-800'}>
                      {cnt.statusKeputusan}
                    </span>
                  </td>
                  <td className="border border-slate-700 p-2 text-slate-700">{cnt.pic}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-xs font-black text-slate-900 uppercase mb-2">Key Point Activities & Strategic Milestones</h3>
          <table className="w-full border-collapse border border-slate-700 text-[11px] mb-8">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="border border-slate-700 p-2 text-center w-12 font-bold">NO</th>
                <th className="border border-slate-700 p-2 text-center w-28 font-bold">MONTH RAISED</th>
                <th className="border border-slate-700 p-2 text-left font-bold">ACTION ITEM / INITIATIVE</th>
                <th className="border border-slate-700 p-2 text-left w-44 font-bold">PIC</th>
                <th className="border border-slate-700 p-2 text-center w-28 font-bold">DUE DATE</th>
                <th className="border border-slate-700 p-2 text-center w-28 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {data.keyActivities.map((act) => (
                <tr key={act.id}>
                  <td className="border border-slate-700 p-2 text-center font-bold">{act.no}</td>
                  <td className="border border-slate-700 p-2 text-center">{act.monthRaised}</td>
                  <td className="border border-slate-700 p-2 font-bold">{act.actionItem}</td>
                  <td className="border border-slate-700 p-2">{act.pic}</td>
                  <td className="border border-slate-700 p-2 text-center">{act.dueDate}</td>
                  <td className="border border-slate-700 p-2 text-center font-bold">
                    <span className={act.status === 'Completed' ? 'text-emerald-800' : 'text-blue-800'}>
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Executive Signatures Block */}
        <div className="border-t-2 border-slate-900 pt-6 mt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <p className="text-slate-600 mb-14 font-medium">Prepared by,</p>
            <p className="font-black border-b border-slate-900 pb-1 mx-6 text-slate-950">HRBP Lead Head Office</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">HRBP Nusaraya Group</p>
          </div>
          <div>
            <p className="text-slate-600 mb-14 font-medium">Reviewed by,</p>
            <p className="font-black border-b border-slate-900 pb-1 mx-6 text-slate-950">Head of Human Capital</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Nusaraya Mining Group</p>
          </div>
          <div>
            <p className="text-slate-600 mb-14 font-medium">Approved by,</p>
            <p className="font-black border-b border-slate-900 pb-1 mx-6 text-slate-950">Board of Directors</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Chief Executive Officer / Director</p>
          </div>
        </div>
      </div>
    </div>
  );
};
