'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Boxes,
  Search,
  PlusCircle,
  MinusCircle,
  ClipboardCheck,
  FileDown,
  Printer,
  X,
  CheckCircle2,
  TrendingDown,
  Warehouse,
  ThermometerSnowflake,
  Apple,
  Flame,
  History,
  Calculator,
  RotateCcw,
  ArrowUpDown,
  FileText,
  Info,
  Save,
  Check,
  ChevronDown,
  Scale,
  ChefHat,
  Lock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { TopNav, BottomTabs } from '@/components/SiteNav';
import {
  StockItem,
  StockMovement,
  StockCategory,
  StockStatus,
  loadStockFromStorage,
  saveStockToStorage,
  loadMovementsFromStorage,
  saveMovementsToStorage,
  calculateStockStatus,
  getDaysLeft,
  calculateStockSummary,
  generateStockCSV,
  generateMovementsCSV,
  DEFAULT_STOCK_ITEMS_ALL,
  DEFAULT_STOCK_MOVEMENTS,
  OpnameSession,
  loadOpnameDraftFromStorage,
  saveOpnameDraftToStorage,
  clearOpnameDraftFromStorage,
  generateOpnameCSV,
} from '@/lib/stock';
import { verifyPin, hasValidSession, clearSession } from '@/lib/auth';


