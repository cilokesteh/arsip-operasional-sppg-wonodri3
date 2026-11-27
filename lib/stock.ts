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
  batch: '01-NOV' | '02-NOV' | '03-NOV' | '04-NOV' | '05-NOV' | '06-NOV' | '07-NOV' | '08-NOV' | '09-NOV' | '10-NOV' | '11-NOV' | '12-NOV' | '13-NOV' | '14-NOV' | '15-NOV' | '16-NOV' | '17-NOV' | '18-NOV' | '19-NOV' | '20-NOV' | 'ALL' | (string & {});
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

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v23';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v24';
export const LEGACY_ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v23';
export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v23';

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

// BATCH 8: 18 Bahan Masuk 10 Nov 2026 -> Keluar Masak 11 Nov 2026
// Menu: Nasi putih, Ayam Kecap, Tahu Crispy, Tumis Wortel Pokcoy, Kelengkeng
export const BATCH_8_ITEMS: StockItem[] = [
  { id: 'b8-01', sku: 'BGN-BHK-801', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 100 KG (10 Nov) -> Keluar masak 100 KG (11 Nov)' },
  { id: 'b8-02', sku: 'BGN-BHK-802', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 2 KG (10 Nov) -> Keluar masak 2 KG (11 Nov)' },
  { id: 'b8-03', sku: 'BGN-BHK-803', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 2 KG (10 Nov) -> Keluar masak 2 KG (11 Nov)' },
  { id: 'b8-04', sku: 'BGN-BHK-804', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 17, usedStock: 17, minStockAlert: 5, dailyUsageAvg: 17, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 17 KG (10 Nov) -> Keluar masak 17 KG (11 Nov) untuk Tahu Crispy' },
  { id: 'b8-05', sku: 'BGN-BHK-805', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 10, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 36 L (10 Nov) -> Keluar masak 36 L (11 Nov)' },
  { id: 'b8-06', sku: 'BGN-RMP-801', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 0.1 KG (10 Nov) -> Keluar masak 0.1 KG (11 Nov)' },
  { id: 'b8-07', sku: 'BGN-RMP-802', name: 'LENGKUAS', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.2, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 0.5 KG (10 Nov) -> Keluar masak 0.5 KG (11 Nov)' },
  { id: 'b8-08', sku: 'BGN-RMP-803', name: 'JAHE', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.25, usedStock: 0.25, minStockAlert: 0.1, dailyUsageAvg: 0.25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 0.25 KG (10 Nov) -> Keluar masak 0.25 KG (11 Nov)' },
  { id: 'b8-09', sku: 'BGN-RMP-804', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 2 KG (10 Nov) -> Keluar masak 2 KG (11 Nov)' },
  { id: 'b8-10', sku: 'BGN-RMP-805', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 1 KG (10 Nov) -> Keluar masak 1 KG (11 Nov)' },
  { id: 'b8-11', sku: 'BGN-RMP-806', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 1 KG (10 Nov) -> Keluar masak 1 KG (11 Nov)' },
  { id: 'b8-12', sku: 'BGN-RMP-807', name: 'GULA JAWA', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 2 KG (10 Nov) -> Keluar masak 2 KG (11 Nov)' },
  { id: 'b8-13', sku: 'BGN-PRH-801', name: 'AYAM POTONG PAHA BAWAH', category: 'Protein Hewani', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1610, usedStock: 1610, minStockAlert: 400, dailyUsageAvg: 1610, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 1.610 PCS (10 Nov) -> Keluar masak 1.610 PCS (11 Nov) untuk Ayam Kecap' },
  { id: 'b8-14', sku: 'BGN-PRN-801', name: 'TAHU KUNING', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 200, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 1.600 PCS (10 Nov) -> Keluar masak 1.600 PCS (11 Nov) untuk Tahu Crispy' },
  { id: 'b8-15', sku: 'BGN-SYR-801', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 1 KG (10 Nov) -> Keluar masak 1 KG (11 Nov)' },
  { id: 'b8-16', sku: 'BGN-SYR-802', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 30 KG (10 Nov) -> Keluar masak 30 KG (11 Nov) untuk Tumis Wortel Pokcoy' },
  { id: 'b8-17', sku: 'BGN-SYR-803', name: 'PAKCOY', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 30 KG (10 Nov) -> Keluar masak 30 KG (11 Nov) untuk Tumis Wortel Pokcoy' },
  { id: 'b8-18', sku: 'BGN-BUH-801', name: 'KELENGKENG', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 6, usedStock: 6, minStockAlert: 2, dailyUsageAvg: 6, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-10', lastUsageDate: '2026-11-11', batch: '08-NOV', notes: 'Batch 8: Masuk 6 KRAT (10 Nov) -> Keluar 6 KRAT (11 Nov) buah segar' },
];

// BATCH 9: 19 Bahan Masuk 11 Nov 2026 -> Keluar Masak 12 Nov 2026
// Menu: Nasi Putih, Sesame Chicken, Tempe Goreng, Oseng Kol dan Kacang Panjang, Kurma
export const BATCH_9_ITEMS: StockItem[] = [
  { id: 'b9-01', sku: 'BGN-BHK-901', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 100 KG (11 Nov) -> Keluar masak 100 KG (12 Nov)' },
  { id: 'b9-02', sku: 'BGN-BHK-902', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 18, usedStock: 18, minStockAlert: 5, dailyUsageAvg: 18, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 18 KG (11 Nov) -> Keluar masak 18 KG (12 Nov) balutan Sesame Chicken & Tempe' },
  { id: 'b9-03', sku: 'BGN-BHK-903', name: 'KECAP IKAN', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 2 BTL (11 Nov) -> Keluar masak 2 BTL (12 Nov)' },
  { id: 'b9-04', sku: 'BGN-BHK-904', name: 'MINYAK WIJEN', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 1 BTL (11 Nov) -> Keluar masak 1 BTL (12 Nov) saus sesame chicken' },
  { id: 'b9-05', sku: 'BGN-BHK-905', name: 'SAUCE TOMAT', category: 'Bahan Kering', uom: 'JIR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 1 JIR (11 Nov) -> Keluar masak 1 JIR (12 Nov)' },
  { id: 'b9-06', sku: 'BGN-BHK-906', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 3 L (11 Nov) -> Keluar masak 3 L (12 Nov)' },
  { id: 'b9-07', sku: 'BGN-BHK-907', name: 'WIJEN', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.1, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 0.2 KG (11 Nov) -> Keluar masak 0.2 KG (12 Nov) taburan Sesame Chicken' },
  { id: 'b9-08', sku: 'BGN-BHK-908', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 56, usedStock: 56, minStockAlert: 15, dailyUsageAvg: 56, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 56 L (11 Nov) -> Keluar masak 56 L (12 Nov)' },
  { id: 'b9-09', sku: 'BGN-BHK-909', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 2 KG (11 Nov) -> Keluar masak 2 KG (12 Nov)' },
  { id: 'b9-10', sku: 'BGN-BHK-910', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 3 KG (11 Nov) -> Keluar masak 3 KG (12 Nov)' },
  { id: 'b9-11', sku: 'BGN-RMP-901', name: 'GULA JAWA', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 3 KG (11 Nov) -> Keluar masak 3 KG (12 Nov)' },
  { id: 'b9-12', sku: 'BGN-RMP-902', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 2 KG (11 Nov) -> Keluar masak 2 KG (12 Nov)' },
  { id: 'b9-13', sku: 'BGN-PRH-901', name: 'AYAM DADA FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 63 KG (11 Nov) -> Keluar masak 63 KG (12 Nov) untuk Sesame Chicken' },
  { id: 'b9-14', sku: 'BGN-PRH-902', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 3 KG (11 Nov) -> Keluar masak 3 KG (12 Nov) perekat adonan ayam' },
  { id: 'b9-15', sku: 'BGN-PRN-901', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 80 PAPAN (11 Nov) -> Keluar masak 80 PAPAN (12 Nov) untuk Tempe Goreng' },
  { id: 'b9-16', sku: 'BGN-SYR-901', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 1 KG (11 Nov) -> Keluar masak 1 KG (12 Nov) garnish / oseng' },
  { id: 'b9-17', sku: 'BGN-SYR-902', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 30 KG (11 Nov) -> Keluar masak 30 KG (12 Nov) untuk Oseng Kol dan Kacang Panjang' },
  { id: 'b9-18', sku: 'BGN-SYR-903', name: 'KACANG PANJANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 30 KG (11 Nov) -> Keluar masak 30 KG (12 Nov) untuk Oseng Kol dan Kacang Panjang' },
  { id: 'b9-19', sku: 'BGN-BUH-901', name: 'KURMA', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3900, usedStock: 3900, minStockAlert: 500, dailyUsageAvg: 3900, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-11', lastUsageDate: '2026-11-12', batch: '09-NOV', notes: 'Batch 9: Masuk 3.900 PCS (11 Nov) -> Keluar 3.900 PCS (12 Nov) buah porsi manis' },
];

// BATCH 10: 22 Bahan Masuk 12 Nov 2026 -> Keluar Masak 13 Nov 2026
// Menu: Nasi putih, Telur Bumbu Pesmol, Tempe Mendohan, Tumis Labu Siam dan Jagung, Jeruk
export const BATCH_10_ITEMS: StockItem[] = [
  { id: 'b10-01', sku: 'BGN-BHK-1001', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 100 KG (12 Nov) -> Keluar masak 100 KG (13 Nov)' },
  { id: 'b10-02', sku: 'BGN-BHK-1002', name: 'SAUCE TOMAT', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 2 L (12 Nov) -> Keluar masak 2 L (13 Nov)' },
  { id: 'b10-03', sku: 'BGN-BHK-1003', name: 'SAUCE SAMBAL', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.5, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 1 L (12 Nov) -> Keluar masak 1 L (13 Nov)' },
  { id: 'b10-04', sku: 'BGN-BHK-1004', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 2 KG (12 Nov) -> Keluar masak 2 KG (13 Nov)' },
  { id: 'b10-05', sku: 'BGN-BHK-1005', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 15, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 54 L (12 Nov) -> Keluar masak 54 L (13 Nov)' },
  { id: 'b10-06', sku: 'BGN-BHK-1006', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 2 KG (12 Nov) -> Keluar masak 2 KG (13 Nov)' },
  { id: 'b10-07', sku: 'BGN-BHK-1007', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 13, usedStock: 13, minStockAlert: 5, dailyUsageAvg: 13, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 13 KG (12 Nov) -> Keluar masak 13 KG (13 Nov) untuk adonan Tempe Mendoan' },
  { id: 'b10-08', sku: 'BGN-BHK-1008', name: 'TEPUNG BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 3 KG (12 Nov) -> Keluar masak 3 KG (13 Nov) untuk adonan Tempe Mendoan' },
  { id: 'b10-09', sku: 'BGN-RMP-1001', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 4 KG (12 Nov) -> Keluar masak 4 KG (13 Nov) bumbu pesmol & tumisan' },
  { id: 'b10-10', sku: 'BGN-RMP-1002', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 3 KG (12 Nov) -> Keluar masak 3 KG (13 Nov)' },
  { id: 'b10-11', sku: 'BGN-RMP-1003', name: 'KEMIRI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.5, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 1 KG (12 Nov) -> Keluar masak 1 KG (13 Nov) bumbu pesmol' },
  { id: 'b10-12', sku: 'BGN-RMP-1004', name: 'JAHE', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.2, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 0.5 KG (12 Nov) -> Keluar masak 0.5 KG (13 Nov)' },
  { id: 'b10-13', sku: 'BGN-RMP-1005', name: 'LENGKUAS', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.2, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 0.5 KG (12 Nov) -> Keluar masak 0.5 KG (13 Nov)' },
  { id: 'b10-14', sku: 'BGN-RMP-1006', name: 'DAUN JERUK', category: 'Rempah', uom: 'GR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 0.1 GR (12 Nov) -> Keluar masak 0.1 GR (13 Nov) aroma bumbu pesmol' },
  { id: 'b10-15', sku: 'BGN-RMP-1007', name: 'SEREH', category: 'Rempah', uom: 'GR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.05, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 0.2 GR (12 Nov) -> Keluar masak 0.2 GR (13 Nov) aroma bumbu pesmol' },
  { id: 'b10-16', sku: 'BGN-RMP-1008', name: 'KUNYIT BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 0.1 KG (12 Nov) -> Keluar masak 0.1 KG (13 Nov) bumbu pesmol' },
  { id: 'b10-17', sku: 'BGN-PRH-1001', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 110, usedStock: 110, minStockAlert: 20, dailyUsageAvg: 110, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 110 KG (12 Nov) -> Keluar masak 110 KG (13 Nov) untuk Telur Bumbu Pesmol' },
  { id: 'b10-18', sku: 'BGN-PRN-1001', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 80 PAPAN (12 Nov) -> Keluar masak 80 PAPAN (13 Nov) untuk Tempe Mendohan' },
  { id: 'b10-19', sku: 'BGN-SYR-1001', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 2 KG (12 Nov) -> Keluar masak 2 KG (13 Nov) irisan mendoan & garnish' },
  { id: 'b10-20', sku: 'BGN-SYR-1002', name: 'LABU SIAM', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 30 KG (12 Nov) -> Keluar masak 30 KG (13 Nov) untuk Tumis Labu Siam dan Jagung' },
  { id: 'b10-21', sku: 'BGN-SYR-1003', name: 'JAGUNG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 30 KG (12 Nov) -> Keluar masak 30 KG (13 Nov) untuk Tumis Labu Siam dan Jagung' },
  { id: 'b10-22', sku: 'BGN-BUH-1001', name: 'JERUK', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 200, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-12', lastUsageDate: '2026-11-13', batch: '10-NOV', notes: 'Batch 10: Masuk 1.600 PCS (12 Nov) -> Keluar 1.600 PCS (13 Nov) buah segar' },
];

// BATCH 11: 16 Bahan Masuk 15 Nov 2026 -> Keluar Masak 16 Nov 2026
// Menu (resmi cloud KV): Nasi Putih Lele Popcorn — Nasi Putih, Ikan Lele, Tempe, Kol & Wortel, Kelengkeng
export const BATCH_11_ITEMS: StockItem[] = [
  { id: 'b11-01', sku: 'BGN-BHK-1101', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 20 KG (15 Nov) -> Keluar masak 20 KG (16 Nov) adonan tepung lele & tempe' },
  { id: 'b11-02', sku: 'BGN-BHK-1102', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 15, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 54 L (15 Nov) -> Keluar masak 54 L (16 Nov)' },
  { id: 'b11-03', sku: 'BGN-BHK-1103', name: 'SAUCE TOMAT', category: 'Bahan Kering', uom: 'JIR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 1, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 1 JIR (15 Nov) -> Keluar masak 1 JIR (16 Nov) saus olahan lele' },
  { id: 'b11-04', sku: 'BGN-BHK-1104', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 2 KG (15 Nov) -> Keluar masak 2 KG (16 Nov)' },
  { id: 'b11-05', sku: 'BGN-BHK-1105', name: 'MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1.5, usedStock: 1.5, minStockAlert: 0.5, dailyUsageAvg: 1.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 1.5 KG (15 Nov) -> Keluar masak 1.5 KG (16 Nov) perekat adonan' },
  { id: 'b11-06', sku: 'BGN-BHK-1106', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 3 L (15 Nov) -> Keluar masak 3 L (16 Nov) bumbu saus' },
  { id: 'b11-07', sku: 'BGN-RMP-1101', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 3 KG (15 Nov) -> Keluar masak 3 KG (16 Nov) bumbu halus' },
  { id: 'b11-08', sku: 'BGN-RMP-1102', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.5, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 1 KG (15 Nov) -> Keluar masak 1 KG (16 Nov) bumbu halus' },
  { id: 'b11-09', sku: 'BGN-RMP-1103', name: 'ROYCO', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 2 KG (15 Nov) -> Keluar masak 2 KG (16 Nov)' },
  { id: 'b11-10', sku: 'BGN-PRH-1101', name: 'LELE FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 63 KG (15 Nov) -> Keluar masak 63 KG (16 Nov) kebutuhan bersih' },
  { id: 'b11-11', sku: 'BGN-PRN-1101', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 80 PAPAN (15 Nov) -> Keluar masak 80 PAPAN (16 Nov) Tempe Goreng' },
  { id: 'b11-12', sku: 'BGN-SYR-1101', name: 'TOMAT', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 8, usedStock: 8, minStockAlert: 2, dailyUsageAvg: 8, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 8 KG (15 Nov) -> Keluar masak 8 KG (16 Nov) tumisan' },
  { id: 'b11-13', sku: 'BGN-SYR-1102', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 20 KG (15 Nov) -> Keluar masak 20 KG (16 Nov) tumisan' },
  { id: 'b11-14', sku: 'BGN-SYR-1103', name: 'SAWI PUTIH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 20 KG (15 Nov) -> Keluar masak 20 KG (16 Nov) tumisan' },
  { id: 'b11-15', sku: 'BGN-SYR-1104', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 20 KG (15 Nov) -> Keluar masak 20 KG (16 Nov) tumisan' },
  { id: 'b11-16', sku: 'BGN-BUH-1101', name: 'KELENGKENG', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 6, usedStock: 6, minStockAlert: 2, dailyUsageAvg: 6, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-15', lastUsageDate: '2026-11-16', batch: '11-NOV', notes: 'Batch 11: Masuk 6 KRAT (15 Nov) -> Keluar 6 KRAT (16 Nov) buah segar' },
];

// BATCH 12: 18 Bahan Masuk 16 Nov 2026 -> Keluar Masak 17 Nov 2026
// Menu (resmi cloud KV): Nasi Putih Chicken Crumble — Nasi Putih, Ayam, Tahu, Wortel & Putren, Jeruk Manis
export const BATCH_12_ITEMS: StockItem[] = [
  { id: 'b12-01', sku: 'BGN-BHK-1201', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 100 KG (16 Nov) -> Keluar masak 100 KG (17 Nov)' },
  { id: 'b12-02', sku: 'BGN-BHK-1202', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 6, usedStock: 6, minStockAlert: 2, dailyUsageAvg: 6, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 6 KG (16 Nov) -> Keluar masak 6 KG (17 Nov) balutan ayam & tahu' },
  { id: 'b12-03', sku: 'BGN-BHK-1203', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 2 KG (16 Nov) -> Keluar masak 2 KG (17 Nov)' },
  { id: 'b12-04', sku: 'BGN-BHK-1204', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 10, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 36 L (16 Nov) -> Keluar masak 36 L (17 Nov)' },
  { id: 'b12-05', sku: 'BGN-BHK-1205', name: 'GULA JAWA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 2 KG (16 Nov) -> Keluar masak 2 KG (17 Nov)' },
  { id: 'b12-06', sku: 'BGN-BHK-1206', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 2 KG (16 Nov) -> Keluar masak 2 KG (17 Nov)' },
  { id: 'b12-07', sku: 'BGN-BHK-1207', name: 'CRUMLE BUBBLE', category: 'Bahan Kering', uom: 'PAX', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 15, usedStock: 15, minStockAlert: 5, dailyUsageAvg: 15, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 15 PAX (16 Nov) -> Keluar masak 15 PAX (17 Nov) taburan crumble' },
  { id: 'b12-08', sku: 'BGN-BHK-1208', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 4 L (16 Nov) -> Keluar masak 4 L (17 Nov)' },
  { id: 'b12-09', sku: 'BGN-RMP-1201', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.3, usedStock: 0.3, minStockAlert: 0.1, dailyUsageAvg: 0.3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 0.3 KG (16 Nov) -> Keluar masak 0.3 KG (17 Nov)' },
  { id: 'b12-10', sku: 'BGN-RMP-1202', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 2 KG (16 Nov) -> Keluar masak 2 KG (17 Nov) bumbu halus' },
  { id: 'b12-11', sku: 'BGN-RMP-1203', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.5, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 1 KG (16 Nov) -> Keluar masak 1 KG (17 Nov) bumbu halus' },
  { id: 'b12-12', sku: 'BGN-RMP-1204', name: 'DAUN JERUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 0.1 KG (16 Nov) -> Keluar masak 0.1 KG (17 Nov) aroma' },
  { id: 'b12-13', sku: 'BGN-PRH-1201', name: 'AYAM FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 63 KG (16 Nov) -> Keluar masak 63 KG (17 Nov) Ayam Goreng Tepung' },
  { id: 'b12-14', sku: 'BGN-PRH-1202', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 3 KG (16 Nov) -> Keluar masak 3 KG (17 Nov) perekat adonan' },
  { id: 'b12-15', sku: 'BGN-PRN-1201', name: 'TAHU KUNING', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1591, usedStock: 1591, minStockAlert: 200, dailyUsageAvg: 1591, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 1.591 PCS (16 Nov) -> Keluar masak 1.591 PCS (17 Nov) Tahu Kuning Goreng' },
  { id: 'b12-16', sku: 'BGN-SYR-1201', name: 'PUTREN', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 30 KG (16 Nov) -> Keluar masak 30 KG (17 Nov) tumisan' },
  { id: 'b12-17', sku: 'BGN-SYR-1202', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 30 KG (16 Nov) -> Keluar masak 30 KG (17 Nov) tumisan' },
  { id: 'b12-18', sku: 'BGN-BUH-1201', name: 'JERUK', category: 'Buah', uom: 'BH', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1591, usedStock: 1591, minStockAlert: 200, dailyUsageAvg: 1591, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-16', lastUsageDate: '2026-11-17', batch: '12-NOV', notes: 'Batch 12: Masuk 1.591 BH (16 Nov) -> Keluar 1.591 BH (17 Nov) buah segar' },
];

// BATCH 20: 17 Bahan Masuk 26 Nov 2026 (Kamis) -> Keluar Masak 27 Nov 2026 (Jumat)
// Menu Resmi (terbit di Cloudflare KV per 26 Nov):
//   Nasi Putih, Telur Semur, Tempe Goreng, Tumis Pakcoy Wortel, Kelengkeng
// CATATAN: nota ini TIDAK ada kolom SATUAN (3 kolom: GOLONGAN | BAHAN MAKANAN | JUMLAH) -> satuan diinferensi sesuai standar dapur SPPG (SATUAN INFERENSI).
export const BATCH_20_ITEMS: StockItem[] = [
  { id: 'b20-01', sku: 'BGN-BHK-2001', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 85, usedStock: 85, minStockAlert: 21.25, dailyUsageAvg: 85, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 85 KG (2026-11-26) -> Keluar masak 85 KG (2026-11-27) Nasi Putih (SATUAN INFERENSI)' },
  { id: 'b20-02', sku: 'BGN-BHK-2002', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 2 KG (2026-11-26) -> Keluar masak 2 KG (2026-11-27) perasa (SATUAN INFERENSI)' },
  { id: 'b20-03', sku: 'BGN-BHK-2003', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 2 KG (2026-11-26) -> Keluar masak 2 KG (2026-11-27) bumbu semur/tumis (SATUAN INFERENSI)' },
  { id: 'b20-04', sku: 'BGN-BHK-2004', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 4 L (2026-11-26) -> Keluar masak 4 L (2026-11-27) Telur Semur (SATUAN INFERENSI)' },
  { id: 'b20-05', sku: 'BGN-BHK-2005', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 2 KG (2026-11-26) -> Keluar masak 2 KG (2026-11-27) perasa (SATUAN INFERENSI)' },
  { id: 'b20-06', sku: 'BGN-BHK-2006', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 9, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 36 L (2026-11-26) -> Keluar masak 36 L (2026-11-27) menggoreng & menumis (SATUAN INFERENSI)' },
  { id: 'b20-07', sku: 'BGN-RMP-2001', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 2 KG (2026-11-26) -> Keluar masak 2 KG (2026-11-27) bumbu halus semur/tumis (SATUAN INFERENSI)' },
  { id: 'b20-08', sku: 'BGN-RMP-2002', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 2 KG (2026-11-26) -> Keluar masak 2 KG (2026-11-27) bumbu halus (SATUAN INFERENSI)' },
  { id: 'b20-09', sku: 'BGN-RMP-2003', name: 'KEMIRI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 1 KG (2026-11-26) -> Keluar masak 1 KG (2026-11-27) bumbu semur/ungkep (SATUAN INFERENSI)' },
  { id: 'b20-10', sku: 'BGN-RMP-2004', name: 'KETUMBAR BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 0.1 KG (2026-11-26) -> Keluar masak 0.1 KG (2026-11-27) bumbu ungkep tempe/semur (SATUAN INFERENSI)' },
  { id: 'b20-11', sku: 'BGN-RMP-2005', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 0.1 KG (2026-11-26) -> Keluar masak 0.1 KG (2026-11-27) bumbu semur/tumis (SATUAN INFERENSI)' },
  { id: 'b20-12', sku: 'BGN-RMP-2006', name: 'DAUN SALAM', category: 'Rempah', uom: 'LEMBAR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 30 LEMBAR (2026-11-26) -> Keluar masak 30 LEMBAR (2026-11-27) aroma semur (SATUAN INFERENSI)' },
  { id: 'b20-13', sku: 'BGN-PRH-2001', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 110, usedStock: 110, minStockAlert: 27.5, dailyUsageAvg: 110, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 110 KG (2026-11-26) -> Keluar masak 110 KG (2026-11-27) Telur Semur (SATUAN INFERENSI)' },
  { id: 'b20-14', sku: 'BGN-PRN-2001', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 80 PAPAN (2026-11-26) -> Keluar masak 80 PAPAN (2026-11-27) Tempe Goreng (SATUAN INFERENSI)' },
  { id: 'b20-15', sku: 'BGN-SYR-2001', name: 'PAKCOY', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 30 KG (2026-11-26) -> Keluar masak 30 KG (2026-11-27) Tumis Pakcoy & Wortel (SATUAN INFERENSI)' },
  { id: 'b20-16', sku: 'BGN-SYR-2002', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 30 KG (2026-11-26) -> Keluar masak 30 KG (2026-11-27) Tumis Pakcoy & Wortel (SATUAN INFERENSI)' },
  { id: 'b20-17', sku: 'BGN-BUH-2001', name: 'KELENGKENG', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 6, usedStock: 6, minStockAlert: 1.5, dailyUsageAvg: 6, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-26', lastUsageDate: '2026-11-27', batch: '20-NOV', notes: 'Batch 20: Masuk 6 KRAT (2026-11-26) -> Keluar 6 KRAT (2026-11-27) buah segar (SATUAN INFERENSI)' },
];

// BATCH 19: 28 Bahan Masuk 25 Nov 2026 (Rabu) -> Keluar Masak 26 Nov 2026 (Kamis)
// Menu (INFERENSI — menu resmi 26 Nov belum terbit di cloud KV per 25 Nov):
//   Nasi Putih, Lumpia / Olahan Ayam Giling, Tahu Kuning Goreng, Tumis Kacang Panjang & Putren, Pisang Ambon / Sunpride
// CATATAN: nota PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak (KG / L / JERRIGEN / BOTOL / LEMBAR / BATANG / PCS / BH).
// Nama bahan disimpan verbatim: SC TOMAT, CUKA DIXI, PISANG AMBON/ SUNPRIDE, KULIT LUMPIA BESAR.
export const BATCH_19_ITEMS: StockItem[] = [
  { id: 'b19-01', sku: 'BGN-BHK-1901', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 85, usedStock: 85, minStockAlert: 21.25, dailyUsageAvg: 85, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 85 (2026-11-25) -> Keluar masak 85 (2026-11-26) Nasi Putih' },
  { id: 'b19-02', sku: 'BGN-BHK-1902', name: 'TAPIOKA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1.25, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 5 (2026-11-25) -> Keluar masak 5 (2026-11-26) adonan/isian Ayam Giling' },
  { id: 'b19-03', sku: 'BGN-BHK-1903', name: 'TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1 (2026-11-25) -> Keluar masak 1 (2026-11-26) perekat kulit lumpia' },
  { id: 'b19-04', sku: 'BGN-BHK-1904', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 2 (2026-11-25) -> Keluar masak 2 (2026-11-26) perasa' },
  { id: 'b19-05', sku: 'BGN-BHK-1905', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 13.5, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 54 (2026-11-25) -> Keluar masak 54 (2026-11-26) menggoreng & menumis' },
  { id: 'b19-06', sku: 'BGN-BHK-1906', name: 'SC TOMAT', category: 'Bahan Kering', uom: 'JERRIGEN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1 (2026-11-25) -> Keluar masak 1 (2026-11-26) saus bumbu (nama verbatim nota)' },
  { id: 'b19-07', sku: 'BGN-BHK-1907', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 0.75, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 3 (2026-11-25) -> Keluar masak 3 (2026-11-26) pemanis saus/tumis' },
  { id: 'b19-08', sku: 'BGN-BHK-1908', name: 'MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 2 (2026-11-25) -> Keluar masak 2 (2026-11-26) pengental saus/adonan' },
  { id: 'b19-09', sku: 'BGN-BHK-1909', name: 'CUKA DIXI', category: 'Bahan Kering', uom: 'BOTOL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1 (2026-11-25) -> Keluar masak 1 (2026-11-26) saus bumbu (nama verbatim nota)' },
  { id: 'b19-10', sku: 'BGN-RMP-1901', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 0.1 (2026-11-25) -> Keluar masak 0.1 (2026-11-26) bumbu' },
  { id: 'b19-11', sku: 'BGN-RMP-1902', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 2 (2026-11-25) -> Keluar masak 2 (2026-11-26) bumbu halus' },
  { id: 'b19-12', sku: 'BGN-RMP-1903', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1 (2026-11-25) -> Keluar masak 1 (2026-11-26) tumisan/saus' },
  { id: 'b19-13', sku: 'BGN-RMP-1904', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1 (2026-11-25) -> Keluar masak 1 (2026-11-26) bumbu halus' },
  { id: 'b19-14', sku: 'BGN-RMP-1905', name: 'KEMIRI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.12, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 0.5 (2026-11-25) -> Keluar masak 0.5 (2026-11-26) bumbu halus' },
  { id: 'b19-15', sku: 'BGN-RMP-1906', name: 'KUNYIT BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.05, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 0.2 (2026-11-25) -> Keluar masak 0.2 (2026-11-26) bumbu tahu/ungkep' },
  { id: 'b19-16', sku: 'BGN-RMP-1907', name: 'LENGKUAS', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.12, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 0.5 (2026-11-25) -> Keluar masak 0.5 (2026-11-26) aroma bumbu' },
  { id: 'b19-17', sku: 'BGN-RMP-1908', name: 'DAUN SALAM', category: 'Rempah', uom: 'LEMBAR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 30 (2026-11-25) -> Keluar masak 30 (2026-11-26) aroma bumbu' },
  { id: 'b19-18', sku: 'BGN-RMP-1909', name: 'SEREH', category: 'Rempah', uom: 'BATANG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5.0, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 20 (2026-11-25) -> Keluar masak 20 (2026-11-26) aroma bumbu' },
  { id: 'b19-19', sku: 'BGN-PRH-1901', name: 'AYAM GILING', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15.75, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 63 (2026-11-25) -> Keluar masak 63 (2026-11-26) Lumpia / Olahan Ayam Giling' },
  { id: 'b19-20', sku: 'BGN-PRN-1901', name: 'TAHU KUNING', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1579, usedStock: 1579, minStockAlert: 394.75, dailyUsageAvg: 1579, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1579 (2026-11-25) -> Keluar masak 1579 (2026-11-26) Tahu Kuning Goreng' },
  { id: 'b19-21', sku: 'BGN-SYR-1901', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 7, usedStock: 7, minStockAlert: 1.75, dailyUsageAvg: 7, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 7 (2026-11-25) -> Keluar masak 7 (2026-11-26) isian/tumisan' },
  { id: 'b19-22', sku: 'BGN-SYR-1902', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1.25, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 5 (2026-11-25) -> Keluar masak 5 (2026-11-26) isian/tumisan' },
  { id: 'b19-23', sku: 'BGN-SYR-1903', name: 'TOMAT', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 7, usedStock: 7, minStockAlert: 1.75, dailyUsageAvg: 7, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 7 (2026-11-25) -> Keluar masak 7 (2026-11-26) tumisan/saus' },
  { id: 'b19-24', sku: 'BGN-SYR-1904', name: 'KACANG PANJANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 30 (2026-11-25) -> Keluar masak 30 (2026-11-26) Tumis Kacang Panjang & Putren' },
  { id: 'b19-25', sku: 'BGN-SYR-1905', name: 'PUTREN', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 30 (2026-11-25) -> Keluar masak 30 (2026-11-26) Tumis Kacang Panjang & Putren' },
  { id: 'b19-26', sku: 'BGN-SYR-1906', name: 'DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 2 (2026-11-25) -> Keluar masak 2 (2026-11-26) isian lumpia/tumis' },
  { id: 'b19-27', sku: 'BGN-BUH-1901', name: 'PISANG AMBON/ SUNPRIDE', category: 'Buah', uom: 'BH', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1579, usedStock: 1579, minStockAlert: 394.75, dailyUsageAvg: 1579, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1579 (2026-11-25) -> Keluar 1579 (2026-11-26) buah segar (nama verbatim nota)' },
  { id: 'b19-28', sku: 'BGN-LIN-1901', name: 'KULIT LUMPIA BESAR', category: 'Lainnya', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1000, usedStock: 1000, minStockAlert: 250, dailyUsageAvg: 1000, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-25', lastUsageDate: '2026-11-26', batch: '19-NOV', notes: 'Batch 19: Masuk 1000 (2026-11-25) -> Keluar masak 1000 (2026-11-26) pembungkus lumpia ayam (nama verbatim nota)' },
];

// BATCH 18: 21 Bahan Masuk 24 Nov 2026 (Selasa) -> Keluar Masak 25 Nov 2026 (Rabu)
// Menu (INFERENSI — menu resmi 25 Nov belum terbit di cloud KV per 24 Nov):
//   Nasi Putih, Chicken Teriyaki, Edamame Rebus, Tumis Caisim Jagung Wortel, Anggur Merah
// CATATAN: nota PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak (KG / L / BTL / JERRIGEN / KRAT).
// Nama bahan baru disimpan verbatim: KECAP ASIN, SAOS TIRAM, KIKKOMAN MIRIN, SAOS TOMAT, KACANG TANAH, UNCLANG / DAUN BAWANG, CAISIM.
export const BATCH_18_ITEMS: StockItem[] = [
  { id: 'b18-01', sku: 'BGN-BHK-1801', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25.0, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 100 (2026-11-24) -> Keluar masak 100 (2026-11-25) Nasi Putih' },
  { id: 'b18-02', sku: 'BGN-BHK-1802', name: 'KECAP ASIN', category: 'Bahan Kering', uom: 'BTL', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 2 (2026-11-24) -> Keluar masak 2 (2026-11-25) Chicken Teriyaki' },
  { id: 'b18-03', sku: 'BGN-BHK-1803', name: 'SAOS TIRAM', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) Chicken Teriyaki' },
  { id: 'b18-04', sku: 'BGN-BHK-1804', name: 'KIKKOMAN MIRIN', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.12, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 0.5 (2026-11-24) -> Keluar masak 0.5 (2026-11-25) Chicken Teriyaki (mirin halal bersertifikat)' },
  { id: 'b18-05', sku: 'BGN-BHK-1805', name: 'SAOS TOMAT', category: 'Bahan Kering', uom: 'JERRIGEN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) saus bumbu' },
  { id: 'b18-06', sku: 'BGN-BHK-1806', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 2 (2026-11-24) -> Keluar masak 2 (2026-11-25) Chicken Teriyaki' },
  { id: 'b18-07', sku: 'BGN-BHK-1807', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) perasa' },
  { id: 'b18-08', sku: 'BGN-BHK-1808', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) pemanis' },
  { id: 'b18-09', sku: 'BGN-BHK-1809', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 13.5, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 54 (2026-11-24) -> Keluar masak 54 (2026-11-25) memasak & menumis' },
  { id: 'b18-10', sku: 'BGN-RMP-1801', name: 'BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) Chicken Teriyaki' },
  { id: 'b18-11', sku: 'BGN-RMP-1802', name: 'JAHE', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.12, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 0.5 (2026-11-24) -> Keluar masak 0.5 (2026-11-25) aroma Chicken Teriyaki' },
  { id: 'b18-12', sku: 'BGN-RMP-1803', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) bumbu halus' },
  { id: 'b18-13', sku: 'BGN-RMP-1804', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 2 (2026-11-24) -> Keluar masak 2 (2026-11-25) bumbu halus' },
  { id: 'b18-14', sku: 'BGN-PRH-1801', name: 'AYAM FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15.75, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 63 (2026-11-24) -> Keluar masak 63 (2026-11-25) Chicken Teriyaki' },
  { id: 'b18-15', sku: 'BGN-PRN-1801', name: 'EDAMAME', category: 'Protein Nabati', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 30 (2026-11-24) -> Keluar masak 30 (2026-11-25) Edamame Rebus' },
  { id: 'b18-16', sku: 'BGN-SYR-1801', name: 'KACANG TANAH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.25, usedStock: 0.25, minStockAlert: 0.06, dailyUsageAvg: 0.25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 0.25 (2026-11-24) -> Keluar masak 0.25 (2026-11-25) pelengkap / olahan sayur' },
  { id: 'b18-17', sku: 'BGN-SYR-1802', name: 'UNCLANG / DAUN BAWANG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 1 (2026-11-24) -> Keluar masak 1 (2026-11-25) Tumis Caisim Jagung Wortel' },
  { id: 'b18-18', sku: 'BGN-SYR-1803', name: 'JAGUNG', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5.0, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 20 (2026-11-24) -> Keluar masak 20 (2026-11-25) Tumis Caisim Jagung Wortel' },
  { id: 'b18-19', sku: 'BGN-SYR-1804', name: 'CAISIM', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5.0, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 20 (2026-11-24) -> Keluar masak 20 (2026-11-25) Tumis Caisim Jagung Wortel' },
  { id: 'b18-20', sku: 'BGN-SYR-1805', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5.0, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 20 (2026-11-24) -> Keluar masak 20 (2026-11-25) Tumis Caisim Jagung Wortel' },
  { id: 'b18-21', sku: 'BGN-BUH-1801', name: 'ANGGUR MERAH', category: 'Buah', uom: 'KRAT', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 11, usedStock: 11, minStockAlert: 2.75, dailyUsageAvg: 11, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-24', lastUsageDate: '2026-11-25', batch: '18-NOV', notes: 'Batch 18: Masuk 11 (2026-11-24) -> Keluar 11 (2026-11-25) buah segar' },
];

// BATCH 17: 22 Bahan Masuk 23 Nov 2026 (Senin) -> Keluar Masak 24 Nov 2026 (Selasa)
// Menu (INFERENSI — menu resmi 24 Nov belum terbit di cloud KV per 23 Nov):
//   Nasi Putih, Ayam Asam Manis, Tempe Goreng, Tumis Buncis Kembang Kol & Tomat, Jeruk
// CATATAN: nota PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak (KG / L / PAPAN / PCS).
// Nama bahan baru disimpan verbatim: AYAM FILLET PAHA, SC SAMBAL, ASAM JAWA, GULA JAWA, KEMBANG KOL.
export const BATCH_17_ITEMS: StockItem[] = [
  { id: 'b17-01', sku: 'BGN-BHK-1701', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25.0, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 100 (2026-11-23) -> Keluar masak 100 (2026-11-24) Nasi Putih' },
  { id: 'b17-02', sku: 'BGN-BHK-1701', name: 'TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 22, usedStock: 22, minStockAlert: 5.5, dailyUsageAvg: 22, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 22 (2026-11-23) -> Keluar masak 22 (2026-11-24) balutan Ayam Asam Manis' },
  { id: 'b17-03', sku: 'BGN-BHK-1701', name: 'TEPUNG BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 1 (2026-11-23) -> Keluar masak 1 (2026-11-24) adonan balutan' },
  { id: 'b17-04', sku: 'BGN-BHK-1701', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 0.75, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 3 (2026-11-23) -> Keluar masak 3 (2026-11-24) perasa' },
  { id: 'b17-05', sku: 'BGN-BHK-1701', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.12, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 0.5 (2026-11-23) -> Keluar masak 0.5 (2026-11-24) bumbu' },
  { id: 'b17-06', sku: 'BGN-BHK-1701', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 2 (2026-11-23) -> Keluar masak 2 (2026-11-24) pemanis' },
  { id: 'b17-07', sku: 'BGN-BHK-1701', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 13.5, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 54 (2026-11-23) -> Keluar masak 54 (2026-11-24) menggoreng' },
  { id: 'b17-08', sku: 'BGN-BHK-1701', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 2 (2026-11-23) -> Keluar masak 2 (2026-11-24) Ayam Asam Manis' },
  { id: 'b17-09', sku: 'BGN-BHK-1701', name: 'SC SAMBAL', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 1 (2026-11-23) -> Keluar masak 1 (2026-11-24) pendamping (nama verbatim nota)' },
  { id: 'b17-10', sku: 'BGN-RMP-1701', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 0.1 (2026-11-23) -> Keluar masak 0.1 (2026-11-24) bumbu' },
  { id: 'b17-11', sku: 'BGN-RMP-1701', name: 'KETUMBAR BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 0.1 (2026-11-23) -> Keluar masak 0.1 (2026-11-24) bumbu halus' },
  { id: 'b17-12', sku: 'BGN-RMP-1701', name: 'GULA JAWA', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 2 (2026-11-23) -> Keluar masak 2 (2026-11-24) Ayam Asam Manis' },
  { id: 'b17-13', sku: 'BGN-RMP-1701', name: 'ASAM JAWA', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 1 (2026-11-23) -> Keluar masak 1 (2026-11-24) Ayam Asam Manis' },
  { id: 'b17-14', sku: 'BGN-RMP-1701', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 2 (2026-11-23) -> Keluar masak 2 (2026-11-24) bumbu halus' },
  { id: 'b17-15', sku: 'BGN-RMP-1701', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 1 (2026-11-23) -> Keluar masak 1 (2026-11-24) bumbu halus' },
  { id: 'b17-16', sku: 'BGN-PRH-1701', name: 'AYAM FILLET PAHA', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15.75, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 63 (2026-11-23) -> Keluar masak 63 (2026-11-24) Ayam Asam Manis (nama verbatim nota)' },
  { id: 'b17-17', sku: 'BGN-PRH-1701', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 0.75, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 3 (2026-11-23) -> Keluar masak 3 (2026-11-24) adonan pencelup' },
  { id: 'b17-18', sku: 'BGN-PRN-1701', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20.0, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 80 (2026-11-23) -> Keluar masak 80 (2026-11-24) Tempe Goreng' },
  { id: 'b17-19', sku: 'BGN-SYR-1701', name: 'TOMAT MERAH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 2 (2026-11-23) -> Keluar masak 2 (2026-11-24) Tumis Buncis Kembang Kol & Tomat' },
  { id: 'b17-20', sku: 'BGN-SYR-1701', name: 'BUNCIS', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 30 (2026-11-23) -> Keluar masak 30 (2026-11-24) Tumis Buncis Kembang Kol & Tomat' },
  { id: 'b17-21', sku: 'BGN-SYR-1701', name: 'KEMBANG KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 35, usedStock: 35, minStockAlert: 8.75, dailyUsageAvg: 35, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 35 (2026-11-23) -> Keluar masak 35 (2026-11-24) Tumis Buncis Kembang Kol & Tomat' },
  { id: 'b17-22', sku: 'BGN-BUH-1701', name: 'JERUK', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1579, usedStock: 1579, minStockAlert: 394.75, dailyUsageAvg: 1579, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-23', lastUsageDate: '2026-11-24', batch: '17-NOV', notes: 'Batch 17: Masuk 1579 (2026-11-23) -> Keluar masak 1579 (2026-11-24) buah segar' },
];

// BATCH 16: 20 Bahan Masuk 22 Nov 2026 (Minggu) -> Keluar Masak 23 Nov 2026 (Senin)
// Menu (INFERENSI — menu resmi 23 Nov belum terbit di cloud KV per 22 Nov):
//   Nasi Putih, Ayam Goreng Tepung, Tahu Goreng, Tumis Kol & Wortel, Kurma
// CATATAN: nota PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak (KG / L / BATANG / LEMBAR / PCS / DUS).
// Nama bahan baru disimpan verbatim: AYAM POTONG PAHA BAWAH, KUNYIT BUBUK, KETUMBAR BUBUK, DAUN SEREH, DAUN SALAM, DAUN JERUK.
// 2 gudang: Basah = protein hewani + sayur + buah; Kering = bahan kering + rempah + protein nabati.
export const BATCH_16_ITEMS: StockItem[] = [
  { id: 'b16-01', sku: 'BGN-BHK-1601', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 100 KG (22 Nov) -> Keluar masak 100 KG (23 Nov) Nasi Putih' },
  { id: 'b16-02', sku: 'BGN-BHK-1602', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 0.75, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 3 KG (22 Nov) -> Keluar masak 3 KG (23 Nov) perasa' },
  { id: 'b16-03', sku: 'BGN-BHK-1603', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 2 KG (22 Nov) -> Keluar masak 2 KG (23 Nov) pemanis' },
  { id: 'b16-04', sku: 'BGN-BHK-1604', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 9, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 36 L (22 Nov) -> Keluar masak 36 L (23 Nov) menggoreng' },
  { id: 'b16-05', sku: 'BGN-BHK-1605', name: 'TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 20 KG (22 Nov) -> Keluar masak 20 KG (23 Nov) balutan Ayam Goreng Tepung' },
  { id: 'b16-06', sku: 'BGN-BHK-1606', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 1 KG (22 Nov) -> Keluar masak 1 KG (23 Nov) bumbu' },
  { id: 'b16-07', sku: 'BGN-RMP-1601', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 2 KG (22 Nov) -> Keluar masak 2 KG (23 Nov) bumbu halus' },
  { id: 'b16-08', sku: 'BGN-RMP-1602', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 2 KG (22 Nov) -> Keluar masak 2 KG (23 Nov) bumbu halus' },
  { id: 'b16-09', sku: 'BGN-RMP-1603', name: 'KUNYIT BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.3, usedStock: 0.3, minStockAlert: 0.08, dailyUsageAvg: 0.3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 0.3 KG (22 Nov) -> Keluar masak 0.3 KG (23 Nov) bumbu' },
  { id: 'b16-10', sku: 'BGN-RMP-1604', name: 'KETUMBAR BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 0.1 KG (22 Nov) -> Keluar masak 0.1 KG (23 Nov) bumbu' },
  { id: 'b16-11', sku: 'BGN-RMP-1605', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 0.1 KG (22 Nov) -> Keluar masak 0.1 KG (23 Nov) bumbu' },
  { id: 'b16-12', sku: 'BGN-RMP-1606', name: 'DAUN SEREH', category: 'Rempah', uom: 'BATANG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 20 BATANG (22 Nov) -> Keluar masak 20 BATANG (23 Nov) aroma bumbu' },
  { id: 'b16-13', sku: 'BGN-RMP-1607', name: 'DAUN SALAM', category: 'Rempah', uom: 'LEMBAR', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 20 LEMBAR (22 Nov) -> Keluar masak 20 LEMBAR (23 Nov) aroma bumbu' },
  { id: 'b16-14', sku: 'BGN-RMP-1608', name: 'DAUN JERUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.03, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 0.1 KG (22 Nov) -> Keluar masak 0.1 KG (23 Nov) aroma bumbu' },
  { id: 'b16-15', sku: 'BGN-RMP-1609', name: 'KEMIRI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 1 KG (22 Nov) -> Keluar masak 1 KG (23 Nov) bumbu halus' },
  { id: 'b16-16', sku: 'BGN-PRH-1601', name: 'AYAM POTONG PAHA BAWAH', category: 'Protein Hewani', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1579, usedStock: 1579, minStockAlert: 395, dailyUsageAvg: 1579, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 1.579 PCS (22 Nov) -> Keluar masak 1.579 PCS (23 Nov) Ayam Goreng Tepung (nama verbatim nota)' },
  { id: 'b16-17', sku: 'BGN-PRN-1601', name: 'TAHU KUNING', category: 'Protein Nabati', uom: 'PCS', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1579, usedStock: 1579, minStockAlert: 395, dailyUsageAvg: 1579, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 1.579 PCS (22 Nov) -> Keluar masak 1.579 PCS (23 Nov) Tahu Goreng' },
  { id: 'b16-18', sku: 'BGN-SYR-1601', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 35, usedStock: 35, minStockAlert: 8.75, dailyUsageAvg: 35, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 35 KG (22 Nov) -> Keluar masak 35 KG (23 Nov) Tumis Kol & Wortel' },
  { id: 'b16-19', sku: 'BGN-SYR-1602', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 30 KG (22 Nov) -> Keluar masak 30 KG (23 Nov) Tumis Kol & Wortel' },
  { id: 'b16-20', sku: 'BGN-BUH-1601', name: 'KURMA', category: 'Buah', uom: 'DUS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1.25, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-22', lastUsageDate: '2026-11-23', batch: '16-NOV', notes: 'Batch 16: Masuk 5 DUS (22 Nov) -> Keluar masak 5 DUS (23 Nov) buah segar' },
];

// BATCH 15: 18 Bahan Masuk 19 Nov 2026 -> Keluar Masak 20 Nov 2026
// Menu (INFERENSI — menu resmi 20 Nov belum terbit di cloud KV per 19 Nov):
//   Nasi Putih, Ayam Goreng Tepung, Tempe Goreng, Tumis Kol & Brokoli, Kurma
// CATATAN: nota PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak (KG / L / PAPAN / DUS).
// 2 gudang: Basah = protein hewani + sayur + buah; Kering = bahan kering + rempah + protein nabati.
export const BATCH_15_ITEMS: StockItem[] = [
  { id: 'b15-01', sku: 'BGN-BHK-1501', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 25, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 100 KG (19 Nov) -> Keluar masak 100 KG (20 Nov) Nasi Putih' },
  { id: 'b15-02', sku: 'BGN-BHK-1502', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 12, usedStock: 12, minStockAlert: 3, dailyUsageAvg: 12, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 12 KG (19 Nov) -> Keluar masak 12 KG (20 Nov) adonan/balutan (nota: TERIGU)' },
  { id: 'b15-03', sku: 'BGN-BHK-1503', name: 'TEPUNG MAIZENA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1.25, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 5 KG (19 Nov) -> Keluar masak 5 KG (20 Nov) adonan/balutan (nota: MAIZENA)' },
  { id: 'b15-04', sku: 'BGN-BHK-1504', name: 'MENTEGA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.05, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 0.2 KG (19 Nov) -> Keluar masak 0.2 KG (20 Nov) lemak/adonan' },
  { id: 'b15-05', sku: 'BGN-BHK-1505', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 2 KG (19 Nov) -> Keluar masak 2 KG (20 Nov) pemanis' },
  { id: 'b15-06', sku: 'BGN-BHK-1506', name: 'SUSU FRESH MILK', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 10, usedStock: 10, minStockAlert: 2.5, dailyUsageAvg: 10, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 10 L (19 Nov) -> Keluar masak 10 L (20 Nov) adonan/minuman' },
  { id: 'b15-07', sku: 'BGN-BHK-1507', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 54, usedStock: 54, minStockAlert: 13.5, dailyUsageAvg: 54, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 54 L (19 Nov) -> Keluar masak 54 L (20 Nov) menggoreng' },
  { id: 'b15-08', sku: 'BGN-BHK-1508', name: 'GARAM', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1.5, usedStock: 1.5, minStockAlert: 0.38, dailyUsageAvg: 1.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 1.5 KG (19 Nov) -> Keluar masak 1.5 KG (20 Nov) bumbu' },
  { id: 'b15-09', sku: 'BGN-RMP-1501', name: 'DAUN KARI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.05, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 0.2 KG (19 Nov) -> Keluar masak 0.2 KG (20 Nov) aroma tumisan' },
  { id: 'b15-10', sku: 'BGN-RMP-1502', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.25, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 1 KG (19 Nov) -> Keluar masak 1 KG (20 Nov) tumisan (nota: BOMBAY)' },
  { id: 'b15-11', sku: 'BGN-RMP-1503', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 2 KG (19 Nov) -> Keluar masak 2 KG (20 Nov) bumbu halus' },
  { id: 'b15-12', sku: 'BGN-RMP-1504', name: 'ROYCO', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 2 KG (19 Nov) -> Keluar masak 2 KG (20 Nov) perasa' },
  { id: 'b15-13', sku: 'BGN-PRH-1501', name: 'AYAM FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15.75, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 63 KG (19 Nov) -> Keluar masak 63 KG (20 Nov) lauk utama Ayam Goreng Tepung' },
  { id: 'b15-14', sku: 'BGN-PRH-1502', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 0.75, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 3 KG (19 Nov) -> Keluar masak 3 KG (20 Nov) adonan pencelup' },
  { id: 'b15-15', sku: 'BGN-PRN-1501', name: 'TEMPE', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 20, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 80 PAPAN (19 Nov) -> Keluar masak 80 PAPAN (20 Nov) Tempe Goreng' },
  { id: 'b15-16', sku: 'BGN-SYR-1501', name: 'KOL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 30 KG (19 Nov) -> Keluar masak 30 KG (20 Nov) Tumis Kol & Brokoli' },
  { id: 'b15-17', sku: 'BGN-SYR-1502', name: 'BROKOLI', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 7.5, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 30 KG (19 Nov) -> Keluar masak 30 KG (20 Nov) Tumis Kol & Brokoli' },
  { id: 'b15-18', sku: 'BGN-BUH-1501', name: 'KURMA', category: 'Buah', uom: 'DUS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1.25, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-19', lastUsageDate: '2026-11-20', batch: '15-NOV', notes: 'Batch 15: Masuk 5 DUS (19 Nov) -> Keluar masak 5 DUS (20 Nov) buah segar' },
];
// BATCH 14: 18 Bahan Masuk 18 Nov 2026 -> Keluar Masak 19 Nov 2026
// Menu: Telur Bumbu Kecap Manis, Tahu Goreng, Tumis Buncis Wortel & Tomat, Buah Anggur
// (INFERENSI dari bahan — menu resmi 19 Nov belum terbit di cloud KV per 18 Nov)
// CATATAN: nota ini PUNYA kolom SATUAN -> satuan dipakai persis seperti tercetak.
export const BATCH_14_ITEMS: StockItem[] = [
  { id: 'b14-01', sku: 'BGN-BHK-1401', name: 'BERAS', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 100, usedStock: 100, minStockAlert: 20, dailyUsageAvg: 100, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 100 KG (18 Nov) -> Keluar masak 100 KG (19 Nov) Nasi Putih' },
  { id: 'b14-02', sku: 'BGN-BHK-1402', name: 'SAUCE SAMBAL', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 0.5, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 2 L (18 Nov) -> Keluar masak 2 L (19 Nov) sambal (nota: SC. SAMBAL DELMONTE)' },
  { id: 'b14-03', sku: 'BGN-BHK-1403', name: 'GULA JAWA', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 2 KG (18 Nov) -> Keluar masak 2 KG (19 Nov) pemanis (nota: GULA MERAH)' },
  { id: 'b14-04', sku: 'BGN-BHK-1404', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 2 KG (18 Nov) -> Keluar masak 2 KG (19 Nov) pemanis' },
  { id: 'b14-05', sku: 'BGN-BHK-1405', name: 'KECAP MANIS', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 4 L (18 Nov) -> Keluar masak 4 L (19 Nov) bumbu kecap' },
  { id: 'b14-06', sku: 'BGN-BHK-1406', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 3, usedStock: 3, minStockAlert: 1, dailyUsageAvg: 3, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 3 KG (18 Nov) -> Keluar masak 3 KG (19 Nov) perasa' },
  { id: 'b14-07', sku: 'BGN-BHK-1407', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 17, usedStock: 17, minStockAlert: 3, dailyUsageAvg: 17, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 17 KG (18 Nov) -> Keluar masak 17 KG (19 Nov) adonan/balutan' },
  { id: 'b14-08', sku: 'BGN-BHK-1408', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 36, usedStock: 36, minStockAlert: 5, dailyUsageAvg: 36, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 36 L (18 Nov) -> Keluar masak 36 L (19 Nov) menggoreng' },
  { id: 'b14-09', sku: 'BGN-RMP-1401', name: 'BAWANG MERAH GORENG', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.25, usedStock: 0.25, minStockAlert: 0.1, dailyUsageAvg: 0.25, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 0.25 KG (18 Nov) -> Keluar masak 0.25 KG (19 Nov) taburan' },
  { id: 'b14-10', sku: 'BGN-RMP-1402', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 2 KG (18 Nov) -> Keluar masak 2 KG (19 Nov) bumbu halus' },
  { id: 'b14-11', sku: 'BGN-RMP-1403', name: 'BAWANG MERAH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 2 KG (18 Nov) -> Keluar masak 2 KG (19 Nov) bumbu halus' },
  { id: 'b14-12', sku: 'BGN-RMP-1404', name: 'KEMIRI', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.5, usedStock: 0.5, minStockAlert: 0.2, dailyUsageAvg: 0.5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 0.5 KG (18 Nov) -> Keluar masak 0.5 KG (19 Nov) bumbu halus' },
  { id: 'b14-13', sku: 'BGN-PRH-1401', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 110, usedStock: 110, minStockAlert: 20, dailyUsageAvg: 110, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 110 KG (18 Nov) -> Keluar masak 110 KG (19 Nov) lauk utama telur (INFERENSI: Telur Bumbu Kecap Manis)' },
  { id: 'b14-14', sku: 'BGN-PRN-1401', name: 'TAHU PUTIH', category: 'Protein Nabati', uom: 'PAPAN', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 80, usedStock: 80, minStockAlert: 15, dailyUsageAvg: 80, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 80 PAPAN (18 Nov) -> Keluar masak 80 PAPAN (19 Nov) Tahu Goreng (nota: TAHU 80 PAPAN)' },
  { id: 'b14-15', sku: 'BGN-SYR-1401', name: 'TOMAT', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 10, usedStock: 10, minStockAlert: 2, dailyUsageAvg: 10, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 10 KG (18 Nov) -> Keluar masak 10 KG (19 Nov) tumisan' },
  { id: 'b14-16', sku: 'BGN-SYR-1402', name: 'BUNCIS', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 30 KG (18 Nov) -> Keluar masak 30 KG (19 Nov) tumisan' },
  { id: 'b14-17', sku: 'BGN-SYR-1403', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 30 KG (18 Nov) -> Keluar masak 30 KG (19 Nov) tumisan' },
  { id: 'b14-18', sku: 'BGN-BUH-1401', name: 'ANGGUR MERAH', category: 'Buah', uom: 'PETI', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 11, usedStock: 11, minStockAlert: 3, dailyUsageAvg: 11, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-18', lastUsageDate: '2026-11-19', batch: '14-NOV', notes: 'Batch 14: Masuk 11 PETI (18 Nov) -> Keluar 11 PETI (19 Nov) buah segar (nota: ANGGUR 11 PETI)' },
];

// Gabungan Semua Item Master Bahan Baku (17 Batch = 314 Item)
// Menu: Ayam Fillet Katsu, Edamame, Tumis Pakcoy Wortel & Tomat, Kentang Goreng, Buah Pisang (INFERENSI — menu resmi 18 Nov belum terbit di cloud KV per 17 Nov)
// CATATAN: nota ini TIDAK ada kolom SATUAN -> satuan diinferensi standar dapur SPPG.
export const BATCH_13_ITEMS: StockItem[] = [
  { id: 'b13-01', sku: 'BGN-BHK-1301', name: 'MINYAK GORENG', category: 'Bahan Kering', uom: 'L', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 72, usedStock: 72, minStockAlert: 20, dailyUsageAvg: 72, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 72 L (17 Nov) -> Keluar masak 72 L (18 Nov)' },
  { id: 'b13-02', sku: 'BGN-BHK-1302', name: 'ROYCO', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 4, usedStock: 4, minStockAlert: 1, dailyUsageAvg: 4, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 4 KG (17 Nov) -> Keluar masak 4 KG (18 Nov)' },
  { id: 'b13-03', sku: 'BGN-BHK-1303', name: 'TEPUNG TERIGU', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 2, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 5 KG (17 Nov) -> Keluar masak 5 KG (18 Nov) adonan katsu' },
  { id: 'b13-04', sku: 'BGN-BHK-1304', name: 'TEPUNG PANIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 10, usedStock: 10, minStockAlert: 3, dailyUsageAvg: 10, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 10 KG (17 Nov) -> Keluar masak 10 KG (18 Nov) balutan katsu' },
  { id: 'b13-05', sku: 'BGN-BHK-1305', name: 'SUSU UHT INDOMILK PLAIN', category: 'Bahan Kering', uom: 'KARTON', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 2 KARTON (17 Nov) -> Keluar masak 2 KARTON (18 Nov) adonan (SATUAN INFERENSI)' },
  { id: 'b13-06', sku: 'BGN-BHK-1306', name: 'GULA PASIR', category: 'Bahan Kering', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 2 KG (17 Nov) -> Keluar masak 2 KG (18 Nov)' },
  { id: 'b13-07', sku: 'BGN-RMP-1301', name: 'LADA BUBUK', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.2, usedStock: 0.2, minStockAlert: 0.1, dailyUsageAvg: 0.2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 0.2 KG (17 Nov) -> Keluar masak 0.2 KG (18 Nov)' },
  { id: 'b13-08', sku: 'BGN-RMP-1302', name: 'BAWANG BOMBAY', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 1, usedStock: 1, minStockAlert: 0.5, dailyUsageAvg: 1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 1 KG (17 Nov) -> Keluar masak 1 KG (18 Nov) tumisan' },
  { id: 'b13-09', sku: 'BGN-RMP-1303', name: 'BAWANG PUTIH', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 2, usedStock: 2, minStockAlert: 1, dailyUsageAvg: 2, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 2 KG (17 Nov) -> Keluar masak 2 KG (18 Nov) bumbu halus' },
  { id: 'b13-10', sku: 'BGN-RMP-1304', name: 'OREGANO KERING', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 0.1 KG (17 Nov) -> Keluar masak 0.1 KG (18 Nov) perasa katsu' },
  { id: 'b13-11', sku: 'BGN-RMP-1305', name: 'BASIL KERING', category: 'Rempah', uom: 'KG', storageLocation: 'Gudang Kering', currentStock: 0, initialStock: 0.1, usedStock: 0.1, minStockAlert: 0.05, dailyUsageAvg: 0.1, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 0.1 KG (17 Nov) -> Keluar masak 0.1 KG (18 Nov) perasa katsu' },
  { id: 'b13-12', sku: 'BGN-PRH-1301', name: 'AYAM FILLET', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 63, usedStock: 63, minStockAlert: 15, dailyUsageAvg: 63, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 63 KG (17 Nov) -> Keluar masak 63 KG (18 Nov) Ayam Fillet Goreng Tepung' },
  { id: 'b13-13', sku: 'BGN-PRH-1302', name: 'TELUR AYAM', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 5 KG (17 Nov) -> Keluar masak 5 KG (18 Nov) adonan celup' },
  { id: 'b13-14', sku: 'BGN-PRH-1303', name: 'AYAM GILING', category: 'Protein Hewani', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 5, usedStock: 5, minStockAlert: 1, dailyUsageAvg: 5, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 5 KG (17 Nov) -> Keluar masak 5 KG (18 Nov) isian/bumbu' },
  { id: 'b13-15', sku: 'BGN-PRN-1301', name: 'EDAMAME', category: 'Protein Nabati', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 30 KG (17 Nov) -> Keluar masak 30 KG (18 Nov) Edamame' },
  { id: 'b13-16', sku: 'BGN-SYR-1301', name: 'WORTEL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 7, usedStock: 7, minStockAlert: 2, dailyUsageAvg: 7, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 7 KG (17 Nov) -> Keluar masak 7 KG (18 Nov) tumisan' },
  { id: 'b13-17', sku: 'BGN-SYR-1302', name: 'TOMAT MERAH', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 20, usedStock: 20, minStockAlert: 5, dailyUsageAvg: 20, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 20 KG (17 Nov) -> Keluar masak 20 KG (18 Nov) tumisan' },
  { id: 'b13-18', sku: 'BGN-SYR-1303', name: 'PAKCOY', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 30 KG (17 Nov) -> Keluar masak 30 KG (18 Nov) tumisan' },
  { id: 'b13-19', sku: 'BGN-SYR-1304', name: 'JAGUNG PIPIL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 30, usedStock: 30, minStockAlert: 8, dailyUsageAvg: 30, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 30 KG (17 Nov) -> Keluar masak 30 KG (18 Nov) tumisan' },
  { id: 'b13-20', sku: 'BGN-SYR-1305', name: 'KENTANG LOKAL', category: 'Sayur', uom: 'KG', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 160, usedStock: 160, minStockAlert: 30, dailyUsageAvg: 160, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 160 KG (17 Nov) -> Keluar masak 160 KG (18 Nov) Kentang Goreng' },
  { id: 'b13-21', sku: 'BGN-BUH-1301', name: 'PISANG', category: 'Buah', uom: 'PCS', storageLocation: 'Gudang Basah', currentStock: 0, initialStock: 1600, usedStock: 1600, minStockAlert: 200, dailyUsageAvg: 1600, supplierName: SUPPLIER_YAYASAN, lastRestockDate: '2026-11-17', lastUsageDate: '2026-11-18', batch: '13-NOV', notes: 'Batch 13: Masuk 1.600 PCS (17 Nov) -> Keluar 1.600 PCS (18 Nov) buah segar' },
];

// Gabungan Semua Item Master Bahan Baku (20 Batch = 380 Item)
export const DEFAULT_STOCK_ITEMS_ALL: StockItem[] = [...BATCH_20_ITEMS, ...BATCH_19_ITEMS, ...BATCH_18_ITEMS, ...BATCH_17_ITEMS, ...BATCH_16_ITEMS, ...BATCH_15_ITEMS, ...BATCH_14_ITEMS, ...BATCH_13_ITEMS, ...BATCH_12_ITEMS, ...BATCH_11_ITEMS, ...BATCH_10_ITEMS, ...BATCH_9_ITEMS, ...BATCH_8_ITEMS, ...BATCH_7_ITEMS, ...BATCH_6_ITEMS, ...BATCH_5_ITEMS, ...BATCH_4_ITEMS, ...BATCH_3_ITEMS, ...BATCH_2_ITEMS, ...BATCH_1_ITEMS];

// Register Mutasi Lengkap (20 Siklus):
// B1: 16 Masuk (01 Nov) + 16 Keluar (02 Nov) = 32
// B2: 17 Masuk (02 Nov) + 17 Keluar (03 Nov) = 34
// B3: 18 Masuk (03 Nov) + 18 Keluar (04 Nov) = 36
// B4: 20 Masuk (04 Nov) + 20 Keluar (05 Nov) = 40
// B5: 22 Masuk (05 Nov) + 22 Keluar (06 Nov) = 44
// B6: 14 Masuk (08 Nov) + 14 Keluar (09 Nov) = 28
// B7: 15 Masuk (09 Nov) + 15 Keluar (10 Nov) = 30
// B8: 18 Masuk (10 Nov) + 18 Keluar (11 Nov) = 36
// B9: 19 Masuk (11 Nov) + 19 Keluar (12 Nov) = 38
// B10: 22 Masuk (12 Nov) + 22 Keluar (13 Nov) = 44
// B11: 16 Masuk (15 Nov) + 16 Keluar (16 Nov) = 32
// B12: 18 Masuk (16 Nov) + 18 Keluar (17 Nov) = 36
// B13: 21 Masuk (17 Nov) + 21 Keluar (18 Nov) = 42
// B14: 18 Masuk (18 Nov) + 18 Keluar (19 Nov) = 36
// B15: 18 Masuk (19 Nov) + 18 Keluar (20 Nov) = 36
// B16: 20 Masuk (22 Nov) + 20 Keluar (23 Nov) = 40
// B17: 22 Masuk (23 Nov) + 22 Keluar (24 Nov) = 44
// B18: 21 Masuk (24 Nov) + 21 Keluar (25 Nov) = 42
// B19: 28 Masuk (25 Nov) + 28 Keluar (26 Nov) = 56
// B20: 17 Masuk (26 Nov) + 17 Keluar (27 Nov) = 34
// TOTAL KESELURUHAN: 760 mutasi (380 item master x 2 arah)
export const DEFAULT_STOCK_MOVEMENTS: StockMovement[] = [
  // --- 17 KELUAR MASAK BATCH 20 (27 NOV 2026) ---
  ...BATCH_20_ITEMS.map((item, idx) => ({
    id: `mov-20261127-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-27',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261127',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 20: Pemakaian masak 1.541 Porsi MBG tgl 27 Nov 2026 (Menu Resmi: Nasi Putih, Telur Semur, Tempe Goreng, Tumis Pakcoy Wortel, Kelengkeng)',
  })),

  // --- 17 MASUK BATCH 20 (26 NOV 2026) ---
  ...BATCH_20_ITEMS.map((item, idx) => ({
    id: `mov-20261126-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-26',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261126-01',
    loggedBy: 'Security Andrie (Petugas Timbangan)',
    notes: `Batch 20: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 26 Nov 2026`,
  })),

  // --- 28 KELUAR MASAK BATCH 19 (26 NOV 2026) ---
  ...BATCH_19_ITEMS.map((item, idx) => ({
    id: `mov-20261126-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-26',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261126',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 19: Pemakaian masak 1.541 Porsi MBG tgl 26 Nov 2026 (INFERENSI: Nasi Putih, Lumpia / Olahan Ayam Giling, Tahu Kuning Goreng, Tumis Kacang Panjang & Putren, Pisang Ambon / Sunpride — menu resmi 26 Nov belum terbit)',
  })),

  // --- 28 MASUK BATCH 19 (25 NOV 2026) ---
  ...BATCH_19_ITEMS.map((item, idx) => ({
    id: `mov-20261125-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-25',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261125-01',
    loggedBy: 'Security Andrie (Petugas Timbangan)',
    notes: `Batch 19: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 25 Nov 2026`,
  })),

  // --- 21 KELUAR MASAK BATCH 18 (25 NOV 2026) ---
  ...BATCH_18_ITEMS.map((item, idx) => ({
    id: `mov-20261125-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-25',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261125',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 18: Pemakaian masak 1.541 Porsi MBG tgl 25 Nov 2026 (INFERENSI: Nasi Putih, Chicken Teriyaki, Edamame Rebus, Tumis Caisim Jagung Wortel, Anggur Merah — menu resmi 25 Nov belum terbit)',
  })),

  // --- 21 MASUK BATCH 18 (24 NOV 2026) ---
  ...BATCH_18_ITEMS.map((item, idx) => ({
    id: `mov-20261124-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-24',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261124-01',
    loggedBy: 'Security Andrie (Petugas Timbangan)',
    notes: `Batch 18: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 24 Nov 2026`,
  })),
  // --- 22 KELUAR MASAK BATCH 17 (24 NOV 2026) ---
  ...BATCH_17_ITEMS.map((item, idx) => ({
    id: `mov-20261124-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-24',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261124',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 17: Pemakaian masak 1.541 Porsi MBG tgl 24 Nov 2026 (INFERENSI: Nasi Putih, Ayam Asam Manis, Tempe Goreng, Tumis Buncis Kembang Kol & Tomat, Jeruk — menu resmi 24 Nov belum terbit)',
  })),

  // --- 22 MASUK BATCH 17 (23 NOV 2026) ---
  ...BATCH_17_ITEMS.map((item, idx) => ({
    id: `mov-20261123-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-23',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261123-01',
    loggedBy: 'Security Andrie (Petugas Timbangan)',
    notes: `Batch 17: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 23 Nov 2026`,
  })),

  // --- 20 KELUAR MASAK BATCH 16 (23 NOV 2026) ---
  ...BATCH_16_ITEMS.map((item, idx) => ({
    id: `mov-20261123-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-23',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261123',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 16: Pemakaian masak 1.541 Porsi MBG tgl 23 Nov 2026 (INFERENSI: Nasi Putih, Ayam Goreng Tepung, Tahu Goreng, Tumis Kol & Wortel, Kurma — menu resmi 23 Nov belum terbit)',
  })),

  // --- 20 MASUK BATCH 16 (22 NOV 2026) ---
  ...BATCH_16_ITEMS.map((item, idx) => ({
    id: `mov-20261122-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-22',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261122-01',
    loggedBy: 'Security Andrie (Petugas Timbangan)',
    notes: `Batch 16: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 22 Nov 2026`,
  })),

  // --- 18 KELUAR MASAK BATCH 15 (20 NOV 2026) ---
  ...BATCH_15_ITEMS.map((item, idx) => ({
    id: `mov-20261120-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-20',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261120',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 15: Pemakaian masak 1.541 Porsi MBG tgl 20 Nov 2026 (INFERENSI: Nasi Putih, Ayam Goreng Tepung, Tempe Goreng, Tumis Kol & Brokoli, Kurma — menu resmi 20 Nov belum terbit)',
  })),

  // --- 18 MASUK BATCH 15 (19 NOV 2026) ---
  ...BATCH_15_ITEMS.map((item, idx) => ({
    id: `mov-20261119-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-19',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261119-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 15: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 19 Nov 2026`,
  })),

  // --- 18 KELUAR MASAK BATCH 14 (19 NOV 2026) ---
  ...BATCH_14_ITEMS.map((item, idx) => ({
    id: `mov-20261119-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-19',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261119',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 14: Pemakaian masak 1.541 Porsi MBG tgl 19 Nov 2026 (Telur Bumbu Kecap Manis, Tahu Goreng, Tumis Buncis Wortel & Tomat, Buah Anggur)',
  })),

  // --- 18 MASUK BATCH 14 (18 NOV 2026) ---
  ...BATCH_14_ITEMS.map((item, idx) => ({
    id: `mov-20261118-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-18',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261118-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 14: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 18 Nov 2026`,
  })),

  // --- 21 KELUAR MASAK BATCH 13 (18 NOV 2026) ---
  ...BATCH_13_ITEMS.map((item, idx) => ({
    id: `mov-20261118-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-18',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261118',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 13: Pemakaian masak 1.541 Porsi MBG tgl 18 Nov 2026 (Ayam Fillet Goreng Tepung, Edamame, Tumis Pakcoy Wortel & Tomat, Kentang Goreng, Buah Pisang)',
  })),

  // --- 21 MASUK BATCH 13 (17 NOV 2026) ---
  ...BATCH_13_ITEMS.map((item, idx) => ({
    id: `mov-20261117-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-17',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261117-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 13: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 17 Nov 2026`,
  })),

  // --- 18 KELUAR MASAK BATCH 12 (17 NOV 2026) ---
  ...BATCH_12_ITEMS.map((item, idx) => ({
    id: `mov-20261117-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-17',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261117',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 12: Pemakaian masak 1.541 Porsi MBG tgl 17 Nov 2026 (Nasi Putih Chicken Crumble — Nasi Putih, Ayam, Tahu, Wortel & Putren, Jeruk Manis)',
  })),

  // --- 18 MASUK BATCH 12 (16 NOV 2026) ---
  ...BATCH_12_ITEMS.map((item, idx) => ({
    id: `mov-20261116-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-16',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261116-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 12: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 16 Nov 2026`,
  })),

  // --- 16 KELUAR MASAK BATCH 11 (16 NOV 2026) ---
  ...BATCH_11_ITEMS.map((item, idx) => ({
    id: `mov-20261116-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-16',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261116',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 11: Pemakaian masak 1.553 Porsi MBG tgl 16 Nov 2026 (Nasi Putih Lele Popcorn — Nasi Putih, Ikan Lele, Tempe, Kol & Wortel, Kelengkeng)',
  })),

  // --- 16 MASUK BATCH 11 (15 NOV 2026) ---
  ...BATCH_11_ITEMS.map((item, idx) => ({
    id: `mov-20261115-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-15',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261115-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 11: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 15 Nov 2026`,
  })),

  // --- 22 KELUAR MASAK BATCH 10 (13 NOV 2026) ---
  ...BATCH_10_ITEMS.map((item, idx) => ({
    id: `mov-20261113-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-13',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261113',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 10: Pemakaian masak 1.553 Porsi MBG tgl 13 Nov 2026 (Nasi Putih, Telur Bumbu Pesmol, Tempe Mendohan, Tumis Labu Siam dan Jagung, Jeruk)',
  })),

  // --- 22 MASUK BATCH 10 (12 NOV 2026) ---
  ...BATCH_10_ITEMS.map((item, idx) => ({
    id: `mov-20261112-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-12',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261112-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 10: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 12 Nov 2026`,
  })),

  // --- 19 KELUAR MASAK BATCH 9 (12 NOV 2026) ---
  ...BATCH_9_ITEMS.map((item, idx) => ({
    id: `mov-20261112-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-12',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261112',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 9: Pemakaian masak 1.553 Porsi MBG tgl 12 Nov 2026 (Nasi Putih, Sesame Chicken, Tempe Goreng, Oseng Kol dan Kacang Panjang, Kurma)',
  })),

  // --- 19 MASUK BATCH 9 (11 NOV 2026) ---
  ...BATCH_9_ITEMS.map((item, idx) => ({
    id: `mov-20261111-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-11',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261111-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 9: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 11 Nov 2026`,
  })),

  // --- 18 KELUAR MASAK BATCH 8 (11 NOV 2026) ---
  ...BATCH_8_ITEMS.map((item, idx) => ({
    id: `mov-20261111-out-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-11',
    time: '05:00',
    itemId: item.id,
    itemName: item.name,
    type: 'OUT' as const,
    qty: item.usedStock,
    uom: item.uom,
    balanceAfter: 0,
    reference: 'BOM-MSK-20261111',
    loggedBy: 'Seksi Pengolahan Dapur',
    notes: 'Batch 8: Pemakaian masak 1.553 Porsi MBG tgl 11 Nov 2026 (Nasi Putih, Ayam Kecap, Tahu Crispy, Tumis Wortel Pokcoy, Kelengkeng)',
  })),

  // --- 18 MASUK BATCH 8 (10 NOV 2026) ---
  ...BATCH_8_ITEMS.map((item, idx) => ({
    id: `mov-20261110-in-${String(idx + 1).padStart(2, '0')}`,
    date: '2026-11-10',
    time: '04:30',
    itemId: item.id,
    itemName: item.name,
    type: 'IN' as const,
    qty: item.initialStock,
    uom: item.uom,
    balanceAfter: item.initialStock,
    reference: 'GRN-20261110-01',
    loggedBy: 'Nur Khafidin (Petugas Timbangan)',
    notes: `Batch 8: Penerimaan bahan baku masuk dari ${SUPPLIER_YAYASAN} tgl 10 Nov 2026`,
  })),

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
        const defaultIds = new Set(DEFAULT_STOCK_ITEMS_ALL.map((item) => item.id));
        const customItems = parsed.filter((item: StockItem) => !defaultIds.has(item.id));
        const merged = [
          ...customItems,
          ...DEFAULT_STOCK_ITEMS_ALL.map((def) => {
            const found = parsed.find((p: StockItem) => p.id === def.id);
            if (!found) return def;
            if (def.id === 'b1-11' && found.initialStock === 65) return def; // Update Dorry 65 -> 90 KG per RKB
            if (def.id === 'b4-17' && found.name === 'BROKOLI') return def; // Update Brokoli -> Buncis per instruksi Tuan
            return found;
          }),
        ];
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
    const raw = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY) ?? localStorage.getItem(LEGACY_ARSIP_STOCK_MOVEMENTS_KEY);
    if (!raw) {
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS);
      return DEFAULT_STOCK_MOVEMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const originalBatchNotes = parsed.map((movement: StockMovement) => movement.notes);
      const corrected = parsed.map((movement: StockMovement) => {
        if (movement.type !== 'OUT' || movement.date < '2026-11-17' || !movement.reference?.startsWith('BOM-MSK-') || !movement.notes?.includes('1.553 Porsi MBG')) return movement;
        return { ...movement, notes: movement.notes.replace(/1\.553(?= Porsi MBG)/g, '1.541') };
      });
      // Auto-merge riwayat mutasi batch baru bila belum tersimpan di klien
      const existingIds = new Set(corrected.map((m: StockMovement) => m.id));
      const missing = DEFAULT_STOCK_MOVEMENTS.filter((m) => !existingIds.has(m.id));
      const wasLegacyKey = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY) === null;
      const hasCorrectedNotes = corrected.some((m: StockMovement, index: number) => m.notes !== originalBatchNotes[index]);
      if (missing.length > 0 || wasLegacyKey || hasCorrectedNotes) {
        const merged = [...missing, ...corrected];
        saveMovementsToStorage(merged);
        return merged;
      }
      return corrected;
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

export function mergeStockWithCloudItems(currentItems: StockItem[], cloudItems: StockItem[]): StockItem[] {
  if (!cloudItems || cloudItems.length === 0) return currentItems;
  const existingIds = new Set(currentItems.map((item) => item.id));
  const newCloudItems = cloudItems.filter((item) => !existingIds.has(item.id));
  if (newCloudItems.length === 0) return currentItems;
  return [...newCloudItems, ...currentItems];
}

export function mergeMovementsWithCloudItems(currentMovs: StockMovement[], cloudMovs: StockMovement[]): StockMovement[] {
  if (!cloudMovs || cloudMovs.length === 0) return currentMovs;
  const existingIds = new Set(currentMovs.map((m) => m.id));
  const newCloudMovs = cloudMovs.filter((m) => !existingIds.has(m.id));
  if (newCloudMovs.length === 0) return currentMovs;
  return [...newCloudMovs, ...currentMovs];
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
    checkerName: 'Security Andrie (Petugas Timbangan)',
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
