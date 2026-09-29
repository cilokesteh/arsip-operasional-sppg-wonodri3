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
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 572.36, proteinG: 15.46, fatG: 14.54, carbsG: 83.87, fiberG: 2.42 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 462.86, proteinG: 13.63, fatG: 14.36, carbsG: 81.67, fiberG: 2.42 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan (MPASI & Tambahan)', portionBadge: 'Porsi Lunak', energyKcal: 426.86, proteinG: 13.03, fatG: 14.30, carbsG: 51.70, fiberG: 1.95 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui Masa Laktasi', portionBadge: 'Porsi Padat Energi & Cairan', energyKcal: 572.36, proteinG: 15.46, fatG: 14.46, carbsG: 83.87, fiberG: 2.42 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil Trimester 1-3', portionBadge: 'Porsi Asam Folat & Zat Besi', energyKcal: 572.36, proteinG: 15.46, fatG: 14.46, carbsG: 83.87, fiberG: 2.42 },
    ],
    photos: [
      { step: 'persiapan', title: 'Sortasi Bahan Baku & Higienitas Sayur', description: 'Pencucian bahan sayuran buncis dengan air mengalir dan sterilisasi pisau serta talenan stainless steel.', imageUrl: '/about-kitchen.jpg', timeEstimate: '04:00 - 05:30 WIB' },
      { step: 'pengolahan', title: 'Pengolahan Lauk Ayam Semur & Bacem', description: 'Proses memasak bertekanan dengan suhu di atas 85°C memastikan kematangan merata dan keamanan mikrobiologis.', imageUrl: '/hero-kitchen.jpg', timeEstimate: '05:30 - 07:15 WIB' },
      { step: 'pengemasan', title: 'Food Plating & Seal Wadah Steril', description: 'Penataan porsi termonitor timbangan gramasi dan segel thermal box higienis siap berangkat ke armada distribusi.', imageUrl: '/gallery-1.jpg', timeEstimate: '07:15 - 08:30 WIB' },
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
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 565.10, proteinG: 16.20, fatG: 14.10, carbsG: 82.50, fiberG: 2.30 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 458.00, proteinG: 13.80, fatG: 13.90, carbsG: 79.40, fiberG: 2.30 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan (MPASI & Tambahan)', portionBadge: 'Porsi Lunak', energyKcal: 420.50, proteinG: 12.80, fatG: 13.50, carbsG: 50.10, fiberG: 1.80 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui Masa Laktasi', portionBadge: 'Porsi Padat Energi & Cairan', energyKcal: 565.10, proteinG: 16.20, fatG: 14.10, carbsG: 82.50, fiberG: 2.30 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil Trimester 1-3', portionBadge: 'Porsi Asam Folat & Zat Besi', energyKcal: 565.10, proteinG: 16.20, fatG: 14.10, carbsG: 82.50, fiberG: 2.30 },
    ],
    photos: [
      { step: 'persiapan', title: 'Pemotongan Rolade & Bahan Sup', description: 'Persiapan sayur wortel, daun seledri, dan pemotongan higienis rolade daging sapi.', imageUrl: '/gallery-2.jpg', timeEstimate: '04:15 - 05:30 WIB' },
      { step: 'pengolahan', title: 'Pemasakan Kaldu Sup Bening & Tumis Saus', description: 'Pembuatan kaldu gurih alami tanpa bahan pengawet.', imageUrl: '/gallery-3.jpg', timeEstimate: '05:30 - 07:00 WIB' },
      { step: 'pengemasan', title: 'Pengemasan Tray & Box Khusus Sekolah', description: 'Pengecekan segel makanan hangat dan pelabelan kelompok penerima.', imageUrl: '/gallery-4.jpg', timeEstimate: '07:00 - 08:20 WIB' },
    ],
    overrides: [],
  },
  {
    date: '2026-09-25',
    menuNumber: 74,
    title: 'Nasi Liwet Gurih, Ayam Goreng Lengkuas, Sambal Goreng Labu Siam Tahu, Semangka Merah, & Susu',
    status: 'published',
    publishedAt: '2026-09-25 08:35 WIB',
    components: {
      karbohidrat: 'Nasi Liwet Aromatik',
      laukHewani: 'Ayam Ungkep Goreng Lengkuas',
      laukNabati: 'Tahu Bumbu Sambal Goreng',
      sayur: 'Sayur Labu Siam Kuah Santan Tipis',
      buah: 'Semangka Merah Segar',
      pelengkap: 'Susu Pasteurisasi',
    },
    nutritionCards: [
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 580.40, proteinG: 17.10, fatG: 15.20, carbsG: 84.10, fiberG: 2.60 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 470.20, proteinG: 14.50, fatG: 14.10, carbsG: 80.20, fiberG: 2.50 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 430.00, proteinG: 13.20, fatG: 13.90, carbsG: 52.00, fiberG: 2.10 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 580.40, proteinG: 17.10, fatG: 15.20, carbsG: 84.10, fiberG: 2.60 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 580.40, proteinG: 17.10, fatG: 15.20, carbsG: 84.10, fiberG: 2.60 },
    ],
    photos: [
      { step: 'persiapan', title: 'Marinasi Ayam & Potong Sayur', description: 'Ungkep ayam bumbu lengkuas segar.', imageUrl: '/gallery-5.jpg', timeEstimate: '04:00 - 05:15 WIB' },
      { step: 'pengolahan', title: 'Penggorengan & Penanakan Nasi Liwet', description: 'Nasi liwet tanak sempurna dengan daun salam dan serai.', imageUrl: '/hero-kitchen.jpg', timeEstimate: '05:15 - 07:00 WIB' },
      { step: 'pengemasan', title: 'Pengepakan Box Bersegel', description: 'Wadah food grade siap didistribusikan.', imageUrl: '/gallery-6.jpg', timeEstimate: '07:00 - 08:15 WIB' },
    ],
    overrides: [],
  },
  {
    date: '2026-09-24',
    menuNumber: 73,
    title: 'Nasi Putih, Daging Sapi Lada Hitam, Tempe Mendoan Panggang, Capcay Bakso Kuah, Melon Segar, & Susu',
    status: 'published',
    publishedAt: '2026-09-24 08:40 WIB',
    components: {
      karbohidrat: 'Nasi Putih Pulen',
      laukHewani: 'Daging Sapi Empuk Saus Lada Hitam',
      laukNabati: 'Tempe Mendoan Panggang Minim Minyak',
      sayur: 'Capcay Kuah Wortel, Kembang Kol, & Bakso',
      buah: 'Melon Hijau Manis',
      pelengkap: 'Susu UHT Segar',
    },
    nutritionCards: [
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 568.90, proteinG: 18.00, fatG: 13.90, carbsG: 81.30, fiberG: 2.50 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 465.10, proteinG: 14.80, fatG: 13.20, carbsG: 78.50, fiberG: 2.40 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 425.60, proteinG: 13.50, fatG: 13.00, carbsG: 51.20, fiberG: 2.00 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 568.90, proteinG: 18.00, fatG: 13.90, carbsG: 81.30, fiberG: 2.50 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 568.90, proteinG: 18.00, fatG: 13.90, carbsG: 81.30, fiberG: 2.50 },
    ],
    photos: [
      { step: 'persiapan', title: 'Sortasi Sayur Capcay', description: 'Pencucian kembang kol dan wortel segar.', imageUrl: '/about-kitchen.jpg', timeEstimate: '04:15 - 05:30 WIB' },
      { step: 'pengolahan', title: 'Tumis Capcay & Daging Lada Hitam', description: 'Pemasakan higienis pada suhu terukur.', imageUrl: '/hero-kitchen.jpg', timeEstimate: '05:30 - 07:10 WIB' },
      { step: 'pengemasan', title: 'Penataan Porsi Sesuai Kategori', description: 'Pemeriksaan bobot gramasi porsi.', imageUrl: '/gallery-1.jpg', timeEstimate: '07:10 - 08:25 WIB' },
    ],
    overrides: [],
  },
  {
    date: '2026-09-23',
    menuNumber: 72,
    title: 'Nasi Kuning Gurih, Telur Balado Suwir, Orek Tempe Kering, Sayur Buncis Wortel, Jeruk Manis, & Susu',
    status: 'published',
    publishedAt: '2026-09-23 08:30 WIB',
    components: {
      karbohidrat: 'Nasi Kuning Santan Encer',
      laukHewani: 'Telur Ayam Balado Lembut',
      laukNabati: 'Orek Tempe Kering Manis',
      sayur: 'Tumis Buncis & Irisan Wortel',
      buah: 'Jeruk Manis Lokal',
      pelengkap: 'Susu Pasteurisasi',
    },
    nutritionCards: [
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 558.00, proteinG: 15.10, fatG: 14.80, carbsG: 82.00, fiberG: 2.20 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 450.50, proteinG: 13.00, fatG: 13.80, carbsG: 77.90, fiberG: 2.10 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 418.00, proteinG: 12.50, fatG: 13.20, carbsG: 50.00, fiberG: 1.80 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 558.00, proteinG: 15.10, fatG: 14.80, carbsG: 82.00, fiberG: 2.20 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 558.00, proteinG: 15.10, fatG: 14.80, carbsG: 82.00, fiberG: 2.20 },
    ],
    photos: [
      { step: 'persiapan', title: 'Kupas Telur & Bumbu Halus', description: 'Persiapan bumbu kuning alami kunyit.', imageUrl: '/gallery-2.jpg', timeEstimate: '04:00 - 05:20 WIB' },
      { step: 'pengolahan', title: 'Pemasakan Telur Balado & Sayur', description: 'Proses masak higienis tanpa MSG berlebih.', imageUrl: '/gallery-3.jpg', timeEstimate: '05:20 - 07:00 WIB' },
      { step: 'pengemasan', title: 'Pengecekan Suhu Sebelum Distribusi', description: 'Suhu makanan di atas 60°C saat penyegelan.', imageUrl: '/gallery-4.jpg', timeEstimate: '07:00 - 08:20 WIB' },
    ],
    overrides: [],
  },
  {
    date: '2026-09-22',
    menuNumber: 71,
    title: 'Nasi Putih, Ikan Fillet Asam Manis, Tahu Goreng Kremes, Sayur Bening Bayam Jagung, Pisang, & Susu',
    status: 'published',
    publishedAt: '2026-09-22 08:45 WIB',
    components: {
      karbohidrat: 'Nasi Putih Beras Pulen',
      laukHewani: 'Ikan Kakap Fillet Tepung Saus Asam Manis',
      laukNabati: 'Tahu Goreng Kuning',
      sayur: 'Sayur Bening Bayam Hijau & Pipil Jagung',
      buah: 'Pisang Susu Matang',
      pelengkap: 'Susu UHT Segar',
    },
    nutritionCards: [
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 562.30, proteinG: 16.80, fatG: 13.50, carbsG: 83.20, fiberG: 2.50 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 455.00, proteinG: 13.90, fatG: 12.80, carbsG: 79.10, fiberG: 2.30 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 422.00, proteinG: 13.00, fatG: 12.50, carbsG: 50.80, fiberG: 1.90 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 562.30, proteinG: 16.80, fatG: 13.50, carbsG: 83.20, fiberG: 2.50 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 562.30, proteinG: 16.80, fatG: 13.50, carbsG: 83.20, fiberG: 2.50 },
    ],
    photos: [
      { step: 'persiapan', title: 'Pencucian Bayam & Ikan Fillet', description: 'Pemeriksaan kesegaran fillet ikan tanpa duri.', imageUrl: '/gallery-5.jpg', timeEstimate: '04:15 - 05:30 WIB' },
      { step: 'pengolahan', title: 'Goreng Fillet & Pemasakan Sayur Bayam', description: 'Sayur bening dimasak segar menjelang jam distribusi.', imageUrl: '/hero-kitchen.jpg', timeEstimate: '05:30 - 07:15 WIB' },
      { step: 'pengemasan', title: 'Distribusi Thermal Box', description: 'Pengemasan porsi ramah anak.', imageUrl: '/gallery-6.jpg', timeEstimate: '07:15 - 08:30 WIB' },
    ],
    overrides: [],
  },
  {
    date: '2026-09-21',
    menuNumber: 70,
    title: 'Nasi Putih, Ayam Panggang Bumbu Madu, Tempe Goreng Kunyit, Tumis Kacang Panjang Tauge, Pepaya Segar, & Susu',
    status: 'published',
    publishedAt: '2026-09-21 08:35 WIB',
    components: {
      karbohidrat: 'Nasi Putih Pulen',
      laukHewani: 'Ayam Panggang Saus Madu Gurih',
      laukNabati: 'Tempe Ungkep Kunyit',
      sayur: 'Tumis Kacang Panjang & Tauge Segar',
      buah: 'Pepaya Iris Dingin',
      pelengkap: 'Susu Pasteurisasi',
    },
    nutritionCards: [
      { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU / TENDIK', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 570.00, proteinG: 16.00, fatG: 14.00, carbsG: 84.00, fiberG: 2.40 },
      { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 460.00, proteinG: 13.50, fatG: 13.50, carbsG: 80.00, fiberG: 2.30 },
      { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 424.00, proteinG: 12.80, fatG: 13.00, carbsG: 51.00, fiberG: 1.90 },
      { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 570.00, proteinG: 16.00, fatG: 14.00, carbsG: 84.00, fiberG: 2.40 },
      { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 570.00, proteinG: 16.00, fatG: 14.00, carbsG: 84.00, fiberG: 2.40 },
    ],
    photos: [
      { step: 'persiapan', title: 'Persiapan Ayam & Bumbu Madu', description: 'Ayam dipanggang oven higienis.', imageUrl: '/about-kitchen.jpg', timeEstimate: '04:00 - 05:20 WIB' },
      { step: 'pengolahan', title: 'Panggang Oven & Tumis Sayuran', description: 'Pengendalian suhu dan higienitas.', imageUrl: '/gallery-3.jpg', timeEstimate: '05:20 - 07:00 WIB' },
      { step: 'pengemasan', title: 'Penyegelan Kotak Makanan', description: 'Pemeriksaan final sebelum keberangkatan kurir.', imageUrl: '/gallery-1.jpg', timeEstimate: '07:00 - 08:20 WIB' },
    ],
    overrides: [],
  },
];
