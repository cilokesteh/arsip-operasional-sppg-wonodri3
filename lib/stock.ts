export type StockCategory =
  | 'Bahan Kering'
  | 'Rempah'
  | 'Protein Hewani'
  | 'Protein Nabati'
  | 'Sayur'
  | 'Buah';

export type StockStatus = 'safe' | 'warning' | 'critical';

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: StockCategory;
  uom: string; // KG, L, POUCH, BTL, PAPAN, KRAT, etc.
  storageLocation: string;
  currentStock: number;
  minStockAlert: number;
  dailyUsageAvg: number;
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
  reference: string;
  loggedBy: string;
  notes?: string;
}

export interface StockSummary {
  totalItems: number;
  totalKg: number;
  totalQtyNonKg: number;
  gudangBasahCount: number;
  gudangKeringCount: number;
  safeCount: number;
  warningCount: number;
  criticalCount: number;
  categoryCounts: Record<StockCategory, number>;
}

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v5';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v5';
export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v5';

// 16 Master Bahan Baku Masuk Resmi Tanggal 01 November 2026
export const DEFAULT_STOCK_ITEMS_16: StockItem[] = [
  // 1. Bahan Kering
  {
    id: 'bhk-01',
    sku: 'BGN-BHK-001',
    name: 'TEPUNG TERIGU',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 20,
    minStockAlert: 5,
    dailyUsageAvg: 10,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-02',
    sku: 'BGN-BHK-002',
    name: 'ROYCO',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 1,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-03',
    sku: 'BGN-BHK-003',
    name: 'MINYAK GORENG',
    category: 'Bahan Kering',
    uom: 'L',
    storageLocation: 'Gudang Kering',
    currentStock: 54,
    minStockAlert: 15,
    dailyUsageAvg: 25,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-04',
    sku: 'BGN-BHK-004',
    name: 'MAYONAISE',
    category: 'Bahan Kering',
    uom: 'POUCH',
    storageLocation: 'Gudang Kering',
    currentStock: 10,
    minStockAlert: 2,
    dailyUsageAvg: 5,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-05',
    sku: 'BGN-BHK-005',
    name: 'MADU',
    category: 'Bahan Kering',
    uom: 'BTL',
    storageLocation: 'Gudang Kering',
    currentStock: 1,
    minStockAlert: 1,
    dailyUsageAvg: 0.5,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-06',
    sku: 'BGN-BHK-006',
    name: 'GULA PASIR',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 1.5,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-07',
    sku: 'BGN-BHK-007',
    name: 'TEPUNG MAIZENA',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 1.5,
    minStockAlert: 0.5,
    dailyUsageAvg: 0.75,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'bhk-08',
    sku: 'BGN-BHK-008',
    name: 'GARAM',
    category: 'Bahan Kering',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 1,
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },

  // 2. Rempah
  {
    id: 'rmp-01',
    sku: 'BGN-RMP-001',
    name: 'LADA BUBUK',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 0.1,
    minStockAlert: 0.05,
    dailyUsageAvg: 0.05,
    supplierName: 'Supplier Rempah',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'rmp-02',
    sku: 'BGN-RMP-002',
    name: 'BAWANG PUTIH',
    category: 'Rempah',
    uom: 'KG',
    storageLocation: 'Gudang Kering',
    currentStock: 2,
    minStockAlert: 1,
    dailyUsageAvg: 1,
    supplierName: 'Supplier Rempah',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },

  // 3. Protein Hewani (Gudang Basah)
  {
    id: 'prh-01',
    sku: 'BGN-PRH-001',
    name: 'DORRY FILLET GLASSING 30%',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 65,
    minStockAlert: 20,
    dailyUsageAvg: 45,
    supplierName: 'Supplier Ikan & Daging',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026 (Revisi 65 KG)',
  },
  {
    id: 'prh-02',
    sku: 'BGN-PRH-002',
    name: 'TELUR AYAM',
    category: 'Protein Hewani',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 3,
    minStockAlert: 1,
    dailyUsageAvg: 1.5,
    supplierName: 'Supplier Telur',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },

  // 4. Protein Nabati (Gudang Kering)
  {
    id: 'prn-01',
    sku: 'BGN-PRN-001',
    name: 'TEMPE',
    category: 'Protein Nabati',
    uom: 'PAPAN',
    storageLocation: 'Gudang Kering',
    currentStock: 80,
    minStockAlert: 20,
    dailyUsageAvg: 40,
    supplierName: 'Pengrajin Tempe',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },

  // 5. Sayur (Gudang Basah)
  {
    id: 'syr-01',
    sku: 'BGN-SYR-001',
    name: 'BUNCIS',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 30,
    minStockAlert: 10,
    dailyUsageAvg: 15,
    supplierName: 'Petani Sayur Bandungan',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
  {
    id: 'syr-02',
    sku: 'BGN-SYR-002',
    name: 'LABU SIAM',
    category: 'Sayur',
    uom: 'KG',
    storageLocation: 'Gudang Basah',
    currentStock: 30,
    minStockAlert: 10,
    dailyUsageAvg: 15,
    supplierName: 'Petani Sayur Bandungan',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },

  // 6. Buah (Gudang Basah)
  {
    id: 'buh-01',
    sku: 'BGN-BUH-001',
    name: 'ANGGUR MERAH',
    category: 'Buah',
    uom: 'KRAT',
    storageLocation: 'Gudang Basah',
    currentStock: 11,
    minStockAlert: 3,
    dailyUsageAvg: 5,
    supplierName: 'Distributor Buah',
    lastRestockDate: '2026-11-01',
    notes: 'Penerimaan masuk 01 Nov 2026',
  },
];

// Register Mutasi Awal Masuk 01 November 2026
export const DEFAULT_STOCK_MOVEMENTS_16: StockMovement[] = DEFAULT_STOCK_ITEMS_16.map((item, idx) => ({
  id: `mov-20261101-${String(idx + 1).padStart(2, '0')}`,
  date: '2026-11-01',
  time: '04:30',
  itemId: item.id,
  itemName: item.name,
  type: 'IN',
  qty: item.currentStock,
  uom: item.uom,
  balanceAfter: item.currentStock,
  reference: 'GRN-20261101-01',
  loggedBy: 'Nur Khafidin (Petugas Logistik)',
  notes: 'Penerimaan bahan baku masuk tgl 01 Nov 2026',
}));

// Helper status buffer berdasarkan jumlah hari pemakaian
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

// Storage Accessors (Safe for SSR)
export function loadStockFromStorage(): StockItem[] {
  if (typeof window === 'undefined') return DEFAULT_STOCK_ITEMS_16;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_INVENTORY_KEY);
    if (!raw) {
      saveStockToStorage(DEFAULT_STOCK_ITEMS_16);
      return DEFAULT_STOCK_ITEMS_16;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load stock from localStorage:', err);
  }
  return DEFAULT_STOCK_ITEMS_16;
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
  if (typeof window === 'undefined') return DEFAULT_STOCK_MOVEMENTS_16;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY);
    if (!raw) {
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS_16);
      return DEFAULT_STOCK_MOVEMENTS_16;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load movements from localStorage:', err);
  }
  return DEFAULT_STOCK_MOVEMENTS_16;
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
  let totalKg = 0;
  let totalQtyNonKg = 0;
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
  };

  items.forEach((item) => {
    if (item.uom.toUpperCase() === 'KG') {
      totalKg += item.currentStock;
    } else {
      totalQtyNonKg += item.currentStock;
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
    totalKg: Number(totalKg.toFixed(2)),
    totalQtyNonKg: Number(totalQtyNonKg.toFixed(2)),
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

// Export CSV Inventory (Tanpa Harga)
export function generateStockCSV(items: StockItem[]): string {
  const headers = [
    'SKU',
    'Golongan / Kategori',
    'Nama Bahan Makanan',
    'Lokasi Simpan',
    'Jumlah Stok Fisik',
    'Satuan',
    'Batas Buffer Min',
    'Rata-rata Pakai / Hari',
    'Hari Ketahanan',
    'Status Buffer',
    'Suplier / Vendor',
    'Tanggal Masuk Terakhir',
  ];

  const rows = items.map((item) => {
    const status = calculateStockStatus(item);
    const days = getDaysLeft(item);
    const statusLabel =
      status === 'critical' ? 'KRITIS' : status === 'warning' ? 'MENIPIS' : 'AMAN';

    return [
      `"${item.sku}"`,
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.storageLocation}"`,
      item.currentStock,
      `"${item.uom}"`,
      item.minStockAlert,
      item.dailyUsageAvg,
      days,
      `"${statusLabel}"`,
      `"${item.supplierName.replace(/"/g, '""')}"`,
      `"${item.lastRestockDate}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Export CSV Mutasi (Tanpa Harga)
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
    notes: 'Kondisi fisik kemasan baik',
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
    if (parsed && Array.isArray(parsed.rows)) {
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
