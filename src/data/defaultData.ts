import {
  EntityId,
  ENTITY_LIST,
  MonthReportData,
  WorkforceOverviewEntity,
  HeadcountMovementEntity,
  SegregationEntity,
  TurnoverEntity,
  TurnoverReasonItem,
  RecruitmentEntity,
  CriticalPositionItem,
  TrainingEntity,
  MainTrainingItem,
  AttendanceEntitySummary,
  DepartmentAttendance,
  HRIssueItem,
  ContractExpiryEntity,
  ContractEmployeeItem,
  KeyPointActivityItem,
  YearData,
} from '../types/dashboard';

export const createDefaultWorkforce = (prevTotal = 40, curTotal = 42): WorkforceOverviewEntity => ({
  totalBulanLalu: prevTotal,
  totalBulanIni: curTotal,
  tetapBulanLalu: Math.round(prevTotal * 0.7),
  tetapBulanIni: Math.round(curTotal * 0.72),
  kontrakBulanLalu: prevTotal - Math.round(prevTotal * 0.7),
  kontrakBulanIni: curTotal - Math.round(curTotal * 0.72),
  posisiKosongBulanLalu: 3,
  posisiKosongBulanIni: 2,
});

export const createDefaultMovement = (prevTotal = 40, masuk = 3, keluar = 1, mutasi = 0, catatan = 'Normal recruitment & replacement'): HeadcountMovementEntity => ({
  awalBulan: prevTotal,
  masuk,
  keluar,
  mutasiInternal: mutasi,
  catatan,
});

export const createDefaultSegregation = (total = 42): SegregationEntity => {
  const managerial = Math.max(3, Math.round(total * 0.15));
  const staff = Math.round(total * 0.55);
  const nonStaff = total - managerial - staff;
  return {
    nonStaff: Math.max(0, nonStaff),
    staff,
    managerial,
  };
};

export const createDefaultTurnover = (keluar = 1, total = 42): TurnoverEntity => ({
  keluarBulanBerjalan: keluar,
  keluarBulanSebelumnya: Math.max(0, keluar - 1),
  keluarTahunBerjalan: keluar + 4,
  catatanKeluar: keluar > 0 ? 'Voluntary resignation' : 'Zero turnover achieved',
  sukarelaBulanBerjalan: keluar,
  sukarelaBulanSebelumnya: Math.max(0, keluar - 1),
  sukarelaTahunBerjalan: keluar + 3,
  catatanSukarela: 'Career progression opportunity',
  nonSukarelaBulanBerjalan: 0,
  nonSukarelaBulanSebelumnya: 0,
  nonSukarelaTahunBerjalan: 1,
  catatanNonSukarela: 'Contract ended',
  turnoverRateBulanBerjalan: Number(((keluar / total) * 100).toFixed(2)),
  turnoverRateBulanSebelumnya: Number((((keluar === 0 ? 1 : keluar - 1) / total) * 100).toFixed(2)),
  turnoverRateTahunBerjalan: Number((((keluar + 4) / total) * 100).toFixed(2)),
  catatanDefinisi: 'Formula: (Exits / Total Active Headcount) x 100%',
});

export const createDefaultRecruitment = (): RecruitmentEntity => ({
  erfBulanBerjalan: 4,
  erfTarget: 4,
  erfTahunBerjalan: 22,
  erfKeterangan: 'Fulfillment on schedule',
  terisiBulanBerjalan: 3,
  terisiTarget: 4,
  terisiTahunBerjalan: 18,
  terisiKeterangan: '1 candidate under salary negotiation',
  prosesBulanBerjalan: 1,
  prosesTarget: 0,
  prosesTahunBerjalan: 4,
  prosesKeterangan: 'Final user interview stage',
  rateBulanBerjalan: 75.0,
  rateTarget: 100.0,
  rateTahunBerjalan: 81.8,
  rateKeterangan: 'Fulfillment threshold target >= 80%',
});

