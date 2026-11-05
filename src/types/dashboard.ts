export type EntityId = string;

export interface EntityConfig {
  id: string;
  name: string;      // Entity code / abbreviation (e.g. 'KNC')
  fullName: string;  // Full company name (e.g. 'PT Kaltim Nusantara Coal')
  color: string;     // Color for charts & badges
  badgeColor?: string;
}

export const DEFAULT_ENTITIES: EntityConfig[] = [
  { id: 'KNC', name: 'KNC', fullName: 'PT Kaltim Nusantara Coal', color: '#2563eb', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'SMS', name: 'SMS', fullName: 'PT Sembada Makmur Sejahtera', color: '#059669', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'SST', name: 'SST', fullName: 'PT Sembada Sarana Transportasi', color: '#d97706', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'SWK', name: 'SWK', fullName: 'PT Sembada Wahau Perkasa', color: '#7c3aed', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'PSM', name: 'PSM', fullName: 'PT Persada Sukses Makmur', color: '#db2777', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'IIM', name: 'IIM', fullName: 'PT Ithaca Infrastructure Mandiri', color: '#0891b2', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'SNB', name: 'SNB', fullName: 'PT Selaju Nusantara Bersama', color: '#ea580c', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
];

export const ENTITY_LIST: EntityId[] = DEFAULT_ENTITIES.map((e) => e.name);

export const ENTITY_METADATA: Record<string, { name: string; fullName: string; color: string; badgeColor: string }> = {
  KNC: { name: 'KNC', fullName: 'PT Kaltim Nusantara Coal', color: '#2563eb', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  SMS: { name: 'SMS', fullName: 'PT Sembada Makmur Sejahtera', color: '#059669', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SST: { name: 'SST', fullName: 'PT Sembada Sarana Transportasi', color: '#d97706', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  SWK: { name: 'SWK', fullName: 'PT Sembada Wahau Perkasa', color: '#7c3aed', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  PSM: { name: 'PSM', fullName: 'PT Persada Sukses Makmur', color: '#db2777', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
  IIM: { name: 'IIM', fullName: 'PT Ithaca Infrastructure Mandiri', color: '#0891b2', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  SNB: { name: 'SNB', fullName: 'PT Selaju Nusantara Bersama', color: '#ea580c', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Section 1: Workforce Overview
export interface WorkforceOverviewEntity {
  totalBulanLalu: number; // Previous Month Total
  totalBulanIni: number;  // Current Month Total
  tetapBulanLalu: number; // Permanent Prev
  tetapBulanIni: number;  // Permanent Current
  kontrakBulanLalu: number; // Contract Prev
  kontrakBulanIni: number;  // Contract Current
  posisiKosongBulanLalu: number; // Vacancies Prev
  posisiKosongBulanIni: number;  // Vacancies Current
}

// Section 1.A: Headcount Movement
export interface HeadcountMovementEntity {
  awalBulan: number;      // Beginning of month
  masuk: number;          // New hires (+)
  keluar: number;         // Exits (-)
  mutasiInternal: number; // Internal transfers (+/-)
  catatan: string;        // Remarks / primary cause
}

// Section 1.B: Employee Segregation by Grade
export interface SegregationEntity {
  nonStaff: number;       // Grade 1-2 (Non-Staff)
  staff: number;          // Grade 3-4 (Staff & Officers)
  managerial: number;     // Grade 5<= (Managerial & Executives)
}

// Section 2: Turnover & Retention
export interface TurnoverEntity {
  keluarBulanBerjalan: number;
  keluarBulanSebelumnya: number;
  keluarTahunBerjalan: number; // YTD
  catatanKeluar?: string;
  sukarelaBulanBerjalan: number; // Voluntary
  sukarelaBulanSebelumnya: number;
  sukarelaTahunBerjalan: number;
  catatanSukarela?: string;
  nonSukarelaBulanBerjalan: number; // Involuntary / End of Contract
  nonSukarelaBulanSebelumnya: number;
  nonSukarelaTahunBerjalan: number;
  catatanNonSukarela?: string;
  turnoverRateBulanBerjalan: number; // %
  turnoverRateBulanSebelumnya: number;
  turnoverRateTahunBerjalan: number;
  catatanDefinisi?: string;
}

// Section 2.A: Turnover Reason Analysis
export interface TurnoverReasonItem {
  id: string;
  kategori: string;
  jumlah: number;
  tren: 'Increasing' | 'Decreasing' | 'Stable' | 'Naik' | 'Turun' | 'Tetap';
  komentar: string;
}

// Section 3: Recruitment & Manpower Fulfillment
export interface RecruitmentEntity {
  erfBulanBerjalan: number;
  erfTarget: number;
  erfTahunBerjalan: number;
  erfKeterangan?: string;
  terisiBulanBerjalan: number;
  terisiTarget: number;
  terisiTahunBerjalan: number;
  terisiKeterangan?: string;
  prosesBulanBerjalan: number;
  prosesTarget: number;
  prosesTahunBerjalan: number;
  prosesKeterangan?: string;
  rateBulanBerjalan: number; // %
  rateTarget: number;
  rateTahunBerjalan: number;
  rateKeterangan?: string;
}

// Section 3.A: Critical Open Positions
export interface CriticalPositionItem {
  id: string;
  posisi: string;
  entitas: string;
  prioritas: 'High' | 'Medium' | 'Low' | 'Tinggi' | 'Sedang' | 'Rendah';
  tahapSaatIni: string;
  targetBergabung: string;
  kendala: string;
}

// Section 4: Learning & Development
export interface TrainingEntity {
  sesiBulanBerjalan: number;
  sesiTarget: number;
  sesiTahunBerjalan: number;
  sesiKeterangan?: string;
  pesertaBulanBerjalan: number;
  pesertaTarget: number;
  pesertaTahunBerjalan: number;
  pesertaKeterangan?: string;
  jamBulanBerjalan: number;
  jamTarget: number;
  jamTahunBerjalan: number;
  jamKeterangan?: string;
  realisasiRateBulanBerjalan: number;
  realisasiRateTarget: number;
  realisasiRateTahunBerjalan: number;
  realisasiKeterangan?: string;
  wajibRateBulanBerjalan: number;
  wajibRateTarget: number;
  wajibRateTahunBerjalan: number;
  wajibKeterangan?: string;
}

// Section 4.A: Main Training & Certifications
export interface MainTrainingItem {
  id: string;
  pelatihan: string;
  kelompokSasaran: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Postponed' | 'Selesai' | 'Dalam Proses' | 'Terjadwal' | 'Tertunda';
  batasWaktu: string;
  pic: string;
}

// Section 5: Attendance, Punctuality & Department Breakdown
export interface DepartmentAttendance {
  id: string;
  department: string;
  totalStaff: number;
  onTimeRate: number;      // % on time
  lateRate: number;        // % late arrival
  leaveAbsentRate: number; // % leave or absent
  avgLateMinutes: number;  // average late in minutes
  entity: string;
}

export interface AttendanceEntitySummary {
  presenceRate: number; // Overall presence %
  onTimeRate: number;   // On-time %
  lateRate: number;     // Late %
  leaveRate: number;    // Leave / Absent %
  avgWorkDays: number;  // Working days in month
  notes?: string;
}

// Section 6: HR Strategic Issues & Mitigation Action Plans
export interface HRIssueItem {
  id: string;
  no: number;
  isu: string;
  dampak: string;
  tindakan: string;
  pic: string;
  batasWaktu: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Terbuka' | 'Proses' | 'Selesai';
}

// Section 7: Contract Expiry Monitoring
export interface ContractPeriodSummary {
  jumlahKontrak: number;
  keputusanTertunda: number;
  keputusanSelesai: number;
  keterangan: string;
}

export interface ContractExpiryEntity {
  h30: ContractPeriodSummary;
  h60: ContractPeriodSummary;
  h90: ContractPeriodSummary;
}

// Section 7.A: Individual Contract Tracking
export interface ContractEmployeeItem {
  id: string;
  nama: string;
  entitasJabatan: string;
  tanggalAkhir: string;
  sisaHari: number;
  rekomendasi: 'Extend' | 'Permanent Convert' | 'End Contract' | 'Perpanjang' | 'Alih Status' | 'Akhiri';
  statusKeputusan: 'Pending Approval' | 'Approved' | 'Menunggu' | 'Disetujui';
  pic: string;
}

// Section 8: Key Point Strategic Activities
export interface KeyPointActivityItem {
  id: string;
  no: number;
  monthRaised: string;
  actionItem: string;
  pic: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Pending';
}

// Full monthly dataset
export interface MonthReportData {
  workforce: Record<string, WorkforceOverviewEntity>;
  headcountMovement: Record<string, HeadcountMovementEntity>;
  segregation: Record<string, SegregationEntity>;
  turnover: Record<string, TurnoverEntity>;
  turnoverReasons: TurnoverReasonItem[];
  recruitment: Record<string, RecruitmentEntity>;
  criticalPositions: CriticalPositionItem[];
  training: Record<string, TrainingEntity>;
  mainTrainings: MainTrainingItem[];
  attendance: Record<string, AttendanceEntitySummary>;
  departmentAttendance: DepartmentAttendance[];
  hrIssues: HRIssueItem[];
  contractExpiry: Record<string, ContractExpiryEntity>;
  contractList: ContractEmployeeItem[];
  keyActivities: KeyPointActivityItem[];
}

export type YearData = Record<number, MonthReportData>; // month index 0 to 11

export interface AppState {
  years: number[];
  activeYear: number;
  activeMonth: number; // 0-11
  activeEntity: 'ALL' | string;
  entities: EntityConfig[]; // User-editable list of entities
  logoUrl: string | null;
  savedAt: string | null;
  updatedAt?: string;
  data: Record<number, YearData>; // year -> YearData
}
