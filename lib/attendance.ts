export type AttendanceStatus = 'Belum Absen' | 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | 'Libur' | 'Nonaktif';
import officialLedgerData from './officialAttendanceLedger.json';

export interface VolunteerProfile {
  id: string;
  no: number;
  name: string;
  dutySection: string;
  dailyRate: number; // Sesuai Juknis BGN TA 2026
  isActive: boolean;
  defaultCheckIn: string;
  defaultCheckOut: string;
  phone?: string;
  notes?: string;
}

export interface AttendanceEntry {
  id: string; // Format: `${date}:${volunteerId}`
  volunteerId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn: string; // HH:mm
  checkOut: string; // HH:mm
  scheduledIn: string; // HH:mm
  scheduledOut: string; // HH:mm
  lateMinutes: number;
  overtimeMinutes: number;
  earnedAmount: number; // Rp
  notes: string;
  paid: boolean;
  recordedAt: string;
  recordedBy: string;
  photoUrl?: string;
  distanceMeters?: number;
  isWithinRadius?: boolean;
}

export interface DayWorkInfo {
  date: string;
  label: string; // 'Senin', 'Selasa', etc.
  formatted: string; // '19 Okt', etc.
  isWeekend: boolean;
}

export const STATUS_ORDER: AttendanceStatus[] = ['Belum Absen', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Libur', 'Nonaktif'];

export const DUTY_SECTIONS = [
  'Semua',
  'Asisten Lapangan',
  'Head Chef',
  'Persiapan',
  'Admin',
  'Pengolahan',
  'Pemorsian',
  'Packing dan Pelabelan',
  'Driver',
  'Cuci Ompreng',
  'Cleaning Service',
  'Security Pagi',
  'Security Malam',
] as const;

// 40 Personel Dapur SPPG Wonodri 3 Sesuai Struktur Matriks Resmi
export const DEFAULT_ROSTER_40: VolunteerProfile[] = [
  // 1. Asisten Lapangan (05:00 - 13:00 @ Rp 200.000)
  { id: 'v-1', no: 1, name: 'ARIEF RAHMAN HAKIM', dutySection: 'Asisten Lapangan', dailyRate: 200000, isActive: true, defaultCheckIn: '05:00', defaultCheckOut: '13:00' },

  // 2. Head Chef (21:00 - 05:00 @ Rp 200.000)
  { id: 'v-2', no: 2, name: 'RIYAN ADHI KRISTANTO', dutySection: 'Head Chef', dailyRate: 200000, isActive: true, defaultCheckIn: '21:00', defaultCheckOut: '05:00' },

  // 3 - 7 Persiapan (5 Personel: 17:00 - 01:00 @ Rp 130.000)
  { id: 'v-3', no: 3, name: 'DEWI AGUSTINA', dutySection: 'Persiapan', dailyRate: 130000, isActive: true, defaultCheckIn: '17:00', defaultCheckOut: '01:00' },
  { id: 'v-4', no: 4, name: 'RINA NUR HIDAYAH', dutySection: 'Persiapan', dailyRate: 130000, isActive: true, defaultCheckIn: '17:00', defaultCheckOut: '01:00' },
  { id: 'v-5', no: 5, name: 'ALMIRA PUTRI HAYANI', dutySection: 'Persiapan', dailyRate: 130000, isActive: true, defaultCheckIn: '17:00', defaultCheckOut: '01:00' },
  { id: 'v-6', no: 6, name: 'DEWI IKA PURNAMA', dutySection: 'Persiapan', dailyRate: 130000, isActive: true, defaultCheckIn: '17:00', defaultCheckOut: '01:00' },
  { id: 'v-7', no: 7, name: 'FENI FEBRINUNGRUM', dutySection: 'Persiapan', dailyRate: 130000, isActive: true, defaultCheckIn: '17:00', defaultCheckOut: '01:00' },

  // 8. Admin (13:00 - 21:00 @ Rp 130.000)
  { id: 'v-8', no: 8, name: 'NUR KHAFIDIN', dutySection: 'Admin', dailyRate: 130000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },

  // 9 - 14 Pengolahan (6 Personel: 02:00 - 10:00 @ Rp 140.000)
  { id: 'v-9', no: 9, name: 'ARI WIDYASARI', dutySection: 'Pengolahan', dailyRate: 140000, isActive: true, defaultCheckIn: '02:00', defaultCheckOut: '10:00' },
  { id: 'v-10', no: 10, name: 'IRA DWI SETYANINGRUM', dutySection: 'Pengolahan', dailyRate: 140000, isActive: true, defaultCheckIn: '02:00', defaultCheckOut: '10:00' },
  { id: 'v-11', no: 11, name: 'SRI WAHYUNI', dutySection: 'Pengolahan', dailyRate: 140000, isActive: false, defaultCheckIn: '02:00', defaultCheckOut: '10:00', notes: 'Non-Aktif / Resigned' },
  { id: 'v-12', no: 12, name: 'AGUS RINI INDRIANI', dutySection: 'Pengolahan', dailyRate: 140000, isActive: true, defaultCheckIn: '02:00', defaultCheckOut: '10:00' },
  { id: 'v-13', no: 13, name: 'AYU ARMAYA', dutySection: 'Pengolahan', dailyRate: 140000, isActive: true, defaultCheckIn: '02:00', defaultCheckOut: '10:00' },
  { id: 'v-14', no: 14, name: 'MUHAMMAD RASYIDALIMMATIN', dutySection: 'Pengolahan', dailyRate: 140000, isActive: true, defaultCheckIn: '02:00', defaultCheckOut: '10:00' },

  // 15 - 22 Pemorsian (8 Personel: 04:00 - 12:00 @ Rp 125.000)
  { id: 'v-15', no: 15, name: 'MARINANINGSIH', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-16', no: 16, name: 'ALIS YULIANTI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-17', no: 17, name: 'AGFANTI FATMASARI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-18', no: 18, name: 'DWI ERNAWATI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-19', no: 19, name: 'RATNA AYU CANDRA DEWI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-20', no: 20, name: 'ROBBI FIRLI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-21', no: 21, name: 'SRI HERNAWATI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },
  { id: 'v-22', no: 22, name: 'DESY ARYANI', dutySection: 'Pemorsian', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },

  // 23. Packing dan Pelabelan (04:00 - 12:00 @ Rp 125.000)
  { id: 'v-23', no: 23, name: 'MUHLISIN', dutySection: 'Packing dan Pelabelan', dailyRate: 125000, isActive: true, defaultCheckIn: '04:00', defaultCheckOut: '12:00' },

  // 24 - 27 Driver (4 Driver Armada: 06:00 - 14:00 @ Rp 125.000)
  { id: 'v-24', no: 24, name: 'HARWIYONO', dutySection: 'Driver', dailyRate: 125000, isActive: true, defaultCheckIn: '06:00', defaultCheckOut: '14:00' },
  { id: 'v-25', no: 25, name: 'MUHAMMAD TAMHID AMALI', dutySection: 'Driver', dailyRate: 125000, isActive: true, defaultCheckIn: '06:00', defaultCheckOut: '14:00' },
  { id: 'v-26', no: 26, name: 'ROCHMAT SYAMSURI', dutySection: 'Driver', dailyRate: 125000, isActive: true, defaultCheckIn: '06:00', defaultCheckOut: '14:00' },
  { id: 'v-27', no: 27, name: 'M SAEBANI', dutySection: 'Driver', dailyRate: 125000, isActive: true, defaultCheckIn: '06:00', defaultCheckOut: '14:00' },

  // 28 - 37 Cuci Ompreng (10 Personel: 13:00 - 21:00 @ Rp 125.000)
  { id: 'v-28', no: 28, name: 'ANDRI ARI KURNIASIH', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-29', no: 29, name: 'ARIAWAN PRABOWO', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-30', no: 30, name: 'YANTI PUJASARI', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-31', no: 31, name: 'TITIS HARTAWAN', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-32', no: 32, name: 'IRFANA PUTRI SETIADI', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-33', no: 33, name: 'RASETIKA WINA WIDIA PUTRI', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-34', no: 34, name: 'EKO RUMEININGSIH', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-35', no: 35, name: 'DEWI RATNASARI', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },
  { id: 'v-36', no: 36, name: 'SAIFUL IKHSAN', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: false, defaultCheckIn: '13:00', defaultCheckOut: '21:00', notes: 'Non-Aktif / Resigned' },
  { id: 'v-37', no: 37, name: 'MIFTAH RIZKY RAMADHAN', dutySection: 'Cuci Ompreng', dailyRate: 125000, isActive: true, defaultCheckIn: '13:00', defaultCheckOut: '21:00' },

  // 38. Cleaning Service (07:00 - 15:00 @ Rp 125.000)
  { id: 'v-38', no: 38, name: 'SUTIMAN', dutySection: 'Cleaning Service', dailyRate: 125000, isActive: true, defaultCheckIn: '07:00', defaultCheckOut: '15:00' },

  // 39. Security Pagi (07:00 - 19:00 @ Rp 125.000)
  { id: 'v-39', no: 39, name: 'ANDRIE ARWINANTO', dutySection: 'Security Pagi', dailyRate: 125000, isActive: true, defaultCheckIn: '07:00', defaultCheckOut: '19:00' },

  // 40. Security Malam (19:00 - 07:00 @ Rp 125.000)
  { id: 'v-40', no: 40, name: 'BAMBANG JOYO WARSO', dutySection: 'Security Malam', dailyRate: 125000, isActive: true, defaultCheckIn: '19:00', defaultCheckOut: '07:00' },
];

export const ARSIP_ATTENDANCE_ROSTER_KEY = 'sppg_arsip_attendance_roster_v3';
export const ARSIP_ATTENDANCE_LEDGER_KEY = 'sppg_arsip_attendance_ledger_v3';

export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

function minutes(value: string): number | null {
  if (!value) return null;
  const clean = value.replace(' WIB', '').trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(clean);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function calculateMinutesLate(actual: string, scheduled: string): number {
  const actualMinutes = minutes(actual);
  const scheduledMinutes = minutes(scheduled);
  if (actualMinutes === null || scheduledMinutes === null) return 0;
  return Math.max(0, actualMinutes - scheduledMinutes);
}

export function calculateOvertimeMinutes(actual: string, scheduled: string): number {
  const actualMinutes = minutes(actual);
  const scheduledMinutes = minutes(scheduled);
  if (actualMinutes === null || scheduledMinutes === null) return 0;
  return Math.max(0, actualMinutes - scheduledMinutes);
}

export function buildDailyEntries(
  roster: VolunteerProfile[],
  date: string,
  recordedBy = 'Admin SPPG'
): AttendanceEntry[] {
  const d = new Date(`${date}T12:00:00`);
  const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  return roster.map((person) => {
    let status: AttendanceStatus = 'Belum Absen';
    let notes = '';

    if (!person.isActive) {
      status = 'Nonaktif';
      notes = 'Personel Nonaktif / Resigned';
    } else if (isSunday) {
      status = 'Libur';
      notes = 'Libur Rutin';
    } else if (isSaturday) {
      status = 'Libur';
      notes = '';
    }

    const isPresent = (status as string) === 'Hadir';
    return {
      id: `${date}:${person.id}`,
      volunteerId: person.id,
      date,
      status,
      checkIn: isPresent ? person.defaultCheckIn : '',
      checkOut: isPresent ? person.defaultCheckOut : '',
      scheduledIn: person.defaultCheckIn,
      scheduledOut: person.defaultCheckOut,
      lateMinutes: 0,
      overtimeMinutes: 0,
      earnedAmount: isPresent ? person.dailyRate : 0,
      notes,
      paid: false,
      recordedAt: new Date().toISOString(),
      recordedBy,
    };
  });
}

export function normalizeAttendanceEntry(entry: AttendanceEntry, person: VolunteerProfile): AttendanceEntry {
  const isPresent = entry.status === 'Hadir' && person.isActive;
  const lateMinutes = isPresent ? calculateMinutesLate(entry.checkIn, entry.scheduledIn) : 0;
  const overtimeMinutes = isPresent ? calculateOvertimeMinutes(entry.checkOut, entry.scheduledOut) : 0;
  const earnedAmount = isPresent ? person.dailyRate : 0;

  return {
    ...entry,
    checkIn: isPresent ? entry.checkIn : '',
    checkOut: isPresent ? entry.checkOut : '',
    lateMinutes,
    overtimeMinutes,
    earnedAmount,
    paid: isPresent ? entry.paid : false,
    recordedAt: new Date().toISOString(),
  };
}

export function mergeAttendanceDay(
  existing: AttendanceEntry[],
  date: string,
  replacement: AttendanceEntry[]
): AttendanceEntry[] {
  const otherDays = existing.filter((entry) => entry.date !== date);
  const dayMap = new Map(replacement.map((e) => [e.volunteerId, e]));
  return [...otherDays, ...Array.from(dayMap.values())].sort(
    (a, b) => a.date.localeCompare(b.date) || a.volunteerId.localeCompare(b.volunteerId)
  );
}

export function calculatePeriodSummary(entries: AttendanceEntry[]) {
  const statusCounts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0])) as Record<AttendanceStatus, number>;
  let totalEarned = 0;
  let totalPaid = 0;
  let totalLateMinutes = 0;
  let totalOvertimeMinutes = 0;

  for (const entry of entries) {
    statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
    totalEarned += entry.earnedAmount;
    if (entry.paid) totalPaid += entry.earnedAmount;
    totalLateMinutes += entry.lateMinutes;
    totalOvertimeMinutes += entry.overtimeMinutes;
  }

  return {
    statusCounts,
    totalEarned,
    totalPaid,
    totalLateMinutes,
    totalOvertimeMinutes,
    totalRecords: entries.length,
  };
}

