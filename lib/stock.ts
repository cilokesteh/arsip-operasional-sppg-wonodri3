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
  storageLocation: string; // 'Gudang Basah' atau 'Gudang Kering'
  currentStock: number;
  initialStock: number; // Jumlah yang masuk 01 Nov 2026
  usedStock: number; // Jumlah yang keluar masak 02 Nov 2026
  minStockAlert: number;
  dailyUsageAvg: number;
  supplierName: string;
  lastRestockDate: string; // YYYY-MM-DD
  lastUsageDate: string; // YYYY-MM-DD
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

export const ARSIP_STOCK_INVENTORY_KEY = 'sppg_stock_inventory_v6';
export const ARSIP_STOCK_MOVEMENTS_KEY = 'sppg_stock_movements_v6';
export const ARSIP_STOCK_OPNAME_DRAFT_KEY = 'sppg_stock_opname_draft_v6';

// 16 Master Bahan Baku (Masuk 01 Nov 2026 -> Keluar Masak Penuh 02 Nov 2026 untuk 1.553 Porsi MBG)
export const DEFAULT_STOCK_ITEMS_16: StockItem[] = [
  // 1. Bahan Kering (Gudang Kering)
  {
    id: 'bhk-01',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 20 KG (01 Nov) -> Keluar masak 20 KG (02 Nov) untuk adonan crispy Dorry',
  },
  {
    id: 'bhk-02',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov) bumbu penyedap sup/tumis',
  },
  {
    id: 'bhk-03',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 54 L (01 Nov) -> Keluar masak 54 L (02 Nov) menggoreng Dorry & Tempe',
  },
  {
    id: 'bhk-04',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 10 POUCH (01 Nov) -> Keluar 10 POUCH (02 Nov) saus mayo madu 1.553 porsi',
  },
  {
    id: 'bhk-05',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 1 BTL (01 Nov) -> Keluar 1 BTL (02 Nov) campuran saus mayo madu',
  },
  {
    id: 'bhk-06',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 3 KG (01 Nov) -> Keluar masak 3 KG (02 Nov) bumbu dapur & saus',
  },
  {
    id: 'bhk-07',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 1.5 KG (01 Nov) -> Keluar masak 1.5 KG (02 Nov) pengental saus & renyah',
  },
  {
    id: 'bhk-08',
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
    supplierName: 'Supplier Bahan Kering',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov) bumbu marinasi & sup',
  },

  // 2. Rempah (Gudang Kering)
  {
    id: 'rmp-01',
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
    supplierName: 'Supplier Rempah',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 0.1 KG (01 Nov) -> Keluar masak 0.1 KG (02 Nov) bumbu marinasi ikan',
  },
  {
    id: 'rmp-02',
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
    supplierName: 'Supplier Rempah',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 2 KG (01 Nov) -> Keluar masak 2 KG (02 Nov) tumis bumbu sayur & marinasi',
  },

  // 3. Protein Hewani (Gudang Basah)
  {
    id: 'prh-01',
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
    supplierName: 'Supplier Ikan & Daging',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 65 KG (01 Nov) -> Keluar masak 65 KG (02 Nov) lauk hewani 1.553 porsi',
  },
  {
    id: 'prh-02',
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
    supplierName: 'Supplier Telur',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 3 KG (01 Nov) -> Keluar masak 3 KG (02 Nov) adonan pencelup katsu crispy',
  },

  // 4. Protein Nabati (Gudang Kering)
  {
    id: 'prn-01',
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
    supplierName: 'Pengrajin Tempe',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 80 PAPAN (01 Nov) -> Keluar masak 80 PAPAN (02 Nov) lauk nabati 1.553 porsi',
  },

  // 5. Sayur (Gudang Basah)
  {
    id: 'syr-01',
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
    supplierName: 'Petani Sayur Bandungan',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 30 KG (01 Nov) -> Keluar masak 30 KG (02 Nov) olahan sayur MBG',
  },
  {
    id: 'syr-02',
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
    supplierName: 'Petani Sayur Bandungan',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 30 KG (01 Nov) -> Keluar masak 30 KG (02 Nov) olahan sayur MBG',
  },

  // 6. Buah (Gudang Basah)
  {
    id: 'buh-01',
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
    supplierName: 'Distributor Buah',
    lastRestockDate: '2026-11-01',
    lastUsageDate: '2026-11-02',
    notes: 'Masuk 11 KRAT (01 Nov) -> Keluar 11 KRAT (02 Nov) buah segar 1.553 porsi siswa',
  },
];

// Register 32 Mutasi: 16 Masuk (01 Nov 2026) + 16 Keluar Masak (02 Nov 2026)
export const DEFAULT_STOCK_MOVEMENTS_32: StockMovement[] = [
  // --- 16 BARANG KELUAR MASAK (02 NOVEMBER 2026) ---
  ...DEFAULT_STOCK_ITEMS_16.map((item, idx) => ({
    id: `mov-20261102-${String(idx + 1).padStart(2, '0')}`,
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
    notes: `Pemakaian masak 1.553 Porsi MBG tgl 02 Nov 2026 (Ikan Dorry Crispy Mayo, Tempe, Sayur Buncis Labu Siam, Anggur)`,
  })),

  // --- 16 BARANG MASUK DARI SUPPLIER (01 NOVEMBER 2026) ---
  ...DEFAULT_STOCK_ITEMS_16.map((item, idx) => ({
    id: `mov-20261101-${String(idx + 1).padStart(2, '0')}`,
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
    notes: 'Penerimaan bahan baku masuk tgl 01 Nov 2026',
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
  if (typeof window === 'undefined') return DEFAULT_STOCK_MOVEMENTS_32;
  try {
    const raw = localStorage.getItem(ARSIP_STOCK_MOVEMENTS_KEY);
    if (!raw) {
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS_32);
      return DEFAULT_STOCK_MOVEMENTS_32;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load movements from localStorage:', err);
  }
  return DEFAULT_STOCK_MOVEMENTS_32;
}

export function saveMovementsToStorage(movements: StockMovement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ARSIP_STOCK_MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (err) {
    console.error('Failed to save movements to localStorage:', err);
  }
}

// Rekapitulasi kuantitas fisik (Masuk tgl 1 & Keluar Masak tgl 2)
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
    'Golongan / Kategori',
    'Nama Bahan Makanan',
    'Lokasi Simpan',
    'Masuk 01 Nov (Qty)',
    'Keluar 02 Nov (Qty)',
    'Sisa Stok Saat Ini',
    'Satuan',
    'Status Penggunaan',
    'Suplier / Vendor',
  ];

  const rows = items.map((item) => {
    return [
      `"${item.sku}"`,
      `"${item.category}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.storageLocation}"`,
      item.initialStock,
      item.usedStock,
      item.currentStock,
      `"${item.uom}"`,
      `"Habis Terpakai Masak 02 Nov"`,
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
        ? 'MASUK (01 NOV)'
        : m.type === 'OUT'
        ? 'KELUAR MASAK (02 NOV)'
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
