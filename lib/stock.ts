export type StockCategory =
  | 'Gudang Kering'
  | 'Chiller & Freezer'
  | 'Sayur & Buah'
  | 'Bumbu & Rempah'
  | 'Kemasan & Sanitasi';

export type StockStatus = 'safe' | 'warning' | 'critical';

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: StockCategory;
  uom: string; // kg, liter, butir, pack, ikat, box, potong
  storageLocation: string;
  currentStock: number;
  minStockAlert: number;
  dailyUsageAvg: number; // Kebutuhan per hari untuk 1.553 porsi
  unitPrice: number; // Rupiah per uom
  supplierName: string;
  lastRestockDate: string; // YYYY-MM-DD
  expiryDate?: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  itemId: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  qty: number;
  uom: string;
  balanceAfter: number;
  reference: string; // No PO, Faktur, Menu Dapur, atau Berita Acara
  loggedBy: string;
  notes?: string;
}

export interface StockSummary {
  totalItems: number;
  totalValuation: number;
  safeCount: number;
  warningCount: number;
  criticalCount: number;
  categoryCounts: Record<StockCategory, number>;
}

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v1';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v1';

// 32 Master Bahan Baku Resmi SPPG Wonodri 3 (Pagu 1.553 Porsi / Hari)
export const DEFAULT_STOCK_ITEMS_32: StockItem[] = [
  // --- GUDANG KERING ---
  {
    id: 'bhk-001',
    sku: 'BGN-GDK-001',
    name: 'Beras Premium Mentik Wangi',
    category: 'Gudang Kering',
    uom: 'kg',
    storageLocation: 'Gudang Kering Rak A-01',
    currentStock: 650,
    minStockAlert: 250,
    dailyUsageAvg: 124,
    unitPrice: 15000,
    supplierName: 'Koperasi Tani Makmur Semarang',
    lastRestockDate: '2026-10-28',
    expiryDate: '2027-04-30',
    notes: 'Standar beras pulen kadar air maks 14%',
  },
  {
    id: 'bhk-002',
    sku: 'BGN-GDK-002',
    name: 'Minyak Goreng Sawit Premium',
    category: 'Gudang Kering',
    uom: 'liter',
    storageLocation: 'Gudang Kering Rak B-01',
    currentStock: 110,
    minStockAlert: 50,
    dailyUsageAvg: 26,
    unitPrice: 17500,
    supplierName: 'PT Pangan Mandiri Sejahtera',
    lastRestockDate: '2026-10-27',
    expiryDate: '2027-08-15',
    notes: 'Kemasan jeriken 20L tersegel BPOM',
  },
  {
    id: 'bhk-003',
    sku: 'BGN-GDK-003',
    name: 'Tepung Terigu Serbaguna Segitiga',
    category: 'Gudang Kering',
    uom: 'kg',
    storageLocation: 'Gudang Kering Rak A-02',
    currentStock: 45,
    minStockAlert: 20,
    dailyUsageAvg: 15,
    unitPrice: 13500,
    supplierName: 'Toko Bahan Kue 88',
    lastRestockDate: '2026-10-29',
    expiryDate: '2027-03-20',
  },
  {
    id: 'bhk-004',
    sku: 'BGN-GDK-004',
    name: 'Kecap Manis Kedelai Hitam',
    category: 'Gudang Kering',
    uom: 'liter',
    storageLocation: 'Gudang Kering Rak B-02',
    currentStock: 28,
    minStockAlert: 15,
    dailyUsageAvg: 6,
    unitPrice: 22000,
    supplierName: 'PT Pangan Mandiri Sejahtera',
    lastRestockDate: '2026-10-26',
    expiryDate: '2027-09-10',
  },
  {
    id: 'bhk-005',
    sku: 'BGN-GDK-005',
    name: 'Saus Tiram Ekstrak Seafood',
    category: 'Gudang Kering',
    uom: 'liter',
    storageLocation: 'Gudang Kering Rak B-02',
    currentStock: 18,
    minStockAlert: 10,
    dailyUsageAvg: 4,
    unitPrice: 32000,
    supplierName: 'PT Pangan Mandiri Sejahtera',
    lastRestockDate: '2026-10-25',
    expiryDate: '2027-10-01',
  },
  {
    id: 'bhk-006',
    sku: 'BGN-GDK-006',
    name: 'Garam Beryodium Halus 40ppm',
    category: 'Gudang Kering',
    uom: 'kg',
    storageLocation: 'Gudang Kering Rak C-01',
    currentStock: 30,
    minStockAlert: 10,
    dailyUsageAvg: 3.5,
    unitPrice: 8000,
    supplierName: 'Koperasi Garam Nasional',
    lastRestockDate: '2026-10-20',
    expiryDate: '2028-01-01',
  },
  {
    id: 'bhk-007',
    sku: 'BGN-GDK-007',
    name: 'Gula Pasir Kristal Putih',
    category: 'Gudang Kering',
    uom: 'kg',
    storageLocation: 'Gudang Kering Rak C-02',
    currentStock: 40,
    minStockAlert: 15,
    dailyUsageAvg: 5,
    unitPrice: 17500,
    supplierName: 'PT Pangan Mandiri Sejahtera',
    lastRestockDate: '2026-10-24',
    expiryDate: '2027-06-30',
  },
  {
    id: 'bhk-008',
    sku: 'BGN-GDK-008',
    name: 'Bawang Goreng Renyah Super',
    category: 'Gudang Kering',
    uom: 'kg',
    storageLocation: 'Gudang Kering Rak A-03',
    currentStock: 14,
    minStockAlert: 8,
    dailyUsageAvg: 3,
    unitPrice: 65000,
    supplierName: 'UMKM Berkah Rempah Brebes',
    lastRestockDate: '2026-10-28',
    expiryDate: '2027-01-15',
  },

  // --- CHILLER & FREEZER ---
  {
    id: 'chl-001',
    sku: 'BGN-CHL-001',
    name: 'Daging Ayam Broiler Karkas Bersih',
    category: 'Chiller & Freezer',
    uom: 'kg',
    storageLocation: 'Chiller Ruang 1 (Suhu 2°C)',
    currentStock: 145,
    minStockAlert: 120,
    dailyUsageAvg: 115,
    unitPrice: 38000,
    supplierName: 'Kemitraan Peternak Ayam Ungaran',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-03',
    notes: 'Rendemen bersih 85%, sertifikat halal RPH',
  },
  {
    id: 'chl-002',
    sku: 'BGN-FRZ-001',
    name: 'Daging Sapi Gandik Segar Lokal',
    category: 'Chiller & Freezer',
    uom: 'kg',
    storageLocation: 'Deep Freezer (Suhu -18°C)',
    currentStock: 35,
    minStockAlert: 50,
    dailyUsageAvg: 65,
    unitPrice: 135000,
    supplierName: 'RPH Penggaron Semarang',
    lastRestockDate: '2026-10-29',
    expiryDate: '2026-11-20',
    notes: 'Dipotong dadu porsi kecil & besar',
  },
  {
    id: 'chl-003',
    sku: 'BGN-CHL-002',
    name: 'Telur Ayam Ras Segar Grade A',
    category: 'Chiller & Freezer',
    uom: 'butir',
    storageLocation: 'Egg Storage Chiller (8°C)',
    currentStock: 1850,
    minStockAlert: 1600,
    dailyUsageAvg: 1553,
    unitPrice: 2000,
    supplierName: 'Peternakan Layer Kendal',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-14',
    notes: '1 butir per porsi anak didik',
  },
  {
    id: 'chl-004',
    sku: 'BGN-CHL-003',
    name: 'Ikan Kembung Segar Fillet',
    category: 'Chiller & Freezer',
    uom: 'kg',
    storageLocation: 'Fish Chiller (Suhu 1°C)',
    currentStock: 80,
    minStockAlert: 85,
    dailyUsageAvg: 90,
    unitPrice: 42000,
    supplierName: 'TPI Tambaklorok Semarang',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-02',
    notes: 'Sudah dibersihkan insang & jeroan',
  },
  {
    id: 'chl-005',
    sku: 'BGN-CHL-004',
    name: 'Tempe Kedelai Murni Non-GMO',
    category: 'Chiller & Freezer',
    uom: 'kg',
    storageLocation: 'Chiller Ruang 2 (Suhu 4°C)',
    currentStock: 50,
    minStockAlert: 40,
    dailyUsageAvg: 45,
    unitPrice: 12000,
    supplierName: 'Sentra Pengrajin Tempe Gayamsari',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-03',
    notes: 'Pengiriman harian subuh pukul 03:30',
  },
  {
    id: 'chl-006',
    sku: 'BGN-CHL-005',
    name: 'Tahu Putih Sutra Segar',
    category: 'Chiller & Freezer',
    uom: 'potong',
    storageLocation: 'Chiller Ruang 2 (Suhu 4°C)',
    currentStock: 1600,
    minStockAlert: 1500,
    dailyUsageAvg: 1553,
    unitPrice: 800,
    supplierName: 'Pengrajin Tahu Khas Semarang',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-02',
  },

  // --- SAYUR & BUAH SEGAR ---
  {
    id: 'say-001',
    sku: 'BGN-SAY-001',
    name: 'Wortel Brastagi Segar Pilihan',
    category: 'Sayur & Buah',
    uom: 'kg',
    storageLocation: 'Vegetable Cold Room (6°C)',
    currentStock: 85,
    minStockAlert: 40,
    dailyUsageAvg: 38,
    unitPrice: 16000,
    supplierName: 'Kelompok Tani Bandungan',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-06',
  },
  {
    id: 'say-002',
    sku: 'BGN-SAY-002',
    name: 'Buncis Muda Segar',
    category: 'Sayur & Buah',
    uom: 'kg',
    storageLocation: 'Vegetable Cold Room (6°C)',
    currentStock: 48,
    minStockAlert: 35,
    dailyUsageAvg: 30,
    unitPrice: 18000,
    supplierName: 'Kelompok Tani Bandungan',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-04',
  },
  {
    id: 'say-003',
    sku: 'BGN-SAY-003',
    name: 'Labu Siam Manis Baby',
    category: 'Sayur & Buah',
    uom: 'kg',
    storageLocation: 'Vegetable Cold Room (6°C)',
    currentStock: 60,
    minStockAlert: 30,
    dailyUsageAvg: 32,
    unitPrice: 12000,
    supplierName: 'Pasar Induk Johar Semarang',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-05',
  },
  {
    id: 'say-004',
    sku: 'BGN-SAY-004',
    name: 'Jagung Manis Pipil Segar',
    category: 'Sayur & Buah',
    uom: 'kg',
    storageLocation: 'Vegetable Cold Room (6°C)',
    currentStock: 40,
    minStockAlert: 25,
    dailyUsageAvg: 22,
    unitPrice: 19000,
    supplierName: 'Kelompok Tani Grobogan',
    lastRestockDate: '2026-10-29',
    expiryDate: '2026-11-05',
  },
  {
    id: 'say-005',
    sku: 'BGN-SAY-005',
    name: 'Bayam Cabut Hijau Segar',
    category: 'Sayur & Buah',
    uom: 'ikat',
    storageLocation: 'Vegetable Shelf Standby',
    currentStock: 120,
    minStockAlert: 100,
    dailyUsageAvg: 110,
    unitPrice: 3500,
    supplierName: 'Petani Hidroponik Gunungpati',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-02',
    notes: 'Langsung diolah di hari yang sama',
  },
  {
    id: 'say-006',
    sku: 'BGN-BUA-001',
    name: 'Pisang Cavendish Matang Alami',
    category: 'Sayur & Buah',
    uom: 'buah',
    storageLocation: 'Fruit Room Area (Suhu 18°C)',
    currentStock: 1650,
    minStockAlert: 1550,
    dailyUsageAvg: 1553,
    unitPrice: 2200,
    supplierName: 'Koperasi Buah Nusantara Ungaran',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-04',
    notes: '1 buah per porsi anak MBG',
  },
  {
    id: 'say-007',
    sku: 'BGN-BUA-002',
    name: 'Semangka Manis Merah Tanpa Biji',
    category: 'Sayur & Buah',
    uom: 'kg',
    storageLocation: 'Fruit Room Area (Suhu 18°C)',
    currentStock: 175,
    minStockAlert: 120,
    dailyUsageAvg: 155,
    unitPrice: 8500,
    supplierName: 'Distributor Buah Johar',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-05',
  },
  {
    id: 'say-008',
    sku: 'BGN-BUA-003',
    name: 'Jeruk Manis Medan Segar',
    category: 'Sayur & Buah',
    uom: 'buah',
    storageLocation: 'Fruit Room Area (Suhu 18°C)',
    currentStock: 1700,
    minStockAlert: 1500,
    dailyUsageAvg: 1553,
    unitPrice: 2000,
    supplierName: 'Distributor Buah Johar',
    lastRestockDate: '2026-10-31',
    expiryDate: '2026-11-07',
  },

  // --- BUMBU & REMPAH ---
  {
    id: 'bmb-001',
    sku: 'BGN-BMB-001',
    name: 'Bawang Merah Brebes Super Pilihan',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Gudang Rempah Kering Rak D-01',
    currentStock: 38,
    minStockAlert: 20,
    dailyUsageAvg: 12,
    unitPrice: 35000,
    supplierName: 'Sentra Bawang Brebes Asli',
    lastRestockDate: '2026-10-27',
    expiryDate: '2026-12-15',
  },
  {
    id: 'bmb-002',
    sku: 'BGN-BMB-002',
    name: 'Bawang Putih Kating Bersih',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Gudang Rempah Kering Rak D-01',
    currentStock: 32,
    minStockAlert: 18,
    dailyUsageAvg: 9,
    unitPrice: 42000,
    supplierName: 'Sentra Bawang Brebes Asli',
    lastRestockDate: '2026-10-27',
    expiryDate: '2026-12-30',
  },
  {
    id: 'bmb-003',
    sku: 'BGN-BMB-003',
    name: 'Cabai Merah Keriting Segar',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Chiller Bumbu Segar (8°C)',
    currentStock: 16,
    minStockAlert: 10,
    dailyUsageAvg: 6,
    unitPrice: 45000,
    supplierName: 'Pasar Johar Semarang',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-06',
    notes: 'Kadar pedas disesuaikan untuk siswa SD/TK',
  },
  {
    id: 'bmb-004',
    sku: 'BGN-BMB-004',
    name: 'Jahe Emprit Segar',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Gudang Rempah Kering Rak D-02',
    currentStock: 12,
    minStockAlert: 6,
    dailyUsageAvg: 2.5,
    unitPrice: 28000,
    supplierName: 'Petani Rempah Temanggung',
    lastRestockDate: '2026-10-25',
    expiryDate: '2026-12-10',
  },
  {
    id: 'bmb-005',
    sku: 'BGN-BMB-005',
    name: 'Kunyit Basah Bersih',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Gudang Rempah Kering Rak D-02',
    currentStock: 10,
    minStockAlert: 5,
    dailyUsageAvg: 2,
    unitPrice: 18000,
    supplierName: 'Petani Rempah Temanggung',
    lastRestockDate: '2026-10-25',
    expiryDate: '2026-12-10',
  },
  {
    id: 'bmb-006',
    sku: 'BGN-BMB-006',
    name: 'Lengkuas Segar Pilihan',
    category: 'Bumbu & Rempah',
    uom: 'kg',
    storageLocation: 'Gudang Rempah Kering Rak D-02',
    currentStock: 11,
    minStockAlert: 5,
    dailyUsageAvg: 2.5,
    unitPrice: 18000,
    supplierName: 'Petani Rempah Temanggung',
    lastRestockDate: '2026-10-25',
    expiryDate: '2026-12-10',
  },
  {
    id: 'bmb-007',
    sku: 'BGN-BMB-007',
    name: 'Daun Salam & Serai Segar',
    category: 'Bumbu & Rempah',
    uom: 'ikat',
    storageLocation: 'Vegetable Shelf Standby',
    currentStock: 25,
    minStockAlert: 15,
    dailyUsageAvg: 8,
    unitPrice: 5000,
    supplierName: 'Petani Rempah Bandungan',
    lastRestockDate: '2026-10-30',
    expiryDate: '2026-11-06',
  },
  {
    id: 'bmb-008',
    sku: 'BGN-BMB-008',
    name: 'Ketumbar & Merica Bubuk Murni',
    category: 'Bumbu & Rempah',
    uom: 'pack',
    storageLocation: 'Gudang Rempah Kering Rak D-03',
    currentStock: 22,
    minStockAlert: 10,
    dailyUsageAvg: 3,
    unitPrice: 12000,
    supplierName: 'PT Pangan Mandiri Sejahtera',
    lastRestockDate: '2026-10-22',
    expiryDate: '2027-05-30',
  },

  // --- KEMASAN & SANITASI ---
  {
    id: 'kms-001',
    sku: 'BGN-KMS-001',
    name: 'Hairnet & Masker Dapur Bedah 3-Ply',
    category: 'Kemasan & Sanitasi',
    uom: 'box',
    storageLocation: 'Gudang Non-Food Rak E-01',
    currentStock: 35,
    minStockAlert: 15,
    dailyUsageAvg: 2,
    unitPrice: 32000,
    supplierName: 'CV Medika Mandiri Alkes',
    lastRestockDate: '2026-10-20',
    expiryDate: '2029-01-01',
    notes: 'Wajib dikenakan 40 relawan dapur tiap shift',
  },
  {
    id: 'kms-002',
    sku: 'BGN-KMS-002',
    name: 'Sarung Tangan Nitrile Food Grade',
    category: 'Kemasan & Sanitasi',
    uom: 'box',
    storageLocation: 'Gudang Non-Food Rak E-01',
    currentStock: 40,
    minStockAlert: 20,
    dailyUsageAvg: 4,
    unitPrice: 48000,
    supplierName: 'CV Medika Mandiri Alkes',
    lastRestockDate: '2026-10-20',
    expiryDate: '2029-01-01',
    notes: 'Bebas bedak, sertifikasi kontak pangan BPOM',
  },
];

