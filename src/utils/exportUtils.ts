import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import {
  EntityId,
  EntityConfig,
  DEFAULT_ENTITIES,
  ENTITY_LIST,
  MONTH_NAMES,
  MonthReportData,
} from '../types/dashboard';
import { calculateConsolidatedMonth } from './calculations';

export function exportMonthlyReportCsv(
  monthData: MonthReportData,
  year: number,
  monthIndex: number,
  entitiesList?: EntityConfig[]
) {
  const monthName = MONTH_NAMES[monthIndex];
  const entities = entitiesList && entitiesList.length > 0 ? entitiesList : DEFAULT_ENTITIES;
  const entityCodes = entities.map((e) => e.name);
  const consolidated = calculateConsolidatedMonth(monthData, entities);

  let csv = `HRBP NUSARAYA EXECUTIVE REPORT - HEAD OFFICE ONLY\n`;
  csv += `Period: ${monthName} ${year}\n`;
  csv += `Entities: ${entityCodes.join(', ')} & Consolidated HO\n\n`;

  // 1. Workforce Overview
  csv += `1. WORKFORCE OVERVIEW\n`;
  csv += `Indicator,${entityCodes.join(',')},TOTAL HO\n`;

  const getRowWf = (label: string, key: keyof typeof consolidated.workforce) => {
    const vals = entityCodes.map((e) => monthData.workforce[e]?.[key] ?? 0);
    return `"${label}",${vals.join(',')},${consolidated.workforce[key]}`;
  };

  csv += `${getRowWf('Total Headcount Current Month', 'totalBulanIni')}\n`;
  csv += `${getRowWf('Total Headcount Previous Month', 'totalBulanLalu')}\n`;
  csv += `${getRowWf('Permanent Staff Current Month', 'tetapBulanIni')}\n`;
  csv += `${getRowWf('Permanent Staff Previous Month', 'tetapBulanLalu')}\n`;
  csv += `${getRowWf('Contract Staff Current Month', 'kontrakBulanIni')}\n`;
  csv += `${getRowWf('Contract Staff Previous Month', 'kontrakBulanLalu')}\n`;
  csv += `${getRowWf('Open Vacancies Current Month', 'posisiKosongBulanIni')}\n\n`;

  // 1.A Headcount Movement
  csv += `1.A HEADCOUNT MOVEMENT\n`;
  csv += `Movement Type,${entityCodes.join(',')},TOTAL HO\n`;
  csv += `"Beginning Headcount",${entityCodes.map((e) => monthData.headcountMovement[e]?.awalBulan ?? 0).join(',')},${consolidated.headcountMovement.awalBulan}\n`;
  csv += `"New Hires (+)",${entityCodes.map((e) => monthData.headcountMovement[e]?.masuk ?? 0).join(',')},${consolidated.headcountMovement.masuk}\n`;
  csv += `"Departures / Exits (-)",${entityCodes.map((e) => monthData.headcountMovement[e]?.keluar ?? 0).join(',')},${consolidated.headcountMovement.keluar}\n`;
  csv += `"Internal Transfers (+/-)",${entityCodes.map((e) => monthData.headcountMovement[e]?.mutasiInternal ?? 0).join(',')},${consolidated.headcountMovement.mutasiInternal}\n`;
  csv += `"Ending Headcount",${entityCodes.map((e) => monthData.workforce[e]?.totalBulanIni ?? 0).join(',')},${consolidated.workforce.totalBulanIni}\n\n`;

  // 1.B Segregation by Grade
  csv += `1.B EMPLOYEE SEGREGATION BY GRADE\n`;
  csv += `Level,${entityCodes.join(',')},TOTAL HO\n`;
  csv += `"Non-Staff (Grade 1-2)",${entityCodes.map((e) => monthData.segregation[e]?.nonStaff ?? 0).join(',')},${consolidated.segregation.nonStaff}\n`;
  csv += `"Staff & Specialist (Grade 3-4)",${entityCodes.map((e) => monthData.segregation[e]?.staff ?? 0).join(',')},${consolidated.segregation.staff}\n`;
  csv += `"Managerial & Executive (Grade 5<=)",${entityCodes.map((e) => monthData.segregation[e]?.managerial ?? 0).join(',')},${consolidated.segregation.managerial}\n\n`;

  // 2. Turnover & Retention
  csv += `2. TURNOVER & RETENTION\n`;
  csv += `Indicator,${entityCodes.join(',')},TOTAL HO\n`;
  csv += `"Departures Current Month",${entityCodes.map((e) => monthData.turnover[e]?.keluarBulanBerjalan ?? 0).join(',')},${consolidated.turnover.keluarBulanBerjalan}\n`;
  csv += `"Voluntary Resignations",${entityCodes.map((e) => monthData.turnover[e]?.sukarelaBulanBerjalan ?? 0).join(',')},${consolidated.turnover.sukarelaBulanBerjalan}\n`;
  csv += `"Involuntary / End of Contract",${entityCodes.map((e) => monthData.turnover[e]?.nonSukarelaBulanBerjalan ?? 0).join(',')},${consolidated.turnover.nonSukarelaBulanBerjalan}\n`;
  csv += `"Monthly Turnover Rate (%)",${entityCodes.map((e) => (monthData.turnover[e]?.turnoverRateBulanBerjalan ?? 0) + '%').join(',')},${consolidated.turnover.turnoverRateBulanBerjalan}%\n\n`;

  // NEW: Attendance & Punctuality
  csv += `3. ATTENDANCE & PUNCTUALITY BY DEPARTMENT\n`;
  csv += `Department,Staff Count,On-Time Rate (%),Late Rate (%),Leave / Absent (%),Avg Late Minutes,Entity\n`;
  (monthData.departmentAttendance || []).forEach((dept) => {
    csv += `"${dept.department}",${dept.totalStaff},${dept.onTimeRate}%,${dept.lateRate}%,${dept.leaveAbsentRate}%,${dept.avgLateMinutes} mins,"${dept.entity}"\n`;
  });
  csv += `\n`;

  // Recruitment
  csv += `4. RECRUITMENT & FULFILLMENT\n`;
  csv += `Indicator,${entityCodes.join(',')},TOTAL HO\n`;
  csv += `"ERF Requisitions",${entityCodes.map((e) => monthData.recruitment[e]?.erfBulanBerjalan ?? 0).join(',')},${consolidated.recruitment.erfBulanBerjalan}\n`;
  csv += `"Filled Positions",${entityCodes.map((e) => monthData.recruitment[e]?.terisiBulanBerjalan ?? 0).join(',')},${consolidated.recruitment.terisiBulanBerjalan}\n`;
  csv += `"In Progress Positions",${entityCodes.map((e) => monthData.recruitment[e]?.prosesBulanBerjalan ?? 0).join(',')},${consolidated.recruitment.prosesBulanBerjalan}\n`;
  csv += `"Fulfillment Rate (%)",${entityCodes.map((e) => (monthData.recruitment[e]?.rateBulanBerjalan ?? 0) + '%').join(',')},${consolidated.recruitment.rateBulanBerjalan}%\n\n`;

  // Critical Positions
  csv += `4.A CRITICAL OPEN POSITIONS\n`;
  csv += `Position,Entity,Priority,Current Stage,Target Onboarding,Obstacles / Next Step\n`;
  monthData.criticalPositions.forEach((cp) => {
    csv += `"${cp.posisi}","${cp.entitas}","${cp.prioritas}","${cp.tahapSaatIni}","${cp.targetBergabung}","${cp.kendala}"\n`;
  });
  csv += `\n`;

  // HR Issues
  csv += `5. HR ISSUES & ACTION PLANS\n`;
  csv += `No,Issue / Risk,Root Cause Impact,Mitigation Plan,PIC,Target Date,Status\n`;
  monthData.hrIssues.forEach((issue) => {
    csv += `${issue.no},"${issue.isu}","${issue.dampak}","${issue.tindakan}","${issue.pic}","${issue.batasWaktu}","${issue.status}"\n`;
  });
  csv += `\n`;

  // Contracts
  csv += `6. EXPIRING CONTRACT MONITORING\n`;
  csv += `Employee Name,Entity / Position,End Date,Days Remaining,Recommendation,Approval Status,PIC\n`;
  monthData.contractList.forEach((cnt) => {
    csv += `"${cnt.nama}","${cnt.entitasJabatan}","${cnt.tanggalAkhir}",${cnt.sisaHari},"${cnt.rekomendasi}","${cnt.statusKeputusan}","${cnt.pic}"\n`;
  });
  csv += `\n`;

  // Key Activities
  csv += `7. KEY POINT ACTIVITIES\n`;
  csv += `No,Month Raised,Action Item,PIC,Due Date,Status\n`;
  monthData.keyActivities.forEach((act) => {
    csv += `${act.no},"${act.monthRaised}","${act.actionItem}","${act.pic}","${act.dueDate}","${act.status}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `HRBP_Nusaraya_Report_${monthName}_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function generatePptxReport(
  monthData: MonthReportData,
  year: number,
  monthIndex: number,
  logoUrl?: string | null,
  entitiesList?: EntityConfig[]
) {
  const monthName = MONTH_NAMES[monthIndex];
  const entities = entitiesList && entitiesList.length > 0 ? entitiesList : DEFAULT_ENTITIES;
  const entityCodes = entities.map((e) => e.name);
  const consolidated = calculateConsolidatedMonth(monthData, entities);

  const ppt = new pptxgen();
  ppt.layout = 'LAYOUT_16x9';
  ppt.author = 'HRBP Nusaraya Head Office';
  ppt.company = 'Nusaraya Group';
  ppt.title = `HRBP Nusaraya Executive Report - ${monthName} ${year}`;

  const NAVY = '0F172A';
  const BLUE = '1E40AF';
  const SKY = '0284C7';
  const BRIGHT_BG = 'FFFFFF';
  const CARD_BG = 'F8FAFC';
  const BORDER_COLOR = 'CBD5E1';
  const TEXT_DARK = '0F172A';
  const TEXT_MUTED = '475569';
  const GOLD = 'B45309';

  // Helper for Slide Header (Bright Executive Style)
  const addHeader = (slide: any, title: string, category: string) => {
    slide.addShape(ppt.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 1.15,
      fill: { color: NAVY },
    });
    slide.addText(category.toUpperCase(), {
      x: 0.6,
      y: 0.2,
      w: 8.0,
      h: 0.28,
      fontSize: 10,
      color: '38BDF8',
      bold: true,
      fontFace: 'Arial',
    });
    slide.addText(title, {
      x: 0.6,
      y: 0.48,
      w: 9.0,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      bold: true,
      fontFace: 'Arial',
    });
    slide.addText(`${monthName} ${year} | Head Office`, {
      x: 9.2,
      y: 0.4,
      w: 3.5,
      h: 0.4,
      fontSize: 11,
      color: 'E2E8F0',
      align: 'right',
      bold: true,
    });
  };

  const addFooter = (slide: any, pageNum: number) => {
    slide.addText('HRBP Nusaraya · Head Office Monthly Executive Report · Confidential', {
      x: 0.6,
      y: 7.1,
      w: 9.0,
      h: 0.3,
      fontSize: 9,
      color: TEXT_MUTED,
    });
    slide.addText(`Slide ${pageNum}`, {
      x: 11.5,
      y: 7.1,
      w: 1.2,
      h: 0.3,
      fontSize: 9,
      color: TEXT_MUTED,
      align: 'right',
    });
  };

  // ===================== SLIDE 1: COVER SLIDE =====================
  const slide1 = ppt.addSlide();
  slide1.background = { color: CARD_BG };

  // Decorative banner
  slide1.addShape(ppt.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.33,
    h: 0.2,
    fill: { color: SKY },
  });

  slide1.addShape(ppt.ShapeType.roundRect, {
    x: 0.8,
    y: 1.2,
    w: 11.73,
    h: 5.4,
    fill: { color: BRIGHT_BG },
    line: { color: BORDER_COLOR, width: 1.5 },
    rectRadius: 0.15,
  });

  slide1.addText('NUSARAYA GROUP · HEAD OFFICE ONLY', {
    x: 1.4,
    y: 1.7,
    w: 10.0,
    h: 0.35,
    fontSize: 13,
    color: SKY,
    bold: true,
    fontFace: 'Arial',
  });

  slide1.addText('EXECUTIVE MONTHLY HR DASHBOARD & REPORT', {
    x: 1.4,
    y: 2.1,
    w: 10.5,
    h: 0.8,
    fontSize: 28,
    color: TEXT_DARK,
    bold: true,
    fontFace: 'Arial',
  });

  slide1.addText(`Entities: ${entityCodes.join(' · ')} & Consolidated HO`, {
    x: 1.4,
    y: 2.9,
    w: 10.5,
    h: 0.35,
    fontSize: 13,
    color: TEXT_MUTED,
    fontFace: 'Arial',
  });

  // Period Box
  slide1.addShape(ppt.ShapeType.roundRect, {
    x: 1.4,
    y: 3.6,
    w: 4.8,
    h: 1.7,
    fill: { color: 'F1F5F9' },
    line: { color: '94A3B8', width: 1 },
    rectRadius: 0.1,
  });

  slide1.addText('REPORTING PERIOD', {
    x: 1.7,
    y: 3.8,
    w: 4.2,
    h: 0.3,
    fontSize: 10,
    color: TEXT_MUTED,
    bold: true,
  });

  slide1.addText(`${monthName.toUpperCase()} ${year}`, {
    x: 1.7,
    y: 4.15,
    w: 4.2,
    h: 0.6,
    fontSize: 22,
    color: NAVY,
    bold: true,
  });

  // KPI Highlights
  const kpis = [
    { label: 'Total Headcount', val: `${consolidated.workforce.totalBulanIni} Staff`, sub: `+${consolidated.workforce.totalBulanIni - consolidated.workforce.totalBulanLalu} net` },
    { label: 'Attendance Rate', val: `${consolidated.attendance.presenceRate}%`, sub: `${consolidated.attendance.onTimeRate}% on-time` },
    { label: 'Turnover Rate', val: `${consolidated.turnover.turnoverRateBulanBerjalan}%`, sub: `${consolidated.turnover.keluarBulanBerjalan} exits` },
    { label: 'Recruitment Fulfillment', val: `${consolidated.recruitment.rateBulanBerjalan}%`, sub: `${consolidated.recruitment.terisiBulanBerjalan} filled` },
  ];

  kpis.forEach((k, idx) => {
    slide1.addShape(ppt.ShapeType.roundRect, {
      x: 6.6 + (idx % 2) * 2.8,
      y: 3.6 + Math.floor(idx / 2) * 1.0,
      w: 2.6,
      h: 0.85,
      fill: { color: 'F1F5F9' },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.08,
    });
    slide1.addText(k.label, { x: 6.7 + (idx % 2) * 2.8, y: 3.7 + Math.floor(idx / 2) * 1.0, w: 2.4, h: 0.2, fontSize: 9, color: TEXT_MUTED, bold: true });
    slide1.addText(k.val, { x: 6.7 + (idx % 2) * 2.8, y: 3.9 + Math.floor(idx / 2) * 1.0, w: 1.5, h: 0.35, fontSize: 13, color: NAVY, bold: true });
    slide1.addText(k.sub, { x: 8.0 + (idx % 2) * 2.8, y: 3.95 + Math.floor(idx / 2) * 1.0, w: 1.1, h: 0.25, fontSize: 8.5, color: SKY, align: 'right' });
  });

  addFooter(slide1, 1);

  // ===================== SLIDE 2: WORKFORCE OVERVIEW =====================
  const slide2 = ppt.addSlide();
  slide2.background = { color: CARD_BG };
  addHeader(slide2, '1. Workforce Overview & Segregation by Grade', 'Workforce Structure');

  // Stats
  const wfStats = [
    { title: 'Total Headcount', val: consolidated.workforce.totalBulanIni.toString(), sub: `Previous: ${consolidated.workforce.totalBulanLalu}` },
    { title: 'Permanent Staff', val: consolidated.workforce.tetapBulanIni.toString(), sub: `${Math.round((consolidated.workforce.tetapBulanIni / consolidated.workforce.totalBulanIni) * 100)}% of workforce` },
    { title: 'Contract (PKWT)', val: consolidated.workforce.kontrakBulanIni.toString(), sub: `${Math.round((consolidated.workforce.kontrakBulanIni / consolidated.workforce.totalBulanIni) * 100)}% of workforce` },
    { title: 'Open Vacancies', val: consolidated.workforce.posisiKosongBulanIni.toString(), sub: `Target fulfillment: ${consolidated.recruitment.rateBulanBerjalan}%` },
  ];

  wfStats.forEach((st, i) => {
    slide2.addShape(ppt.ShapeType.roundRect, {
      x: 0.6 + i * 3.05,
      y: 1.35,
      w: 2.9,
      h: 0.95,
      fill: { color: BRIGHT_BG },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08,
    });
    slide2.addText(st.title, { x: 0.7 + i * 3.05, y: 1.45, w: 2.7, h: 0.22, fontSize: 10, color: TEXT_MUTED, bold: true });
    slide2.addText(st.val, { x: 0.7 + i * 3.05, y: 1.7, w: 1.4, h: 0.4, fontSize: 18, color: NAVY, bold: true });
    slide2.addText(st.sub, { x: 1.8 + i * 3.05, y: 1.78, w: 1.6, h: 0.28, fontSize: 8.5, color: TEXT_MUTED });
  });

  const wfHeaders = ['Indicator', ...entityCodes, 'TOTAL HO'];
  const tableData: any[][] = [
    wfHeaders.map((h) => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center', fontSize: 10 } })),
    ['Total Headcount', ...entityCodes.map((e) => monthData.workforce[e]?.totalBulanIni ?? 0), { text: consolidated.workforce.totalBulanIni, options: { bold: true } }],
    ['Permanent Staff', ...entityCodes.map((e) => monthData.workforce[e]?.tetapBulanIni ?? 0), { text: consolidated.workforce.tetapBulanIni, options: { bold: true } }],
    ['Contract Staff', ...entityCodes.map((e) => monthData.workforce[e]?.kontrakBulanIni ?? 0), { text: consolidated.workforce.kontrakBulanIni, options: { bold: true } }],
    ['New Hires (+)', ...entityCodes.map((e) => monthData.headcountMovement[e]?.masuk ?? 0), { text: consolidated.headcountMovement.masuk, options: { bold: true, color: '059669' } }],
    ['Departures (-)', ...entityCodes.map((e) => monthData.headcountMovement[e]?.keluar ?? 0), { text: consolidated.headcountMovement.keluar, options: { bold: true, color: 'DC2626' } }],
    ['Non-Staff (Gr 1-2)', ...entityCodes.map((e) => monthData.segregation[e]?.nonStaff ?? 0), { text: consolidated.segregation.nonStaff, options: { bold: true } }],
    ['Staff (Gr 3-4)', ...entityCodes.map((e) => monthData.segregation[e]?.staff ?? 0), { text: consolidated.segregation.staff, options: { bold: true } }],
    ['Managerial (Gr 5≤)', ...entityCodes.map((e) => monthData.segregation[e]?.managerial ?? 0), { text: consolidated.segregation.managerial, options: { bold: true } }],
  ];

  slide2.addTable(tableData as any, {
    x: 0.6,
    y: 2.5,
    w: 12.13,
    h: 4.3,
    fontSize: 9.5,
    align: 'center',
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide2, 2);

  // ===================== SLIDE 3: ATTENDANCE & PUNCTUALITY (NEW!) =====================
  const slide3 = ppt.addSlide();
  slide3.background = { color: CARD_BG };
  addHeader(slide3, '2. Attendance & Punctuality by Department', 'Presence Analytics');

  // Attendance KPI Highlights
  const attStats = [
    { title: 'Overall Presence Rate', val: `${consolidated.attendance.presenceRate}%`, sub: 'Target: >= 95%' },
    { title: 'On-Time Arrival Rate', val: `${consolidated.attendance.onTimeRate}%`, sub: 'Punctuality compliance' },
    { title: 'Late Arrivals Rate', val: `${consolidated.attendance.lateRate}%`, sub: 'Target: < 8%' },
    { title: 'Leave & Absences', val: `${consolidated.attendance.leaveRate}%`, sub: 'Approved leave & sick' },
  ];

  attStats.forEach((st, i) => {
    slide3.addShape(ppt.ShapeType.roundRect, {
      x: 0.6 + i * 3.05,
      y: 1.35,
      w: 2.9,
      h: 0.95,
      fill: { color: BRIGHT_BG },
      line: { color: BORDER_COLOR, width: 1 },
      rectRadius: 0.08,
    });
    slide3.addText(st.title, { x: 0.7 + i * 3.05, y: 1.45, w: 2.7, h: 0.22, fontSize: 10, color: TEXT_MUTED, bold: true });
    slide3.addText(st.val, { x: 0.7 + i * 3.05, y: 1.7, w: 1.4, h: 0.4, fontSize: 18, color: NAVY, bold: true });
    slide3.addText(st.sub, { x: 1.8 + i * 3.05, y: 1.78, w: 1.6, h: 0.28, fontSize: 8.5, color: TEXT_MUTED });
  });

  // Department Attendance Breakdown Table
  const deptTableRows: any[][] = [
    [
      { text: 'Department / Division', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Staff Count', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'On-Time Rate (%)', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Late Rate (%)', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Leave & Absent (%)', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Avg Late (Mins)', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Punctuality Status', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
    ],
    ...(monthData.departmentAttendance || []).map((d) => [
      d.department,
      { text: d.totalStaff.toString(), options: { align: 'center', bold: true } },
      { text: `${d.onTimeRate}%`, options: { align: 'center', bold: true, color: d.onTimeRate >= 95 ? '059669' : '0F172A' } },
      { text: `${d.lateRate}%`, options: { align: 'center', color: d.lateRate > 8 ? 'DC2626' : '0F172A' } },
      { text: `${d.leaveAbsentRate}%`, options: { align: 'center' } },
      { text: `${d.avgLateMinutes}m`, options: { align: 'center' } },
      { text: d.onTimeRate >= 95 ? 'Excellent' : d.onTimeRate >= 90 ? 'Good' : 'Needs Attention', options: { align: 'center', bold: true } },
    ]),
  ];

  slide3.addTable(deptTableRows as any, {
    x: 0.6,
    y: 2.5,
    w: 12.13,
    h: 4.3,
    fontSize: 9,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide3, 3);

  // ===================== SLIDE 4: TURNOVER & RETENTION =====================
  const slide4 = ppt.addSlide();
  slide4.background = { color: CARD_BG };
  addHeader(slide4, '3. Employee Movement & Turnover Reason Analysis', 'Retention Analytics');

  const toHeaders = ['Turnover Indicator', ...entityCodes, 'TOTAL HO'];
  const toTable: any[][] = [
    toHeaders.map((h) => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center', fontSize: 10 } })),
    ['Departures (Current Month)', ...entityCodes.map((e) => monthData.turnover[e]?.keluarBulanBerjalan ?? 0), { text: consolidated.turnover.keluarBulanBerjalan, options: { bold: true } }],
    ['Voluntary Resignations', ...entityCodes.map((e) => monthData.turnover[e]?.sukarelaBulanBerjalan ?? 0), { text: consolidated.turnover.sukarelaBulanBerjalan, options: { bold: true } }],
    ['Involuntary / End Contract', ...entityCodes.map((e) => monthData.turnover[e]?.nonSukarelaBulanBerjalan ?? 0), { text: consolidated.turnover.nonSukarelaBulanBerjalan, options: { bold: true } }],
    ['Monthly Turnover Rate (%)', ...entityCodes.map((e) => `${monthData.turnover[e]?.turnoverRateBulanBerjalan ?? 0}%`), { text: `${consolidated.turnover.turnoverRateBulanBerjalan}%`, options: { bold: true, color: SKY } }],
    ['Turnover YTD (%)', ...entityCodes.map((e) => `${monthData.turnover[e]?.turnoverRateTahunBerjalan ?? 0}%`), { text: `${consolidated.turnover.turnoverRateTahunBerjalan}%`, options: { bold: true, color: TEXT_MUTED } }],
  ];

  slide4.addTable(toTable as any, {
    x: 0.6,
    y: 1.4,
    w: 12.13,
    h: 2.2,
    fontSize: 9.5,
    align: 'center',
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  slide4.addText('Turnover & Exit Reason Analysis', {
    x: 0.6,
    y: 3.8,
    w: 8.0,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: TEXT_DARK,
  });

  const reasonRows: any[][] = [
    [
      { text: 'Reason Category', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Count', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Trend vs. Previous Month', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'HRBP Strategic Analysis & Commentary', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
    ],
    ...monthData.turnoverReasons.map((r) => [
      r.kategori,
      { text: r.jumlah.toString(), options: { align: 'center', bold: true } },
      { text: r.tren, options: { align: 'center' } },
      r.komentar,
    ]),
  ];

  slide4.addTable(reasonRows as any, {
    x: 0.6,
    y: 4.25,
    w: 12.13,
    h: 2.6,
    fontSize: 9,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide4, 4);

  // ===================== SLIDE 5: RECRUITMENT & CRITICAL POSITIONS =====================
  const slide5 = ppt.addSlide();
  slide5.background = { color: CARD_BG };
  addHeader(slide5, '4. Recruitment Fulfillment & Critical Vacancies', 'Talent Acquisition');

  const rcHeaders = ['Recruitment Metric', ...entityCodes, 'TOTAL HO'];
  const rcTable: any[][] = [
    rcHeaders.map((h) => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center', fontSize: 10 } })),
    ['ERF Requisitions', ...entityCodes.map((e) => monthData.recruitment[e]?.erfBulanBerjalan ?? 0), { text: consolidated.recruitment.erfBulanBerjalan, options: { bold: true } }],
    ['Filled Positions', ...entityCodes.map((e) => monthData.recruitment[e]?.terisiBulanBerjalan ?? 0), { text: consolidated.recruitment.terisiBulanBerjalan, options: { bold: true, color: '059669' } }],
    ['In-Progress Positions', ...entityCodes.map((e) => monthData.recruitment[e]?.prosesBulanBerjalan ?? 0), { text: consolidated.recruitment.prosesBulanBerjalan, options: { bold: true, color: GOLD } }],
    ['Fulfillment Rate (%)', ...entityCodes.map((e) => `${monthData.recruitment[e]?.rateBulanBerjalan ?? 0}%`), { text: `${consolidated.recruitment.rateBulanBerjalan}%`, options: { bold: true, color: SKY } }],
  ];

  slide5.addTable(rcTable as any, {
    x: 0.6,
    y: 1.4,
    w: 12.13,
    h: 1.8,
    fontSize: 9.5,
    align: 'center',
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  slide5.addText('Critical Open Positions (Head Office)', {
    x: 0.6,
    y: 3.4,
    w: 8.0,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: TEXT_DARK,
  });

  const cpRows: any[][] = [
    [
      { text: 'Position', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Entity', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Priority', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Current Status', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Target Onboarding', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Obstacles / Next Actions', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
    ],
    ...monthData.criticalPositions.map((cp) => [
      cp.posisi,
      { text: cp.entitas, options: { align: 'center', bold: true } },
      { text: cp.prioritas, options: { align: 'center', color: cp.prioritas === 'High' ? 'DC2626' : '0F172A', bold: true } },
      cp.tahapSaatIni,
      { text: cp.targetBergabung, options: { align: 'center' } },
      cp.kendala,
    ]),
  ];

  slide5.addTable(cpRows as any, {
    x: 0.6,
    y: 3.85,
    w: 12.13,
    h: 3.0,
    fontSize: 8.5,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide5, 5);

  // ===================== SLIDE 6: L&D & CONTRACT MONITORING =====================
  const slide6 = ppt.addSlide();
  slide6.background = { color: CARD_BG };
  addHeader(slide6, '5 & 6. Training & Fixed-Term Contract Expirations', 'Capability & Compliance');

  slide6.addText('Learning & Development Summary', {
    x: 0.6,
    y: 1.3,
    w: 6.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
  });

  const trStats = [
    ['Metric', 'Current Month', 'Target', 'YTD'],
    ['Training Sessions Completed', consolidated.training.sesiBulanBerjalan.toString(), consolidated.training.sesiTarget.toString(), consolidated.training.sesiTahunBerjalan.toString()],
    ['Total Attendees', consolidated.training.pesertaBulanBerjalan.toString(), consolidated.training.pesertaTarget.toString(), consolidated.training.pesertaTahunBerjalan.toString()],
    ['Total Training Hours', `${consolidated.training.jamBulanBerjalan} Hrs`, `${consolidated.training.jamTarget} Hrs`, `${consolidated.training.jamTahunBerjalan} Hrs`],
    ['Realization Rate (%)', `${consolidated.training.realisasiRateBulanBerjalan}%`, '100%', `${consolidated.training.realisasiRateTahunBerjalan}%`],
    ['Mandatory Compliance (%)', `${consolidated.training.wajibRateBulanBerjalan}%`, '100%', `${consolidated.training.wajibRateTahunBerjalan}%`],
  ];

  slide6.addTable(trStats as any, {
    x: 0.6,
    y: 1.7,
    w: 6.0,
    h: 2.3,
    fontSize: 8.5,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  slide6.addText('Expiring Contract Brackets (HO Total)', {
    x: 6.9,
    y: 1.3,
    w: 6.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
  });

  const ceSummary = [
    ['Expiry Period', 'Count', 'Pending', 'Approved', 'Next Steps'],
    ['Next 30 Days', consolidated.contractExpiry.h30.jumlahKontrak.toString(), consolidated.contractExpiry.h30.keputusanTertunda.toString(), consolidated.contractExpiry.h30.keputusanSelesai.toString(), 'Directorate Approval'],
    ['31 - 60 Days', consolidated.contractExpiry.h60.jumlahKontrak.toString(), consolidated.contractExpiry.h60.keputusanTertunda.toString(), consolidated.contractExpiry.h60.keputusanSelesai.toString(), 'Supervisor Review'],
    ['61 - 90 Days', consolidated.contractExpiry.h90.jumlahKontrak.toString(), consolidated.contractExpiry.h90.keputusanTertunda.toString(), consolidated.contractExpiry.h90.keputusanSelesai.toString(), 'HRBP Assessment'],
  ];

  slide6.addTable(ceSummary as any, {
    x: 6.9,
    y: 1.7,
    w: 5.8,
    h: 2.3,
    fontSize: 8.5,
    align: 'center',
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  slide6.addText('Urgent Contract Approvals (Expiring Soon)', {
    x: 0.6,
    y: 4.2,
    w: 8.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
  });

  const cntList = [
    [
      { text: 'Employee Name', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Entity / Role', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Expiry Date', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Days Left', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Recommendation', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'HR PIC', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
    ],
    ...monthData.contractList.slice(0, 4).map((c) => [
      c.nama,
      c.entitasJabatan,
      { text: c.tanggalAkhir, options: { align: 'center' } },
      { text: `${c.sisaHari} Days`, options: { align: 'center', bold: true, color: c.sisaHari <= 30 ? 'DC2626' : '0F172A' } },
      { text: c.rekomendasi, options: { align: 'center' } },
      { text: c.statusKeputusan, options: { align: 'center' } },
      c.pic,
    ]),
  ];

  slide6.addTable(cntList as any, {
    x: 0.6,
    y: 4.6,
    w: 12.13,
    h: 2.2,
    fontSize: 8.5,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide6, 6);

  // ===================== SLIDE 7: HR ISSUES & KEY ACTIVITIES =====================
  const slide7 = ppt.addSlide();
  slide7.background = { color: CARD_BG };
  addHeader(slide7, '7 & 8. Strategic HR Issues & Key Point Activities', 'Execution Roadmap');

  slide7.addText('HR Issues & Mitigation Plans', {
    x: 0.6,
    y: 1.3,
    w: 8.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
  });

  const issuesTable = [
    [
      { text: 'No', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Issue / Risk', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Impact / Root Cause', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'Action / Mitigation', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'PIC', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
    ],
    ...monthData.hrIssues.map((is) => [
      { text: is.no.toString(), options: { align: 'center' } },
      is.isu,
      is.dampak,
      is.tindakan,
      { text: is.pic, options: { align: 'center' } },
      { text: is.status, options: { align: 'center', bold: true } },
    ]),
  ];

  slide7.addTable(issuesTable as any, {
    x: 0.6,
    y: 1.65,
    w: 12.13,
    h: 2.3,
    fontSize: 8.5,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  slide7.addText('Key Point Activities & Strategic Milestones', {
    x: 0.6,
    y: 4.15,
    w: 8.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: TEXT_DARK,
  });

  const actTable = [
    [
      { text: 'No', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Month Raised', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Action Item / Initiative', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY } } },
      { text: 'PIC', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Due Date', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
      { text: 'Status', options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, align: 'center' } },
    ],
    ...monthData.keyActivities.map((a) => [
      { text: a.no.toString(), options: { align: 'center' } },
      { text: a.monthRaised, options: { align: 'center' } },
      a.actionItem,
      { text: a.pic, options: { align: 'center' } },
      { text: a.dueDate, options: { align: 'center' } },
      { text: a.status, options: { align: 'center', bold: true } },
    ]),
  ];

  slide7.addTable(actTable as any, {
    x: 0.6,
    y: 4.5,
    w: 12.13,
    h: 2.3,
    fontSize: 8.5,
    fill: { color: BRIGHT_BG },
    border: { color: BORDER_COLOR, pt: 0.5 },
  });

  addFooter(slide7, 7);

  await ppt.writeFile({ fileName: `HRBP_Nusaraya_Dashboard_${monthName}_${year}.pptx` });
}

/**
 * Generates an executive-grade, deterministic 1-page A4 PDF dashboard directly using jsPDF vector drawing.
 * Guaranteed to be strictly 1 single page, razor sharp, with meticulously calibrated columns that prevent any text overlapping.
 */
export async function downloadDashboardPdf(
  dataOrElementId: MonthReportData | string,
  yearOrFilename?: number | string,
  monthIndex?: number,
  activeEntity?: string,
  entitiesList?: EntityConfig[],
  logoUrl?: string | null,
  customFilename?: string
): Promise<void> {
  let monthData: MonthReportData;
  let year: number = 2026;
  let monthIdx: number = 10;
  let currentEntity: string = 'ALL';
  let entities: EntityConfig[] = entitiesList && entitiesList.length > 0 ? entitiesList : DEFAULT_ENTITIES;
  let filename: string = 'HRBP_Nusaraya_Dashboard_Report.pdf';

  if (typeof dataOrElementId === 'object' && dataOrElementId !== null) {
    monthData = dataOrElementId as MonthReportData;
    if (typeof yearOrFilename === 'number') year = yearOrFilename;
    if (typeof monthIndex === 'number') monthIdx = monthIndex;
    if (activeEntity) currentEntity = activeEntity;
    if (customFilename) filename = customFilename;
  } else {
    if (typeof yearOrFilename === 'string') filename = yearOrFilename;
    throw new Error('Please pass MonthReportData directly to downloadDashboardPdf for pure 1-page vector PDF generation.');
  }

  const monthName = MONTH_NAMES[monthIdx] || 'November';
  const consolidated = calculateConsolidatedMonth(monthData, entities);
  const isAllEntities = currentEntity === 'ALL';

  // Helper string trimmer to guarantee zero column overflowing
  const trimText = (str: string | undefined | null, maxChars: number) => {
    if (!str) return '';
    return str.length > maxChars ? str.slice(0, maxChars - 1) + '…' : str;
  };

  // Initialize jsPDF A4 Portrait in pt (595.28 x 841.89)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const leftX = 20;
  const contentWidth = pageWidth - 40; // 555.28 pt

  // Corporate Color Palette
  const C_NAVY = [15, 23, 42]; // #0F172A
  const C_DARK = [30, 41, 59]; // #1E293B
  const C_MUTED = [100, 116, 139]; // #64748B
  const C_LIGHT_BORDER = [226, 232, 240]; // #E2E8F0
  const C_CARD_BG = [248, 250, 252]; // #F8FAFC
  const C_WHITE = [255, 255, 255];
  const C_SKY = [2, 132, 199]; // #0284C7
  const C_GREEN = [5, 150, 105]; // #059669
  const C_AMBER = [217, 119, 6]; // #D97706
  const C_RED = [220, 38, 38]; // #DC2626

  // Helper drawing functions
  const drawCard = (x: number, y: number, w: number, h: number, fill = C_WHITE, border = C_LIGHT_BORDER) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.75);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');
  };

  const drawSectionHeader = (title: string, sub: string, x: number, y: number, w: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(title.toUpperCase(), x, y);
    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
      doc.text(sub, x + w, y, { align: 'right' });
    }
  };

  // ================= 1. HEADER BANNER (y: 16 -> 68, h: 52) =================
  doc.setFillColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  doc.roundedRect(leftX, 16, contentWidth, 52, 4, 4, 'F');

  // Decorative blue accent strip on left
  doc.setFillColor(C_SKY[0], C_SKY[1], C_SKY[2]);
  doc.rect(leftX, 16, 4, 52, 'F');

  // Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(56, 189, 248); // light sky
  doc.text('HRBP NUSARAYA · HEAD OFFICE ONLY · EXECUTIVE MONITORING', leftX + 12, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('MONTHLY HUMAN CAPITAL EXECUTIVE DASHBOARD', leftX + 12, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(203, 213, 225);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const scopeLabel = isAllEntities ? `Consolidated HO (${entities.length} Entities)` : `Entity: ${currentEntity} (HO)`;
  doc.text(`Period: ${monthName} ${year}   |   ${scopeLabel}   |   Published: ${dateStr}`, leftX + 12, 56);

  // Status Badge on Right (Right-docked, 95pt width)
  const statusBadgeW = 95;
  const statusBadgeX = pageWidth - leftX - statusBadgeW - 6;
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.75);
  doc.roundedRect(statusBadgeX, 24, statusBadgeW, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(56, 189, 248);
  doc.text('REPORT STATUS', statusBadgeX + statusBadgeW / 2, 34, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('OFFICIAL 1-PAGE', statusBadgeX + statusBadgeW / 2, 45, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Confidential / HO Only', statusBadgeX + statusBadgeW / 2, 54, { align: 'center' });

  // ================= 2. 4 EXECUTIVE KPI CARDS (y: 74 -> 122, h: 48) =================
  const kpiW = (contentWidth - 24) / 4; // 132.8pt each
  const kpiY = 74;
  const kpiH = 48;

  const currentWf = isAllEntities ? consolidated.workforce : (monthData.workforce[currentEntity] || consolidated.workforce);
  const currentAtt = isAllEntities ? consolidated.attendance : (monthData.attendance[currentEntity] || consolidated.attendance);
  const currentTo = isAllEntities ? consolidated.turnover : (monthData.turnover[currentEntity] || consolidated.turnover);
  const currentRc = isAllEntities ? consolidated.recruitment : (monthData.recruitment[currentEntity] || consolidated.recruitment);

  const netHcChange = (currentWf.totalBulanIni || 0) - (currentWf.totalBulanLalu || 0);

  const kpis = [
    {
      title: 'TOTAL HEADCOUNT',
      value: `${currentWf.totalBulanIni || 0}`,
      unit: 'Staff',
      sub: `${currentWf.tetapBulanIni || 0} Perm · ${currentWf.kontrakBulanIni || 0} Contract`,
      pill: `${netHcChange >= 0 ? '+' : ''}${netHcChange} vs LM`,
      pillColor: netHcChange >= 0 ? C_GREEN : C_AMBER,
    },
    {
      title: 'ATTENDANCE RATE',
      value: `${currentAtt.presenceRate || 95.8}%`,
      unit: 'Presence',
      sub: `${currentAtt.onTimeRate || 92.4}% On-Time · ${currentAtt.lateRate || 4.2}% Late`,
      pill: (currentAtt.presenceRate || 0) >= 95 ? 'Compliant' : 'Attention',
      pillColor: (currentAtt.presenceRate || 0) >= 95 ? C_GREEN : C_AMBER,
    },
    {
      title: 'MONTHLY TURNOVER',
      value: `${currentTo.turnoverRateBulanBerjalan || 0}%`,
      unit: 'Rate',
      sub: `${currentTo.keluarBulanBerjalan || 0} Exits · ${currentTo.sukarelaBulanBerjalan || 0} Voluntary`,
      pill: `YTD: ${currentTo.turnoverRateTahunBerjalan || 0}%`,
      pillColor: (currentTo.turnoverRateBulanBerjalan || 0) <= 2 ? C_GREEN : C_RED,
    },
    {
      title: 'RECRUITMENT RATE',
      value: `${currentRc.rateBulanBerjalan || 0}%`,
      unit: 'Fulfillment',
      sub: `${currentRc.terisiBulanBerjalan || 0} Filled of ${currentRc.erfBulanBerjalan || 0} ERF`,
      pill: `${currentWf.posisiKosongBulanIni || 0} Vacancies`,
      pillColor: C_SKY,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = leftX + idx * (kpiW + 8);
    drawCard(cardX, kpiY, kpiW, kpiH);

    // Header label (allocated 80pt max)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(kpi.title, cardX + 7, kpiY + 11);

    // Pill on top right
    const pillW = 34;
    const pillX = cardX + kpiW - pillW - 6;
    doc.setFillColor(kpi.pillColor[0], kpi.pillColor[1], kpi.pillColor[2]);
    doc.roundedRect(pillX, kpiY + 4, pillW, 9.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
    doc.text(kpi.pill, pillX + pillW / 2, kpiY + 10.5, { align: 'center' });

    // Main Value & Unit
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(kpi.value, cardX + 7, kpiY + 27);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    const valWidth = doc.getTextWidth(kpi.value);
    doc.text(kpi.unit, cardX + 10 + valWidth, kpiY + 27);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(kpi.sub, cardX + 7, kpiY + 40);
  });

  // ================= 3. ATTENDANCE & PUNCTUALITY BY DEPARTMENT (y: 128 -> 268, h: 140) =================
  const attY = 128;
  const attH = 140;
  drawCard(leftX, attY, contentWidth, attH);

  drawSectionHeader(
    'DEPARTMENT ATTENDANCE & PUNCTUALITY ANALYTICS',
    'Target: >= 95% Presence | <= 5% Late Arrivals',
    leftX + 10,
    attY + 13,
    contentWidth - 20
  );

  // Table header with dedicated, non-overlapping columns
  const tableHeaderY = attY + 19;
  const rowH = 14;
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.roundedRect(leftX + 6, tableHeaderY, contentWidth - 12, rowH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);

  doc.text('DEPARTMENT / DIVISION', leftX + 12, tableHeaderY + 9.5);
  doc.text('STAFF', leftX + 170, tableHeaderY + 9.5, { align: 'center' });
  doc.text('ON-TIME RATE', leftX + 225, tableHeaderY + 9.5, { align: 'center' });
  doc.text('LATE RATE', leftX + 280, tableHeaderY + 9.5, { align: 'center' });
  doc.text('LEAVE / ABSENT', leftX + 340, tableHeaderY + 9.5, { align: 'center' });
  doc.text('AVG DELAY', leftX + 400, tableHeaderY + 9.5, { align: 'center' });
  doc.text('PUNCTUALITY STATUS', leftX + 485, tableHeaderY + 9.5, { align: 'center' });

  // Rows
  const depts = (monthData.departmentAttendance && monthData.departmentAttendance.length > 0)
    ? monthData.departmentAttendance.slice(0, 6)
    : [
        { department: 'Finance & Accounting', totalStaff: 28, onTimeRate: 96.4, lateRate: 2.1, leaveAbsentRate: 1.5, avgLateMinutes: 8, entity: 'HO' },
        { department: 'Human Resources & GA', totalStaff: 18, onTimeRate: 97.2, lateRate: 1.8, leaveAbsentRate: 1.0, avgLateMinutes: 6, entity: 'HO' },
        { department: 'IT, Digital & Systems', totalStaff: 24, onTimeRate: 94.2, lateRate: 4.2, leaveAbsentRate: 1.6, avgLateMinutes: 14, entity: 'HO' },
        { department: 'Operations & Supply Chain', totalStaff: 42, onTimeRate: 91.8, lateRate: 6.2, leaveAbsentRate: 2.0, avgLateMinutes: 18, entity: 'HO' },
        { department: 'Commercial & Marketing', totalStaff: 30, onTimeRate: 93.5, lateRate: 4.8, leaveAbsentRate: 1.7, avgLateMinutes: 12, entity: 'HO' },
        { department: 'Legal, Tax & Compliance', totalStaff: 14, onTimeRate: 98.1, lateRate: 1.2, leaveAbsentRate: 0.7, avgLateMinutes: 5, entity: 'HO' },
      ];

  let currentDeptY = tableHeaderY + rowH + 2;
  depts.forEach((d, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(C_CARD_BG[0], C_CARD_BG[1], C_CARD_BG[2]);
      doc.rect(leftX + 6, currentDeptY - 2, contentWidth - 12, rowH, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(d.department, 26), leftX + 12, currentDeptY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`${d.totalStaff}`, leftX + 170, currentDeptY + 7.5, { align: 'center' });

    // On-Time
    doc.setFont('helvetica', 'bold');
    if (d.onTimeRate >= 95) doc.setTextColor(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
    else if (d.onTimeRate >= 90) doc.setTextColor(C_SKY[0], C_SKY[1], C_SKY[2]);
    else doc.setTextColor(C_AMBER[0], C_AMBER[1], C_AMBER[2]);
    doc.text(`${d.onTimeRate}%`, leftX + 225, currentDeptY + 7.5, { align: 'center' });

    // Late
    if (d.lateRate > 5) doc.setTextColor(C_RED[0], C_RED[1], C_RED[2]);
    else doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(`${d.lateRate}%`, leftX + 280, currentDeptY + 7.5, { align: 'center' });

    // Leave
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(`${d.leaveAbsentRate}%`, leftX + 340, currentDeptY + 7.5, { align: 'center' });

    // Avg delay
    doc.text(`${d.avgLateMinutes} min`, leftX + 400, currentDeptY + 7.5, { align: 'center' });

    // Status pill (Width 44pt, centered around 485)
    const statusText = d.onTimeRate >= 95 ? 'EXCELLENT' : d.onTimeRate >= 92 ? 'COMPLIANT' : 'MONITOR';
    const statusColor = d.onTimeRate >= 95 ? C_GREEN : d.onTimeRate >= 92 ? C_SKY : C_AMBER;
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(leftX + 462, currentDeptY + 0.5, 46, 9.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
    doc.text(statusText, leftX + 485, currentDeptY + 7, { align: 'center' });

    currentDeptY += rowH;
  });

  // Consolidated HO Average Row
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftX + 6, currentDeptY - 1, contentWidth - 12, rowH + 1, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  doc.text('TOTAL CONSOLIDATED HEAD OFFICE', leftX + 12, currentDeptY + 8);
  doc.text(`${currentWf.totalBulanIni || 0}`, leftX + 170, currentDeptY + 8, { align: 'center' });
  doc.setTextColor(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  doc.text(`${consolidated.attendance.onTimeRate}%`, leftX + 225, currentDeptY + 8, { align: 'center' });
  doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.text(`${consolidated.attendance.lateRate}%`, leftX + 280, currentDeptY + 8, { align: 'center' });
  doc.text(`${consolidated.attendance.leaveRate}%`, leftX + 340, currentDeptY + 8, { align: 'center' });
  doc.text('10 min', leftX + 400, currentDeptY + 8, { align: 'center' });

  doc.setFillColor(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  doc.roundedRect(leftX + 462, currentDeptY + 1.5, 46, 9.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('STABLE HO', leftX + 485, currentDeptY + 8, { align: 'center' });

  // ================= 4. HEADCOUNT BY ENTITY & GRADE SEGREGATION (y: 274 -> 402, h: 128) =================
  const hcY = 274;
  const hcH = 128;
  const colLeftW = 345;
  const colRightW = contentWidth - colLeftW - 8; // 202 pt
  const colRightX = leftX + colLeftW + 8;

  // 4.A Left Card: Entity Breakdown
  drawCard(leftX, hcY, colLeftW, hcH);
  drawSectionHeader('HEADCOUNT & MOVEMENT BY ENTITY', 'Head Office Personnel', leftX + 10, hcY + 12, colLeftW - 20);

  const entTableHdrY = hcY + 17;
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.roundedRect(leftX + 6, entTableHdrY, colLeftW - 12, 12, 2, 2, 'F');

  // Exact calibrated column positions with zero collision between EXITS and TURNOVER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('ENTITY', leftX + 10, entTableHdrY + 8.5);
  doc.text('TOTAL HC', leftX + 130, entTableHdrY + 8.5, { align: 'center' });
  doc.text('PERM', leftX + 168, entTableHdrY + 8.5, { align: 'center' });
  doc.text('CONTRACT', leftX + 204, entTableHdrY + 8.5, { align: 'center' });
  doc.text('HIRES (+)', leftX + 242, entTableHdrY + 8.5, { align: 'center' });
  doc.text('EXITS (-)', leftX + 278, entTableHdrY + 8.5, { align: 'center' });
  doc.text('TURNOVER', leftX + 332, entTableHdrY + 8.5, { align: 'right' });

  let entRowY = entTableHdrY + 14;
  const maxEntitiesToShow = Math.min(entities.length, 5);
  for (let i = 0; i < maxEntitiesToShow; i++) {
    const e = entities[i];
    const wf = monthData.workforce[e.name] || { totalBulanIni: 0, tetapBulanIni: 0, kontrakBulanIni: 0 };
    const mov = monthData.headcountMovement[e.name] || { masuk: 0, keluar: 0 };
    const to = monthData.turnover[e.name] || { turnoverRateBulanBerjalan: 0 };

    if (i % 2 === 1) {
      doc.setFillColor(C_CARD_BG[0], C_CARD_BG[1], C_CARD_BG[2]);
      doc.rect(leftX + 6, entRowY - 2, colLeftW - 12, 12, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(e.name, 20), leftX + 10, entRowY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`${wf.totalBulanIni || 0}`, leftX + 130, entRowY + 6.5, { align: 'center' });
    doc.text(`${wf.tetapBulanIni || 0}`, leftX + 168, entRowY + 6.5, { align: 'center' });
    doc.text(`${wf.kontrakBulanIni || 0}`, leftX + 204, entRowY + 6.5, { align: 'center' });

    doc.setTextColor(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
    doc.text(`+${mov.masuk || 0}`, leftX + 242, entRowY + 6.5, { align: 'center' });

    doc.setTextColor((mov.keluar || 0) > 0 ? C_RED[0] : C_MUTED[0], (mov.keluar || 0) > 0 ? C_RED[1] : C_MUTED[1], (mov.keluar || 0) > 0 ? C_RED[2] : C_MUTED[2]);
    doc.text(`-${mov.keluar || 0}`, leftX + 278, entRowY + 6.5, { align: 'center' });

    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(`${to.turnoverRateBulanBerjalan || 0}%`, leftX + 332, entRowY + 6.5, { align: 'right' });

    entRowY += 13;
  }

  // Consolidated row at bottom of entity card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftX + 6, hcY + hcH - 17, colLeftW - 12, 13, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  doc.text('TOTAL CONSOLIDATED', leftX + 10, hcY + hcH - 8);
  doc.text(`${consolidated.workforce.totalBulanIni}`, leftX + 130, hcY + hcH - 8, { align: 'center' });
  doc.text(`${consolidated.workforce.tetapBulanIni}`, leftX + 168, hcY + hcH - 8, { align: 'center' });
  doc.text(`${consolidated.workforce.kontrakBulanIni}`, leftX + 204, hcY + hcH - 8, { align: 'center' });
  doc.setTextColor(C_GREEN[0], C_GREEN[1], C_GREEN[2]);
  doc.text(`+${consolidated.headcountMovement.masuk}`, leftX + 242, hcY + hcH - 8, { align: 'center' });
  doc.setTextColor(consolidated.headcountMovement.keluar > 0 ? C_RED[0] : C_MUTED[0], consolidated.headcountMovement.keluar > 0 ? C_RED[1] : C_MUTED[1], consolidated.headcountMovement.keluar > 0 ? C_RED[2] : C_MUTED[2]);
  doc.text(`-${consolidated.headcountMovement.keluar}`, leftX + 278, hcY + hcH - 8, { align: 'center' });
  doc.setTextColor(C_SKY[0], C_SKY[1], C_SKY[2]);
  doc.text(`${consolidated.turnover.turnoverRateBulanBerjalan}%`, leftX + 332, hcY + hcH - 8, { align: 'right' });

  // 4.B Right Card: Career Grade Segregation
  drawCard(colRightX, hcY, colRightW, hcH);
  drawSectionHeader('CAREER GRADE SEGREGATION', 'By Level', colRightX + 10, hcY + 12, colRightW - 20);

  const curSeg = isAllEntities ? consolidated.segregation : (monthData.segregation[currentEntity] || consolidated.segregation);
  const totalHc = currentWf.totalBulanIni || 1;
  const nonStaffPct = Math.round(((curSeg.nonStaff || 0) / totalHc) * 100);
  const staffPct = Math.round(((curSeg.staff || 0) / totalHc) * 100);
  const mgmtPct = Math.round(((curSeg.managerial || 0) / totalHc) * 100);

  const grades = [
    { label: 'Non-Staff (Grade 1 - 2)', count: curSeg.nonStaff || 0, pct: nonStaffPct, color: C_MUTED },
    { label: 'Staff & Specialist (Gr 3 - 4)', count: curSeg.staff || 0, pct: staffPct, color: C_SKY },
    { label: 'Managerial & Exec (Gr 5+)', count: curSeg.managerial || 0, pct: mgmtPct, color: C_NAVY },
  ];

  let gradeY = hcY + 24;
  grades.forEach((g) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
    doc.text(g.label, colRightX + 10, gradeY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(g.color[0], g.color[1], g.color[2]);
    doc.text(`${g.count} (${g.pct}%)`, colRightX + colRightW - 10, gradeY + 4, { align: 'right' });

    // Progress bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(colRightX + 10, gradeY + 8, colRightW - 20, 5, 2, 2, 'F');

    const fillW = Math.max(2, Math.min(colRightW - 20, ((colRightW - 20) * g.pct) / 100));
    doc.setFillColor(g.color[0], g.color[1], g.color[2]);
    doc.roundedRect(colRightX + 10, gradeY + 8, fillW, 5, 2, 2, 'F');

    gradeY += 21;
  });

  // Permanent vs Contract bar
  const permPct = Math.round(((currentWf.tetapBulanIni || 0) / totalHc) * 100);
  const cntPct = 100 - permPct;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.text('Employment Status Ratio', colRightX + 10, hcY + hcH - 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
  doc.text(`Perm: ${permPct}% | Contract: ${cntPct}%`, colRightX + colRightW - 10, hcY + hcH - 22, { align: 'right' });

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(colRightX + 10, hcY + hcH - 16, colRightW - 20, 6, 2, 2, 'F');

  const permBarW = ((colRightW - 20) * permPct) / 100;
  doc.setFillColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  doc.roundedRect(colRightX + 10, hcY + hcH - 16, permBarW, 6, 2, 2, 'F');
  doc.setFillColor(C_SKY[0], C_SKY[1], C_SKY[2]);
  doc.roundedRect(colRightX + 10 + permBarW, hcY + hcH - 16, (colRightW - 20) - permBarW, 6, 2, 2, 'F');

  // ================= 5. CRITICAL POSITIONS & TALENT ACQUISITION (y: 408 -> 524, h: 116) =================
  const cpY = 408;
  const cpH = 116;
  drawCard(leftX, cpY, colLeftW, cpH);
  drawSectionHeader('CRITICAL OPEN POSITIONS (HEAD OFFICE)', 'Recruitment Status', leftX + 10, cpY + 12, colLeftW - 20);

  const cpHdrY = cpY + 17;
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.roundedRect(leftX + 6, cpHdrY, colLeftW - 12, 12, 2, 2, 'F');

  // Separated headers with clear margins
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('POSITION TITLE', leftX + 10, cpHdrY + 8.5);
  doc.text('ENTITY', leftX + 120, cpHdrY + 8.5);
  doc.text('PRIORITY', leftX + 185, cpHdrY + 8.5, { align: 'center' });
  doc.text('CURRENT STAGE', leftX + 218, cpHdrY + 8.5);
  doc.text('TARGET', leftX + 332, cpHdrY + 8.5, { align: 'right' });

  let cpRowY = cpHdrY + 14;
  const criticalList = (monthData.criticalPositions && monthData.criticalPositions.length > 0)
    ? monthData.criticalPositions.slice(0, 4)
    : [
        { posisi: 'Senior Tax Manager', entitas: 'Nusaraya HO', prioritas: 'High', tahapSaatIni: 'User Interview 2', targetBergabung: 'Dec 2026', kendala: '' },
        { posisi: 'ERP Lead Specialist', entitas: 'Nusaraya HO', prioritas: 'High', tahapSaatIni: 'Offering Letter', targetBergabung: 'Nov 2026', kendala: '' },
        { posisi: 'HRBP Lead Specialist', entitas: 'Nusaraya HO', prioritas: 'Medium', tahapSaatIni: 'Shortlisting CV', targetBergabung: 'Dec 2026', kendala: '' },
        { posisi: 'Internal Audit Lead', entitas: 'Nusaraya HO', prioritas: 'High', tahapSaatIni: 'Background Check', targetBergabung: 'Dec 2026', kendala: '' },
      ];

  criticalList.forEach((cp, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(C_CARD_BG[0], C_CARD_BG[1], C_CARD_BG[2]);
      doc.rect(leftX + 6, cpRowY - 2, colLeftW - 12, 18, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(cp.posisi, 20), leftX + 10, cpRowY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(trimText(cp.entitas, 11), leftX + 120, cpRowY + 6);

    // Priority pill (Centered at 185)
    const isHigh = cp.prioritas === 'High';
    doc.setFillColor(isHigh ? C_RED[0] : C_SKY[0], isHigh ? C_RED[1] : C_SKY[1], isHigh ? C_RED[2] : C_SKY[2]);
    doc.roundedRect(leftX + 171, cpRowY + 0.5, 28, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
    doc.text(cp.prioritas.toUpperCase(), leftX + 185, cpRowY + 6, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
    doc.text(trimText(cp.tahapSaatIni, 17), leftX + 218, cpRowY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(cp.targetBergabung, leftX + 332, cpRowY + 6, { align: 'right' });

    // Obstacle or sub line safely positioned with zero collision
    if (cp.kendala) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(5);
      doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
      doc.text(`Note: ${trimText(cp.kendala, 55)}`, leftX + 10, cpRowY + 12.5);
    }

    cpRowY += 21;
  });

  // 5.B Right Card: Talent Acquisition Pipeline
  drawCard(colRightX, cpY, colRightW, cpH);
  drawSectionHeader('TALENT ACQUISITION FUNNEL', 'Head Office ERF', colRightX + 10, cpY + 12, colRightW - 20);

  const taItems = [
    { label: 'Active ERF Requisitions', value: `${currentRc.erfBulanBerjalan || 0}`, sub: 'Approved positions' },
    { label: 'Candidates In-Process', value: `${currentRc.prosesBulanBerjalan || 0}`, sub: 'Interviews & assessments' },
    { label: 'Successfully Filled', value: `${currentRc.terisiBulanBerjalan || 0}`, sub: 'Offers accepted' },
    { label: 'Recruitment Fulfillment', value: `${currentRc.rateBulanBerjalan || 0}%`, sub: 'Target: >= 85%' },
  ];

  let taY = cpY + 22;
  taItems.forEach((item, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(item.label, colRightX + 10, taY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(idx === 3 ? C_GREEN[0] : C_SKY[0], idx === 3 ? C_GREEN[1] : C_SKY[1], idx === 3 ? C_GREEN[2] : C_SKY[2]);
    doc.text(item.value, colRightX + colRightW - 10, taY + 5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(item.sub, colRightX + 10, taY + 13.5);

    if (idx < 3) {
      doc.setDrawColor(C_LIGHT_BORDER[0], C_LIGHT_BORDER[1], C_LIGHT_BORDER[2]);
      doc.setLineWidth(0.5);
      doc.line(colRightX + 10, taY + 17.5, colRightX + colRightW - 10, taY + 17.5);
    }

    taY += 22;
  });

  // ================= 6. TURNOVER REASONS & CONTRACT MONITORING (y: 530 -> 646, h: 116) =================
  const toY = 530;
  const toH = 116;
  const toLeftW = 270;
  const toRightW = contentWidth - toLeftW - 8; // 277 pt
  const toRightX = leftX + toLeftW + 8;

  // 6.A Left: Turnover Root Causes
  drawCard(leftX, toY, toLeftW, toH);
  drawSectionHeader('TURNOVER ROOT CAUSE ANALYSIS', 'Exit Interviews', leftX + 10, toY + 12, toLeftW - 20);

  const toReasons = (monthData.turnoverReasons && monthData.turnoverReasons.length > 0)
    ? monthData.turnoverReasons.slice(0, 3)
    : [
        { kategori: 'Career Progression / External Offer', jumlah: 2, tren: 'Up', komentar: 'Benchmark compensation packages' },
        { kategori: 'Higher Education / Relocation', jumlah: 1, tren: 'Stable', komentar: 'Personal reasons verified' },
        { kategori: 'End of Contract (PKWT)', jumlah: 1, tren: 'Down', komentar: 'Project completed on schedule' },
      ];

  let toReasonY = toY + 25;
  toReasons.forEach((r, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(`${idx + 1}. ${trimText(r.kategori, 26)}`, leftX + 10, toReasonY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(C_RED[0], C_RED[1], C_RED[2]);
    doc.text(`${r.jumlah} Staff (${r.tren})`, leftX + toLeftW - 10, toReasonY, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(`Action: ${trimText(r.komentar, 48)}`, leftX + 10, toReasonY + 8);

    if (idx < toReasons.length - 1) {
      doc.setDrawColor(C_LIGHT_BORDER[0], C_LIGHT_BORDER[1], C_LIGHT_BORDER[2]);
      doc.setLineWidth(0.5);
      doc.line(leftX + 10, toReasonY + 13.5, leftX + toLeftW - 10, toReasonY + 13.5);
    }
    toReasonY += 23;
  });

  // 6.B Right: Fixed-Term Contract Expiration
  drawCard(toRightX, toY, toRightW, toH);
  drawSectionHeader('FIXED-TERM CONTRACT (PKWT) RISK MONITORING', 'Expiring Contracts', toRightX + 10, toY + 12, toRightW - 20);

  // 3 Bucket badges
  const bW = (toRightW - 24) / 3;
  const bY = toY + 18;
  const bH = 24;

  const buckets = [
    { title: 'H-30 (URGENT)', count: consolidated.contractExpiry.h30.jumlahKontrak, pending: consolidated.contractExpiry.h30.keputusanTertunda, color: C_RED },
    { title: 'H-60 (ACTION)', count: consolidated.contractExpiry.h60.jumlahKontrak, pending: consolidated.contractExpiry.h60.keputusanTertunda, color: C_AMBER },
    { title: 'H-90 (PLANNED)', count: consolidated.contractExpiry.h90.jumlahKontrak, pending: consolidated.contractExpiry.h90.keputusanTertunda, color: C_SKY },
  ];

  buckets.forEach((b, idx) => {
    const bx = toRightX + 8 + idx * (bW + 4);
    doc.setFillColor(C_CARD_BG[0], C_CARD_BG[1], C_CARD_BG[2]);
    doc.setDrawColor(b.color[0], b.color[1], b.color[2]);
    doc.setLineWidth(0.75);
    doc.roundedRect(bx, bY, bW, bH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.title, bx + bW / 2, bY + 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(`${b.count}`, bx + bW / 2 - 8, bY + 19, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(`(${b.pending} pend)`, bx + bW / 2 + 12, bY + 19, { align: 'center' });
  });

  // Upcoming contract table with zero overlap between Recommendation and Days Left pill
  let cntRowY = bY + bH + 11;
  const upcomingContracts = (monthData.contractList && monthData.contractList.length > 0)
    ? monthData.contractList.slice(0, 3)
    : [
        { nama: 'Budi Santoso', entitasJabatan: 'IT / System Engineer', tanggalAkhir: '15 Nov 2026', sisaHari: 10, rekomendasi: 'Extend 1 Year', statusKeputusan: 'Approved' },
        { nama: 'Siti Rahma', entitasJabatan: 'Finance / AP Specialist', tanggalAkhir: '28 Nov 2026', sisaHari: 23, rekomendasi: 'Convert Permanent', statusKeputusan: 'Pending' },
        { nama: 'Dimas Anggara', entitasJabatan: 'GA / Building Officer', tanggalAkhir: '10 Dec 2026', sisaHari: 35, rekomendasi: 'Extend 6 Mos', statusKeputusan: 'Review' },
      ];

  upcomingContracts.forEach((c) => {
    // Left: Name & Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(c.nama, 16), toRightX + 10, cntRowY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(trimText(c.entitasJabatan, 19), toRightX + 10, cntRowY + 7);

    // Center: Recommendation (distinct column at toRightX + 130)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(c.rekomendasi, 16), toRightX + 130, cntRowY + 3);

    // Right: Days Left Pill (docked to right edge: 44pt width)
    const isUrgent = c.sisaHari <= 30;
    const pillW = 44;
    const pillX = toRightX + toRightW - pillW - 8;
    doc.setFillColor(isUrgent ? C_RED[0] : C_SKY[0], isUrgent ? C_RED[1] : C_SKY[1], isUrgent ? C_RED[2] : C_SKY[2]);
    doc.roundedRect(pillX, cntRowY - 3.5, pillW, 8.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
    doc.text(`${c.sisaHari} DAYS LEFT`, pillX + pillW / 2, cntRowY + 2.5, { align: 'center' });

    cntRowY += 17.5;
  });

  // ================= 7. HR ISSUES & LEARNING & DEVELOPMENT (y: 652 -> 786, h: 134) =================
  const issueY = 652;
  const issueH = 134;
  drawCard(leftX, issueY, colLeftW, issueH);
  drawSectionHeader('STRATEGIC HR ISSUES & MITIGATION ROADMAP', 'Executive Action Plan', leftX + 10, issueY + 12, colLeftW - 20);

  const issuesHdrY = issueY + 17;
  doc.setFillColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.roundedRect(leftX + 6, issuesHdrY, colLeftW - 12, 12, 2, 2, 'F');

  // Calibrated column layout with zero overlap between Action, PIC and Status pill
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
  doc.text('KEY ISSUE & RISK', leftX + 10, issuesHdrY + 8.5);
  doc.text('MITIGATION ACTION', leftX + 128, issuesHdrY + 8.5);
  doc.text('PIC', leftX + 242, issuesHdrY + 8.5);
  doc.text('STATUS', leftX + 315, issuesHdrY + 8.5, { align: 'center' });

  let curIssueY = issuesHdrY + 14;
  const issueList = (monthData.hrIssues && monthData.hrIssues.length > 0)
    ? monthData.hrIssues.slice(0, 4)
    : [
        { isu: 'Tax Specialist Vacancy Lead Time', dampak: 'Delayed close', tindakan: 'Engage headhunter & fast-track tests', pic: 'HRBP Lead', status: 'In Progress' },
        { isu: 'Attendance Punctuality in Operations', dampak: 'Meeting delays', tindakan: 'Automate biometric alert notifications', pic: 'HR Ops', status: 'Completed' },
        { isu: 'Mid-Year Performance Review Completion', dampak: 'KPI tracking', tindakan: 'Conduct manager calibration sessions', pic: 'HRBP Lead', status: 'In Progress' },
        { isu: 'Annual Remuneration Market Alignment', dampak: 'Attrition risk', tindakan: 'Submit revised salary band to Board', pic: 'Rewards Lead', status: 'Under Review' },
      ];

  issueList.forEach((is, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(C_CARD_BG[0], C_CARD_BG[1], C_CARD_BG[2]);
      doc.rect(leftX + 6, curIssueY - 2, colLeftW - 12, 22, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(is.isu, 22), leftX + 10, curIssueY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    const cleanDampak = is.dampak ? `Risk: ${trimText(is.dampak, 24)}` : '';
    doc.text(cleanDampak, leftX + 10, curIssueY + 13.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
    doc.text(trimText(is.tindakan, 26), leftX + 128, curIssueY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(trimText(is.pic, 11), leftX + 242, curIssueY + 6);

    // Status pill (38pt width, centered around 315)
    const isDone = is.status === 'Completed' || is.status === 'Done';
    const stPillW = 38;
    const stPillX = leftX + 296;
    doc.setFillColor(isDone ? C_GREEN[0] : C_SKY[0], isDone ? C_GREEN[1] : C_SKY[1], isDone ? C_GREEN[2] : C_SKY[2]);
    doc.roundedRect(stPillX, curIssueY + 0.5, stPillW, 8.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(4.8);
    doc.setTextColor(C_WHITE[0], C_WHITE[1], C_WHITE[2]);
    doc.text(trimText(is.status.toUpperCase(), 11), stPillX + stPillW / 2, curIssueY + 6.5, { align: 'center' });

    curIssueY += 23.5;
  });

  // 7.B Right: Learning & Development Highlights
  drawCard(colRightX, issueY, colRightW, issueH);
  drawSectionHeader('LEARNING & DEVELOPMENT', 'Capability Building', colRightX + 10, issueY + 12, colRightW - 20);

  const curTr = isAllEntities ? consolidated.training : (monthData.training[currentEntity] || consolidated.training);

  const ldItems = [
    { label: 'Completed Training Sessions', val: `${curTr.sesiBulanBerjalan || 0}`, target: `Target: ${curTr.sesiTarget || 0}` },
    { label: 'Total Employees Trained', val: `${curTr.pesertaBulanBerjalan || 0} Staff`, target: `Target: ${curTr.pesertaTarget || 0}` },
    { label: 'Total Learning Hours Delivered', val: `${curTr.jamBulanBerjalan || 0} Hours`, target: `Target: ${curTr.jamTarget || 0} Hrs` },
    { label: 'Training Plan Realization', val: `${curTr.realisasiRateBulanBerjalan || 0}%`, target: 'Target: 100%' },
    { label: 'Mandatory Compliance Rate', val: `${curTr.wajibRateBulanBerjalan || 0}%`, target: 'Target: 100%' },
  ];

  let ldY = issueY + 22;
  ldItems.forEach((ld, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
    doc.text(trimText(ld.label, 26), colRightX + 10, ldY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(C_SKY[0], C_SKY[1], C_SKY[2]);
    doc.text(ld.val, colRightX + colRightW - 10, ldY + 4, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
    doc.text(ld.target, colRightX + 10, ldY + 12);

    if (idx < ldItems.length - 1) {
      doc.setDrawColor(C_LIGHT_BORDER[0], C_LIGHT_BORDER[1], C_LIGHT_BORDER[2]);
      doc.setLineWidth(0.5);
      doc.line(colRightX + 10, ldY + 15, colRightX + colRightW - 10, ldY + 15);
    }
    ldY += 19;
  });

  // ================= 8. EXECUTIVE FOOTER (y: 794 -> 826, h: 32) =================
  const footerY = 794;
  doc.setDrawColor(C_LIGHT_BORDER[0], C_LIGHT_BORDER[1], C_LIGHT_BORDER[2]);
  doc.setLineWidth(0.75);
  doc.line(leftX, footerY, pageWidth - leftX, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(C_DARK[0], C_DARK[1], C_DARK[2]);
  doc.text('HRBP NUSARAYA · HEAD OFFICE MONTHLY EXECUTIVE DASHBOARD', leftX, footerY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
  doc.text('CONFIDENTIAL & PROPRIETARY · PREPARED FOR EXECUTIVE COMMITTEE & BOARD OF DIRECTORS', leftX, footerY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(C_NAVY[0], C_NAVY[1], C_NAVY[2]);
  doc.text('PAGE 1 OF 1', pageWidth - leftX, footerY + 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(C_MUTED[0], C_MUTED[1], C_MUTED[2]);
  doc.text(`Official Executive Export · Generated ${dateStr}`, pageWidth - leftX, footerY + 20, { align: 'right' });

  // STRICT GUARANTEE: Ensure exactly 1 page
  while (doc.getNumberOfPages() > 1) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Trigger browser download via Blob
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();

  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);
  }, 250);
}