export const createDefaultTraining = (): TrainingEntity => ({
  sesiBulanBerjalan: 3,
  sesiTarget: 3,
  sesiTahunBerjalan: 26,
  sesiKeterangan: 'Internal & external corporate workshops completed',
  pesertaBulanBerjalan: 28,
  pesertaTarget: 30,
  pesertaTahunBerjalan: 210,
  pesertaKeterangan: 'Attendance rate 93.3%',
  jamBulanBerjalan: 48,
  jamTarget: 50,
  jamTahunBerjalan: 380,
  jamKeterangan: 'Average 1.7 training hours per employee',
  realisasiRateBulanBerjalan: 93.3,
  realisasiRateTarget: 100,
  realisasiRateTahunBerjalan: 92.5,
  realisasiKeterangan: 'On schedule',
  wajibRateBulanBerjalan: 100,
  wajibRateTarget: 100,
  wajibRateTahunBerjalan: 98.2,
  wajibKeterangan: 'Mandatory Safety (HSE) & Corporate Governance',
});

export const createDefaultAttendanceSummary = (onTime = 93.2, late = 6.8): AttendanceEntitySummary => ({
  presenceRate: 97.4,
  onTimeRate: onTime,
  lateRate: late,
  leaveRate: 2.6,
  avgWorkDays: 22,
  notes: 'Fingerprint & mobile biometric check-in verified',
});

export const createDefaultContractExpiry = (): ContractExpiryEntity => ({
  h30: { jumlahKontrak: 2, keputusanTertunda: 0, keputusanSelesai: 2, keterangan: 'Directorate approval confirmed' },
  h60: { jumlahKontrak: 4, keputusanTertunda: 1, keputusanSelesai: 3, keterangan: '1 position under performance evaluation' },
  h90: { jumlahKontrak: 5, keputusanTertunda: 3, keputusanSelesai: 2, keterangan: 'Direct supervisor review in progress' },
});