// Mutasi Historis Awal Logistik SPPG Wonodri 3 (Oktober 2026)
export const DEFAULT_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-20261031-01',
    date: '2026-10-31',
    time: '04:15',
    itemId: 'chl-001',
    itemName: 'Daging Ayam Broiler Karkas Bersih',
    type: 'IN',
    qty: 150,
    uom: 'kg',
    balanceAfter: 145,
    reference: 'GRN-AYM-20261031-01',
    loggedBy: 'Petugas Timbangan Logistik',
    notes: 'Penerimaan karkas segar suhu inti 3°C lolos uji visual',
  },
  {
    id: 'mov-20261031-02',
    date: '2026-10-31',
    time: '04:30',
    itemId: 'chl-003',
    itemName: 'Telur Ayam Ras Segar Grade A',
    type: 'IN',
    qty: 1800,
    uom: 'butir',
    balanceAfter: 1850,
    reference: 'GRN-TLR-20261031-02',
    loggedBy: 'Petugas Timbangan Logistik',
    notes: 'Kondisi cangkang bersih utuh 100%',
  },
  {
    id: 'mov-20261030-01',
    date: '2026-10-30',
    time: '05:30',
    itemId: 'bhk-001',
    itemName: 'Beras Premium Mentik Wangi',
    type: 'OUT',
    qty: 124,
    uom: 'kg',
    balanceAfter: 650,
    reference: 'BOM-MSK-20261030',
    loggedBy: 'Chef In Charge (Seksi Pengolahan)',
    notes: 'Produksi Nasi Putih Pulen 1.553 Porsi',
  },
  {
    id: 'mov-20261030-02',
    date: '2026-10-30',
    time: '05:45',
    itemId: 'chl-001',
    itemName: 'Daging Ayam Broiler Karkas Bersih',
    type: 'OUT',
    qty: 115,
    uom: 'kg',
    balanceAfter: 110,
    reference: 'BOM-MSK-20261030',
    loggedBy: 'Chef In Charge (Seksi Pengolahan)',
    notes: 'Produksi Ayam Goreng Lengkuas MBG 1.553 Porsi',
  },
  {
    id: 'mov-20261029-01',
    date: '2026-10-29',
    time: '15:00',
    itemId: 'bhk-002',
    itemName: 'Minyak Goreng Sawit Premium',
    type: 'IN',
    qty: 100,
    uom: 'liter',
    balanceAfter: 136,
    reference: 'PO-MNY-20261029',
    loggedBy: 'Admin Logistik Gudang',
    notes: 'Restock mingguan 5 jeriken 20L',
  },
  {
    id: 'mov-20261028-01',
    date: '2026-10-28',
    time: '16:30',
    itemId: 'bhk-001',
    itemName: 'Beras Premium Mentik Wangi',
    type: 'IN',
    qty: 500,
    uom: 'kg',
    balanceAfter: 774,
    reference: 'PO-BRS-20261028',
    loggedBy: 'Admin Logistik Gudang',
    notes: 'Pengiriman beras 20 karung @25kg lolos uji lab beras',
  },
];

