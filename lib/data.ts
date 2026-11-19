export interface BeneficiarySite {
  id: string;
  name: string;
  type: 'TK' | 'SD' | 'Posyandu';
  masterCount: number;
}

export interface NutritionItem {
  groupName: string;
  targetCategory: string;
  portionBadge: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
  color: string;
  bgLight: string;
  borderAccent: string;
  recommendedPct: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
}

export interface ProcessPhoto {
  step: string;
  title: string;
  description: string;
  imageUrl: string;
  timeEstimate: string;
}

export interface DailyMenuRecord {
  date: string; // YYYY-MM-DD
  menuNumber: number;
  title: string;
  uraianPekerjaan?: string;
  menuPhotoUrl?: string; // FOTO SAJIAN MAKANAN UTAMA HARIAN
  status: 'draft' | 'review' | 'published';
  publishedAt?: string;
  components: {
    karbohidrat: string;
    laukHewani: string;
    laukNabati: string;
    sayur: string;
    buah: string;
  };
  nutritionCards: NutritionItem[];
  photos: ProcessPhoto[]; // 5 Tahap Dokumentasi Foto: Persiapan, Pengolahan, Pengemasan, Distribusi, Pencucian Ompreng
  overrides?: {
    siteId: string;
    condition: 'libur' | 'penyesuaian';
    effectiveCount: number;
    reason: string;
  }[];
}

// 13 Titik Layanan Resmi SPPG Wonodri 3 (Periode Awal 01 - 11 Okt 2026: 1.554 Porsi)
export const BENEFICIARIES_OCT_1_11: BeneficiarySite[] = [
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 349 },
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 341 },
  { id: 'sdn-lamper-lor', name: 'SDN Lamper Lor', type: 'SD', masterCount: 154 },
  { id: 'sdn-pleburan-04', name: 'SDN Pleburan 04', type: 'SD', masterCount: 150 },
  { id: 'sdn-pleburan-01', name: 'SDN Pleburan 01', type: 'SD', masterCount: 120 },
  { id: 'tk-it-sultan-agung', name: 'TK IT Sultan Agung', type: 'TK', masterCount: 100 },
  { id: 'sdn-wonodri', name: 'SDN Wonodri', type: 'SD', masterCount: 91 },
  { id: 'posyandu-erlangga', name: 'Posyandu Erlangga', type: 'Posyandu', masterCount: 74 },
  { id: 'tk-nirwana-burhan', name: 'TK Nirwana Burhan', type: 'TK', masterCount: 61 },
  { id: 'tk-kartika-iii', name: 'TK Kartika III', type: 'TK', masterCount: 43 },
  { id: 'tk-kuntum-mekar', name: 'TK Kuntum Mekar', type: 'TK', masterCount: 31 },
  { id: 'tk-siwi-peni', name: 'TK Siwi Peni', type: 'TK', masterCount: 29 },
  { id: 'tk-hapsari', name: 'TK Hapsari', type: 'TK', masterCount: 11 },
];

// 13 Titik Layanan Resmi SPPG Wonodri 3 (Periode 12 - 18 Okt 2026: 1.556 Porsi)
export const BENEFICIARIES_OCT_12_18: BeneficiarySite[] = [
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 350 },
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 341 },
  { id: 'sdn-lamper-lor', name: 'SDN Lamper Lor', type: 'SD', masterCount: 154 },
  { id: 'sdn-pleburan-04', name: 'SDN Pleburan 04', type: 'SD', masterCount: 150 },
  { id: 'sdn-pleburan-01', name: 'SDN Pleburan 01', type: 'SD', masterCount: 122 },
  { id: 'tk-it-sultan-agung', name: 'TK IT Sultan Agung', type: 'TK', masterCount: 99 },
  { id: 'sdn-wonodri', name: 'SDN Wonodri', type: 'SD', masterCount: 91 },
  { id: 'posyandu-erlangga', name: 'Posyandu Erlangga', type: 'Posyandu', masterCount: 74 },
  { id: 'tk-nirwana-burhan', name: 'TK Nirwana Burhan', type: 'TK', masterCount: 61 },
  { id: 'tk-kartika-iii', name: 'TK Kartika III', type: 'TK', masterCount: 43 },
  { id: 'tk-kuntum-mekar', name: 'TK Kuntum Mekar', type: 'TK', masterCount: 31 },
  { id: 'tk-siwi-peni', name: 'TK Siwi Peni', type: 'TK', masterCount: 29 },
  { id: 'tk-hapsari', name: 'TK Hapsari', type: 'TK', masterCount: 11 },
];

