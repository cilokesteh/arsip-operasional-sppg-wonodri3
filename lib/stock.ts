export type StockCategory =
  | 'Bahan Kering'
  | 'Rempah'
  | 'Protein Hewani'
  | 'Protein Nabati'
  | 'Sayur'
  | 'Buah'
  | 'Lainnya';

export type StockStatus = 'safe' | 'warning' | 'critical';

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: StockCategory;
  uom: string; // KG, L, POUCH, BTL, PAPAN, KRAT, PCS, etc.
  storageLocation: string; // 'Gudang Basah' atau 'Gudang Kering'
  currentStock: number;
  initialStock: number; // Masuk
  usedStock: number; // Keluar Masak
  minStockAlert: number;
  dailyUsageAvg: number;
  supplierName: string;
  lastRestockDate: string; // YYYY-MM-DD
  lastUsageDate: string; // YYYY-MM-DD
  batch: '01-NOV' | '02-NOV' | '03-NOV' | '04-NOV' | '05-NOV' | '06-NOV' | '07-NOV' | 'ALL';
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
  reference: string;
  loggedBy: string;
  notes?: string;
}

export interface StockSummary {
  totalItems: number;
  totalKgMasuk: number;
  totalQtyNonKgMasuk: number;
  totalKgKeluar: number;
  totalQtyNonKgKeluar: number;
  currentKgSisa: number;
  currentQtyNonKgSisa: number;
  gudangBasahCount: number;
  gudangKeringCount: number;
  safeCount: number;
  warningCount: number;
  criticalCount: number;
  categoryCounts: Record<StockCategory, number>;
}

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v11';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v11';
export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v11';

export const SUPPLIER_YAYASAN = 'Yayasan Berkat Makmur Sentosa';

// BATCH 1: 16 Bahan Masuk 01 Nov 2026 -> Keluar Masak 02 Nov 2026
export const BATCH_1_ITEMS: StockItem[] = [
  {
    id: 'b1-01',
    sku: 'BGN-BHK-001',
    name: 'TEPUNG TERIGU',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 20,
    usedStock: 20,
    minStockAlert: 5,
    dailyUsageAvg: 20,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 20 KG (01 Nov) -> Keluar masak 20 KG (02 Nov) untuk adonan Dorry',
  },
  {
    id: 'b1-02',
    sku: 'BGN-BHK-002',
    name: 'ROYCO',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 2,
    usedStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 2,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov)',
  },
  {
    id: 'b1-03',
    sku: 'BGN-BHK-003',
    name: 'MINYAK GORENG',
    category: 'Bahan Kering',
    uom: 'L',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 54,
    usedStock: 54,
    minStockAlert: 15,
    dailyUsageAvg: 54,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 54 L (01 Nov) -> Keluar masak 54 L (02 Nov)',
  },
  {
    id: 'b1-04',
    sku: 'BGN-BHK-004',
    name: 'MAYONAISE',
    category: 'Bahan Kering',
    uom: 'POUCH',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 10,
    usedStock: 10,
    minStockAlert: 2,
    dailyUsageAvg: 10,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 10 POUCH (01 Nov) -> Keluar 10 POUCH (02 Nov) saus mayo madu',
  },
  {
    id: 'b1-05',
    sku: 'BGN-BHK-005',
    name: 'MADU',
    category: 'Bahan Kering',
    uom: 'BTL',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1,
    usedStock: 1,
    minStockAlert: 1,
    dailyUsageAvg: 1,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 1 BTL (01 Nov) -> Keluar 1 BTL (02 Nov)',
  },
  {
    id: 'b1-06',
    sku: 'BGN-BHK-006',
    name: 'GULA PASIR',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 3,
    usedStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 3,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 3 KG (01 Nov) -> Keluar masak 3 KG (02 Nov)',
  },
  {
    id: 'b1-07',
    sku: 'BGN-BHK-007',
    name: 'TEPUNG MAIZENA',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1.5,
    usedStock: 1.5,
    minStockAlert: 0.5,
    dailyUsageAvg: 1.5,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 1.5 KG (01 Nov) -> Keluar masak 1.5 KG (02 Nov)',
  },
  {
    id: 'b1-08',
    sku: 'BGN-BHK-008',
    name: 'GARAM',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 2,
    usedStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 2,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov)',
  },
  {
    id: 'b1-09',
    sku: 'BGN-RMP-001',
    name: 'LADA BUBUK',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 0.1,
    usedStock: 0.1,
    minStockAlert: 0.05,
    dailyUsageAvg: 0.1,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 0.1 KG (01 Nov) -> Keluar masak 0.1 KG (02 Nov)',
  },
  {
    id: 'b1-10',
    sku: 'BGN-RMP-002',
    name: 'BAWANG PUTIH',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 2,
    usedStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 2,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov)',
  },
  {
    id: 'b1-11',
    sku: 'BGN-PRH-001',
    name: 'DORRY FILLET GLASSING 30%',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 90,
    usedStock: 90,
    minStockAlert: 20,
    dailyUsageAvg: 90,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 90 KG (01 Nov) -> Keluar masak 90 KG (02 Nov) lauk hewani',
  },
  {
    id: 'b1-12',
    sku: 'BGN-PRH-002',
    name: 'TELUR AYAM',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 3,
    usedStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 3,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 3 KG (01 Nov) -> Keluar masak 3 KG (02 Nov)',
  },
  {
    id: 'b1-13',
    sku: 'BGN-PRN-001',
    name: 'TEMPE',
    category: 'Protein Nabati',
    uom: 'PAPAN',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 80,
    usedStock: 80,
    minStockAlert: 20,
    dailyUsageAvg: 80,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 80 PAPAN (01 Nov) -> Keluar masak 80 PAPAN (02 Nov)',
  },
  {
    id: 'b1-14',
    sku: 'BGN-SYR-001',
    name: 'BUNCIS',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 30,
    usedStock: 30,
    minStockAlert: 10,
    dailyUsageAvg: 30,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 30 KG (01 Nov) -> Keluar masak 30 KG (02 Nov)',
  },
  {
    id: 'b1-15',
    sku: 'BGN-SYR-002',
    name: 'LABU SIAM',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 30,
    usedStock: 30,
    minStockAlert: 10,
    dailyUsageAvg: 30,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 30 KG (01 Nov) -> Keluar masak 30 KG (02 Nov)',
  },
  {
    id: 'b1-16',
    sku: 'BGN-BUH-001',
    name: 'ANGGUR MERAH',
    category: 'Buah',
    uom: 'KRAT',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 11,
    usedStock: 11,
    minStockAlert: 3,
    dailyUsageAvg: 11,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 11 KRAT (01 Nov) -> Keluar 11 KRAT (02 Nov) buah segar',
  },
];

