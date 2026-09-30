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
  status: 'draft' | 'review' | 'published';
  publishedAt?: string;
  components: {
    karbohidrat: string;
    laukHewani: string;
    laukNabati: string;
    sayur: string;
    buah: string;
    pelengkap: string;
  };
  nutritionCards: NutritionItem[];
  photos: ProcessPhoto[];
  overrides?: {
    siteId: string;
    condition: 'libur' | 'penyesuaian';
    effectiveCount: number;
    reason: string;
  }[];
}

// 13 Titik Layanan Resmi SPPG Wonodri 3 (Total: 1.555 Penerima Manfaat)
export const INITIAL_BENEFICIARIES: BeneficiarySite[] = [
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 349 },
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 342 },
  { id: 'sdn-lamper-lor', name: 'SDN Lamper Lor', type: 'SD', masterCount: 154 },
  { id: 'sdn-pleburan-b', name: 'SDN Pleburan B', type: 'SD', masterCount: 150 },
  { id: 'sdn-pleburan-a', name: 'SDN Pleburan A', type: 'SD', masterCount: 120 },
  { id: 'tk-it-sultan-agung', name: 'TK IT Sultan Agung', type: 'TK', masterCount: 100 },
  { id: 'sdn-wonodri', name: 'SDN Wonodri', type: 'SD', masterCount: 91 },
  { id: 'posyandu-erlangga', name: 'Posyandu Erlangga', type: 'Posyandu', masterCount: 74 },
  { id: 'tk-nirwana-burhan', name: 'TK Nirwana Burhan', type: 'TK', masterCount: 61 },
  { id: 'tk-kartika-iii', name: 'TK Kartika III', type: 'TK', masterCount: 43 },
  { id: 'tk-kuntum-mekar', name: 'TK Kuntum Mekar', type: 'TK', masterCount: 31 },
  { id: 'tk-siwi-peni', name: 'TK Siwi Peni', type: 'TK', masterCount: 29 },
  { id: 'tk-hapsari', name: 'TK Hapsari', type: 'TK', masterCount: 11 },
];

// Standar Acuan Gizi Nasional BGN untuk 5 Kategori Porsi (Selalu aktif sebagai referensi)
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
    color: '#2563eb', // Royal Blue
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
    color: '#059669', // Emerald Green
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
    color: '#d97706', // Warm Amber
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
    color: '#e11d48', // Rose Pink
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
    color: '#7c3aed', // Purple Violet
    bgLight: '#f5f3ff',
    borderAccent: '#8b5cf6',
    recommendedPct: { protein: 26, fat: 22, carbs: 64, fiber: 22 },
  },
];

// Riwayat Menu Mulai 01 Oktober 2026 (Siap diisi operator)
export const INITIAL_MENU_HISTORY: DailyMenuRecord[] = [
  {
    date: '2026-10-01',
    menuNumber: 1,
    title: 'Nasi Pandan Wangi, Semur Ayam Suwir, Tahu Bacem Tradisional, Sayur Bening Jagung Manis, Pisang Cavendish, & Susu UHT',
    status: 'published',
    publishedAt: '01 Okt 2026 • 08:30 WIB',
    components: {
      karbohidrat: 'Nasi Putih Beras Pandan Wangi',
      laukHewani: 'Ayam Ungkep Semur Kecap Gurih',
      laukNabati: 'Tahu Bacem Tradisional',
      sayur: 'Sayur Bening Jagung Manis & Bayam',
      buah: 'Pisang Cavendish Matang Alami',
      pelengkap: 'Susu Pasteurisasi Segar BGN',
    },
    nutritionCards: STANDARD_AKG_REFERENCE,
    photos: [
      {
        step: 'Persiapan',
        title: 'Sortasi Bahan Baku Higienis',
        description: 'Pembersihan sayuran segar dengan air mengalir dan sterilisasi peralatan dapur stainless steel.',
        imageUrl: '/about-kitchen.jpg',
        timeEstimate: '04:00 - 05:30 WIB',
      },
      {
        step: 'Pengolahan',
        title: 'Pemasakan Suhu Terukur (>85°C)',
        description: 'Pengolahan lauk ayam semur dan tahu bacem dengan suhu terjaga untuk memastikan kematangan merata.',
        imageUrl: '/hero-kitchen.jpg',
        timeEstimate: '05:30 - 07:15 WIB',
      },
      {
        step: 'Pengemasan',
        title: 'Food Plating & Segel Thermal Box',
        description: 'Penataan porsi termonitor gramasi timbangan dan segel kotak makanan hangat siap didistribusikan.',
        imageUrl: '/gallery-1.jpg',
        timeEstimate: '07:15 - 08:30 WIB',
      },
    ],
    overrides: [],
  },
];