// Helper kalkulasi status item stok
export function calculateStockStatus(item: StockItem): StockStatus {
  if (item.dailyUsageAvg <= 0) return 'safe';
  const daysLeft = item.currentStock / item.dailyUsageAvg;
  if (daysLeft < 1.0 || item.currentStock <= item.minStockAlert * 0.5) {
    return 'critical';
  }
  if (daysLeft < 2.5 || item.currentStock <= item.minStockAlert) {
    return 'warning';
  }
  return 'safe';
}

export function getDaysLeft(item: StockItem): number {
  if (item.dailyUsageAvg <= 0) return 999;
  return Number((item.currentStock / item.dailyUsageAvg).toFixed(1));
}

// Client Storage Accessors (Safe for SSR)
export function loadStockFromStorage(): StockItem[] {
  if (typeof window === 'undefined') return DEFAULT_STOCK_ITEMS_32;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_INVENTORY_KEY);
    if (!raw) {
      saveStockToStorage(DEFAULT_STOCK_ITEMS_32);
      return DEFAULT_STOCK_ITEMS_32;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stock from localStorage:', err);
  }
  return DEFAULT_STOCK_ITEMS_32;
}

export function saveStockToStorage(items: StockItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_STOCK_INVENTORY_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save stock to localStorage:', err);
  }
}