// BATCH 2: 17 Bahan Masuk 02 Nov 2026 -> Keluar Masak 03 Nov 2026
export const BATCH_2_ITEMS: StockItem[] = [
  {
    id: 'b2-01',
    sku: 'BGN-BHK-009',
    name: 'BERAS',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 100,
    usedStock: 100,
    minStockAlert: 25,
    dailyUsageAvg: 100,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 100 KG (02 Nov) -> Keluar masak 100 KG (03 Nov)',
  },
  {
    id: 'b2-02',
    sku: 'BGN-BHK-002B',
    name: 'ROYCO',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 3,
    usedStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 3,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 3 KG (02 Nov) -> Keluar masak 3 KG (03 Nov)',
  },
  {
    id: 'b2-03',
    sku: 'BGN-BHK-010',
    name: 'TEPUNG TAPIOKA',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 3,
    usedStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 3,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 3 KG (02 Nov) -> Keluar masak 3 KG (03 Nov)',
  },
  {
    id: 'b2-04',
    sku: 'BGN-BHK-011',
    name: 'SAUCE TIRAM',
    category: 'Bahan Kering',
    uom: 'L',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1,
    usedStock: 1,
    minStockAlert: 0.5,
    dailyUsageAvg: 1,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1 L (02 Nov) -> Keluar masak 1 L (03 Nov)',
  },
  {
    id: 'b2-05',
    sku: 'BGN-BHK-003B',
    name: 'MINYAK GORENG',
    category: 'Bahan Kering',
    uom: 'L',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 36,
    usedStock: 36,
    minStockAlert: 10,
    dailyUsageAvg: 36,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 36 L (02 Nov) -> Keluar masak 36 L (03 Nov)',
  },
  {
    id: 'b2-06',
    sku: 'BGN-BHK-012',
    name: 'KECAP MANIS',
    category: 'Bahan Kering',
    uom: 'L',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1,
    usedStock: 1,
    minStockAlert: 0.5,
    dailyUsageAvg: 1,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1 L (02 Nov) -> Keluar masak 1 L (03 Nov)',
  },
  {
    id: 'b2-07',
    sku: 'BGN-RMP-001B',
    name: 'LADA BUBUK',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 0.2,
    usedStock: 0.2,
    minStockAlert: 0.05,
    dailyUsageAvg: 0.2,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 0.2 KG (02 Nov) -> Keluar masak 0.2 KG (03 Nov)',
  },
  {
    id: 'b2-08',
    sku: 'BGN-RMP-002B',
    name: 'BAWANG PUTIH',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 2,
    usedStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 2,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 2 KG (02 Nov) -> Keluar masak 2 KG (03 Nov)',
  },
  {
    id: 'b2-09',
    sku: 'BGN-RMP-003',
    name: 'BAWANG MERAH',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1,
    usedStock: 1,
    minStockAlert: 0.5,
    dailyUsageAvg: 1,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1 KG (02 Nov) -> Keluar masak 1 KG (03 Nov)',
  },
  {
    id: 'b2-10',
    sku: 'BGN-PRH-003',
    name: 'AYAM GILING',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 60,
    usedStock: 60,
    minStockAlert: 15,
    dailyUsageAvg: 60,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 60 KG (02 Nov) -> Keluar masak 60 KG (03 Nov)',
  },
  {
    id: 'b2-11',
    sku: 'BGN-PRH-002B',
    name: 'TELUR AYAM',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 3,
    usedStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 3,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 3 KG (02 Nov) -> Keluar masak 3 KG (03 Nov)',
  },
  {
    id: 'b2-12',
    sku: 'BGN-PRN-002',
    name: 'TAHU KUNING',
    category: 'Protein Nabati',
    uom: 'PCS',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1600,
    usedStock: 1600,
    minStockAlert: 200,
    dailyUsageAvg: 1600,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1.600 PCS (02 Nov) -> Keluar masak 1.600 PCS (03 Nov)',
  },
  {
    id: 'b2-13',
    sku: 'BGN-SYR-003',
    name: 'WORTEL',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 33,
    usedStock: 33,
    minStockAlert: 10,
    dailyUsageAvg: 33,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 33 KG (02 Nov) -> Keluar masak 33 KG (03 Nov)',
  },
  {
    id: 'b2-14',
    sku: 'BGN-SYR-004',
    name: 'DAUN BAWANG',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 4,
    usedStock: 4,
    minStockAlert: 1,
    dailyUsageAvg: 4,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 4 KG (02 Nov) -> Keluar masak 4 KG (03 Nov)',
  },
  {
    id: 'b2-15',
    sku: 'BGN-SYR-005',
    name: 'KEMBANG KOL',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 35,
    usedStock: 35,
    minStockAlert: 10,
    dailyUsageAvg: 35,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 35 KG (02 Nov) -> Keluar masak 35 KG (03 Nov)',
  },
  {
    id: 'b2-16',
    sku: 'BGN-BUH-002',
    name: 'JERUK MANIS',
    category: 'Buah',
    uom: 'PCS',
    storageLocation: 'Gudang Basah',
    currentStock: 0,
    initialStock: 1600,
    usedStock: 1600,
    minStockAlert: 200,
    dailyUsageAvg: 1600,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1.600 PCS (02 Nov) -> Keluar 1.600 PCS (03 Nov)',
  },
  {
    id: 'b2-17',
    sku: 'BGN-LNY-001',
    name: 'KULIT TAHU UK. 15 X 15',
    category: 'Lainnya',
    uom: 'PCS',
    storageLocation: 'Gudang Kering',
    currentStock: 0,
    initialStock: 1600,
    usedStock: 1600,
    minStockAlert: 200,
    dailyUsageAvg: 1600,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-02',
    lastUsageDate: '2026-11-03',
    batch: '02-NOV',
    notes: 'Batch 2: Masuk 1.600 PCS (02 Nov) -> Keluar masak 1.600 PCS (03 Nov)',
  },
];