export default function StockMonitoringPage() {
  // Security PIN Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSubmittingPin, setIsSubmittingPin] = useState<boolean>(false);

  const [stockItems, setStockItems] = useState<StockItem[]>(DEFAULT_STOCK_ITEMS_ALL);
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Active Main Workflow Tab
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'opname' | 'movements' | 'bom'>('inventory');

  // Filters & Search for Inventory Tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'daysLeft' | 'currentStock'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter for Movements Tab
  const [movementFilterType, setMovementFilterType] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUST'>('ALL');
  const [movementSearch, setMovementSearch] = useState<string>('');

  // Stock Opname Session & Draft State
  const [opnameSession, setOpnameSession] = useState<OpnameSession | null>(null);
  const [opnameSearch, setOpnameSearch] = useState<string>('');
  const [isOpnameDirty, setIsOpnameDirty] = useState<boolean>(false);

  // Modal Print Type: Masuk/Keluar Masak per Batch, atau Rekap Mutasi
  const [printReportType, setPrintReportType] = useState<'B8_OUT' | 'B8_IN' | 'B7_OUT' | 'B7_IN' | 'B6_OUT' | 'B6_IN' | 'B5_OUT' | 'B5_IN' | 'B4_OUT' | 'B4_IN' | 'B3_OUT' | 'B3_IN' | 'B2_OUT' | 'B2_IN' | 'B1_OUT' | 'B1_IN' | 'MUTASI'>('B8_OUT');

  // Dropdown kustom untuk pilihan dokumen Berita Acara (pengganti <select> native
  // yang tampil berantakan di popup Android: label grup jadi baris penuh dan
  // teks panjang terpotong). Dropdown ini dirender aplikasi sendiri sehingga
  // tampilannya sama di semua perangkat.
  const [printMenuOpen, setPrintMenuOpen] = useState<boolean>(false);
  const PRINT_REPORT_GROUPS: {
    label: string;
    options: { value: typeof printReportType; icon: string; title: string; count: number }[];
  }[] = [
    { label: 'Batch 8 — Masuk 10 Nov / Masak 11 Nov', options: [
      { value: 'B8_OUT', icon: '📤', title: 'Keluar Masak 11 Nov', count: 18 },
      { value: 'B8_IN', icon: '📥', title: 'Masuk 10 Nov', count: 18 },
    ] },
    { label: 'Batch 7 — Masuk 09 Nov / Masak 10 Nov', options: [
      { value: 'B7_OUT', icon: '📤', title: 'Keluar Masak 10 Nov', count: 15 },
      { value: 'B7_IN', icon: '📥', title: 'Masuk 09 Nov', count: 15 },
    ] },
    { label: 'Batch 6 — Masuk 08 Nov / Masak 09 Nov', options: [
      { value: 'B6_OUT', icon: '📤', title: 'Keluar Masak 09 Nov', count: 14 },
      { value: 'B6_IN', icon: '📥', title: 'Masuk 08 Nov', count: 14 },
    ] },
    { label: 'Batch 5 — Masuk 05 Nov / Masak 06 Nov', options: [
      { value: 'B5_OUT', icon: '📤', title: 'Keluar Masak 06 Nov', count: 22 },
      { value: 'B5_IN', icon: '📥', title: 'Masuk 05 Nov', count: 22 },
    ] },
    { label: 'Batch 4 — Masuk 04 Nov / Masak 05 Nov', options: [
      { value: 'B4_OUT', icon: '📤', title: 'Keluar Masak 05 Nov', count: 20 },
      { value: 'B4_IN', icon: '📥', title: 'Masuk 04 Nov', count: 20 },
    ] },
    { label: 'Batch 3 — Masuk 03 Nov / Masak 04 Nov', options: [
      { value: 'B3_OUT', icon: '📤', title: 'Keluar Masak 04 Nov', count: 18 },
      { value: 'B3_IN', icon: '📥', title: 'Masuk 03 Nov', count: 18 },
    ] },
    { label: 'Batch 2 — Masuk 02 Nov / Masak 03 Nov', options: [
      { value: 'B2_OUT', icon: '📤', title: 'Keluar Masak 03 Nov', count: 17 },
      { value: 'B2_IN', icon: '📥', title: 'Masuk 02 Nov', count: 17 },
    ] },
    { label: 'Batch 1 — Masuk 01 Nov / Masak 02 Nov', options: [
      { value: 'B1_OUT', icon: '📤', title: 'Keluar Masak 02 Nov', count: 16 },
      { value: 'B1_IN', icon: '📥', title: 'Masuk 01 Nov', count: 16 },
    ] },
    { label: 'Rekap', options: [
      { value: 'MUTASI', icon: '📊', title: 'Rekap Mutasi', count: 280 },
    ] },
  ];
  const currentPrintOption = PRINT_REPORT_GROUPS.flatMap((g) => g.options).find((o) => o.value === printReportType) ?? PRINT_REPORT_GROUPS[0].options[0];

  // Tutup menu dropdown pilihan dokumen dengan tombol Escape.
  useEffect(() => {
    if (!printMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPrintMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [printMenuOpen]);

  const handleOpenPrintFor = (type: 'B8_OUT' | 'B8_IN' | 'B7_OUT' | 'B7_IN' | 'B6_OUT' | 'B6_IN' | 'B5_OUT' | 'B5_IN' | 'B4_OUT' | 'B4_IN' | 'B3_OUT' | 'B3_IN' | 'B2_OUT' | 'B2_IN' | 'B1_OUT' | 'B1_IN' | 'MUTASI') => {
    setPrintReportType(type);
    setShowPrintModal(true);
  };

  // Items untuk Dokumen Berita Acara A4
  const reportItems = useMemo(() => {
    if (printReportType === 'B8_OUT' || printReportType === 'B8_IN') {
      return stockItems.filter((i) => i.batch === '08-NOV');
    }
    if (printReportType === 'B7_OUT' || printReportType === 'B7_IN') {
      return stockItems.filter((i) => i.batch === '07-NOV');
    }
    if (printReportType === 'B6_OUT' || printReportType === 'B6_IN') {
      return stockItems.filter((i) => i.batch === '06-NOV');
    }
    if (printReportType === 'B5_OUT' || printReportType === 'B5_IN') {
      return stockItems.filter((i) => i.batch === '05-NOV');
    }
    if (printReportType === 'B4_OUT' || printReportType === 'B4_IN') {
      return stockItems.filter((i) => i.batch === '04-NOV');
    }
    if (printReportType === 'B3_OUT' || printReportType === 'B3_IN') {
      return stockItems.filter((i) => i.batch === '03-NOV');
    }
    if (printReportType === 'B2_OUT' || printReportType === 'B2_IN') {
      return stockItems.filter((i) => i.batch === '02-NOV');
    }
    if (printReportType === 'B1_OUT' || printReportType === 'B1_IN') {
      return stockItems.filter((i) => i.batch === '01-NOV');
    }
    return stockItems;
  }, [stockItems, printReportType]);

  const reportSummary = useMemo(() => calculateStockSummary(reportItems), [reportItems]);

  // Interactive Modals
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showOpnamePrintModal, setShowOpnamePrintModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form State for Tambah Master Bahan Baru
  const [formAddSku, setFormAddSku] = useState<string>('');
  const [formAddName, setFormAddName] = useState<string>('');
  const [formAddCategory, setFormAddCategory] = useState<StockCategory>('Bahan Kering');
  const [formAddUom, setFormAddUom] = useState<string>('KG');
  const [formAddLocation, setFormAddLocation] = useState<string>('Gudang Kering');
  const [formAddInitialStock, setFormAddInitialStock] = useState<number>(10);
  const [formAddMinAlert, setFormAddMinAlert] = useState<number>(5);
  const [formAddDailyUsage, setFormAddDailyUsage] = useState<number>(2);
  const [formAddSupplier, setFormAddSupplier] = useState<string>('Yayasan Berkat Makmur Sentosa');
  const [formAddNotes, setFormAddNotes] = useState<string>('Penerimaan tgl 10 Nov 2026');

  // Form States for Restock
  const [formRestockItemId, setFormRestockItemId] = useState<string>('bhk-01');
  const [formRestockDate, setFormRestockDate] = useState<string>('2026-11-01');
  const [formRestockQty, setFormRestockQty] = useState<number>(20);
  const [formRestockVendor, setFormRestockVendor] = useState<string>('Yayasan Berkat Makmur Sentosa');
  const [formRestockInvoice, setFormRestockInvoice] = useState<string>('GRN-20261110-01');
  const [formRestockNotes, setFormRestockNotes] = useState<string>('Bahan baku masuk tgl 10 Nov 2026');

  // Form States for Usage
  const [formUsageItemId, setFormUsageItemId] = useState<string>('bhk-01');
  const [formUsageQty, setFormUsageQty] = useState<number>(10);
  const [formUsageMenu, setFormUsageMenu] = useState<string>('Produksi Dapur MBG 1.553 Porsi (11 Nov 2026)');
  const [formUsageNotes, setFormUsageNotes] = useState<string>('Dikeluarkan penuh untuk pengolahan masak dapur');

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check Auth Sesi on Mount (token diverifikasi ke server)
  useEffect(() => {
    let cancelled = false;
    hasValidSession('stock')
      .then((valid) => {
        if (!cancelled && valid) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPin(true);
    setPinError('');

    const result = await verifyPin(pinInput.trim(), 'stock');
    if (result.ok) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else if (result.reason === 'wrong') {
      setPinError('PIN salah! Akses modul stok khusus pengurus & tim logistik resmi SPPG.');
      setPinInput('');
    } else if (result.reason === 'rate_limited') {
      setPinError('Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.');
      setPinInput('');
    } else {
      setPinError('Verifikasi PIN belum dikonfigurasi di server. Hubungi pengurus SPPG.');
    }
    setIsSubmittingPin(false);
  };

  const handleLockSession = () => {
    clearSession('stock');
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Load Initial Data on Mount
  useEffect(() => {
    const loadedItems = loadStockFromStorage();
    const loadedMovements = loadMovementsFromStorage();
    const loadedOpname = loadOpnameDraftFromStorage(loadedItems);

    setStockItems(loadedItems);
    setMovements(loadedMovements);
    setOpnameSession(loadedOpname);
  }, []);

  // Recalculate summary metrics
  const summary = useMemo(() => calculateStockSummary(stockItems), [stockItems]);

  // Filtered & Sorted Stock Items for Inventory Tab
  const filteredItems = useMemo(() => {
    return stockItems
      .filter((item) => {
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }

        if (selectedLocation !== 'ALL' && item.storageLocation !== selectedLocation) {
          return false;
        }

        if (selectedBatch !== 'ALL' && item.batch !== selectedBatch) {
          return false;
        }

        const status = calculateStockStatus(item);
        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'critical' && status !== 'critical') return false;
          if (selectedStatus === 'warning' && status !== 'warning') return false;
          if (selectedStatus === 'safe' && status !== 'safe') return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchSku = item.sku.toLowerCase().includes(q);
          const matchLoc = item.storageLocation.toLowerCase().includes(q);
          const matchSup = item.supplierName.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchLoc && !matchSup) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: number | string = 0;
        let valB: number | string = 0;

        if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          return sortDirection === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        if (sortBy === 'daysLeft') {
          valA = getDaysLeft(a);
          valB = getDaysLeft(b);
        } else if (sortBy === 'currentStock') {
          valA = a.currentStock;
          valB = b.currentStock;
        }

        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stockItems, selectedCategory, selectedLocation, selectedBatch, selectedStatus, searchQuery, sortBy, sortDirection]);

  // Filtered Movements for Log Tab
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (movementFilterType !== 'ALL' && m.type !== movementFilterType) return false;
      if (movementSearch.trim()) {
        const q = movementSearch.toLowerCase();
        return (
          m.itemName.toLowerCase().includes(q) ||
          m.reference.toLowerCase().includes(q) ||
          m.loggedBy.toLowerCase().includes(q) ||
          m.date.includes(q)
        );
      }
      return true;
    });
  }, [movements, movementFilterType, movementSearch]);

  // Opname Session Calculations
  const opnameStats = useMemo(() => {
    if (!opnameSession) return { totalRows: 0, itemsDiff: 0, matchPct: 100 };

    let itemsDiff = 0;
    opnameSession.rows.forEach((r) => {
      const diff = Number((r.physicalQty - r.systemQty).toFixed(2));
      if (diff !== 0) itemsDiff++;
    });

    const totalRows = opnameSession.rows.length;
    const matchPct = totalRows > 0 ? Number((((totalRows - itemsDiff) / totalRows) * 100).toFixed(1)) : 100;

    return { totalRows, itemsDiff, matchPct };
  }, [opnameSession]);

  // Baris untuk dokumen PDF opname: hanya bahan yang punya kuantitas
  // (stok sistem ATAU hasil fisik bukan 0). Bahan ber-qty 0 di kedua sisi
  // tidak dicantumkan di output print/PDF. Tampilan layar & CSV tidak berubah.
  const printOpnameRows = useMemo(() => {
    if (!opnameSession) return [];
    return opnameSession.rows.filter((r) => r.systemQty !== 0 || r.physicalQty !== 0);
  }, [opnameSession]);

  const printOpnameStats = useMemo(() => {
    let itemsDiff = 0;
    printOpnameRows.forEach((r) => {
      const diff = Number((r.physicalQty - r.systemQty).toFixed(2));
      if (diff !== 0) itemsDiff++;
    });
    const totalRows = printOpnameRows.length;
    const matchPct = totalRows > 0 ? Number((((totalRows - itemsDiff) / totalRows) * 100).toFixed(1)) : 100;
    return { totalRows, itemsDiff, matchPct };
  }, [printOpnameRows]);

  // Filtered Opname Rows
  const filteredOpnameRows = useMemo(() => {
    if (!opnameSession) return [];
    if (!opnameSearch.trim()) return opnameSession.rows;
    const q = opnameSearch.toLowerCase();
    return opnameSession.rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.sku.toLowerCase().includes(q) ||
        r.storageLocation.toLowerCase().includes(q)
    );
  }, [opnameSession, opnameSearch]);

  // Handlers for Opname Physical Input Change
  const handleOpnamePhysicalChange = (itemId: string, newPhysical: number) => {
    if (!opnameSession) return;
    const updatedRows = opnameSession.rows.map((row) => {
      if (row.itemId === itemId) {
        return { ...row, physicalQty: newPhysical };
      }
      return row;
    });

    const updatedSession = { ...opnameSession, rows: updatedRows, savedAt: new Date().toISOString() };
    setOpnameSession(updatedSession);
    setIsOpnameDirty(true);
  };

  const handleOpnameNotesChange = (itemId: string, notes: string) => {
    if (!opnameSession) return;
    const updatedRows = opnameSession.rows.map((row) => {
      if (row.itemId === itemId) {
        return { ...row, notes };
      }
      return row;
    });

    const updatedSession = { ...opnameSession, rows: updatedRows, savedAt: new Date().toISOString() };
    setOpnameSession(updatedSession);
    setIsOpnameDirty(true);
  };

  // Simpan Draf Opname
  const handleSaveOpnameDraft = () => {
    if (!opnameSession) return;
    saveOpnameDraftToStorage(opnameSession);
    setIsOpnameDirty(false);
    showToast('💾 Draf Stock Opname berhasil disimpan.');
  };

  // Finalisasi & Terapkan Opname
  const handleFinalizeOpname = () => {
    if (!opnameSession) return;

    if (
      !window.confirm(
        `Selesaikan Stock Opname? Saldo stok ${opnameStats.itemsDiff} item yang berselisih akan disesuaikan ke stok fisik aktual.`
      )
    ) {
      return;
    }

    const physicalMap = new Map<string, number>();
    opnameSession.rows.forEach((r) => physicalMap.set(r.itemId, r.physicalQty));

    const updatedStockItems = stockItems.map((item) => {
      if (physicalMap.has(item.id)) {
        return {
          ...item,
          currentStock: physicalMap.get(item.id)!,
        };
      }
      return item;
    });

    const newMovements: StockMovement[] = [];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const nowDate = new Date().toISOString().slice(0, 10);

    opnameSession.rows.forEach((r) => {
      const diff = Number((r.physicalQty - r.systemQty).toFixed(2));
      if (diff !== 0) {
        newMovements.push({
          id: `mov-opn-${Date.now()}-${r.itemId}`,
          date: nowDate,
          time: nowTime,
          itemId: r.itemId,
          itemName: r.name,
          type: 'ADJUST',
          qty: Math.abs(diff),
          uom: r.uom,
          balanceAfter: r.physicalQty,
          reference: opnameSession.id,
          loggedBy: opnameSession.checkerName,
          notes: `Rekonsiliasi Opname (${diff >= 0 ? '+' : ''}${diff} ${r.uom}): ${r.notes || 'Penyesuaian fisik'}`,
        });
      }
    });

    const updatedMovements = [...newMovements, ...movements];

    setStockItems(updatedStockItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedStockItems);
    saveMovementsToStorage(updatedMovements);

    const completedSession: OpnameSession = {
      ...opnameSession,
      status: 'completed',
      savedAt: new Date().toISOString(),
    };
    setOpnameSession(completedSession);
    saveOpnameDraftToStorage(completedSession);
    setIsOpnameDirty(false);

    showToast(`✅ Stock Opname Selesai! Saldo ${opnameStats.itemsDiff} item berhasil disesuaikan.`);
  };

  // Reset Draf Opname ke Saldo Sistem
  const handleResetOpnameDraft = () => {
    if (window.confirm('Reset input draf opname ke angka stok sistem saat ini?')) {
      const resetRows = stockItems.map((item) => ({
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

      const resetSession: OpnameSession = {
        id: `OPN-${new Date().toISOString().slice(0, 10)}`,
        date: new Date().toISOString().slice(0, 10),
        title: 'Audit Fisik Berkala Stok Bahan Baku SPPG Wonodri 3',
        checkerName: 'Nur Khafidin (Petugas Timbangan)',
        status: 'draft',
        rows: resetRows,
        savedAt: new Date().toISOString(),
      };

      setOpnameSession(resetSession);
      saveOpnameDraftToStorage(resetSession);
      setIsOpnameDirty(false);
      showToast('🔄 Draf Stock Opname di-reset ke saldo sistem.');
    }
  };

  // Handlers for Add Item Modal
  const handleOpenAddItem = () => {
    const nextNum = stockItems.length + 1;
    setFormAddSku(`BGN-SKU-${String(nextNum).padStart(3, '0')}`);
    setFormAddName('');
    setFormAddCategory('Bahan Kering');
    setFormAddUom('KG');
    setFormAddLocation('Gudang Kering');
    setFormAddInitialStock(10);
    setFormAddMinAlert(5);
    setFormAddDailyUsage(2);
    setFormAddSupplier('Yayasan Berkat Makmur Sentosa');
    setFormAddNotes('Penerimaan masuk 10 Nov 2026');
    setShowAddItemModal(true);
  };

  const handleSubmitAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAddName.trim()) {
      alert('Nama bahan baku wajib diisi');
      return;
    }

    const newItem: StockItem = {
      id: `item-${Date.now()}`,
      sku: formAddSku || `BGN-SKU-${Date.now().toString().slice(-4)}`,
      name: formAddName.trim().toUpperCase(),
      category: formAddCategory,
      uom: formAddUom.trim().toUpperCase(),
      storageLocation: formAddLocation || 'Gudang Kering',
      currentStock: Number(formAddInitialStock) || 0,
      initialStock: Number(formAddInitialStock) || 0,
      usedStock: 0,
      minStockAlert: Number(formAddMinAlert) || 0,
      dailyUsageAvg: Number(formAddDailyUsage) || 0,
      supplierName: formAddSupplier || 'Yayasan Berkat Makmur Sentosa',
      lastRestockDate: '2026-11-10',
      lastUsageDate: '2026-11-11',
      batch: '08-NOV',
      notes: formAddNotes || undefined,
    };

    const updated = [newItem, ...stockItems];
    setStockItems(updated);
    saveStockToStorage(updated);

    if (opnameSession) {
      const newRow = {
        itemId: newItem.id,
        sku: newItem.sku,
        name: newItem.name,
        category: newItem.category,
        uom: newItem.uom,
        storageLocation: newItem.storageLocation,
        systemQty: newItem.currentStock,
        physicalQty: newItem.currentStock,
        notes: 'Item baru ditambahkan',
      };
      const updatedOpname = {
        ...opnameSession,
        rows: [newRow, ...opnameSession.rows],
      };
      setOpnameSession(updatedOpname);
      saveOpnameDraftToStorage(updatedOpname);
    }

    setShowAddItemModal(false);
    showToast(`✅ Bahan baru berhasil ditambahkan: ${newItem.name}`);
  };

  // Handlers for Restock & Usage Modals
  const handleOpenRestock = (item?: StockItem) => {
    if (stockItems.length === 0) {
      alert('Inventory masih kosong! Silakan klik "+ Tambah Bahan Baru" terlebih dahulu.');
      return;
    }
    if (item) {
      setFormRestockItemId(item.id);
      setFormRestockVendor(item.supplierName);
    } else {
      setFormRestockItemId(stockItems[0]?.id || '');
      setFormRestockVendor(stockItems[0]?.supplierName || 'Yayasan Berkat Makmur Sentosa');
    }
    setFormRestockDate('2026-11-10');
    setFormRestockQty(20);
    setFormRestockInvoice(`GRN-20261110-${Date.now().toString().slice(-4)}`);
    setShowRestockModal(true);
  };

  const handleOpenUsage = (item?: StockItem) => {
    if (stockItems.length === 0) {
      alert('Inventory masih kosong! Silakan tambahkan bahan terlebih dahulu.');
      return;
    }
    if (item) {
      setFormUsageItemId(item.id);
      setFormUsageQty(item.currentStock > 0 ? item.currentStock : 10);
    } else {
      setFormUsageItemId(stockItems[0]?.id || '');
      setFormUsageQty(10);
    }
    setShowUsageModal(true);
  };

  const handleOpenDetail = (item: StockItem) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);
  };

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (window.confirm(`Hapus bahan "${itemName}" dari master inventory?`)) {
      const updated = stockItems.filter((i) => i.id !== itemId);
      setStockItems(updated);
      saveStockToStorage(updated);
      if (opnameSession) {
        const updatedOpname = {
          ...opnameSession,
          rows: opnameSession.rows.filter((r) => r.itemId !== itemId),
        };
        setOpnameSession(updatedOpname);
        saveOpnameDraftToStorage(updatedOpname);
      }
      setShowItemDetailModal(false);
      showToast(`🗑️ Bahan "${itemName}" berhasil dihapus.`);
    }
  };

  // Submit Restock (Penerimaan Bahan Masuk)
  const handleSubmitRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const target = stockItems.find((i) => i.id === formRestockItemId);
    if (!target) return;

    const qty = Number(formRestockQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Jumlah penerimaan harus lebih dari 0');
      return;
    }

    const updatedItems = stockItems.map((item) => {
      if (item.id === formRestockItemId) {
        return {
          ...item,
          currentStock: Number((item.currentStock + qty).toFixed(2)),
          initialStock: Number((item.initialStock + qty).toFixed(2)),
          lastRestockDate: formRestockDate || '2026-11-02',
          supplierName: formRestockVendor || item.supplierName,
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: formRestockDate || '2026-11-02',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'IN',
      qty: qty,
      uom: target.uom,
      balanceAfter: Number((target.currentStock + qty).toFixed(2)),
      reference: formRestockInvoice || 'GRN-20261102-01',
      loggedBy: 'Nur Khafidin (Petugas Timbangan)',
      notes: formRestockNotes || 'Penerimaan bahan baku masuk tgl 10 Nov 2026',
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowRestockModal(false);
    showToast(`✅ Bahan masuk dicatat: +${qty} ${target.uom} ${target.name}`);
  };

  // Submit Usage (Pemakaian Masak Dapur MBG)
  const handleSubmitUsage = (e: React.FormEvent) => {
    e.preventDefault();
    const target = stockItems.find((i) => i.id === formUsageItemId);
    if (!target) return;

    const qty = Number(formUsageQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Jumlah pemakaian harus lebih dari 0');
      return;
    }

    if (qty > target.currentStock) {
      alert(`Stok tidak mencukupi! Stok saat ini: ${target.currentStock} ${target.uom}`);
      return;
    }

    const newBalance = Number((target.currentStock - qty).toFixed(2));
    const updatedItems = stockItems.map((item) => {
      if (item.id === formUsageItemId) {
        return {
          ...item,
          currentStock: newBalance,
          usedStock: Number((item.usedStock + qty).toFixed(2)),
          lastUsageDate: '2026-11-03',
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: '2026-11-03',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'OUT',
      qty: qty,
      uom: target.uom,
      balanceAfter: newBalance,
      reference: formUsageMenu || 'BOM-MSK-20261111',
      loggedBy: 'Seksi Pengolahan Dapur',
      notes: formUsageNotes || 'Pemakaian bahan masak MBG tgl 11 Nov 2026',
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowUsageModal(false);
    showToast(`🍳 Pemakaian dapur dicatat: -${qty} ${target.uom} ${target.name}`);
  };

  // Reset to Baseline: Seluruh Siklus Mutasi Penuh (Batch 1-8 - 280 Mutasi)
  const handleResetToBaseline = () => {
    if (window.confirm('Muat ulang seluruh riwayat mutasi (Batch 01-08 Nov — 280 Mutasi)?')) {
      setStockItems(DEFAULT_STOCK_ITEMS_ALL);
      setMovements(DEFAULT_STOCK_MOVEMENTS);
      saveStockToStorage(DEFAULT_STOCK_ITEMS_ALL);
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS);
      clearOpnameDraftFromStorage();
      const newOpname = loadOpnameDraftFromStorage(DEFAULT_STOCK_ITEMS_ALL);
      setOpnameSession(newOpname);
      showToast('📦 Seluruh riwayat mutasi Batch 01-08 Nov (280 transaksi) berhasil dimuat utuh.');
    }
  };

  // Kosongkan Total
  const handleClearAllInventory = () => {
    if (window.confirm('Kosongkan seluruh data stok dan inventaris?')) {
      setStockItems([]);
      setMovements([]);
      saveStockToStorage([]);
      saveMovementsToStorage([]);
      clearOpnameDraftFromStorage();
      const emptyOpname = loadOpnameDraftFromStorage([]);
      setOpnameSession(emptyOpname);
      showToast('🗑️ Seluruh data stok berhasil dikosongkan.');
    }
  };

  // Download CSVs (Tanpa Harga)
  const handleDownloadStockCSV = () => {
    const csv = generateStockCSV(stockItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Stok_01_10_Nov2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Stok berhasil diunduh.');
  };

  const handleDownloadMovementsCSV = () => {
    const csv = generateMovementsCSV(movements);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Mutasi_01_02_Nov2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Mutasi berhasil diunduh.');
  };

  const handleDownloadOpnameCSV = () => {
    if (!opnameSession) return;
    const csv = generateOpnameCSV(opnameSession);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Stock_Opname_02Nov2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Stock Opname berhasil diunduh.');
  };

  const getCategoryIcon = (category: StockCategory) => {
    switch (category) {
      case 'Bahan Kering':
        return <Warehouse className="w-3.5 h-3.5 text-amber-600" />;
      case 'Rempah':
        return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      case 'Protein Hewani':
        return <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600" />;
      case 'Protein Nabati':
        return <Scale className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Sayur':
        return <Apple className="w-3.5 h-3.5 text-green-600" />;
      case 'Buah':
        return <Apple className="w-3.5 h-3.5 text-rose-600" />;
      case 'Lainnya':
        return <Boxes className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: StockStatus, daysLeft: number, usageDateLabel: string) => {
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          SELESAI DIMASAK ({usageDateLabel})
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <TrendingDown className="w-3 h-3 text-amber-600" />
          MENIPIS ({daysLeft} Hari)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-ink border border-blue-300">
        <CheckCircle2 className="w-3 h-3 text-blue-600" />
        STANDBY GUDANG
      </span>
    );
  };

  // Jangan render sebelum client hydration selesai untuk cegah visual flicker
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-line border-t-ink rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Memeriksa hak akses stok...</p>
        </div>
      </div>
    );
  }

  // Jika belum terautentikasi: Tampilkan Fullscreen Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-between p-4 sm:p-6">
        {/* Top Navbar Minimalis */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-ink bg-white hover:bg-ink/5 px-3 py-1.5 rounded-lg transition-colors border border-line"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-[13px] font-mono text-slate-500 font-bold tracking-widest">
            SPPG-RESTRICTED
          </span>
        </div>

        {/* Card Form PIN */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="panel p-6 sm:p-8 relative overflow-hidden">

            {/* Header Badge & Icon */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-gold-soft border border-gold/40 text-gold-ink mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <div className="inline-block mx-auto mb-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                Akses Terbatas Logistik
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Monitoring Stok Bahan Baku
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                Data inventaris, stok opname, dan mutasi dapur SPPG Wonodri 3 dilindungi. Masukkan PIN Otoritas resmi untuk membuka.
              </p>
            </div>

            {/* Form PIN */}
            <form onSubmit={handleVerifyPin} className="space-y-4 relative">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">
                  PIN Otoritas (6 Digit):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="•••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base text-center tracking-widest font-mono text-ink bg-white border border-line rounded-xl focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none transition-all placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700 flex items-start gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPin || !pinInput.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-ink hover:bg-ink-soft active:bg-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi & Buka Data Stok</span>
              </button>
            </form>

            {/* Navigasi Alternatif */}
            <div className="mt-6 pt-5 border-t border-line flex flex-col gap-2 text-center">
              <Link
                href="/arsip"
                className="text-sm font-bold text-slate-600 hover:text-ink transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Buka Dokumen Arsip Publik</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-md w-full mx-auto text-center pb-2">
          <p className="text-xs text-slate-500 font-medium">
            Program MBG 1.553 Porsi &bull; SPPG Wonodri 3 Kota Semarang
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper print:bg-white text-ink flex flex-col w-full overflow-x-hidden has-bottom-tabs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-5 z-50 bg-ink text-white text-sm sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-line flex items-center gap-2 animate-bounce">
          <Info className="w-4 h-4 text-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============ HEADER ============ */}
      <header className="bg-paper/90 backdrop-blur border-b border-line sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label="SPPG Wonodri 3, beranda">
            <Image src="/logo.png" alt="" width={32} height={32} className="object-contain shrink-0" priority />
            <span className="min-w-0">
              <span className="block font-heading font-bold text-[15px] leading-tight truncate">
                SPPG Wonodri 3
              </span>
              <span className="block text-sm text-slate-600 leading-tight truncate">
                Monitoring Stok &bull; Dapur MBG
              </span>
            </span>
          </Link>

          <TopNav />

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              aria-label="Cetak Berita Acara"
              className="inline-flex items-center gap-2 px-3 min-h-10 rounded-lg text-sm font-semibold text-white bg-ink hover:bg-ink-soft cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cetak Berita Acara</span>
            </button>
            <button
              type="button"
              onClick={handleLockSession}
              title="Kunci Akses Sesi Stok"
              className="inline-flex items-center gap-1.5 px-3 min-h-10 rounded-lg text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Kunci Sesi</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex-1 space-y-5 sm:space-y-6 print:hidden">
        {/* Banner Header Halaman */}
        <div className="px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="eyebrow">Selesai Dimasak (11 Nov 2026)</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500 font-medium">BGN TA 2026 — SPPG Wonodri 3 Kota Semarang</span>
            </div>
            <h1 className="page-title">Monitoring Stok &amp; Kuantitas Bahan Masak</h1>
            <div className="gold-rule" aria-hidden="true" />
            <p className="text-sm sm:text-sm text-slate-600 leading-relaxed">
              Tercatat 8 siklus mutasi: <strong>Batch 1–8</strong> (Masuk 01–10 Nov &bull; Masak 02–11 Nov) dari mitra <strong>Yayasan Berkat Makmur Sentosa</strong> untuk <strong>1.553 Porsi MBG</strong>.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddItem()}
              className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-ink hover:bg-ink-soft flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Bahan Baru</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenRestock()}
              className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Catat Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenUsage()}
              className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <MinusCircle className="w-4 h-4 shrink-0" />
              <span>- Catat Masak</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenPrintFor('B8_IN')}
              className="px-3 py-2 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Download Dokumen PDF Bahan Masuk"
            >
              <FileDown className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>PDF Bahan Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenPrintFor('B8_OUT')}
              className="px-3 py-2 rounded-xl text-sm font-bold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title="Download Dokumen PDF Bahan Keluar Masak"
            >
              <FileDown className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>PDF Bahan Masak</span>
            </button>
          </div>
        </div>

        {/* ============ 4 METRICS KPI CARDS (KUANTITAS FISIK MURNI) ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Item Bahan */}
          <div className="bg-white rounded-xl border border-line p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-slate-500">Total Bahan Baku</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">{summary.totalItems} Item</div>
              <span className="text-xs text-slate-500 font-medium">Batch 01–08 Nov 2026</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-ink/5 border border-ink/15 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Card 2: Total Muatan Masuk (01-10 Nov) */}
          <div
            onClick={() => {
              setActiveMainTab('movements');
              setMovementFilterType('IN');
            }}
            className="bg-white rounded-xl border border-line p-4 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
            title="Klik untuk lihat mutasi masuk 01-10 Nov"
          >
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-slate-500">Total Masuk (01-10 Nov 2026)</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700">
                {summary.totalKgMasuk} KG
              </div>
              <span className="text-xs text-emerald-600 font-medium">+{summary.totalQtyNonKgMasuk} Unit &bull; Buka Mutasi &rarr;</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: Keluar Masak (02-11 Nov) */}
          <div
            onClick={() => {
              setActiveMainTab('movements');
              setMovementFilterType('OUT');
            }}
            className="bg-white rounded-xl border border-line p-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
            title="Klik untuk lihat mutasi keluar masak 02-11 Nov"
          >
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-slate-500">Total Keluar Masak (02-11 Nov)</span>
              <div className="text-xl sm:text-2xl font-bold text-indigo-700">
                {summary.totalKgKeluar} KG
              </div>
              <span className="text-xs text-indigo-600 font-medium">1.553 Porsi MBG &bull; Buka Mutasi &rarr;</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          {/* Card 4: Sisa Stok Saat Ini */}
          <div className="bg-white rounded-xl border border-line p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[13px] font-bold text-slate-500">Sisa Stok Fisik</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {summary.currentKgSisa} KG
              </div>
              <span className="text-xs text-emerald-600 font-bold">Habis Terpakai Masak 100%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-line flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* ============ 4 WORKFLOW TABS (SUB-NAV) ============ */}
        <div className="space-y-2 border-b border-line pb-3">
          {/* Mobile Grid View (2x2) — 100% langsung kelihatan tanpa perlu geser */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {/* Tab 1: Stok Bahan */}
            <button
              type="button"
              onClick={() => setActiveMainTab('inventory')}
              className={`p-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeMainTab === 'inventory'
                  ? 'bg-ink text-white'
                  : 'bg-white text-slate-700 border border-line hover:bg-slate-50'
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0" />
              <span>Stok Bahan</span>
            </button>

            {/* Tab 2: Mutasi Masuk & Keluar (Langsung Berdampingan & Terlihat) */}
            <button
              type="button"
              onClick={() => setActiveMainTab('movements')}
              className={`p-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeMainTab === 'movements'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-line hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Mutasi ({movements.length})</span>
            </button>

            {/* Tab 3: Stock Opname */}
            <button
              type="button"
              onClick={() => setActiveMainTab('opname')}
              className={`p-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeMainTab === 'opname'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-700 border border-line hover:bg-slate-50'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>Stock Opname</span>
              {isOpnameDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse shrink-0" />
              )}
            </button>

            {/* Tab 4: BOM Masak */}
            <button
              type="button"
              onClick={() => setActiveMainTab('bom')}
              className={`p-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeMainTab === 'bom'
                  ? 'bg-ink text-white'
                  : 'bg-white text-slate-700 border border-line hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span>Kalkulator BOM</span>
            </button>
          </div>

          {/* Desktop Tab Row (hidden on mobile, visible on sm and above) */}
          <div className="hidden sm:flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMainTab('inventory')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeMainTab === 'inventory'
                    ? 'bg-ink text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-line'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Daftar Bahan &amp; Stok Fisik</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('movements')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeMainTab === 'movements'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-line'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Mutasi Masuk &amp; Keluar ({movements.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('opname')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeMainTab === 'opname'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-line'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Stock Opname (Hitung Fisik)</span>
                {isOpnameDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveMainTab('bom')}
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  activeMainTab === 'bom'
                    ? 'bg-ink text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-line'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Kalkulator Kebutuhan Masak</span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearAllInventory}
                className="px-2.5 py-1.5 rounded-lg text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Kosongkan seluruh data inventory"
              >
                <span>Kosongkan</span>
              </button>
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                title="Muat Ulang 140 Bahan Batch 01-08 Nov (280 Mutasi)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============ TAB 1: DAFTAR BAHAN & STOK FISIK ============ */}
        {activeMainTab === 'inventory' && (
          <div className="space-y-4">
            {/* Toolbar Filters */}
            <div className="bg-white rounded-xl border border-line p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari bahan makanan, SKU, golongan, atau lokasi simpan..."
                    className="w-full bg-slate-50 border border-line rounded-xl pl-10 pr-4 py-2 text-sm sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status, Location & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-slate-50 border border-line rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="ALL">Semua Lokasi</option>
                    <option value="Gudang Basah">Gudang Basah ({summary.gudangBasahCount})</option>
                    <option value="Gudang Kering">Gudang Kering ({summary.gudangKeringCount})</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-50 border border-line rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="critical">Selesai Dimasak</option>
                    <option value="warning">Menipis</option>
                    <option value="safe">Standby Gudang</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'daysLeft' | 'currentStock')}
                    className="bg-slate-50 border border-line rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="name">Urut: Nama Bahan</option>
                    <option value="currentStock">Urut: Jumlah Stok</option>
                    <option value="daysLeft">Urut: Hari Ketahanan</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={`Urutan: ${sortDirection.toUpperCase()}`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadStockCSV}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Export Daftar Stok ke CSV"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Batch Filter Dropdown */}
              <div className="flex items-center gap-2 pt-1 pb-1 border-b border-slate-100">
                <label htmlFor="batch-filter" className="text-xs font-bold text-slate-400 shrink-0">Filter Batch:</label>
                <select
                  id="batch-filter"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-50 border border-line rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer truncate"
                >
                  <option value="ALL">Semua Bahan ({stockItems.length})</option>
                  <option value="08-NOV">Batch 10 Nov → Masak 11 Nov ({stockItems.filter(i => i.batch === '08-NOV').length})</option>
                  <option value="07-NOV">Batch 09 Nov → Masak 10 Nov ({stockItems.filter(i => i.batch === '07-NOV').length})</option>
                  <option value="06-NOV">Batch 08 Nov → Masak 09 Nov ({stockItems.filter(i => i.batch === '06-NOV').length})</option>
                  <option value="05-NOV">Batch 05 Nov → Masak 06 Nov ({stockItems.filter(i => i.batch === '05-NOV').length})</option>
                  <option value="04-NOV">Batch 04 Nov → Masak 05 Nov ({stockItems.filter(i => i.batch === '04-NOV').length})</option>
                  <option value="03-NOV">Batch 03 Nov → Masak 04 Nov ({stockItems.filter(i => i.batch === '03-NOV').length})</option>
                  <option value="02-NOV">Batch 02 Nov → Masak 03 Nov ({stockItems.filter(i => i.batch === '02-NOV').length})</option>
                  <option value="01-NOV">Batch 01 Nov → Masak 02 Nov ({stockItems.filter(i => i.batch === '01-NOV').length})</option>
                </select>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-ink text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Golongan ({stockItems.length})
                </button>
                {(
                  [
                    'Bahan Kering',
                    'Rempah',
                    'Protein Hewani',
                    'Protein Nabati',
                    'Sayur',
                    'Buah',
                    'Lainnya',
                  ] as StockCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      selectedCategory === cat
                        ? 'bg-ink text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                    <span className="text-xs opacity-70">({summary.categoryCounts[cat] || 0})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-line p-8 text-center text-slate-500">
                  <Boxes className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Inventory Belum Memiliki Data Bahan Baku</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Mulai tambahkan bahan baru atau muat 18 bahan masuk 10 Nov 2026.
                  </p>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenAddItem()}
                      className="w-full py-2.5 rounded-xl bg-ink hover:bg-ink-soft text-white font-bold text-sm flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Tambah Bahan Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetToBaseline()}
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm border border-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Muat 140 Bahan Batch 01-08 Nov</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const status = calculateStockStatus(item);
                  const daysLeft = getDaysLeft(item);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-line p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-ink bg-ink/5 px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              {getCategoryIcon(item.category)}
                              <span>{item.category}</span>
                            </span>
                            <span
                              className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                                item.storageLocation === 'Gudang Basah'
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {item.storageLocation}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">{getStatusBadge(status, daysLeft, `${item.lastUsageDate.slice(8, 10)} NOV`)}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <div className="border-r border-line pr-1">
                          <span className="text-[11px] font-bold text-emerald-700 block">Masuk (Batch)</span>
                          <span className="font-mono font-bold text-sm text-slate-800 mt-0.5 block">
                            {item.initialStock} {item.uom}
                          </span>
                        </div>
                        <div className="border-r border-line px-1">
                          <span className="text-[11px] font-bold text-indigo-700 block">Keluar (Batch)</span>
                          <span className="font-mono font-bold text-sm text-indigo-900 mt-0.5 block">
                            {item.usedStock} {item.uom}
                          </span>
                        </div>
                        <div className="pl-1">
                          <span className="text-[11px] font-bold text-slate-500 block">Sisa Stok</span>
                          <span className="font-mono font-bold text-sm text-slate-900 mt-0.5 block">
                            {item.currentStock} {item.uom}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        {item.notes}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-sm">
                        <button
                          type="button"
                          onClick={() => handleOpenRestock(item)}
                          className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1 border border-emerald-200 transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ Masuk</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenUsage(item)}
                          className="py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center gap-1 border border-indigo-200 transition-colors"
                        >
                          <MinusCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>- Pakai</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-600" />
                          <span>Detail</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Inventory Table (hidden md:block) */}
            <div className="hidden md:block bg-white rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-line text-slate-600 text-xs font-bold ">
                    <tr>
                      <th className="py-3 px-4">Bahan Makanan &amp; SKU</th>
                      <th className="py-3 px-3">Lokasi / Golongan</th>
                      <th className="py-3 px-3 text-right">Masuk (Batch)</th>
                      <th className="py-3 px-3 text-right">Keluar (Batch)</th>
                      <th className="py-3 px-3 text-right">Sisa Stok</th>
                      <th className="py-3 px-3 text-center">Satuan</th>
                      <th className="py-3 px-3 text-center">Status Penggunaan</th>
                      <th className="py-3 px-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <Boxes className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                          <p className="font-bold text-slate-700 text-sm">Inventory Belum Memiliki Data Bahan Baku</p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => handleOpenAddItem()}
                              className="px-3.5 py-2 rounded-xl bg-ink hover:bg-ink-soft text-white font-bold text-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Tambah Bahan Baru</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetToBaseline()}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Muat 140 Bahan Batch 01-08 Nov</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const status = calculateStockStatus(item);
                        const daysLeft = getDaysLeft(item);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 text-sm sm:text-sm leading-tight">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-bold text-ink bg-ink/5 px-1 rounded">
                                  {item.sku}
                                </span>
                                <span className="text-xs text-slate-400">Masuk: {item.lastRestockDate.slice(8, 10)} Nov &bull; Masak: {item.lastUsageDate.slice(8, 10)} Nov</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded border ${
                                    item.storageLocation === 'Gudang Basah'
                                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {item.storageLocation}
                                </span>
                              </div>
                            </td>

                            {/* Masuk (Batch) */}
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                              +{item.initialStock}
                            </td>

                            {/* Keluar (Batch) */}
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700 text-sm">
                              -{item.usedStock}
                            </td>

                            {/* Sisa Stok */}
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-slate-900">
                              {item.currentStock}
                            </td>

                            {/* Satuan */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-bold text-sm px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-line font-mono">
                                {item.uom}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3 text-center">{getStatusBadge(status, daysLeft, `${item.lastUsageDate.slice(8, 10)} NOV`)}</td>

                            {/* Aksi Cepat */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenRestock(item)}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                  title="+ Terima Bahan (Restock)"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUsage(item)}
                                  className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                                  title="- Catat Pakai Masak"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(item)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Detail &amp; Hapus Bahan"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-slate-50 border-t border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-600">
                <div>
                  Menampilkan <strong>{filteredItems.length}</strong> bahan baku terdaftar
                </div>
                <div className="font-mono text-[13px] text-slate-500">
                  Total Masuk (01-10 Nov): <strong>{summary.totalKgMasuk} KG</strong> &bull; Total Masak (02-11 Nov): <strong>{summary.totalKgKeluar} KG</strong> (1.553 Porsi MBG)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 2: STOCK OPNAME & HITUNG FISIK ============ */}
        {activeMainTab === 'opname' && opnameSession && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-line p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Sesi Hitung Fisik (Opname)
                    </span>
                    <span className="text-sm text-slate-400">•</span>
                    <span className="text-sm font-mono text-slate-500">{opnameSession.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Stock Opname Timbangan Fisik Dapur (Paska Masak 11 Nov)
                  </h3>
                  <p className="text-sm text-slate-500">
                    Petugas: <strong>{opnameSession.checkerName}</strong> &bull; Tanggal: <strong>{opnameSession.date}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveOpnameDraft}
                    className="px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-ink hover:bg-ink-soft flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Draf Opname</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalizeOpname}
                    className="px-3.5 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Selesaikan &amp; Terapkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOpnameCSV}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Export Hasil Opname ke CSV"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => opnameSession && setShowOpnamePrintModal(true)}
                    disabled={!opnameSession}
                    className="px-3 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Pratinjau & Download Hasil Opname sebagai PDF (A4)"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetOpnameDraft}
                    className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Reset Draf Opname ke Saldo Sistem"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Opname Variance Metric Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-line">
                  <span className="text-xs font-bold text-slate-500 block">Total Item Dicek</span>
                  <strong className="text-lg font-bold text-slate-900">{opnameStats.totalRows} Bahan</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-line">
                  <span className="text-xs font-bold text-slate-500 block">Item Berselisih</span>
                  <strong className={`text-lg font-bold ${opnameStats.itemsDiff > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {opnameStats.itemsDiff} Item
                  </strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-line">
                  <span className="text-xs font-bold text-slate-500 block">Tingkat Akurasi Fisik</span>
                  <strong className="text-lg font-bold text-ink">{opnameStats.matchPct}%</strong>
                </div>
              </div>
            </div>

            {/* Opname Search Bar */}
            <div className="bg-white rounded-xl border border-line p-4 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={opnameSearch}
                  onChange={(e) => setOpnameSearch(e.target.value)}
                  placeholder="Cari bahan pada lembar opname..."
                  className="w-full bg-slate-50 border border-line rounded-xl pl-10 pr-4 py-2 text-sm sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-sm text-slate-500 shrink-0 font-medium">
                {isOpnameDirty ? (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Ada Perubahan Belum Disimpan
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Draf Tersimpan
                  </span>
                )}
              </span>
            </div>

            {/* Mobile Opname Cards (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredOpnameRows.length === 0 ? (
                <div className="bg-white rounded-xl border border-line p-8 text-center text-slate-500">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">Belum Ada Item pada Lembar Opname</p>
                </div>
              ) : (
                filteredOpnameRows.map((row, idx) => {
                  const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
                  return (
                    <div
                      key={row.itemId}
                      className="bg-white rounded-xl border border-line p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">{row.name}</h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {row.category} &bull; {row.storageLocation}
                            </span>
                          </div>
                        </div>

                        <div>
                          {diff === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              KLOP (0 {row.uom})
                            </span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-ink border border-ink/15">
                              +{diff} {row.uom}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {diff} {row.uom}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-line items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-500 block">Stok Sistem</span>
                          <div className="font-mono font-bold text-lg text-slate-800 mt-0.5">
                            {row.systemQty} <span className="text-sm text-slate-500">{row.uom}</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-amber-800 block">
                            Fisik Timbangan *
                          </label>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={row.physicalQty}
                              onChange={(e) =>
                                handleOpnamePhysicalChange(row.itemId, parseFloat(e.target.value) || 0)
                              }
                              className="w-full bg-white border-2 border-amber-400 rounded-lg py-1.5 px-2 text-right font-mono font-bold text-lg text-slate-900 focus:outline-none focus:border-amber-600"
                            />
                            <span className="font-mono font-bold text-sm text-slate-600 shrink-0">{row.uom}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleOpnameNotesChange(row.itemId, e.target.value)}
                          placeholder="Catatan kondisi fisik (kemasan baik/utuh)..."
                          className="w-full bg-slate-50 border border-line rounded-lg p-2 text-sm text-slate-700 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {/* Mobile Footer Save/Finalize Action Bar */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveOpnameDraft}
                  className="w-full py-2.5 rounded-xl bg-ink hover:bg-ink-soft text-white font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Draf Opname</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOpname}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Selesaikan &amp; Terapkan Opname</span>
                </button>
              </div>
            </div>

            {/* Desktop Opname Table (hidden md:block) */}
            <div className="hidden md:block bg-white rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-line text-slate-600 text-xs font-bold ">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">No</th>
                      <th className="py-3 px-4">Bahan Makanan &amp; SKU</th>
                      <th className="py-3 px-3">Golongan / Lokasi</th>
                      <th className="py-3 px-3 text-center">Satuan</th>
                      <th className="py-3 px-3 text-right">Stok Sistem</th>
                      <th className="py-3 px-4 text-center w-36">Input Fisik Riil</th>
                      <th className="py-3 px-3 text-right">Selisih (+/-)</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4">Catatan Checker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOpnameRows.map((row, idx) => {
                      const diff = Number((row.physicalQty - row.systemQty).toFixed(2));

                      return (
                        <tr key={row.itemId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{row.name}</div>
                            <div className="font-mono text-xs text-ink">{row.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-[13px] text-slate-600">
                            <span className="font-bold block">{row.category}</span>
                            <span className="text-xs text-slate-400">{row.storageLocation}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {row.uom}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                            {row.systemQty}
                          </td>

                          {/* Input Fisik Riil */}
                          <td className="py-2 px-4 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                value={row.physicalQty}
                                onChange={(e) =>
                                  handleOpnamePhysicalChange(row.itemId, parseFloat(e.target.value) || 0)
                                }
                                className="w-20 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                              />
                              <span className="text-xs text-slate-500 font-mono">{row.uom}</span>
                            </div>
                          </td>

                          {/* Selisih Otomatis */}
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {diff === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600">+{diff}</span>
                            ) : (
                              <span className="text-rose-600">{diff}</span>
                            )}
                          </td>

                          {/* Status Kecocokan */}
                          <td className="py-3 px-3 text-center">
                            {diff === 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                KLOP
                              </span>
                            ) : diff > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-ink">
                                LEBIH
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                KURANG
                              </span>
                            )}
                          </td>

                          {/* Catatan Checker */}
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleOpnameNotesChange(row.itemId, e.target.value)}
                              placeholder="Catatan fisik..."
                              className="w-full bg-transparent border-b border-line py-1 text-[13px] text-slate-700 focus:outline-none focus:border-amber-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Action */}
              <div className="bg-slate-50 border-t border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm text-slate-500 font-medium">
                  {isOpnameDirty ? (
                    <span className="text-amber-700 font-bold">
                      ⚠️ Klik &quot;Simpan Draf Opname&quot; agar angka tidak hilang saat berpindah menu.
                    </span>
                  ) : (
                    <span>Data draf tersimpan di penyimpanan lokal peramban.</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOpnameDraft}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-ink hover:bg-ink-soft cursor-pointer"
                  >
                    Simpan Draf
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeOpname}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer"
                  >
                    Selesaikan Opname
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 3: MUTASI MASUK & KELUAR ============ */}
        {activeMainTab === 'movements' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Buku Register Mutasi Stok (Audit Trail)</h3>
                <p className="text-sm text-slate-500">
                  Daftar transaksi barang masuk dan keluar masak dapur (Siklus Batch 01–06 Nov 2026).
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleOpenPrintFor('B8_IN')}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Download Dokumen Berita Acara PDF Bahan Masuk"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PDF Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPrintFor('B8_OUT')}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Download Dokumen Berita Acara PDF Bahan Keluar Masak"
                >
                  <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                  <span>PDF Masak</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenRestock()}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUsage()}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>- Pakai</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMovementsCSV}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Mutasi */}
            <div className="bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  placeholder="Cari transaksi mutasi, no referensi, atau nama bahan..."
                  className="w-full bg-slate-50 border border-line rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={
                    movementFilterType === 'ALL' && !movementSearch ? 'ALL'
                    : movementFilterType === 'OUT' && movementSearch === '2026-11-11' ? 'OUT_1111'
                    : movementFilterType === 'IN' && movementSearch === '2026-11-10' ? 'IN_1110'
                    : movementFilterType === 'OUT' && movementSearch === '2026-11-10' ? 'OUT_1110'
                    : movementFilterType === 'IN' && movementSearch === '2026-11-09' ? 'IN_1109'
                    : movementFilterType === 'OUT' && movementSearch === '2026-11-09' ? 'OUT_1109'
                    : movementFilterType === 'IN' && movementSearch === '2026-11-08' ? 'IN_1108'
                    : movementFilterType === 'OUT' && movementSearch === '2026-11-03' ? 'OUT_1103'
                    : movementFilterType === 'IN' && movementSearch === '2026-11-02' ? 'IN_1102'
                    : movementFilterType === 'OUT' && movementSearch === '2026-11-02' ? 'OUT_1102'
                    : movementFilterType === 'IN' && movementSearch === '2026-11-01' ? 'IN_1101'
                    : 'ALL'
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'ALL') { setMovementFilterType('ALL'); setMovementSearch(''); }
                    else if (v === 'OUT_1111') { setMovementFilterType('OUT'); setMovementSearch('2026-11-11'); }
                    else if (v === 'IN_1110') { setMovementFilterType('IN'); setMovementSearch('2026-11-10'); }
                    else if (v === 'OUT_1110') { setMovementFilterType('OUT'); setMovementSearch('2026-11-10'); }
                    else if (v === 'IN_1109') { setMovementFilterType('IN'); setMovementSearch('2026-11-09'); }
                    else if (v === 'OUT_1109') { setMovementFilterType('OUT'); setMovementSearch('2026-11-09'); }
                    else if (v === 'IN_1108') { setMovementFilterType('IN'); setMovementSearch('2026-11-08'); }
                    else if (v === 'OUT_1103') { setMovementFilterType('OUT'); setMovementSearch('2026-11-03'); }
                    else if (v === 'IN_1102') { setMovementFilterType('IN'); setMovementSearch('2026-11-02'); }
                    else if (v === 'OUT_1102') { setMovementFilterType('OUT'); setMovementSearch('2026-11-02'); }
                    else if (v === 'IN_1101') { setMovementFilterType('IN'); setMovementSearch('2026-11-01'); }
                  }}
                  className="flex-1 min-w-0 bg-slate-50 border border-line rounded-xl px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="ALL">Semua Mutasi ({movements.length})</option>
                  <option value="OUT_1111">- Masak 11 Nov (18)</option>
                  <option value="IN_1110">+ Masuk 10 Nov (18)</option>
                  <option value="OUT_1110">- Masak 10 Nov (15)</option>
                  <option value="IN_1109">+ Masuk 09 Nov (15)</option>
                  <option value="OUT_1109">- Masak 09 Nov (14)</option>
                  <option value="IN_1108">+ Masuk 08 Nov (14)</option>
                  <option value="OUT_1103">- Masak 03 Nov (17)</option>
                  <option value="IN_1102">+ Masuk 02 Nov (17)</option>
                  <option value="OUT_1102">- Masak 02 Nov (16)</option>
                  <option value="IN_1101">+ Masuk 01 Nov (16)</option>
                </select>
              </div>
            </div>

            {/* Mobile Movements Cards (md:hidden) */}
            <div className="md:hidden space-y-2.5">
              {filteredMovements.length === 0 ? (
                <div className="bg-white rounded-xl border border-line p-8 text-center text-slate-400">
                  Tidak ada catatan mutasi yang cocok.
                </div>
              ) : (
                filteredMovements.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-xl border border-line p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="font-mono text-xs text-slate-500">
                        <strong>{m.date}</strong> &bull; {m.time} WIB
                      </div>
                      <div>
                        {m.type === 'IN' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            + MASUK (02 NOV)
                          </span>
                        )}
                        {m.type === 'OUT' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            - KELUAR MASAK (03 NOV)
                          </span>
                        )}
                        {m.type === 'ADJUST' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            ± OPNAME
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{m.itemName}</h4>
                      <span
                        className={`font-mono font-bold text-sm ${
                          m.type === 'IN'
                            ? 'text-emerald-700'
                            : m.type === 'OUT'
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}
                        {m.qty} {m.uom}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-1.5 font-mono">
                      <span>Ref: <strong className="text-slate-700">{m.reference}</strong></span>
                      <span>Sisa: <strong className="text-slate-800">{m.balanceAfter} {m.uom}</strong></span>
                    </div>
                    {m.notes && <p className="text-xs text-slate-500 italic">{m.notes}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table Movements (hidden md:block) */}
            <div className="hidden md:block bg-white rounded-xl border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-line text-slate-600 text-xs font-bold ">
                    <tr>
                      <th className="py-3 px-4">Waktu &amp; Ref</th>
                      <th className="py-3 px-3">Jenis</th>
                      <th className="py-3 px-4">Nama Bahan</th>
                      <th className="py-3 px-3 text-right">Mutasi Qty</th>
                      <th className="py-3 px-3 text-right">Sisa Stok</th>
                      <th className="py-3 px-4">Petugas &amp; Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMovements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada catatan mutasi yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredMovements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[13px]">
                            <div className="font-bold text-slate-800">{m.date}</div>
                            <div className="text-slate-400 text-xs">{m.time} WIB &bull; {m.reference}</div>
                          </td>
                          <td className="py-3 px-3">
                            {m.type === 'IN' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                + MASUK (02 NOV)
                              </span>
                            )}
                            {m.type === 'OUT' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                - KELUAR MASAK (03 NOV)
                              </span>
                            )}
                            {m.type === 'ADJUST' && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                ± OPNAME
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{m.itemName}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span
                              className={
                                m.type === 'IN'
                                  ? 'text-emerald-700'
                                  : m.type === 'OUT'
                                  ? 'text-indigo-700'
                                  : 'text-amber-700'
                              }
                            >
                              {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}
                              {m.qty} {m.uom}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 font-bold">
                            {m.balanceAfter} {m.uom}
                          </td>
                          <td className="py-3 px-4 text-[13px]">
                            <div className="font-bold text-slate-700">{m.loggedBy}</div>
                            <div className="text-slate-500 text-xs">{m.notes || '-'}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 4: KALKULATOR RESEP & BOM MASAK (1.553 PORSI) ============ */}
        {activeMainTab === 'bom' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-line p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Kalkulator Kebutuhan Bahan Masak Dapur (BOM 1.553 Porsi)
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kebutuhan bahan pangan untuk pengolahan menu sajian 1.553 Porsi MBG tanggal <strong>Rabu, 11 November 2026</strong> telah terpenuhi 100% dari penerimaan logistik tgl 10 November 2026.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Ayam Potong Paha Bawah */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-ink bg-ink/5 px-2 py-0.5 rounded">
                    Protein Hewani (Ayam Kecap)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1.610 PCS</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ayam Potong Paha Bawah:</span>
                    <strong className="font-mono">1.610 PCS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bumbu Kecap &amp; Bawang:</span>
                    <strong className="font-mono">4 KG + Gula Jawa</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Olahan Menu:</span>
                    <span className="font-mono text-indigo-700">Ayam Kecap</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (11 Nov)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Tahu Kuning Crispy */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Tahu Crispy (Tahu Kuning)
                  </span>
                  <span className="text-xs font-mono text-slate-400">1.600 PCS</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tahu Kuning:</span>
                    <strong className="font-mono">1.600 PCS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tepung Terigu (Balutan):</span>
                    <strong className="font-mono">17 KG</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Target MBG Terpenuhi:</span>
                    <span className="font-mono text-indigo-700">1.553 Porsi</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (11 Nov)</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Sayur Mayur (Wortel, Pokcoy) */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-green-800 bg-green-50 px-2 py-0.5 rounded">
                    Sayur Mayur Segar (Tumis Wortel Pokcoy)
                  </span>
                  <span className="text-xs font-mono text-slate-400">61 KG Keluar Masak</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wortel:</span>
                    <strong className="font-mono">30 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pokcoy:</span>
                    <strong className="font-mono">30 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Daun Bawang:</span>
                    <strong className="font-mono">1 KG</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Sayur MBG:</span>
                    <span className="font-mono text-indigo-700">61 KG</span>
                  </div>
                </div>
              </div>

              {/* Box 4: Buah Segar Kelengkeng */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                    Buah Segar (Kelengkeng)
                  </span>
                  <span className="text-xs font-mono text-slate-400">6 KRAT Keluar</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Kelengkeng:</span>
                    <strong className="font-mono">6 KRAT</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Alokasi Titik:</span>
                    <strong className="font-mono">12 SD/TK + 1 Posyandu</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Kapasitas Porsi:</span>
                    <span className="font-mono text-indigo-700">1.553 Siswa</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Distribusi:</span>
                    <span className="font-mono text-emerald-700">Teralokasi Penuh</span>
                  </div>
                </div>
              </div>

              {/* Box 5: Beras, Minyak & Bumbu */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Beras, Minyak &amp; Bumbu
                  </span>
                  <span className="text-xs font-mono text-slate-400">Habis Terpakai</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beras:</span>
                    <strong className="font-mono">100 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Minyak Goreng:</span>
                    <strong className="font-mono">36 Liter</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Royco, Gula &amp; Rempah:</span>
                    <strong className="font-mono">7.85 KG</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (11 Nov)</span>
                  </div>
                </div>
              </div>

              {/* Box 6: Verifikasi Pagu MBG & Suplier Tunggal */}
              <div className="bg-white rounded-xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    Suplier Resmi Yayasan
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold">100% Klop</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mitra Suplier:</span>
                    <strong className="text-slate-900 truncate max-w-[130px]" title="Yayasan Berkat Makmur Sentosa">
                      YAYASAN BERKAT MAKMUR
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Realisasi Porsi:</span>
                    <strong className="font-mono text-ink">1.553 Porsi / Hari</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Status SPJ Dokumen:</span>
                    <span className="font-mono text-emerald-700">Sah 4 Pejabat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============ MODAL 0: TAMBAH MASTER BAHAN BAKU BARU ============ */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-line max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Tambah Master Bahan Baku Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddItem} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formAddSku}
                    onChange={(e) => setFormAddSku(e.target.value)}
                    placeholder="BGN-SKU-001"
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Golongan / Kategori</label>
                  <select
                    value={formAddCategory}
                    onChange={(e) => {
                      const cat = e.target.value as StockCategory;
                      setFormAddCategory(cat);
                      if (cat === 'Protein Hewani' || cat === 'Sayur' || cat === 'Buah') {
                        setFormAddLocation('Gudang Basah');
                      } else {
                        setFormAddLocation('Gudang Kering');
                      }
                    }}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Bahan Kering">Bahan Kering (Gudang Kering)</option>
                    <option value="Rempah">Rempah (Gudang Kering)</option>
                    <option value="Protein Hewani">Protein Hewani (Gudang Basah)</option>
                    <option value="Protein Nabati">Protein Nabati (Gudang Kering)</option>
                    <option value="Sayur">Sayur (Gudang Basah)</option>
                    <option value="Buah">Buah (Gudang Basah)</option>
                    <option value="Lainnya">Lainnya (Gudang Kering)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Bahan Makanan *</label>
                <input
                  type="text"
                  required
                  value={formAddName}
                  onChange={(e) => setFormAddName(e.target.value)}
                  placeholder="Cth: TEPUNG TERIGU / DORRY FILLET"
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 "
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan (KG, L, POUCH, BTL, PAPAN, KRAT) *</label>
                  <input
                    type="text"
                    required
                    value={formAddUom}
                    onChange={(e) => setFormAddUom(e.target.value)}
                    placeholder="KG, L, POUCH, BTL, PAPAN, KRAT"
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 "
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Penyimpanan</label>
                  <select
                    value={formAddLocation}
                    onChange={(e) => setFormAddLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Gudang Basah">Gudang Basah (Protein Hewani, Buah &amp; Sayur)</option>
                    <option value="Gudang Kering">Gudang Kering (Bahan Kering, Rempah, Nabati / Sisanya)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Awal</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formAddInitialStock}
                    onChange={(e) => setFormAddInitialStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batas Buffer Min</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formAddMinAlert}
                    onChange={(e) => setFormAddMinAlert(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pakai / Hari</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formAddDailyUsage}
                    onChange={(e) => setFormAddDailyUsage(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Suplier / Petani</label>
                <input
                  type="text"
                  value={formAddSupplier}
                  onChange={(e) => setFormAddSupplier(e.target.value)}
                  placeholder="Nama supplier..."
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-ink hover:bg-ink-soft text-white font-bold cursor-pointer"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL 1: RESTOCK / PENERIMAAN BAHAN MASUK ============ */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-line max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Catat Bahan Baku Masuk</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRestock} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Bahan Baku</label>
                <select
                  value={formRestockItemId}
                  onChange={(e) => {
                    setFormRestockItemId(e.target.value);
                    const item = stockItems.find((i) => i.id === e.target.value);
                    if (item) setFormRestockVendor(item.supplierName);
                  }}
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} — Saat ini: {item.currentStock} {item.uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Masuk</label>
                  <input
                    type="date"
                    required
                    value={formRestockDate}
                    onChange={(e) => setFormRestockDate(e.target.value)}
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Masuk (Qty)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formRestockQty}
                      onChange={(e) => setFormRestockQty(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    />
                    <span className="font-mono font-bold text-slate-600 px-2">
                      {stockItems.find((i) => i.id === formRestockItemId)?.uom || ''}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Referensi / Surat Jalan</label>
                <input
                  type="text"
                  value={formRestockInvoice}
                  onChange={(e) => setFormRestockInvoice(e.target.value)}
                  placeholder="GRN-20261102-01..."
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Penerimaan / Hasil QC</label>
                <textarea
                  rows={2}
                  value={formRestockNotes}
                  onChange={(e) => setFormRestockNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL 2: POTONG STOK PEMAKAIAN DAPUR ============ */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-line max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Potong Pemakaian Masak Dapur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUsage} className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bahan yang Digunakan</label>
                <select
                  value={formUsageItemId}
                  onChange={(e) => {
                    setFormUsageItemId(e.target.value);
                    const item = stockItems.find((i) => i.id === e.target.value);
                    if (item && item.currentStock > 0) setFormUsageQty(item.currentStock);
                  }}
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} — Sisa: {item.currentStock} {item.uom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Pemakaian (Qty)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formUsageQty}
                    onChange={(e) => setFormUsageQty(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    disabled
                    value={stockItems.find((i) => i.id === formUsageItemId)?.uom || ''}
                    className="w-full bg-slate-100 border border-line rounded-xl p-2.5 font-bold text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alokasi Menu Sajian</label>
                <input
                  type="text"
                  value={formUsageMenu}
                  onChange={(e) => setFormUsageMenu(e.target.value)}
                  placeholder="Cth: Nasi Putih Dorry Fillet &amp; Buncis 1.553 Porsi"
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Seksi Pengolahan</label>
                <textarea
                  rows={2}
                  value={formUsageNotes}
                  onChange={(e) => setFormUsageNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-line rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Eksekusi Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL 3: DETAIL KARTU STOK ITEM ============ */}
      {showItemDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-line max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-ink bg-ink/5 px-1.5 py-0.5 rounded">
                  {selectedItem.sku}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowItemDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-line">
                <span className="text-xs text-slate-500 font-bold block">Golongan</span>
                <strong className="text-slate-900">{selectedItem.category}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-line">
                <span className="text-xs text-slate-500 font-bold block">Lokasi Simpan</span>
                <strong className="text-slate-900">{selectedItem.storageLocation}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-line">
                <span className="text-xs text-slate-500 font-bold block">Masuk (01-10 Nov 2026)</span>
                <strong className="text-emerald-700 text-sm font-mono font-bold">
                  {selectedItem.initialStock} {selectedItem.uom}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-line">
                <span className="text-xs text-slate-500 font-bold block">Keluar Masak (02-11 Nov)</span>
                <strong className="text-indigo-700 text-sm font-mono font-bold">
                  {selectedItem.usedStock} {selectedItem.uom}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-line col-span-2">
                <span className="text-xs text-slate-500 font-bold block">Sisa Stok Fisik Gudang</span>
                <strong className="text-slate-900 text-base font-mono font-bold">
                  {selectedItem.currentStock} {selectedItem.uom}
                </strong>
                <span className="text-xs text-emerald-600 font-bold block mt-0.5">
                  ✓ Selesai dimasak untuk 1.553 Porsi MBG tgl {selectedItem.lastUsageDate.slice(8, 10)} Nov 2026
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Masuk:</span>
                <span className="font-mono font-bold text-slate-800">{selectedItem.lastRestockDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Selesai Masak:</span>
                <span className="font-mono font-bold text-indigo-700">{selectedItem.lastUsageDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Suplier / Petani:</span>
                <strong className="text-slate-900">{selectedItem.supplierName}</strong>
              </div>
              {selectedItem.notes && (
                <div className="text-slate-500 text-[13px] pt-1">
                  <em>{selectedItem.notes}</em>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteItem(selectedItem.id, selectedItem.name)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-sm cursor-pointer"
              >
                Hapus Bahan
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemDetailModal(false);
                    handleOpenRestock(selectedItem);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-sm cursor-pointer hover:bg-emerald-700"
                >
                  + Restock
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemDetailModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL 4: CETAK BERITA ACARA STOK A4 (PILIHAN: MASUK 01 NOV / KELUAR 02 NOV / REKAP MUTASI) ============ */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs print:static print:p-0 print:bg-white print:z-auto print:block">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full print:max-w-none print:rounded-none">
            {/* Modal Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 p-3 sm:p-4 bg-slate-50 no-print gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    Pratinjau Dokumen Berita Acara Logistik (A4)
                  </h3>
                  <p className="text-[10px] text-slate-500">Standar Resmi Badan Gizi Nasional (BGN)</p>
                </div>
              </div>

              {/* Selector Dokumen Berita Acara (Dropdown kustom — rapi di semua perangkat) */}
              <div className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setPrintMenuOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={printMenuOpen}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center gap-2 focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <span className="text-sm leading-none" aria-hidden="true">{currentPrintOption.icon}</span>
                  <span className="flex-1 min-w-0 text-left truncate">{currentPrintOption.title}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500">{currentPrintOption.count}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${printMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {printMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[60]" aria-hidden="true" onClick={() => setPrintMenuOpen(false)} />
                    <div role="listbox" aria-label="Pilih dokumen Berita Acara" className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[340px] mt-2 z-[70] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                      <div className="max-h-[55vh] overflow-y-auto py-1.5">
                        {PRINT_REPORT_GROUPS.map((group) => (
                          <div key={group.label}>
                            <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{group.label}</p>
                            {group.options.map((option) => {
                              const selected = option.value === printReportType;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => { setPrintReportType(option.value); setPrintMenuOpen(false); }}
                                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs font-bold cursor-pointer transition-colors ${selected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                                >
                                  <span className="text-sm leading-none" aria-hidden="true">{option.icon}</span>
                                  <span className="flex-1 min-w-0 truncate">{option.title}</span>
                                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500">{option.count}</span>
                                  {selected && <Check className="w-4 h-4 shrink-0 text-blue-600" />}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  title="Download atau Simpan sebagai PDF (A4)"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Download / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPrintMenuOpen(false); setShowPrintModal(false); }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body Wrapper with Scroll */}
            <div className="p-2 sm:p-8 bg-slate-100 overflow-y-auto flex-1 print:p-0 print:bg-white print:overflow-visible">
              {/* Genuine A4 Document Sheet */}
              <div className="report-sheet bg-white text-slate-950 p-4 sm:p-10 border border-slate-300 rounded-xl shadow-md max-w-3xl mx-auto space-y-6 print:space-y-3 font-serif text-xs print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
                {/* Official KOP BGN SPPG */}
                <div className="border-b-2 border-slate-950 pb-4 print:pb-2 text-center relative">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Logo BGN"
                      width={55}
                      height={55}
                      className="object-contain shrink-0 print:w-10 print:h-10"
                      priority
                    />
                    <div className="text-center">
                      <h4 className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-slate-800">
                        BADAN GIZI NASIONAL
                      </h4>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950">
                        SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                      </h2>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Pagu Layanan: 1.553 Porsi / Hari &bull; 12 Sekolah &amp; 1 Posyandu &bull; Kode Satpel: SPPG-SMG-003
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-950 mt-3 print:mt-1.5 pt-0.5" />
                </div>

                {/* Judul Dokumen Sesuai Pilihan */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wider text-slate-950">
                    {printReportType === 'B8_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (11 NOV 2026)'}
                    {printReportType === 'B8_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (10 NOV 2026)'}
                    {printReportType === 'B7_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (10 NOV 2026)'}
                    {printReportType === 'B7_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (09 NOV 2026)'}
                    {printReportType === 'B6_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (09 NOV 2026)'}
                    {printReportType === 'B6_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (08 NOV 2026)'}
                    {printReportType === 'B5_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (06 NOV 2026)'}
                    {printReportType === 'B5_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (05 NOV 2026)'}
                    {printReportType === 'B4_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (05 NOV 2026)'}
                    {printReportType === 'B4_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (04 NOV 2026)'}
                    {printReportType === 'B3_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (04 NOV 2026)'}
                    {printReportType === 'B3_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (03 NOV 2026)'}
                    {printReportType === 'B2_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (03 NOV 2026)'}
                    {printReportType === 'B2_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (02 NOV 2026)'}
                    {printReportType === 'B1_OUT' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (02 NOV 2026)'}
                    {printReportType === 'B1_IN' && 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK (01 NOV 2026)'}
                    {printReportType === 'MUTASI' && 'BUKU REGISTER REKAPITULASI MUTASI BAHAN BAKU (01 - 11 NOV 2026)'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-600">
                    {printReportType === 'B8_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1111'}
                    {printReportType === 'B8_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1110'}
                    {printReportType === 'B7_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1110'}
                    {printReportType === 'B7_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1109'}
                    {printReportType === 'B6_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1109'}
                    {printReportType === 'B6_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1108'}
                    {printReportType === 'B5_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1106'}
                    {printReportType === 'B5_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1105'}
                    {printReportType === 'B4_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1105'}
                    {printReportType === 'B4_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1104'}
                    {printReportType === 'B3_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1104'}
                    {printReportType === 'B3_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1103'}
                    {printReportType === 'B2_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1103'}
                    {printReportType === 'B2_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1102'}
                    {printReportType === 'B1_OUT' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1102'}
                    {printReportType === 'B1_IN' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1101'}
                    {printReportType === 'MUTASI' && 'Nomor: REG-MUTASI/SPPG-SMG3/BGN/2026/11'}
                  </p>
                  <p className="text-[11px] text-slate-700 font-bold">
                    {printReportType === 'B8_OUT' && 'Tanggal Pengolahan Masak: Rabu, 11 November 2026'}
                    {printReportType === 'B8_IN' && 'Tanggal Penerimaan: Selasa, 10 November 2026'}
                    {printReportType === 'B7_OUT' && 'Tanggal Pengolahan Masak: Selasa, 10 November 2026'}
                    {printReportType === 'B7_IN' && 'Tanggal Penerimaan: Senin, 09 November 2026'}
                    {printReportType === 'B6_OUT' && 'Tanggal Pengolahan Masak: Senin, 09 November 2026'}
                    {printReportType === 'B6_IN' && 'Tanggal Penerimaan: Ahad, 08 November 2026'}
                    {printReportType === 'B5_OUT' && 'Tanggal Pengolahan Masak: Jumat, 06 November 2026'}
                    {printReportType === 'B5_IN' && 'Tanggal Penerimaan: Kamis, 05 November 2026'}
                    {printReportType === 'B4_OUT' && 'Tanggal Pengolahan Masak: Kamis, 05 November 2026'}
                    {printReportType === 'B4_IN' && 'Tanggal Penerimaan: Rabu, 04 November 2026'}
                    {printReportType === 'B3_OUT' && 'Tanggal Pengolahan Masak: Rabu, 04 November 2026'}
                    {printReportType === 'B3_IN' && 'Tanggal Penerimaan: Selasa, 03 November 2026'}
                    {printReportType === 'B2_OUT' && 'Tanggal Pengolahan Masak: Selasa, 03 November 2026'}
                    {printReportType === 'B2_IN' && 'Tanggal Penerimaan: Senin, 02 November 2026'}
                    {printReportType === 'B1_OUT' && 'Tanggal Pengolahan Masak: Senin, 02 November 2026'}
                    {printReportType === 'B1_IN' && 'Tanggal Penerimaan: Minggu, 01 November 2026'}
                    {printReportType === 'MUTASI' && 'Periode Mutasi: 01 s/d 11 November 2026'}
                  </p>
                </div>

                {/* Narasi Resmi Sesuai Pilihan */}
                <p className="text-[11px] leading-relaxed print:leading-snug text-justify text-slate-800">
                  {printReportType === 'B8_OUT' &&
                    'Pada hari ini, Rabu tanggal 11 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 8 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Ayam Kecap, Tahu Crispy, Tumis Wortel Pokcoy, Buah Kelengkeng) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B8_IN' &&
                    'Pada hari ini, Selasa tanggal 10 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 8 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B7_OUT' &&
                    'Pada hari ini, Selasa tanggal 10 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 7 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Telur Fuyunghai, Martabak Tahu, Tumis Buncis Kol, Buah Anggur) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B7_IN' &&
                    'Pada hari ini, Senin tanggal 09 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 7 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B6_OUT' &&
                    'Pada hari ini, Senin tanggal 09 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 6 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Nugget Ayam, Edamame, Tumis Brokoli dan Wortel, Buah Jeruk) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B6_IN' &&
                    'Pada hari ini, Ahad tanggal 08 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 6 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B5_OUT' &&
                    'Pada hari ini, Jumat tanggal 06 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 5 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Mongolian Chicken, Tahu Goreng Marinasi, Sayur Orak Arik, Buah Kurma) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B5_IN' &&
                    'Pada hari ini, Kamis tanggal 05 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 5 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B4_OUT' &&
                    'Pada hari ini, Kamis tanggal 05 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 4 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Bistik Ayam, Tempe Goreng, Buncis Wortel Steamed, Buah Anggur Merah) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B4_IN' &&
                    'Pada hari ini, Rabu tanggal 04 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 4 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B3_OUT' &&
                    'Pada hari ini, Rabu tanggal 04 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 3 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Kentang Goreng, Telur Katsu, Edamame, Tumis Pakcoy Jagung, Buah Kelengkeng, Sauce Asam Manis) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B3_IN' &&
                    'Pada hari ini, Selasa tanggal 03 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 3 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B2_OUT' &&
                    'Pada hari ini, Selasa tanggal 03 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 2 dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Rolade Ayam Kulit Tahu, Tahu Kuning Goreng, Sup Kembang Kol Wortel, Buah Jeruk Manis) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B2_IN' &&
                    'Pada hari ini, Senin tanggal 02 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 2 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B1_OUT' &&
                    'Pada hari ini, Senin tanggal 02 November 2026, telah dikeluarkan dan dialokasikan seluruh stok bahan baku Batch 1 dari gudang penyimpanan untuk proses pengolahan masak Program MBG sebanyak 1.553 Porsi (Menu: Nasi Putih, Ikan Dorry Fillet Crispy Saus Mayo Madu, Tempe Goreng, Sayur Buncis & Labu Siam, Buah Anggur Merah) pasokan dari Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'B1_IN' &&
                    'Pada hari ini, Minggu tanggal 01 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku Batch 1 di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:'}
                  {printReportType === 'MUTASI' &&
                    'Rekapitulasi mutasi siklus bahan baku makanan Program MBG 1.553 Porsi SPPG Wonodri 3 periode 01 s/d 11 November 2026 pasokan dari Yayasan Berkat Makmur Sentosa, mencakup seluruh kuantitas penerimaan barang masuk dan pengeluaran masak dapur secara penuh dengan rincian sebagai berikut:'}
                </p>

                {/* Tabel Dokumen A4 */}
                <div className="overflow-x-auto rounded border border-slate-400">
                  <table className="w-full text-left text-[10px] border-collapse min-w-[500px]">
                    <thead className="bg-slate-100 font-bold">
                      <tr className="border-b border-slate-400">
                        <th className="p-1.5 print:p-1 border-r border-slate-400 text-center w-8">NO</th>
                        <th className="p-1.5 print:p-1 border-r border-slate-400">GOLONGAN</th>
                        <th className="p-1.5 print:p-1 border-r border-slate-400">NAMA BAHAN MAKANAN</th>
                        {printReportType === 'MUTASI' ? (
                          <>
                            <th className="p-1.5 print:p-1 border-r border-slate-400 text-right">MASUK (QTY)</th>
                            <th className="p-1.5 print:p-1 border-r border-slate-400 text-right">MASAK (QTY)</th>
                            <th className="p-1.5 print:p-1 border-r border-slate-400 text-right">SISA</th>
                          </>
                        ) : (
                          <th className="p-1.5 print:p-1 border-r border-slate-400 text-right">
                            {printReportType.includes('IN') ? 'JUMLAH MASUK' : 'JUMLAH MASAK'}
                          </th>
                        )}
                        <th className="p-1.5 print:p-1 border-r border-slate-400 text-center">SATUAN</th>
                        <th className="p-1.5 print:p-1 border-r border-slate-400">LOKASI SIMPAN</th>
                        <th className="p-1.5 print:p-1 text-center">KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {reportItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-1.5 print:p-1 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-1.5 print:p-1 border-r border-slate-300 font-semibold">{item.category}</td>
                          <td className="p-1.5 print:p-1 border-r border-slate-300 font-bold">{item.name}</td>
                          {printReportType === 'MUTASI' ? (
                            <>
                              <td className="p-1.5 print:p-1 border-r border-slate-300 text-right font-mono font-bold text-emerald-800">
                                {item.initialStock}
                              </td>
                              <td className="p-1.5 print:p-1 border-r border-slate-300 text-right font-mono font-bold text-indigo-800">
                                {item.usedStock}
                              </td>
                              <td className="p-1.5 print:p-1 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                                {item.currentStock}
                              </td>
                            </>
                          ) : (
                            <td className="p-1.5 print:p-1 border-r border-slate-300 text-right font-mono font-bold text-[11px]">
                              {printReportType.includes('IN') ? item.initialStock : item.usedStock}
                            </td>
                          )}
                          <td className="p-1.5 print:p-1 border-r border-slate-300 text-center font-mono font-bold">
                            {item.uom}
                          </td>
                          <td className="p-1.5 print:p-1 border-r border-slate-300">{item.storageLocation}</td>
                          <td className="p-1.5 print:p-1 text-center font-medium text-emerald-800">
                            {printReportType.includes('IN')
                              ? 'Diterima Baik'
                              : printReportType === 'MUTASI'
                              ? 'Selesai Dimasak'
                              : '1.553 Porsi MBG'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <tr>
                        <td colSpan={3} className="p-2 print:p-1 border-r border-slate-400 text-right uppercase">
                          {printReportType === 'MUTASI' ? 'Total Mutasi (Kg):' : 'Total Muatan Timbangan:'}
                        </td>
                        {printReportType === 'MUTASI' ? (
                          <>
                            <td className="p-2 print:p-1 border-r border-slate-400 text-right font-mono text-xs text-emerald-900">
                              {reportSummary.totalKgMasuk} KG
                            </td>
                            <td className="p-2 print:p-1 border-r border-slate-400 text-right font-mono text-xs text-indigo-900">
                              {reportSummary.totalKgKeluar} KG
                            </td>
                            <td className="p-2 print:p-1 border-r border-slate-400 text-right font-mono text-xs text-slate-900">
                              0 KG
                            </td>
                          </>
                        ) : (
                          <td className="p-2 print:p-1 border-r border-slate-400 text-right font-mono text-xs text-blue-900">
                            {printReportType.includes('IN') ? reportSummary.totalKgMasuk : reportSummary.totalKgKeluar} KG
                          </td>
                        )}
                        <td
                          colSpan={printReportType === 'MUTASI' ? 2 : 3}
                          className="p-2 print:p-1 text-left font-mono text-[10px] text-slate-700"
                        >
                          + {reportSummary.totalQtyNonKgMasuk} Unit Satuan Lain (L/Pouch/Btl/Papan/Krat/PCS)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Formal 4-Signatory Block: Responsive grid (2x2 on mobile, 4 cols in print & desktop) */}
                <div className="pt-6 print:pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-3 print:gap-2 text-center text-xs">
                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Petugas Logistik / Timbangan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Nur Khafidin
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Staf Logistik SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Ahli Gizi Penanggung Jawab,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Sintia Mariam, A.Md.Gz
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Ahli Gizi SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Petugas Akuntansi / Keuangan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Salsabiila Zainima, S.Ak
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Akuntan SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Mengetahui / Mengesahkan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Dicky Yusuf Mulyadi, S.M.
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Kepala SPPG Wonodri 3</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL 5: CETAK BERITA ACARA STOCK OPNAME A4 (PDF) ============ */}
      {showOpnamePrintModal && opnameSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs print:static print:p-0 print:bg-white print:z-auto print:block">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full print:max-w-none print:rounded-none">
            {/* Modal Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 p-3 sm:p-4 bg-slate-50 no-print gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    Pratinjau Dokumen Stock Opname (A4)
                  </h3>
                  <p className="text-[10px] text-slate-500">Standar Resmi Badan Gizi Nasional (BGN)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  title="Download atau Simpan sebagai PDF (A4)"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Download / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowOpnamePrintModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  title="Tutup Pratinjau"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body Wrapper with Scroll */}
            <div className="p-2 sm:p-8 bg-slate-100 overflow-y-auto flex-1 print:p-0 print:bg-white print:overflow-visible">
              {/* Genuine A4 Document Sheet */}
              <div className="report-sheet bg-white text-slate-950 p-4 sm:p-10 border border-slate-300 rounded-xl shadow-md max-w-3xl mx-auto space-y-6 print:space-y-3 font-serif text-xs print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
                {/* Official KOP BGN SPPG */}
                <div className="border-b-2 border-slate-950 pb-4 print:pb-2 text-center relative">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Logo BGN"
                      width={55}
                      height={55}
                      className="object-contain shrink-0 print:w-10 print:h-10"
                      priority
                    />
                    <div className="text-center">
                      <h4 className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-slate-800">
                        BADAN GIZI NASIONAL
                      </h4>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-slate-950">
                        SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                      </h2>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Pagu Layanan: 1.553 Porsi / Hari &bull; 12 Sekolah &amp; 1 Posyandu &bull; Kode Satpel: SPPG-SMG-003
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-950 mt-3 print:mt-1.5 pt-0.5" />
                </div>

                {/* Judul Dokumen */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wider text-slate-950">
                    Berita Acara Stock Opname Bahan Baku
                  </h3>
                  <p className="text-[11px] font-bold text-slate-700">
                    Nomor: {opnameSession.id} &nbsp;&bull;&nbsp; Tanggal: {new Date(`${opnameSession.date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Pemeriksa: {opnameSession.checkerName} &nbsp;&bull;&nbsp; Status: {opnameSession.status === 'completed' ? 'Selesai & Diterapkan' : 'Draf'}
                  </p>
                </div>

                {/* Ringkasan Opname */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] font-bold text-slate-800 border border-slate-300 rounded-lg px-3 py-2">
                  <span>Total Item: {printOpnameStats.totalRows}</span>
                  <span>Item Berselisih: {printOpnameStats.itemsDiff}</span>
                  <span>Kecocokan: {printOpnameStats.matchPct}%</span>
                </div>

                {/* Tabel Hasil Opname */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-400 text-[11px] print:text-[10px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-center w-8">No</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-left">Nama Bahan</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-center">Satuan</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right">Stok Sistem</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right">Hasil Fisik</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right">Selisih</th>
                        <th className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printOpnameRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="border border-slate-400 px-2 py-4 text-center text-slate-500">
                            Tidak ada bahan dengan kuantitas &mdash; semua item ber-qty 0 sehingga tidak dicantumkan.
                          </td>
                        </tr>
                      ) : (
                        printOpnameRows.map((row, idx) => {
                          const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
                          const fmt = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(2));
                          return (
                            <tr key={row.itemId} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-center">{idx + 1}</td>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 font-bold">
                                {row.name}
                                <span className="block font-mono font-normal text-[9px] text-slate-500 print:hidden">{row.sku} &bull; {row.storageLocation}</span>
                              </td>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-center">{row.uom}</td>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right font-mono">{fmt(row.systemQty)}</td>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right font-mono">{fmt(row.physicalQty)}</td>
                              <td className={`border border-slate-400 px-2 py-1.5 print:py-0.5 text-right font-mono ${diff !== 0 ? 'font-black' : ''}`}>
                                {diff > 0 ? `+${fmt(diff)}` : diff < 0 ? `-${fmt(Math.abs(diff))}` : '0'}
                              </td>
                              <td className="border border-slate-400 px-2 py-1.5 print:py-0.5">{row.notes || '-'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={3} className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right">Total</td>
                        <td className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-right font-mono">{printOpnameStats.totalRows} Item</td>
                        <td colSpan={3} className="border border-slate-400 px-2 py-1.5 print:py-0.5 text-left">
                          {printOpnameStats.itemsDiff} Item Berselisih &bull; Kecocokan {printOpnameStats.matchPct}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Demikian Berita Acara Stock Opname ini dibuat dengan sebenarnya berdasarkan hasil pemeriksaan fisik
                  bahan baku di gudang penyimpanan SPPG Wonodri 3, untuk dipergunakan sebagaimana mestinya.
                </p>

                {/* Formal 4-Signatory Block: Responsive grid (2x2 on mobile, 4 cols in print & desktop) */}
                <div className="pt-6 print:pt-3 border-t border-slate-200">
                  <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-3 print:gap-2 text-center text-xs">
                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Petugas Logistik / Timbangan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Nur Khafidin
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Staf Logistik SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Ahli Gizi Penanggung Jawab,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Sintia Mariam, A.Md.Gz
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Ahli Gizi SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Petugas Akuntansi / Keuangan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Salsabiila Zainima, S.Ak
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Akuntan SPPG</p>
                      </div>
                    </div>

                    <div className="space-y-12 bg-slate-50/50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                      <p className="font-medium text-slate-700 text-[10px] sm:text-[11px] leading-tight">
                        Mengetahui / Mengesahkan,
                      </p>
                      <div>
                        <p className="font-bold underline uppercase text-slate-950 text-[11px] sm:text-xs">
                          Dicky Yusuf Mulyadi, S.M.
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500">Kepala SPPG Wonodri 3</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ FOOTER ============ */}
      <footer className="no-print border-t border-line bg-white mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-sm text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span>Portal transparansi operasional SPPG Wonodri 3, Kota Semarang</span>
          <span>Badan Gizi Nasional, Republik Indonesia</span>
        </div>
      </footer>

      <BottomTabs />
    </div>
  );
}
