export interface BeneficiarySite {
  id: string;
  name: string;
  type: 'TK' | 'SD' | 'Posyandu';
  masterCount: number;
}

export interface NutritionItem {
  groupName: string;
  targetCategory: string;
  portionBadge?: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
}

export interface ProcessPhoto {
  step: 'persiapan' | 'pengolahan' | 'pengemasan';
  title: string;
  description: string;
  imageUrl: string;
  timeEstimate?: string;
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
    pelengkap?: string;
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

export const INITIAL_BENEFICIARIES: BeneficiarySite[] = [
  { id: 'sdn-pleburan-03', name: 'SDN Pleburan 03', type: 'SD', masterCount: 342 },
  { id: 'sd-it-al-firdaus', name: 'SD IT Al Firdaus', type: 'SD', masterCount: 349 },
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

export const INITIAL_MENU_HISTORY: DailyMenuRecord[] = [
  {
    date: '2026-09-29',
    menuNumber: 76,
    title: 'Nasi Pandan Wangi, Ayam Semur Kecap, Tahu Bacem, Tumis Buncis Jagung Manis, Pisang Cavendish, & Susu UHT',
    status: 'published',
    publishedAt: '2026-09-29 08:45 WIB',
    components: {
      karbohidrat: 'Nasi Putih Beras Pandan Wangi',
      laukHewani: 'Ayam Ungkep Semur Kecap Gurih',
      laukNabati: 'Tahu Bacem Tradisional',
      sayur: 'Tumis Buncis & Pipil Jagung Manis',
      buah: 'Pisang Cavendish Matang Alami',
      pelengkap: 'Susu Pasteurisasi / UHT Segar',
    },
    nutritionCards: [
      {
        groupName: 'Besar',
        targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK',
        portionBadge: 'Porsi Standar Remaja & Dewasa',
        energyKcal: 572.36,
        proteinG: 15.46,
        fatG: 14.54,
        carbsG: 83.87,
        fiberG: 2.42,
      },
      {
        groupName: 'Kecil',
        targetCategory: 'PAUD / TK / SD 1-3',
        portionBadge: 'Porsi Anak Usia Dini',
        energyKcal: 462.86,
        proteinG: 13.63,
        fatG: 14.36,
        carbsG: 81.67,
        fiberG: 2.42,
      },
      {
        groupName: 'Balita',
        targetCategory: '6 - 60 Bulan (MPASI & Tambahan)',
        portionBadge: 'Porsi Lunak & Nutrisi Mikro',
        energyKcal: 426.86,
        proteinG: 13.03,
        fatG: 14.30,
        carbsG: 51.70,
        fiberG: 1.95,
      },
      {
        groupName: 'Busui',
        targetCategory: 'Ibu Menyusui Masa Laktasi',
        portionBadge: 'Porsi Padat Energi & Cairan',
        energyKcal: 572.36,
        proteinG: 15.46,
        fatG: 14.46,
        carbsG: 83.87,
        fiberG: 2.42,
      },
      {
        groupName: 'Bumil',
        targetCategory: 'Ibu Hamil Trimester 1-3',
        portionBadge: 'Porsi Asam Folat & Zat Besi',
        energyKcal: 572.36,
        proteinG: 15.46,
        fatG: 14.46,
        carbsG: 83.87,
        fiberG: 2.42,
      },
    ],
    photos: [
      {
        step: 'persiapan',
        title: 'Sortasi Bahan Baku & Higienitas Sayur',
        description: 'Pencucian bahan sayuran buncis dengan air mengalir dan sterilisasi pisau serta talenan stainless steel.',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '04:00 - 05:30 WIB',
      },
      {
        step: 'pengolahan',
        title: 'Pengolahan Lauk Ayam Semur & Bacem',
        description: 'Proses memasak bertekanan dengan suhu di atas 85°C memastikan kematangan merata dan keamanan mikrobiologis.',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '05:30 - 07:15 WIB',
      },
      {
        step: 'pengemasan',
        title: 'Food Plating & Seal Wadah Steril',
        description: 'Penataan porsi termonitor timbangan gramasi dan segel thermal box higienis siap berangkat ke armada distribusi.',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '07:15 - 08:30 WIB',
      },
    ],
    overrides: [],
  },
  {
    date: '2026-09-28',
    menuNumber: 75,
    title: 'Nasi Pulen, Rolade Daging Sapi Saus Tiram, Tempe Orek Manis, Sup Sayur Bening Wortel Bakso, Jeruk Manis, & Susu',
    status: 'published',
    publishedAt: '2026-09-28 08:40 WIB',
    components: {
      karbohidrat: 'Nasi Putih Pulen Wangi',
      laukHewani: 'Rolade Daging Sapi Saus Tiram',
      laukNabati: 'Tempe Orek Kering Manis Gurih',
      sayur: 'Sup Sayur Bening Wortel & Irisan Bakso',
      buah: 'Jeruk Manis Segar',
      pelengkap: 'Susu UHT Segar',
    },
    nutritionCards: [
      {
        groupName: 'Besar',
        targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK',
        portionBadge: 'Porsi Standar Remaja & Dewasa',
        energyKcal: 565.10,
        proteinG: 16.20,
        fatG: 14.10,
        carbsG: 82.50,
        fiberG: 2.30,
      },
      {
        groupName: 'Kecil',
        targetCategory: 'PAUD / TK / SD 1-3',
        portionBadge: 'Porsi Anak Usia Dini',
        energyKcal: 458.00,
        proteinG: 13.80,
        fatG: 13.90,
        carbsG: 79.40,
        fiberG: 2.30,
      },
      {
        groupName: 'Balita',
        targetCategory: '6 - 60 Bulan (MPASI & Tambahan)',
        portionBadge: 'Porsi Lunak & Nutrisi Mikro',
        energyKcal: 420.50,
        proteinG: 12.80,
        fatG: 13.50,
        carbsG: 50.10,
        fiberG: 1.80,
      },
      {
        groupName: 'Busui',
        targetCategory: 'Ibu Menyusui Masa Laktasi',
        portionBadge: 'Porsi Padat Energi & Cairan',
        energyKcal: 565.10,
        proteinG: 16.20,
        fatG: 14.10,
        carbsG: 82.50,
        fiberG: 2.30,
      },
      {
        groupName: 'Bumil',
        targetCategory: 'Ibu Hamil Trimester 1-3',
        portionBadge: 'Porsi Asam Folat & Zat Besi',
        energyKcal: 565.10,
        proteinG: 16.20,
        fatG: 14.10,
        carbsG: 82.50,
        fiberG: 2.30,
      },
    ],
    photos: [
      {
        step: 'persiapan',
        title: 'Pemotongan Rolade & Bahan Sup',
        description: 'Persiapan sayur wortel, daun seledri, dan pemotongan higienis rolade daging sapi.',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '04:15 - 05:30 WIB',
      },
      {
        step: 'pengolahan',
        title: 'Pemasakan Kaldu Sup Bening & Tumis Saus',
        description: 'Pembuatan kaldu gurih alami tanpa bahan pengawet.',
        imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '05:30 - 07:00 WIB',
      },
      {
        step: 'pengemasan',
        title: 'Pengemasan Tray & Box Khusus Sekolah',
        description: 'Pengecekan segel makanan hangat dan pelabelan kelompok penerima.',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        timeEstimate: '07:00 - 08:20 WIB',
      },
    ],
    overrides: [],
  },
];