// BATCH 3: 18 Bahan Masuk 03 Nov 2026 -> Keluar Masak 04 Nov 2026
// Menu: Kentang Goreng, Telur Katsu, Edamame, Tumis Pakcoy Jagung, Kelengkeng, Sauce Asam Manis
export const BATCH_3_ITEMS: StockItem[] = [
  { id: 'b3-01', sku: 'BGN-BHK-301', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 2, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 5 KG (03 Nov) -> Keluar masak 5 KG (04 Nov)' },
  { id: 'b3-02', sku: 'BGN-BHK-302', name: 'TEPUNG PANIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 20 KG (03 Nov) -> Keluar masak 20 KG (04 Nov)' },
  { id: 'b3-03', sku: 'BGN-BHK-303', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 10, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 36 L (03 Nov) -> Keluar masak 36 L (04 Nov)' },
  { id: 'b3-04', sku: 'BGN-BHK-304', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 3 KG (03 Nov) -> Keluar masak 3 KG (04 Nov)' },
  { id: 'b3-05', sku: 'BGN-BHK-305', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 2 KG (03 Nov) -> Keluar masak 2 KG (04 Nov)' },
  { id: 'b3-06', sku: 'BGN-BHK-306', name: 'SAUCE TOMAT', category: 'Bahan Kering', uom: 'JIR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 1 JIR (03 Nov) -> Keluar masak 1 JIR (04 Nov)' },
  { id: 'b3-07', sku: 'BGN-BHK-307', name: 'TEPUNG MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 2 KG (03 Nov) -> Keluar masak 2 KG (04 Nov)' },
  { id: 'b3-08', sku: 'BGN-RMP-301', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 1 KG (03 Nov) -> Keluar masak 1 KG (04 Nov)' },
  { id: 'b3-09', sku: 'BGN-RMP-302', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 1 KG (03 Nov) -> Keluar masak 1 KG (04 Nov)' },
  { id: 'b3-10', sku: 'BGN-PRH-301', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 100 KG (03 Nov) -> Keluar masak 100 KG (04 Nov) untuk Telur Katsu' },
  { id: 'b3-11', sku: 'BGN-PRN-301', name: 'EDAMAME', category: 'Protein Nabati', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 30 KG (03 Nov) -> Keluar masak 30 KG (04 Nov)' },
  { id: 'b3-12', sku: 'BGN-SYR-301', name: 'KENTANG LOKAL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 170, usedStock: 170, minStockAlert: 40, dailyUsageAvg: 170, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 170 KG (03 Nov) -> Keluar masak 170 KG (04 Nov) Kentang Goreng' },
  { id: 'b3-13', sku: 'BGN-SYR-302', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 2 KG (03 Nov) -> Keluar masak 2 KG (04 Nov)' },
  { id: 'b3-14', sku: 'BGN-SYR-303', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 3 KG (03 Nov) -> Keluar masak 3 KG (04 Nov)' },
  { id: 'b3-15', sku: 'BGN-SYR-304', name: 'PAKCOY', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 30 KG (03 Nov) -> Keluar masak 30 KG (04 Nov)' },
  { id: 'b3-16', sku: 'BGN-SYR-305', name: 'JAGUNG PIPIL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 30 KG (03 Nov) -> Keluar masak 30 KG (04 Nov)' },
  { id: 'b3-17', sku: 'BGN-SYR-306', name: 'TOMAT MERAH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 2, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 5 KG (03 Nov) -> Keluar masak 5 KG (04 Nov)' },
  { id: 'b3-18', sku: 'BGN-BUH-301', name: 'KELENGKENG', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 6, usedStock: 6, minStockAlert: 2, dailyUsageAvg: 6, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-03', lastUsageDate: '2026-11-04', batch: '03-NOV', notes: 'Batch 3: Masuk 6 KRAT (03 Nov) -> Keluar 6 KRAT (04 Nov) buah segar' },
];

// BATCH 4: 20 Bahan Masuk 04 Nov 2026 -> Keluar Masak 05 Nov 2026
// Menu: Nasi Putih, Bistik Ayam, Tempe Goreng, Buncis Wortel Steamed, Anggur Merah
export const BATCH_4_ITEMS: StockItem[] = [
  { id: 'b4-01', sku: 'BGN-BHK-401', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 100 KG (04 Nov) -> Keluar masak 100 KG (05 Nov)' },
  { id: 'b4-02', sku: 'BGN-BHK-402', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 23, usedStock: 23, minStockAlert: 6, dailyUsageAvg: 23, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 23 KG (04 Nov) -> Keluar masak 23 KG (05 Nov)' },
  { id: 'b4-03', sku: 'BGN-BHK-403', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 3 KG (04 Nov) -> Keluar masak 3 KG (05 Nov)' },
  { id: 'b4-04', sku: 'BGN-BHK-404', name: 'SAUCE TOMAT', category: 'Bahan Kering', uom: 'JIR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 1 JIR (04 Nov) -> Keluar masak 1 JIR (05 Nov)' },
  { id: 'b4-05', sku: 'BGN-BHK-405', name: 'SAUCE SAMBAL', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 L (04 Nov) -> Keluar masak 2 L (05 Nov)' },
  { id: 'b4-06', sku: 'BGN-BHK-406', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 KG (04 Nov) -> Keluar masak 2 KG (05 Nov)' },
  { id: 'b4-07', sku: 'BGN-BHK-407', name: 'TEPUNG MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 KG (04 Nov) -> Keluar masak 2 KG (05 Nov)' },
  { id: 'b4-08', sku: 'BGN-BHK-408', name: 'SAUCE INGGRIS', category: 'Bahan Kering', uom: 'BOTOL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 1 BOTOL (04 Nov) -> Keluar masak 1 BOTOL (05 Nov)' },
  { id: 'b4-09', sku: 'BGN-BHK-409', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 L (04 Nov) -> Keluar masak 2 L (05 Nov)' },
  { id: 'b4-10', sku: 'BGN-BHK-410', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 10, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 36 L (04 Nov) -> Keluar masak 36 L (05 Nov)' },
  { id: 'b4-11', sku: 'BGN-BHK-411', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 KG (04 Nov) -> Keluar masak 2 KG (05 Nov)' },
  { id: 'b4-12', sku: 'BGN-RMP-401', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 1 KG (04 Nov) -> Keluar masak 1 KG (05 Nov)' },
  { id: 'b4-13', sku: 'BGN-RMP-402', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 2 KG (04 Nov) -> Keluar masak 2 KG (05 Nov)' },
  { id: 'b4-14', sku: 'BGN-PRH-401', name: 'AYAM DADA FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 63 KG (04 Nov) -> Keluar masak 63 KG (05 Nov) Bistik Ayam' },
  { id: 'b4-15', sku: 'BGN-PRH-402', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 3 KG (04 Nov) -> Keluar masak 3 KG (05 Nov)' },
  { id: 'b4-16', sku: 'BGN-PRN-401', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 80 PAPAN (04 Nov) -> Keluar masak 80 PAPAN (05 Nov)' },
  { id: 'b4-17', sku: 'BGN-SYR-401', name: 'BUNCIS', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 35, usedStock: 35, minStockAlert: 10, dailyUsageAvg: 35, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 35 KG (04 Nov) -> Keluar masak 35 KG (05 Nov)' },
  { id: 'b4-18', sku: 'BGN-SYR-402', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 30 KG (04 Nov) -> Keluar masak 30 KG (05 Nov)' },
  { id: 'b4-19', sku: 'BGN-SYR-403', name: 'TOMAT MERAH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 2, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 5 KG (04 Nov) -> Keluar masak 5 KG (05 Nov)' },
  { id: 'b4-20', sku: 'BGN-BUH-401', name: 'ANGGUR MERAH', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 11, usedStock: 11, minStockAlert: 3, dailyUsageAvg: 11, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-04', lastUsageDate: '2026-11-05', batch: '04-NOV', notes: 'Batch 4: Masuk 11 KRAT (04 Nov) -> Keluar 11 KRAT (05 Nov) buah segar' },
];

// BATCH 5: 22 Bahan Masuk 05 Nov 2026 -> Keluar Masak 06 Nov 2026
// Menu: Nasi putih, Mongolian Chicken, Tahu Goreng Marinasi, Sayur Orak Arik, Kurma
export const BATCH_5_ITEMS: StockItem[] = [
  { id: 'b5-01', sku: 'BGN-BHK-501', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 100 KG (05 Nov) -> Keluar masak 100 KG (06 Nov)' },
  { id: 'b5-02', sku: 'BGN-BHK-502', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 15, usedStock: 15, minStockAlert: 5, dailyUsageAvg: 15, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 15 KG (05 Nov) -> Keluar masak 15 KG (06 Nov)' },
  { id: 'b5-03', sku: 'BGN-BHK-503', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 3 KG (05 Nov) -> Keluar masak 3 KG (06 Nov)' },
  { id: 'b5-04', sku: 'BGN-BHK-504', name: 'KECAP ASIN', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 3 BTL (05 Nov) -> Keluar masak 3 BTL (06 Nov)' },
  { id: 'b5-05', sku: 'BGN-BHK-505', name: 'SAUCE TIRAM', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 1 L (05 Nov) -> Keluar masak 1 L (06 Nov)' },
  { id: 'b5-06', sku: 'BGN-BHK-506', name: 'BROWN SUGAR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2 KG (05 Nov) -> Keluar masak 2 KG (06 Nov)' },
  { id: 'b5-07', sku: 'BGN-BHK-507', name: 'MINYAK WIJEN', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 1 BTL (05 Nov) -> Keluar masak 1 BTL (06 Nov)' },
  { id: 'b5-08', sku: 'BGN-BHK-508', name: 'TEPUNG MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2 KG (05 Nov) -> Keluar masak 2 KG (06 Nov)' },
  { id: 'b5-09', sku: 'BGN-BHK-509', name: 'WIJEN', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 0.1 KG (05 Nov) -> Keluar masak 0.1 KG (06 Nov)' },
  { id: 'b5-10', sku: 'BGN-BHK-510', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 15, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 54 L (05 Nov) -> Keluar masak 54 L (06 Nov)' },
  { id: 'b5-11', sku: 'BGN-BHK-511', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 1 L (05 Nov) -> Keluar masak 1 L (06 Nov)' },
  { id: 'b5-12', sku: 'BGN-BHK-512', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.25, usedStock: 0.25, minStockAlert: 0.1, dailyUsageAvg: 0.25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 0.25 KG (05 Nov) -> Keluar masak 0.25 KG (06 Nov)' },
  { id: 'b5-13', sku: 'BGN-RMP-501', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2 KG (05 Nov) -> Keluar masak 2 KG (06 Nov)' },
  { id: 'b5-14', sku: 'BGN-RMP-502', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2 KG (05 Nov) -> Keluar masak 2 KG (06 Nov)' },
  { id: 'b5-15', sku: 'BGN-RMP-503', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.05, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 0.2 KG (05 Nov) -> Keluar masak 0.2 KG (06 Nov)' },
  { id: 'b5-16', sku: 'BGN-RMP-504', name: 'JAHE', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 1 KG (05 Nov) -> Keluar masak 1 KG (06 Nov)' },
  { id: 'b5-17', sku: 'BGN-PRH-501', name: 'AYAM FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 50, usedStock: 50, minStockAlert: 15, dailyUsageAvg: 50, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 50 KG (05 Nov) -> Keluar masak 50 KG (06 Nov) Mongolian Chicken' },
  { id: 'b5-18', sku: 'BGN-PRH-502', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2 KG (05 Nov) -> Keluar masak 2 KG (06 Nov)' },
  { id: 'b5-19', sku: 'BGN-PRN-501', name: 'TAHU KUNING', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1253, usedStock: 1253, minStockAlert: 200, dailyUsageAvg: 1253, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 1.253 PCS (05 Nov) -> Keluar masak 1.253 PCS (06 Nov) Tahu Goreng Marinasi' },
  { id: 'b5-20', sku: 'BGN-SYR-501', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 25, usedStock: 25, minStockAlert: 8, dailyUsageAvg: 25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 25 KG (05 Nov) -> Keluar masak 25 KG (06 Nov) Orak Arik' },
  { id: 'b5-21', sku: 'BGN-SYR-502', name: 'KUBIS / KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 25, usedStock: 25, minStockAlert: 8, dailyUsageAvg: 25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 25 KG (05 Nov) -> Keluar masak 25 KG (06 Nov) Orak Arik' },
  { id: 'b5-22', sku: 'BGN-BUH-501', name: 'KURMA', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2980, usedStock: 2980, minStockAlert: 500, dailyUsageAvg: 2980, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-05', lastUsageDate: '2026-11-06', batch: '05-NOV', notes: 'Batch 5: Masuk 2.980 PCS (05 Nov) -> Keluar 2.980 PCS (06 Nov) buah kurma' },
];

// BATCH 6: 14 Bahan Masuk 08 Nov 2026 -> Keluar Masak 09 Nov 2026
// Menu: Nasi putih, Nugget Ayam, Edamame, Tumis Brokoli dan Wortel, Jeruk
export const BATCH_6_ITEMS: StockItem[] = [
  { id: 'b6-01', sku: 'BGN-BHK-601', name: 'TEPUNG TAPIOKA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 3 KG (08 Nov) -> Keluar masak 3 KG (09 Nov)' },
  { id: 'b6-02', sku: 'BGN-BHK-602', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 2 KG (08 Nov) -> Keluar masak 2 KG (09 Nov)' },
  { id: 'b6-03', sku: 'BGN-BHK-603', name: 'TEPUNG PANIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 15, usedStock: 15, minStockAlert: 5, dailyUsageAvg: 15, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 15 KG (08 Nov) -> Keluar masak 15 KG (09 Nov)' },
  { id: 'b6-04', sku: 'BGN-BHK-604', name: 'SAUCE TIRAM', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 1 BTL (08 Nov) -> Keluar masak 1 BTL (09 Nov)' },
  { id: 'b6-05', sku: 'BGN-BHK-605', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 10, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 36 L (08 Nov) -> Keluar masak 36 L (09 Nov)' },
  { id: 'b6-06', sku: 'BGN-BHK-606', name: 'MAYONAICE', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 10, usedStock: 10, minStockAlert: 3, dailyUsageAvg: 10, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 10 KG (08 Nov) -> Keluar masak 10 KG (09 Nov) Nugget Ayam' },
  { id: 'b6-07', sku: 'BGN-RMP-601', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 1 KG (08 Nov) -> Keluar masak 1 KG (09 Nov)' },
  { id: 'b6-08', sku: 'BGN-PRH-601', name: 'AYAM GILING', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 60, usedStock: 60, minStockAlert: 15, dailyUsageAvg: 60, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 60 KG (08 Nov) -> Keluar masak 60 KG (09 Nov) Nugget Ayam' },
  { id: 'b6-09', sku: 'BGN-PRH-602', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 3 KG (08 Nov) -> Keluar masak 3 KG (09 Nov) Adonan Nugget' },
  { id: 'b6-10', sku: 'BGN-PRN-601', name: 'EDAMAME', category: 'Protein Nabati', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 30 KG (08 Nov) -> Keluar masak 30 KG (09 Nov)' },
  { id: 'b6-11', sku: 'BGN-SYR-601', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 35, usedStock: 35, minStockAlert: 8, dailyUsageAvg: 35, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 35 KG (08 Nov) -> Keluar masak 35 KG (09 Nov) Tumis Brokoli Wortel' },
  { id: 'b6-12', sku: 'BGN-SYR-602', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 1 KG (08 Nov) -> Keluar masak 1 KG (09 Nov)' },
  { id: 'b6-13', sku: 'BGN-SYR-603', name: 'BROKOLI', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 30 KG (08 Nov) -> Keluar masak 30 KG (09 Nov) Tumis Brokoli Wortel' },
  { id: 'b6-14', sku: 'BGN-BUH-601', name: 'JERUK', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 400, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-08', lastUsageDate: '2026-11-09', batch: '06-NOV', notes: 'Batch 6: Masuk 1.600 PCS (08 Nov) -> Keluar 1.600 PCS (09 Nov) buah segar' },
];

// BATCH 7: 15 Bahan Masuk 09 Nov 2026 -> Keluar Masak 10 Nov 2026
// Menu: Nasi putih, Telur Fuyunghai, Martabak Tahu, Tumis Buncis Kol, Anggur
export const BATCH_7_ITEMS: StockItem[] = [
  { id: 'b7-01', sku: 'BGN-BHK-701', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 100 KG (09 Nov) -> Keluar masak 100 KG (10 Nov)' },
  { id: 'b7-02', sku: 'BGN-BHK-702', name: 'TEPUNG TAPIOKA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 2, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 5 KG (09 Nov) -> Keluar masak 5 KG (10 Nov)' },
  { id: 'b7-03', sku: 'BGN-BHK-703', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 34, usedStock: 34, minStockAlert: 10, dailyUsageAvg: 34, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 34 L (09 Nov) -> Keluar masak 34 L (10 Nov)' },
  { id: 'b7-04', sku: 'BGN-BHK-704', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 3 KG (09 Nov) -> Keluar masak 3 KG (10 Nov)' },
  { id: 'b7-05', sku: 'BGN-RMP-701', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.4, usedStock: 0.4, minStockAlert: 0.1, dailyUsageAvg: 0.4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 0.4 KG (09 Nov) -> Keluar masak 0.4 KG (10 Nov)' },
  { id: 'b7-06', sku: 'BGN-RMP-702', name: 'BAWANG MERAH GORENG', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.2, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 0.5 KG (09 Nov) -> Keluar masak 0.5 KG (10 Nov)' },
  { id: 'b7-07', sku: 'BGN-RMP-703', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 2 KG (09 Nov) -> Keluar masak 2 KG (10 Nov)' },
  { id: 'b7-08', sku: 'BGN-PRH-701', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 115, usedStock: 115, minStockAlert: 30, dailyUsageAvg: 115, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 115 KG (09 Nov) -> Keluar masak 115 KG (10 Nov) untuk Telur Fuyunghai' },
  { id: 'b7-09', sku: 'BGN-PRN-701', name: 'TAHU PUTIH', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 200, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 1.600 PCS (09 Nov) -> Keluar masak 1.600 PCS (10 Nov) untuk Martabak Tahu' },
  { id: 'b7-10', sku: 'BGN-SYR-701', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 4 KG (09 Nov) -> Keluar masak 4 KG (10 Nov)' },
  { id: 'b7-11', sku: 'BGN-SYR-702', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 10, usedStock: 10, minStockAlert: 3, dailyUsageAvg: 10, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 10 KG (09 Nov) -> Keluar masak 10 KG (10 Nov)' },
  { id: 'b7-12', sku: 'BGN-SYR-703', name: 'BUNCIS', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 30 KG (09 Nov) -> Keluar masak 30 KG (10 Nov) untuk Tumis Buncis Kol' },
  { id: 'b7-13', sku: 'BGN-SYR-704', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 35, usedStock: 35, minStockAlert: 10, dailyUsageAvg: 35, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 35 KG (09 Nov) -> Keluar masak 35 KG (10 Nov) untuk Tumis Buncis Kol' },
  { id: 'b7-14', sku: 'BGN-BUH-701', name: 'ANGGUR MERAH', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 11, usedStock: 11, minStockAlert: 3, dailyUsageAvg: 11, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 11 KRAT (09 Nov) -> Keluar 11 KRAT (10 Nov) buah segar' },
  { id: 'b7-15', sku: 'BGN-LNY-701', name: 'KULIT MARTABAK', category: 'Lainnya', uom: 'LEMBAR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 200, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-09', lastUsageDate: '2026-11-10', batch: '07-NOV', notes: 'Batch 7: Masuk 1.600 LEMBAR (09 Nov) -> Keluar masak 1.600 LEMBAR (10 Nov) untuk Martabak Tahu' },
];

// Gabungan Semua Item Master Bahan Baku (7 Batch = 122 Item)
export const DEFAULT_STOCK_ITEMS_ALL: StockItem[] = [...BATCH_7_ITEMS, ...BATCH_6_ITEMS, ...BATCH_5_ITEMS, ...BATCH_4_ITEMS, ...BATCH_3_ITEMS, ...BATCH_2_ITEMS, ...BATCH_1_ITEMS];

// Register Mutasi Lengkap (7 Siklus):
// B1: 16 Masuk (01 Nov) + 16 Keluar (02 Nov) = 32
// B2: 17 Masuk (02 Nov) + 17 Keluar (03 Nov) = 34
// B3: 18 Masuk (03 Nov) + 18 Keluar (04 Nov) = 36
// B4: 20 Masuk (04 Nov) + 20 Keluar (05 Nov) = 40
// B5: 22 Masuk (05 Nov) + 22 Keluar (06 Nov) = 44
// B6: 14 Masuk (08 Nov) + 14 Keluar (09 Nov) = 28
// B7: 15 Masuk (09 Nov) + 15 Keluar (10 Nov) = 30
export const DEFAULT_STOCK_MOVEMENTS: StockMovement[] = [
  // --- 15 KELUAR MASAK BATCH 7 (10 NOV 2026) ---
  ...BATCH_7_ITEMS.map((item, idx) => ({
    id: `mov-20261110-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-10',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261110',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 7: Pemakaian masak 1.553 Porsi MBG tgl 10 Nov 2026 (Nasi Putih, Telur Fuyunghai, Martabak Tahu, Tumis Buncis Kol, Anggur)',
  })),

  // --- 15 MASUK BATCH 7 (09 NOV 2026) ---
  ...BATCH_7_ITEMS.map((item, idx) => ({
    id: `mov-20261109-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-09',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261109-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 7: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 09 Nov 2026`,
  })),

  // --- 14 KELUAR MASAK BATCH 6 (09 NOV 2026) ---
  ...BATCH_6_ITEMS.map((item, idx) => ({
    id: `mov-20261109-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-09',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261109',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 6: Pemakaian masak 1.553 Porsi MBG tgl 09 Nov 2026 (Nasi Putih, Nugget Ayam, Edamame, Tumis Brokoli dan Wortel, Jeruk)',
  })),

  // --- 14 MASUK BATCH 6 (08 NOV 2026) ---
  ...BATCH_6_ITEMS.map((item, idx) => ({
    id: `mov-20261108-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-08',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261108-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 6: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 08 Nov 2026`,
  })),

  // --- 22 KELUAR MASAK BATCH 5 (06 NOV 2026) ---
  ...BATCH_5_ITEMS.map((item, idx) => ({
    id: `mov-20261106-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-06',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261106',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 5: Pemakaian masak 1.553 Porsi MBG tgl 06 Nov 2026 (Mongolian Chicken, Tahu Goreng Marinasi, Sayur Orak Arik, Kurma)',
  })),

  // --- 22 MASUK BATCH 5 (05 NOV 2026) ---
  ...BATCH_5_ITEMS.map((item, idx) => ({
    id: `mov-20261105-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-05',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261105-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 5: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 05 Nov 2026`,
  })),

  // --- 20 KELUAR MASAK BATCH 4 (05 NOV 2026) ---
  ...BATCH_4_ITEMS.map((item, idx) => ({
    id: `mov-20261105-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-05',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261105',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 4: Pemakaian masak 1.553 Porsi MBG tgl 05 Nov 2026 (Bistik Ayam, Tempe Goreng, Buncis Wortel Steamed, Anggur Merah)',
  })),

  // --- 20 MASUK BATCH 4 (04 NOV 2026) ---
  ...BATCH_4_ITEMS.map((item, idx) => ({
    id: `mov-20261104-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-04',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261104-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 4: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 04 Nov 2026`,
  })),

  // --- 18 KELUAR MASAK BATCH 3 (04 NOV 2026) ---
  ...BATCH_3_ITEMS.map((item, idx) => ({
    id: `mov-20261104-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-04',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261104',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 3: Pemakaian masak 1.553 Porsi MBG tgl 04 Nov 2026 (Kentang Goreng, Telur Katsu, Edamame, Tumis Pakcoy Jagung, Kelengkeng)',
  })),

  // --- 18 MASUK BATCH 3 (03 NOV 2026) ---
  ...BATCH_3_ITEMS.map((item, idx) => ({
    id: `mov-20261103-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-03',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261103-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 3: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 03 Nov 2026`,
  })),

  // --- 17 KELUAR MASAK BATCH 2 (03 NOV 2026) ---
  ...BATCH_2_ITEMS.map((item, idx) => ({
    id: `mov-20261103-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-03',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261103',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 2: Pemakaian masak 1.553 Porsi MBG tgl 03 Nov 2026 (Rolade Ayam Kulit Tahu, Tahu Kuning, Sup Kembang Kol, Jeruk Manis)',
  })),

  // --- 17 MASUK BATCH 2 (02 NOV 2026) ---
  ...BATCH_2_ITEMS.map((item, idx) => ({
    id: `mov-20261102-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-02',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261102-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 2: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 02 Nov 2026`,
  })),

  // --- 16 KELUAR MASAK BATCH 1 (02 NOV 2026) ---
  ...BATCH_1_ITEMS.map((item, idx) => ({
    id: `mov-20261102-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-02',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261102',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 1: Pemakaian masak 1.553 Porsi MBG tgl 02 Nov 2026 (Dorry Fillet Crispy Mayo, Tempe, Sayur Buncis Labu Siam, Anggur)',
  })),

  // --- 16 MASUK BATCH 1 (01 NOV 2026) ---
  ...BATCH_1_ITEMS.map((item, idx) => ({
    id: `mov-20261101-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-01',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261101-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 1: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 01 Nov 2026`,
  })),
];

// Helper status buffer
export function calculateStockStatus(item: StockItem): StockStatus {
  if (item.currentStock === 0) return 'critical';
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

// Storage Accessors (Safe for SSR)
export function loadStockFromStorage(): StockItem[] {
  if (typeof window === 'undefined') return DEFAULT_STOCK_ITEMS_ALL;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_INVENTORY_KEY);
    if (!raw) {
      saveStockToStorage(DEFAULT_STOCK_ITEMS_ALL);
      return DEFAULT_STOCK_ITEMS_ALL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-merge batch baru atau perbaikan nama bahan (Brokoli -> Buncis)
      const existingIds = new Set(parsed.map((item: StockItem) => item.id));
      const hasMissing = DEFAULT_STOCK_ITEMS_ALL.some((item) => !existingIds.has(item.id));
      const hasBrokoliOld = parsed.some((item: StockItem) => item.id === 'b4-17' && item.name === 'BROKOLI');
      if (hasMissing || hasBrokoliOld) {
        const merged = DEFAULT_STOCK_ITEMS_ALL.map((def) => {
          const found = parsed.find((p: StockItem) => p.id === def.id);
          if (!found) return def;
          if (def.id === 'b1-11' && found.initialStock === 65) return def; // Update Dorry 65 -> 90 KG per RKB
          if (def.id === 'b4-17' && found.name === 'BROKOLI') return def; // Update Brokoli -> Buncis per instruksi Tuan
          return found;
        });
        saveStockToStorage(merged);
        return merged;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stock from localStorage:', err);
  }
  return DEFAULT_STOCK_ITEMS_ALL;
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
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Auto-merge riwayat mutasi batch baru bila belum tersimpan di klien
      const existingIds = new Set(parsed.map((m: StockMovement) => m.id));
      const missing = DEFAULT_STOCK_MOVEMENTS.filter((m) => !existingIds.has(m.id));
      if (missing.length > 0) {
        const merged = [...missing, ...parsed];
        saveMovementsToStorage(merged);
        return merged;
      }
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

// Rekapitulasi kuantitas fisik
export function calculateStockSummary(items: StockItem[]): StockSummary {
  let totalKgMasuk = 0;
  let totalQtyNonKgMasuk = 0;
  let totalKgKeluar = 0;
  let totalQtyNonKgKeluar = 0;
  let currentKgSisa = 0;
  let currentQtyNonKgSisa = 0;
  let gudangBasahCount = 0;
  let gudangKeringCount = 0;
  let safeCount = 0;
  let warningCount = 0;
  let criticalCount = 0;

  const categoryCounts: Record<StockCategory, number> = {
    'Bahan Kering': 0,
    Rempah: 0,
    'Protein Hewani': 0,
    'Protein Nabati': 0,
    Sayur: 0,
    Buah: 0,
    Lainnya: 0,
  };

  items.forEach((item) => {
    const isKg = item.uom.toUpperCase() === 'KG';
    if (isKg) {
      totalKgMasuk += item.initialStock;
      totalKgKeluar += item.usedStock;
      currentKgSisa += item.currentStock;
    } else {
      totalQtyNonKgMasuk += item.initialStock;
      totalQtyNonKgKeluar += item.usedStock;
      currentQtyNonKgSisa += item.currentStock;
    }

    if (item.storageLocation === 'Gudang Basah') {
      gudangBasahCount++;
    } else {
      gudangKeringCount++;
    }

    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;

    const status = calculateStockStatus(item);
    if (status === 'critical') criticalCount++;
    else if (status === 'warning') warningCount++;
    else safeCount++;
  });

  return {
    totalItems: items.length,
    totalKgMasuk: Number(totalKgMasuk.toFixed(2)),
    totalQtyNonKgMasuk: Number(totalQtyNonKgMasuk.toFixed(2)),
    totalKgKeluar: Number(totalKgKeluar.toFixed(2)),
    totalQtyNonKgKeluar: Number(totalQtyNonKgKeluar.toFixed(2)),
    currentKgSisa: Number(currentKgSisa.toFixed(2)),
    currentQtyNonKgSisa: Number(currentQtyNonKgSisa.toFixed(2)),
    gudangBasahCount,
    gudangKeringCount,
    safeCount,
    warningCount,
    criticalCount,
    categoryCounts,
  };
}

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
    'Batch',
    'Golongan / Kategori',
    'Nama Bahan Makanan',
    'Lokasi Simpan',
    'Kuantitas Masuk',
    'Kuantitas Masak Keluar',
    'Sisa Stok Fisik',
    'Satuan',
    'Tanggal Masuk',
    'Tanggal Masak',
    'Suplier / Vendor',
  ];

  const rows = items.map((item) => {
    return [
      `"${item.sku}"`,
      `"${item.batch}"`,
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.storageLocation}"`,
      item.initialStock,
      item.usedStock,
      item.currentStock,
      `"${item.uom}"`,
      `"${item.lastRestockDate}"`,
      `"${item.lastUsageDate}"`,
      `"${item.supplierName.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Export CSV Mutasi
export function generateMovementsCSV(movements: StockMovement[]): string {
  const headers = [
    'ID Log',
    'Tanggal',
    'Jam',
    'Jenis Mutasi',
    'Nama Bahan Makanan',
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
        ? `MASUK (${m.date.slice(5)})`
        : m.type === 'OUT'
        ? `KELUAR MASAK (${m.date.slice(5)})`
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
    notes: 'Kondisi fisik kemasan baik / habis terpakai',
  }));
}

export function loadOpnameDraftFromStorage(items: StockItem[]): OpnameSession {
  const defaultSession: OpnameSession = {
    id: `OPN-${new Date().toISOString().slice(0, 10)}`,
    date: new Date().toISOString().slice(0, 10),
    title: 'Audit Fisik Berkala Stok Bahan Baku SPPG Wonodri 3',
    checkerName: 'Nur Khafidin (Petugas Timbangan)',
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
      // Update nama bahan jika ada perubahan master (Brokoli -> Buncis)
      let needsOpnameUpdate = false;
      const updatedRows = parsed.rows.map((row: OpnameRow) => {
        if (row.itemId === 'b4-17' && row.name === 'BROKOLI') {
          needsOpnameUpdate = true;
          return { ...row, name: 'BUNCIS' };
        }
        return row;
      });

      if (parsed.rows.length < items.length) {
        needsOpnameUpdate = true;
        const existingRowIds = new Set(parsed.rows.map((r: OpnameRow) => r.itemId));
        const missingRows = items
          .filter((item) => !existingRowIds.has(item.id))
          .map((item) => ({
            itemId: item.id,
            sku: item.sku,
            name: item.name,
            category: item.category,
            storageLocation: item.storageLocation,
            uom: item.uom,
            systemQty: item.currentStock,
            physicalQty: item.currentStock,
            notes: 'Kondisi fisik kemasan baik / habis terpakai',
          }));
        updatedRows.push(...missingRows);
      }

      if (needsOpnameUpdate) {
        const updatedSession = { ...parsed, rows: updatedRows };
        saveOpnameDraftToStorage(updatedSession);
        return updatedSession;
      }
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
    'Golongan / Kategori',
    'Nama Bahan Makanan',
    'Lokasi Simpan',
    'Satuan',
    'Stok Sistem',
    'Stok Fisik Aktual',
    'Selisih (+/-)',
    'Status Kecocokan',
    'Catatan Pemeriksaan',
  ];

  const rows = session.rows.map((row, idx) => {
    const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
    const statusText = diff === 0 ? 'SESUAI (KLOP)' : diff > 0 ? 'LEBIH (+)' : 'KURANG (-)';

    return [
      idx + 1,
      `"${row.sku}"`,
      `"${row.category}"`,
      `"${row.name.replace(/"/g, '""')}"`,
      `"${row.storageLocation}"`,
      `"${row.uom}"`,
      row.systemQty,
      row.physicalQty,
      diff,
      `"${statusText}"`,
      `"${(row.notes || '-').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