// 13 Titik Layanan Resmi SPPG Wonodri 3 (Efektif per 19 Okt 2026: 1.553 Porsi — TK Sultan Agung 98, Posyandu 72)
export const BENEFICIARIES_OCT_19_ONWARDS: BeneficiarySite[] = [
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 350 },
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 341 },
  { id: 'sdn-lamper-lor', name: 'SDN Lamper Lor', type: 'SD', masterCount: 154 },
  { id: 'sdn-pleburan-04', name: 'SDN Pleburan 04', type: 'SD', masterCount: 150 },
  { id: 'sdn-pleburan-01', name: 'SDN Pleburan 01', type: 'SD', masterCount: 122 },
  { id: 'tk-it-sultan-agung', name: 'TK IT Sultan Agung', type: 'TK', masterCount: 98 },
  { id: 'sdn-wonodri', name: 'SDN Wonodri', type: 'SD', masterCount: 91 },
  { id: 'posyandu-erlangga', name: 'Posyandu Erlangga', type: 'Posyandu', masterCount: 72 },
  { id: 'tk-nirwana-burhan', name: 'TK Nirwana Burhan', type: 'TK', masterCount: 61 },
  { id: 'tk-kartika-iii', name: 'TK Kartika III', type: 'TK', masterCount: 43 },
  { id: 'tk-kuntum-mekar', name: 'TK Kuntum Mekar', type: 'TK', masterCount: 31 },
  { id: 'tk-siwi-peni', name: 'TK Siwi Peni', type: 'TK', masterCount: 29 },
  { id: 'tk-hapsari', name: 'TK Hapsari', type: 'TK', masterCount: 11 },
];

// Helper dinamis berdasarkan tanggal laporan (01-11 Okt = 1.554, 12-18 Okt = 1.556, per 19 Okt = 1.553)
export function getBeneficiariesForDate(dateStr?: string): BeneficiarySite[] {
  if (!dateStr) return BENEFICIARIES_OCT_19_ONWARDS;
  if (dateStr < '2026-10-12') {
    return BENEFICIARIES_OCT_1_11;
  }
  if (dateStr < '2026-10-19') {
    return BENEFICIARIES_OCT_12_18;
  }
  return BENEFICIARIES_OCT_19_ONWARDS;
}

// Jumlah porsi produksi aktual. Master roster tetap utuh; ada penyesuaian produksi
// 12 porsi mulai 17 Nov 2026, sehingga BA historis memakai 1.541, bukan 1.553.
export function getProductionPortionCount(dateStr?: string, overrides: Record<string, number> = {}): number {
  const masterTotal = getEffectiveBeneficiariesForDate(dateStr, overrides).reduce((sum, site) => sum + site.masterCount, 0);
  return masterTotal + (dateStr && dateStr >= PRODUCTION_PORTION_ADJUSTMENT_FROM ? PRODUCTION_PORTION_ADJUSTMENT : 0);
}

// ===== MASTER KUOTA — bisa diedit dari halaman Operator (Alur 4) =====
// Kuota adalah data master (bukan per tanggal laporan): perubahan berlaku
// untuk periode baseline yang sedang berjalan (per 19 Okt 2026 ke depan).
// Periode lama (arsip s/d 18 Okt) TIDAK ikut berubah — baseline-nya terkunci.
// Disimpan di localStorage browser (sama seperti data app lainnya) supaya
// bisa diubah tanpa deploy ulang.
export const KUOTA_OVERRIDE_KEY = 'sppg_master_kuota_overrides_v1';
export const KUOTA_OVERRIDE_SINCE = '2026-10-19';

// Realisasi produksi makan berubah mulai 17 Nov 2026; Master Kuota tetap 1.553.
// Ini adalah jumlah porsi yang benar-benar diproduksi, bukan perubahan roster penerima.
export const PRODUCTION_PORTION_ADJUSTMENT_FROM = '2026-11-17';
export const PRODUCTION_PORTION_ADJUSTMENT = -12;

export function loadKuotaOverrides(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KUOTA_OVERRIDE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n <= 9999) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveKuotaOverrides(overrides: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KUOTA_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch {
    // storage penuh / mode privat — abaikan, kuota kembali ke baseline
  }
}

const KUOTA_CLOUD_URL = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/kuota';

// Ambil Master Kuota dari Cloudflare KV (sumber kebenaran lintas perangkat).
// Return null kalau gagal (jaringan / server) supaya pemanggil bisa fallback ke lokal.
export async function fetchKuotaOverridesFromCloud(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch(KUOTA_CLOUD_URL, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const overrides = (data as { overrides?: unknown })?.overrides;
    if (!overrides || typeof overrides !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(overrides as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n <= 9999) out[k] = n;
    }
    return out;
  } catch {
    return null;
  }
}