export function loadMovementsFromStorage(): StockMovement[] {
  if (typeof window === 'undefined') return DEFAULT_STOCK_MOVEMENTS;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY);
    if (!raw) {
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS);
      return DEFAULT_STOCK_MOVEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load movements from localStorage:', err);
  }
  return DEFAULT_STOCK_MOVEMENTS;
}

export function saveMovementsToStorage(movements: StockMovement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_STOCK_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (err) {
    console.error('Failed to save movements to localStorage:', err);
  }
}

// Rekapitulasi metrik eksekutif stok
export function calculateStockSummary(items: StockItem[]): StockSummary {
  let totalValuation = 0;
  let safeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  const categoryCounts: Record<StockCategory, number> = {
    'Gudang Kering': 0,
    'Chiller & Freezer': 0,
    'Sayur & Buah': 0,
    'Bumbu & Rempah': 0,
    'Kemasan & Sanitasi': 0,
  };

  items.forEach((item) => {
    totalValuation += item.currentStock * item.unitPrice;
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

    const status = calculateStockStatus(item);
    if (status === 'critical') criticalCount++;
    else if (status === 'warning') warningCount++;
    else safeCount++;
  });

  return {
    totalItems: items.length,
    totalValuation,
    safeCount,
    warningCount,
    criticalCount,
    categoryCounts,
  };
}