function csvCell(value: string | number | boolean): string {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function createAttendanceCsv(
  entries: AttendanceEntry[],
  roster: VolunteerProfile[],
  tenantName: string
): string {
  const byId = new Map(roster.map((person) => [person.id, person]));
  const rows = [
    ['PORTAL ARSIP OPERASIONAL SPPG', tenantName],
    ['REKAPITULASI RESMI AMPRAH INSENTIF & ABSENSI RELAWAN DAPUR BGN TA 2026'],
    ['Tanggal Generate', new Date().toLocaleString('id-ID')],
    [],
    [
      'Tanggal',
      'No',
      'Nama Lengkap',
      'Divisi / Seksi',
      'Status Kehadiran',
      'Jadwal Masuk',
      'Jam Masuk (Real)',
      'Jadwal Pulang',
      'Jam Pulang (Real)',
      'Terlambat (Menit)',
      'Lembur (Menit)',
      'Tarif Harian (Rp)',
      'Insentif Diterima (Rp)',
      'Status Pencairan BNI',
      'Catatan / Alasan',
      'Petugas Pencatat',
    ],
    ...entries.map((entry) => {
      const person = byId.get(entry.volunteerId);
      return [
        entry.date,
        person?.no ?? '-',
        person?.name ?? entry.volunteerId,
        person?.dutySection ?? '-',
        entry.status,
        entry.scheduledIn,
        entry.checkIn || '-',
        entry.scheduledOut,
        entry.checkOut || '-',
        entry.lateMinutes,
        entry.overtimeMinutes,
        person?.dailyRate ?? 0,
        entry.earnedAmount,
        entry.paid ? 'Sudah Cair (BNI)' : 'Menunggu SPJ',
        entry.notes || '-',
        entry.recordedBy,
      ];
    }),
  ];

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
}

export function toIsoDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function formatIndoDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return `${INDO_DAYS[d.getDay()]}, ${d.getDate()} ${INDO_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// 7 Hari Kalender Penuh: Senin s/d Minggu (Format Excel Resmi SPPG)
export function getWeekDays(selectedDate: string): DayWorkInfo[] {
  const selected = new Date(`${selectedDate}T12:00:00`);
  const dayOfWeek = selected.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(selected);
  monday.setDate(selected.getDate() + mondayOffset);

  const days: DayWorkInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = toIsoDateLocal(cur);
    days.push({
      date: dateStr,
      label: INDO_DAYS[cur.getDay()],
      formatted: `${cur.getDate()} ${INDO_MONTHS[cur.getMonth()]}`,
      isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
    });
  }
  return days;
}

// Clean baseline: kosongkan seluruh riwayat dummy agar data murni dari input riil operator
export function seedSampleHistory(_roster: VolunteerProfile[]): AttendanceEntry[] {
  return [];
}

// Client Storage Accessors (Safe for SSR)
export function loadRosterFromStorage(): VolunteerProfile[] {
  if (typeof window === 'undefined') return DEFAULT_ROSTER_40;
  try {
    const raw = localStorage.getItem(ARSIP_ATTENDANCE_ROSTER_KEY);
    if (!raw) return DEFAULT_ROSTER_40;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error('Failed to load roster from localStorage:', err);
  }
  return DEFAULT_ROSTER_40;
}

export function saveRosterToStorage(roster: VolunteerProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_ATTENDANCE_ROSTER_KEY, JSON.stringify(roster));
  } catch (err) {
    console.error('Failed to save roster to localStorage:', err);
  }
}

export function loadLedgerFromStorage(_roster: VolunteerProfile[]): AttendanceEntry[] {
  const baseLedger = (officialLedgerData as unknown as AttendanceEntry[]) || [];
  if (typeof window === 'undefined') return baseLedger;
  try {
    const raw = localStorage.getItem(ARSIP_ATTENDANCE_LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge user updates on top of baseLedger
        const map = new Map<string, AttendanceEntry>(baseLedger.map((e) => [e.id, e]));
        parsed.forEach((e) => map.set(e.id, e));
        return Array.from(map.values()).sort(
          (a, b) => a.date.localeCompare(b.date) || a.volunteerId.localeCompare(b.volunteerId)
        );
      }
    }
  } catch (err) {
    console.error('Failed to load attendance ledger from localStorage:', err);
  }
  return baseLedger;
}

export function saveLedgerToStorage(ledger: AttendanceEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_ATTENDANCE_LEDGER_KEY, JSON.stringify(ledger));
  } catch (err) {
    console.error('Failed to save attendance ledger to localStorage:', err);
  }
}