export const createInitialMonthData = (monthIndex = 10): MonthReportData => {
  const entityDataMap: Record<EntityId, { prev: number; cur: number; in: number; out: number; mutasi: number; onTime: number; late: number }> = {
    KNC: { prev: 54, cur: 56, in: 3, out: 1, mutasi: 0, onTime: 94.2, late: 5.8 },
    SMS: { prev: 42, cur: 43, in: 2, out: 1, mutasi: 0, onTime: 92.5, late: 7.5 },
    SST: { prev: 38, cur: 39, in: 1, out: 0, mutasi: 0, onTime: 95.1, late: 4.9 },
    SWK: { prev: 45, cur: 44, in: 0, out: 1, mutasi: 0, onTime: 91.8, late: 8.2 },
    PSM: { prev: 33, cur: 34, in: 2, out: 1, mutasi: 0, onTime: 93.0, late: 7.0 },
    IIM: { prev: 28, cur: 29, in: 2, out: 1, mutasi: 0, onTime: 96.0, late: 4.0 },
    SNB: { prev: 31, cur: 33, in: 2, out: 0, mutasi: 0, onTime: 93.5, late: 6.5 },
  };

  const workforce: Record<EntityId, WorkforceOverviewEntity> = {} as any;
  const headcountMovement: Record<EntityId, HeadcountMovementEntity> = {} as any;
  const segregation: Record<EntityId, SegregationEntity> = {} as any;
  const turnover: Record<EntityId, TurnoverEntity> = {} as any;
  const recruitment: Record<EntityId, RecruitmentEntity> = {} as any;
  const training: Record<EntityId, TrainingEntity> = {} as any;
  const attendance: Record<EntityId, AttendanceEntitySummary> = {} as any;
  const contractExpiry: Record<EntityId, ContractExpiryEntity> = {} as any;

  ENTITY_LIST.forEach((entity) => {
    const info = entityDataMap[entity];
    workforce[entity] = createDefaultWorkforce(info.prev, info.cur);
    headcountMovement[entity] = createDefaultMovement(info.prev, info.in, info.out, info.mutasi, `Net Headcount +${info.in - info.out}`);
    segregation[entity] = createDefaultSegregation(info.cur);
    turnover[entity] = createDefaultTurnover(info.out, info.cur);
    recruitment[entity] = createDefaultRecruitment();
    training[entity] = createDefaultTraining();
    attendance[entity] = createDefaultAttendanceSummary(info.onTime, info.late);
    contractExpiry[entity] = createDefaultContractExpiry();
  });

  const turnoverReasons: TurnoverReasonItem[] = [
    { id: '1', kategori: 'Compensation & Benefits', jumlah: 2, tren: 'Stable', komentar: 'Benchmarked with national mining salary scales' },
    { id: '2', kategori: 'Career Advancement Opportunity', jumlah: 2, tren: 'Increasing', komentar: 'Offered higher managerial roles elsewhere' },
    { id: '3', kategori: 'Personal / Family Relocation', jumlah: 1, tren: 'Decreasing', komentar: 'Family relocation outside Jakarta HQ' },
    { id: '4', kategori: 'Contract Expiration / Mutual Agreement', jumlah: 0, tren: 'Decreasing', komentar: 'All expiring contracts extended on time' },
    { id: '5', kategori: 'Higher Education / Studies', jumlah: 0, tren: 'Stable', komentar: 'No occurrences this month' },
  ];

  // Presence & Punctuality by Department
  const departmentAttendance: DepartmentAttendance[] = [
    {
      id: 'dept-1',
      department: 'Finance & Accounting',
      totalStaff: 38,
      onTimeRate: 96.2,
      lateRate: 3.8,
      leaveAbsentRate: 2.1,
      avgLateMinutes: 8,
      entity: 'HO Total',
    },
    {
      id: 'dept-2',
      department: 'Human Resources & General Affairs',
      totalStaff: 24,
      onTimeRate: 97.5,
      lateRate: 2.5,
      leaveAbsentRate: 1.8,
      avgLateMinutes: 6,
      entity: 'HO Total',
    },
    {
      id: 'dept-3',
      department: 'Mining Technical, Geology & Planning',
      totalStaff: 48,
      onTimeRate: 92.4,
      lateRate: 7.6,
      leaveAbsentRate: 3.2,
      avgLateMinutes: 14,
      entity: 'HO Total',
    },
    {
      id: 'dept-4',
      department: 'Supply Chain, Procurement & Logistics',
      totalStaff: 42,
      onTimeRate: 91.1,
      lateRate: 8.9,
      leaveAbsentRate: 2.9,
      avgLateMinutes: 16,
      entity: 'HO Total',
    },
    {
      id: 'dept-5',
      department: 'Commercial, Marketing & Coal Shipping',
      totalStaff: 32,
      onTimeRate: 93.8,
      lateRate: 6.2,
      leaveAbsentRate: 2.5,
      avgLateMinutes: 12,
      entity: 'HO Total',
    },
    {
      id: 'dept-6',
      department: 'Legal, Industrial Relations & Compliance',
      totalStaff: 18,
      onTimeRate: 95.6,
      lateRate: 4.4,
      leaveAbsentRate: 2.0,
      avgLateMinutes: 9,
      entity: 'HO Total',
    },
    {
      id: 'dept-7',
      department: 'HSE & Environmental Management',
      totalStaff: 22,
      onTimeRate: 98.1,
      lateRate: 1.9,
      leaveAbsentRate: 1.4,
      avgLateMinutes: 5,
      entity: 'HO Total',
    },
    {
      id: 'dept-8',
      department: 'Information Technology & Digital Systems',
      totalStaff: 26,
      onTimeRate: 90.5,
      lateRate: 9.5,
      leaveAbsentRate: 3.4,
      avgLateMinutes: 19,
      entity: 'HO Total',
    },
  ];

  const criticalPositions: CriticalPositionItem[] = [
    {
      id: 'cp-1',
      posisi: 'Senior Geologist Specialist (HO)',
      entitas: 'KNC',
      prioritas: 'High',
      tahapSaatIni: 'Offering Letter & Medical Check-Up',
      targetBergabung: 'Dec 15, 2026',
      kendala: 'Candidate serving 1-month notice period',
    },
    {
      id: 'cp-2',
      posisi: 'Commercial & Sales Logistics Lead',
      entitas: 'SMS',
      prioritas: 'High',
      tahapSaatIni: 'Final Board Interview with Directorate',
      targetBergabung: 'Jan 05, 2027',
      kendala: 'Remuneration package alignment in progress',
    },
    {
      id: 'cp-3',
      posisi: 'Tax & Corporate Accounting Supervisor',
      entitas: 'SST',
      prioritas: 'Medium',
      tahapSaatIni: 'Psychological Assessment & Background Check',
      targetBergabung: 'Dec 20, 2026',
      kendala: 'Tax certification (Brevet C) verification',
    },
    {
      id: 'cp-4',
      posisi: 'Supply Chain Contract Manager',
      entitas: 'SWK',
      prioritas: 'High',
      tahapSaatIni: 'Candidate Shortlisting & Screening',
      targetBergabung: 'Jan 15, 2027',
      kendala: 'Mining heavy equipment procurement experience required',
    },
  ];

  const mainTrainings: MainTrainingItem[] = [
    {
      id: 'tr-1',
      pelatihan: 'Executive HR Analytics & Strategic Workforce Planning',
      kelompokSasaran: 'HRBP Team & Head Office Management',
      status: 'Completed',
      batasWaktu: 'Nov 10, 2026',
      pic: 'HRBP Lead HO',
    },
    {
      id: 'tr-2',
      pelatihan: 'Labor Law & Industrial Relations Compliance 2026',
      kelompokSasaran: 'All Entity HR & Operations Leaders',
      status: 'Completed',
      batasWaktu: 'Nov 18, 2026',
      pic: 'Legal & IR Specialist',
    },
    {
      id: 'tr-3',
      pelatihan: 'Enterprise Asset & Financial Management System',
      kelompokSasaran: 'Finance, Accounting & Logistics Teams',
      status: 'In Progress',
      batasWaktu: 'Dec 05, 2026',
      pic: 'IT & Project PMO',
    },
    {
      id: 'tr-4',
      pelatihan: 'SMKP & Mining Occupational Safety Refreshment',
      kelompokSasaran: 'Technical & Engineering HO Staff',
      status: 'Scheduled',
      batasWaktu: 'Dec 15, 2026',
      pic: 'HSE Manager',
    },
  ];

  const hrIssues: HRIssueItem[] = [
    {
      id: 'isu-1',
      no: 1,
      isu: 'Approval lead time bottleneck on critical engineering requisitions',
      dampak: 'Fulfillment timeline exceeding standard 45-day SLA',
      tindakan: 'Automated requisition routing via HRIS & weekly escalation to Head of HR',
      pic: 'Talent Acquisition Lead',
      batasWaktu: 'Nov 30, 2026',
      status: 'In Progress',
    },
    {
      id: 'isu-2',
      no: 2,
      isu: 'Data reconciliation latency in monthly entity reporting',
      dampak: 'Manual consolidation required across multiple subsidiary spreadsheets',
      tindakan: 'Deploy standardized centralized digital HRBP dashboard with live validation',
      pic: 'HR Operations Lead',
      batasWaktu: 'Dec 10, 2026',
      status: 'In Progress',
    },
    {
      id: 'isu-3',
      no: 3,
      isu: 'Fixed-term contract compliance audit for 2026 statutory updates',
      dampak: 'Statutory compliance and internal labor audit governance',
      tindakan: 'Comprehensive legal review of standardized contract addenda completed',
      pic: 'Industrial Relations Lead',
      batasWaktu: 'Nov 25, 2026',
      status: 'Resolved',
    },
  ];

  const contractList: ContractEmployeeItem[] = [
    {
      id: 'cnt-1',
      nama: 'Bambang Prasetyo (KNC-0492)',
      entitasJabatan: 'KNC - Mine Planning Specialist',
      tanggalAkhir: '2026-11-28',
      sisaHari: 18,
      rekomendasi: 'Extend',
      statusKeputusan: 'Approved',
      pic: 'Engineering Lead & HRBP KNC',
    },
    {
      id: 'cnt-2',
      nama: 'Dewi Lestari (SMS-0311)',
      entitasJabatan: 'SMS - Senior Logistics Coordinator',
      tanggalAkhir: '2026-12-05',
      sisaHari: 25,
      rekomendasi: 'Permanent Convert',
      statusKeputusan: 'Approved',
      pic: 'Logistics Manager & HRBP SMS',
    },
    {
      id: 'cnt-3',
      nama: 'Rizky Firmansyah (SWK-0188)',
      entitasJabatan: 'SWK - Procurement Officer',
      tanggalAkhir: '2026-12-20',
      sisaHari: 40,
      rekomendasi: 'Extend',
      statusKeputusan: 'Pending Approval',
      pic: 'Procurement Head & HRBP SWK',
    },
    {
      id: 'cnt-4',
      nama: 'Siti Handayani (PSM-0220)',
      entitasJabatan: 'PSM - Cost Control Analyst',
      tanggalAkhir: '2027-01-10',
      sisaHari: 61,
      rekomendasi: 'Extend',
      statusKeputusan: 'Pending Approval',
      pic: 'Finance Controller & HRBP PSM',
    },
    {
      id: 'cnt-5',
      nama: 'Ahmad Fauzan (IIM-0105)',
      entitasJabatan: 'IIM - Environmental Compliance Officer',
      tanggalAkhir: '2027-01-25',
      sisaHari: 76,
      rekomendasi: 'Extend',
      statusKeputusan: 'Pending Approval',
      pic: 'HSE Manager & HRBP IIM',
    },
  ];

  const keyActivities: KeyPointActivityItem[] = [
    {
      id: 'act-1',
      no: 1,
      monthRaised: 'Nov 2026',
      actionItem: 'Finalize Manpower Planning (MPP) Budgeting for Head Office Fiscal Year 2027',
      pic: 'HRBP Lead Nusaraya HO',
      dueDate: 'Dec 15, 2026',
      status: 'In Progress',
    },
    {
      id: 'act-2',
      no: 2,
      monthRaised: 'Nov 2026',
      actionItem: 'Conduct Annual Performance Appraisal (KPI Review) Semester II for all HO entities',
      pic: 'Talent Management & OD Specialist',
      dueDate: 'Dec 20, 2026',
      status: 'In Progress',
    },
    {
      id: 'act-3',
      no: 3,
      monthRaised: 'Oct 2026',
      actionItem: 'Rollout integrated Healthcare Coverage & Statutory Insurance Policy',
      pic: 'Compensation & Benefits Lead',
      dueDate: 'Nov 10, 2026',
      status: 'Completed',
    },
    {
      id: 'act-4',
      no: 4,
      monthRaised: 'Nov 2026',
      actionItem: 'Personnel File Audit & Digital Document Archiving (e-Filing Project)',
      pic: 'HR Operations Supervisor',
      dueDate: 'Dec 28, 2026',
      status: 'Open',
    },
  ];

  return {
    workforce,
    headcountMovement,
    segregation,
    turnover,
    turnoverReasons,
    recruitment,
    criticalPositions,
    training,
    mainTrainings,
    attendance,
    departmentAttendance,
    hrIssues,
    contractExpiry,
    contractList,
    keyActivities,
  };
};

export const createInitialYearData = (): YearData => {
  const yearData: YearData = {};
  for (let m = 0; m < 12; m++) {
    yearData[m] = createInitialMonthData(m);
  }
  return yearData;
};

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 90" width="420" height="90">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:%230284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:%230369a1;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:%23f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:%23d97706;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="76" height="76" rx="16" fill="url(%23grad1)" stroke="%2338bdf8" stroke-width="2"/>
  <path d="M22 60 L22 24 L34 24 L52 48 L52 24 L60 24 L60 60 L48 60 L30 36 L30 60 Z" fill="white" font-weight="900"/>
  <circle cx="58" cy="22" r="5" fill="url(%23goldGrad)"/>
  <text x="96" y="38" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="800" font-size="24" fill="%230f172a" letter-spacing="1.5">HRBP NUSARAYA</text>
  <text x="97" y="56" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="700" font-size="12" fill="%230284c7" letter-spacing="3.2">HEAD OFFICE ONLY</text>
  <text x="97" y="72" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="600" font-size="10" fill="%23475569" letter-spacing="1">KNC · SMS · SST · SWK · PSM · IIM · SNB</text>
</svg>`;
