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
  batch: '01-NOV' | '02-NOV' | 'ALL';
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

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v9';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v9';
export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v9';

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
    initialStock: 65,
    usedStock: 65,
    minStockAlert: 20,
    dailyUsageAvg: 65,
    supplierName: SUPPLIER_YAYASAN,
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    batch: '01-NOV',
    notes: 'Batch 1: Masuk 65 KG (01 Nov) -> Keluar masak 65 KG (02 Nov) lauk hewani',
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

// Gabungan 33 Item Master Bahan Baku
export const DEFAULT_STOCK_ITEMS_ALL: StockItem[] = [...BATCH_2_ITEMS, ...BATCH_1_ITEMS];

// Register 66 Mutasi Lengkap:
// 16 Masuk (01 Nov) + 16 Keluar Masak (02 Nov) + 17 Masuk (02 Nov) + 17 Keluar Masak (03 Nov)
export const DEFAULT_STOCK_MOVEMENTS_66: StockMovement[] = [
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
  if (typeof window === 'undefined') return DEFAULT_STOCK_MOVEMENTS_66;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY);
    if (!raw) {
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS_66);
      return DEFAULT_STOCK_MOVEMENTS_66;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load movements from localStorage:', err);
  }
  return DEFAULT_STOCK_MOVEMENTS_66;
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