export async function saveKuotaOverridesToCloud(overrides: Record<string, number>): Promise<boolean> {
  try {
    const res = await fetch(KUOTA_CLOUD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides }),
    });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    return (data as { success?: boolean })?.success === true;
  } catch {
    return false;
  }
}

// Muat kuota efektif: lokal dulu (cepat), lalu cloud (benar lintas perangkat).
// - Cloud ada isi -> pakai cloud, simpan juga ke lokal sebagai cache.
// - Cloud kosong + lokal ada isi -> dorong lokal ke cloud (migrasi sekali jalan).
// - Cloud gagal -> pakai lokal.
export async function loadEffectiveKuotaOverrides(): Promise<Record<string, number>> {
  const local = loadKuotaOverrides();
  const cloud = await fetchKuotaOverridesFromCloud();
  if (cloud === null) return local;
  if (Object.keys(cloud).length > 0) {
    if (JSON.stringify(cloud) !== JSON.stringify(local)) saveKuotaOverrides(cloud);
    return cloud;
  }
  if (Object.keys(local).length > 0) {
    void saveKuotaOverridesToCloud(local);
  }
  return local;
}

// Baseline efektif: baseline per tanggal + override kuota (hanya periode berjalan)
export function getEffectiveBeneficiariesForDate(
  dateStr?: string,
  overrides: Record<string, number> = {},
): BeneficiarySite[] {
  const base = getBeneficiariesForDate(dateStr);
  if (dateStr && dateStr < KUOTA_OVERRIDE_SINCE) return base;
  if (!overrides || Object.keys(overrides).length === 0) return base;
  return base.map((site) => {
    const v = overrides[site.id];
    return v === undefined ? site : { ...site, masterCount: v };
  });
}

// Default export untuk backward-compatibility
export const INITIAL_BENEFICIARIES: BeneficiarySite[] = BENEFICIARIES_OCT_19_ONWARDS;

// Standar Acuan Gizi Nasional BGN untuk 5 Kategori Porsi
export const STANDARD_AKG_REFERENCE: NutritionItem[] = [
  {
    groupName: 'Besar',
    targetCategory: 'SD Kelas 4–6 / SMP / SMA / Guru / Tendik',
    portionBadge: 'Porsi Remaja & Dewasa',
    energyKcal: 572.4,
    proteinG: 15.5,
    fatG: 14.5,
    carbsG: 83.9,
    fiberG: 2.4,
    color: '#2563eb',
    bgLight: '#eff6ff',
    borderAccent: '#3b82f6',
    recommendedPct: { protein: 25, fat: 23, carbs: 65, fiber: 20 },
  },
  {
    groupName: 'Kecil',
    targetCategory: 'PAUD / TK / SD Kelas 1–3',
    portionBadge: 'Porsi Anak Usia Dini',
    energyKcal: 462.9,
    proteinG: 13.6,
    fatG: 14.4,
    carbsG: 81.7,
    fiberG: 2.4,
    color: '#059669',
    bgLight: '#ecfdf5',
    borderAccent: '#10b981',
    recommendedPct: { protein: 22, fat: 24, carbs: 60, fiber: 18 },
  },
  {
    groupName: 'Balita',
    targetCategory: 'Anak Usia 6 – 60 Bulan (MPASI & Tambahan)',
    portionBadge: 'Porsi Lunak & Nutrisi Mikro',
    energyKcal: 426.9,
    proteinG: 13.0,
    fatG: 14.3,
    carbsG: 51.7,
    fiberG: 2.0,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderAccent: '#f59e0b',
    recommendedPct: { protein: 20, fat: 25, carbs: 45, fiber: 15 },
  },
  {
    groupName: 'Busui',
    targetCategory: 'Ibu Menyusui (Masa Laktasi)',
    portionBadge: 'Padat Energi & Cairan',
    energyKcal: 572.4,
    proteinG: 15.5,
    fatG: 14.5,
    carbsG: 83.9,
    fiberG: 2.4,
    color: '#e11d48',
    bgLight: '#fff1f2',
    borderAccent: '#f43f5e',
    recommendedPct: { protein: 26, fat: 22, carbs: 64, fiber: 22 },
  },
  {
    groupName: 'Bumil',
    targetCategory: 'Ibu Hamil (Trimester 1, 2, & 3)',
    portionBadge: 'Asam Folat & Zat Besi Tinggi',
    energyKcal: 572.4,
    proteinG: 15.5,
    fatG: 14.5,
    carbsG: 83.9,
    fiberG: 2.4,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    borderAccent: '#8b5cf6',
    recommendedPct: { protein: 26, fat: 22, carbs: 64, fiber: 22 },
  },
];

// Database Menu Awal Bersih
export const INITIAL_MENU_HISTORY: DailyMenuRecord[] = [];