// Format Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format Number
export function formatStockQty(qty: number, uom: string): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(qty);
  return `${formatted} ${uom}`;
}

// Export CSV Inventory
export function generateStockCSV(items: StockItem[]): string {
  const headers = [
    'SKU',
    'Nama Bahan Baku',
    'Kategori',
    'Lokasi Simpan',
    'Stok Aktual',
    'Satuan (UoM)',
    'Batas Buffer Min',
    'Rata-rata Pakai / Hari',
    'Hari Ketahanan',
    'Status Buffer',
    'Harga Satuan (Rp)',
    'Nilai Total Aset (Rp)',
    'Suplier / Vendor',
    'Tanggal Restock Terakhir',
    'Tanggal Kedaluwarsa',
  ];

  const rows = items.map((item) => {
    const status = calculateStockStatus(item);
    const days = getDaysLeft(item);
    const statusLabel =
      status === 'critical'
        ? 'KRITIS / HABIS'
        : status === 'warning'
        ? 'MENIPIS'
        : 'AMAN';

    return [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.storageLocation}"`,
      item.currentStock,
      `"${item.uom}"`,
      item.minStockAlert,
      item.dailyUsageAvg,
      days,
      `"${statusLabel}"`,
      item.unitPrice,
      item.currentStock * item.unitPrice,
      `"${item.supplierName.replace(/"/g, '""')}"`,
      `"${item.lastRestockDate}"`,
      `"${item.expiryDate || '-'}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Export CSV Movement Logs
export function generateMovementsCSV(movements: StockMovement[]): string {
  const headers = [
    'ID Log',
    'Tanggal',
    'Jam',
    'Jenis Mutasi',
    'Nama Bahan Baku',
    'Jumlah (Qty)',
    'Satuan',
    'Sisa Stok Setelah Mutasi',
    'Nomor Referensi',
    'Petugas Pencatat',
    'Catatan Operasional',
  ];

  const rows = movements.map((m) => {
    const typeLabel =
      m.type === 'IN'
        ? 'MASUK (RESTOCK)'
        : m.type === 'OUT'
        ? 'KELUAR (MASAK MBG)'
        : 'PENYESUAIAN OPNAME';

    return [
      `"${m.id}"`,
      `"${m.date}"`,
      `"${m.time}"`,
      `"${typeLabel}"`,
      `"${m.itemName.replace(/"/g, '""')}"`,
      m.qty,
      `"${m.uom}"`,
      m.balanceAfter,
      `"${m.reference.replace(/"/g, '""')}"`,
      `"${m.loggedBy.replace(/"/g, '""')}"`,
      `"${(m.notes || '-').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ============ FITUR STOCK OPNAME BERKALA (DRAF & FINALISASI) ============
export interface OpnameRow {
  itemId: string;
  sku: string;
  name: string;
  category: StockCategory;
  uom: string;
  storageLocation: string;
  systemQty: number;
  physicalQty: number;
  unitPrice: number;
  notes: string;
}

export interface OpnameSession {
  id: string;
  date: string;
  title: string;
  checkerName: string;
  status: 'draft' | 'completed';
  rows: OpnameRow[];
  savedAt: string;
}

export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v1';

export function createInitialOpnameRows(items: StockItem[]): OpnameRow[] {
  return items.map((item) => ({
    itemId: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    uom: item.uom,
    storageLocation: item.storageLocation,
    systemQty: item.currentStock,
    physicalQty: item.currentStock,
    unitPrice: item.unitPrice,
    notes: 'Kondisi kemasan & fisik baik',
  }));
}

export function loadOpnameDraftFromStorage(items: StockItem[]): OpnameSession {
  const defaultSession: OpnameSession = {
    id: `OPN-${new Date().toISOString().slice(0, 10)}`,
    date: new Date().toISOString().slice(0, 10),
    title: 'Audit Fisik Berkala Stok Gudang SPPG Wonodri 3',
    checkerName: 'Bambang Susanto (Staf Logistik)',
    status: 'draft',
    rows: createInitialOpnameRows(items),
    savedAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return defaultSession;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_OPNAME_DRAFT_KEY);
    if (!raw) return defaultSession;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load opname draft from localStorage:', err);
  }
  return defaultSession;
}

export function saveOpnameDraftToStorage(session: OpnameSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_STOCK_OPNAME_DRAFT_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save opname draft to localStorage:', err);
  }
}

export function clearOpnameDraftFromStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ARSIP_STOCK_OPNAME_DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear opname draft from localStorage:', err);
  }
}

export function generateOpnameCSV(session: OpnameSession): string {
  const headers = [
    'No',
    'SKU',
    'Nama Bahan Baku',
    'Kategori',
    'Lokasi Simpan',
    'Satuan',
    'Stok Sistem',
    'Stok Fisik Aktual',
    'Selisih (Qty)',
    'Harga Satuan (Rp)',
    'Nilai Selisih Nominal (Rp)',
    'Status Kecocokan',
    'Catatan Pemeriksaan',
  ];

  const rows = session.rows.map((row, idx) => {
    const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
    const diffNominal = diff * row.unitPrice;
    const statusText = diff === 0 ? 'SESUAI (KLOP)' : diff > 0 ? 'LEBIH (+)' : 'KURANG (-)';

    return [
      idx + 1,
      `"${row.sku}"`,
      `"${row.name.replace(/"/g, '""')}"`,
      `"${row.category}"`,
      `"${row.storageLocation}"`,
      `"${row.uom}"`,
      row.systemQty,
      row.physicalQty,
      diff,
      row.unitPrice,
      diffNominal,
      `"${statusText}"`,
      `"${(row.notes || '-').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
