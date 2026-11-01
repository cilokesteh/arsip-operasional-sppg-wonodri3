'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Landmark,
  ShieldCheck,
  LayoutDashboard,
  Archive,
  Users,
  FileSpreadsheet,
  Boxes,
  Search,
  PlusCircle,
  MinusCircle,
  ClipboardCheck,
  FileDown,
  Printer,
  X,
  Menu as MenuIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Warehouse,
  ThermometerSnowflake,
  Apple,
  Flame,
  Package,
  History,
  Calculator,
  RotateCcw,
  ArrowUpDown,
  FileText,
  Utensils,
  Info,
} from 'lucide-react';
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
  formatRupiah,
  formatStockQty,
  generateStockCSV,
  generateMovementsCSV,
  DEFAULT_STOCK_ITEMS_32,
} from '@/lib/stock';

export default function StockMonitoringPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(DEFAULT_STOCK_ITEMS_32);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Active view tab
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'movements' | 'bom'>('inventory');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'daysLeft' | 'currentStock' | 'valuation'>('daysLeft');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Interactive Modals
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [showOpnameModal, setShowOpnameModal] = useState<boolean>(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form States for Restock
  const [formRestockItemId, setFormRestockItemId] = useState<string>('bhk-001');
  const [formRestockQty, setFormRestockQty] = useState<number>(50);
  const [formRestockVendor, setFormRestockVendor] = useState<string>('');
  const [formRestockInvoice, setFormRestockInvoice] = useState<string>('');
  const [formRestockNotes, setFormRestockNotes] = useState<string>('Lolos verifikasi QC & timbangan gudang');

  // Form States for Usage
  const [formUsageItemId, setFormUsageItemId] = useState<string>('bhk-001');
  const [formUsageQty, setFormUsageQty] = useState<number>(20);
  const [formUsageMenu, setFormUsageMenu] = useState<string>('Produksi Nasi Chicken Katsu 1.553 Porsi');
  const [formUsageNotes, setFormUsageNotes] = useState<string>('Pemotongan bahan masak shift pagi');

  // Form States for Opname
  const [formOpnameItemId, setFormOpnameItemId] = useState<string>('bhk-001');
  const [formOpnamePhysicalQty, setFormOpnamePhysicalQty] = useState<number>(0);
  const [formOpnameReason, setFormOpnameReason] = useState<string>('Audit fisik mingguan timbangan');

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load from LocalStorage on mount
  useEffect(() => {
    const loadedItems = loadStockFromStorage();
    const loadedMovements = loadMovementsFromStorage();
    setStockItems(loadedItems);
    setMovements(loadedMovements);
  }, []);

  // Recalculate summary metrics
  const summary = useMemo(() => calculateStockSummary(stockItems), [stockItems]);

  // Filtered & Sorted Stock Items
  const filteredItems = useMemo(() => {
    return stockItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }

        // Status filter
        const status = calculateStockStatus(item);
        if (selectedStatus !== 'ALL') {
          if (selectedStatus === 'critical' && status !== 'critical') return false;
          if (selectedStatus === 'warning' && status !== 'warning') return false;
          if (selectedStatus === 'safe' && status !== 'safe') return false;
        }

        // Search Query
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
        } else if (sortBy === 'valuation') {
          valA = a.currentStock * a.unitPrice;
          valB = b.currentStock * b.unitPrice;
        }

        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stockItems, selectedCategory, selectedStatus, searchQuery, sortBy, sortDirection]);

  // Handlers for Modals
  const handleOpenRestock = (item?: StockItem) => {
    if (item) {
      setFormRestockItemId(item.id);
      setFormRestockVendor(item.supplierName);
    } else {
      setFormRestockItemId(stockItems[0]?.id || 'bhk-001');
      setFormRestockVendor(stockItems[0]?.supplierName || '');
    }
    setFormRestockQty(50);
    setFormRestockInvoice(`INV-${Date.now().toString().slice(-6)}`);
    setShowRestockModal(true);
  };

  const handleOpenUsage = (item?: StockItem) => {
    if (item) {
      setFormUsageItemId(item.id);
      setFormUsageQty(item.dailyUsageAvg > 0 ? item.dailyUsageAvg : 10);
    } else {
      setFormUsageItemId(stockItems[0]?.id || 'bhk-001');
      setFormUsageQty(stockItems[0]?.dailyUsageAvg || 20);
    }
    setShowUsageModal(true);
  };

  const handleOpenOpname = (item?: StockItem) => {
    const target = item || stockItems[0];
    if (target) {
      setFormOpnameItemId(target.id);
      setFormOpnamePhysicalQty(target.currentStock);
    }
    setShowOpnameModal(true);
  };

  const handleOpenDetail = (item: StockItem) => {
    setSelectedItem(item);
    setShowItemDetailModal(true);
  };

  // Submit Restock
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
          lastRestockDate: new Date().toISOString().slice(0, 10),
          supplierName: formRestockVendor || item.supplierName,
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'IN',
      qty: qty,
      uom: target.uom,
      balanceAfter: Number((target.currentStock + qty).toFixed(2)),
      reference: formRestockInvoice || `GRN-${Date.now().toString().slice(-5)}`,
      loggedBy: 'Petugas Timbangan Logistik',
      notes: formRestockNotes || 'Penerimaan bahan baru gudang',
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowRestockModal(false);
    showToast(`✅ Berhasil mencatat bahan masuk: +${qty} ${target.uom} ${target.name}`);
  };

  // Submit Usage
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
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'OUT',
      qty: qty,
      uom: target.uom,
      balanceAfter: newBalance,
      reference: formUsageMenu || 'BOM Dapur MBG 1.553 Porsi',
      loggedBy: 'Chef In Charge (Seksi Pengolahan)',
      notes: formUsageNotes || 'Pemotongan bahan masak',
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowUsageModal(false);
    showToast(`🍳 Pemakaian dapur dicatat: -${qty} ${target.uom} ${target.name}`);
  };

  // Submit Opname
  const handleSubmitOpname = (e: React.FormEvent) => {
    e.preventDefault();
    const target = stockItems.find((i) => i.id === formOpnameItemId);
    if (!target) return;

    const physical = Number(formOpnamePhysicalQty);
    if (isNaN(physical) || physical < 0) {
      alert('Jumlah fisik tidak valid');
      return;
    }

    const diff = Number((physical - target.currentStock).toFixed(2));

    const updatedItems = stockItems.map((item) => {
      if (item.id === formOpnameItemId) {
        return {
          ...item,
          currentStock: physical,
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'ADJUST',
      qty: Math.abs(diff),
      uom: target.uom,
      balanceAfter: physical,
      reference: `OPNAME-${new Date().toISOString().slice(0, 10)}`,
      loggedBy: 'Tim Auditor Logistik & Ahli Gizi',
      notes: `Penyesuaian stok opname (${diff >= 0 ? '+' : ''}${diff} ${target.uom}): ${formOpnameReason}`,
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowOpnameModal(false);
    showToast(`📋 Stok opname diperbarui: ${target.name} sekarang ${physical} ${target.uom}`);
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reset seluruh stok ke data master baseline 32 bahan baku resmi SPPG Wonodri 3?')) {
      setStockItems(DEFAULT_STOCK_ITEMS_32);
      saveStockToStorage(DEFAULT_STOCK_ITEMS_32);
      showToast('🔄 Stok berhasil di-reset ke data master baseline resmi.');
    }
  };

  // Download CSV Handlers
  const handleDownloadStockCSV = () => {
    const csv = generateStockCSV(stockItems);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Stok_Gudang_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Stok Gudang berhasil diunduh.');
  };

  const handleDownloadMovementsCSV = () => {
    const csv = generateMovementsCSV(movements);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Mutasi_Stok_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Riwayat Mutasi berhasil diunduh.');
  };

  const getCategoryIcon = (category: StockCategory) => {
    switch (category) {
      case 'Gudang Kering':
        return <Warehouse className="w-3.5 h-3.5 text-amber-600" />;
      case 'Chiller & Freezer':
        return <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-600" />;
      case 'Sayur & Buah':
        return <Apple className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Bumbu & Rempah':
        return <Flame className="w-3.5 h-3.5 text-orange-600" />;
      case 'Kemasan & Sanitasi':
        return <Package className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Boxes className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: StockStatus, daysLeft: number) => {
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
          KRITIS ({daysLeft} Hari)
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <TrendingDown className="w-3 h-3 text-amber-600" />
          MENIPIS ({daysLeft} Hari)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        AMAN ({daysLeft} Hari)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============ INSTITUTIONAL MASTHEAD ============ */}
      <div className="bg-[#0b1f3a] text-white no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-1.5 text-[10px] sm:text-[11px] font-medium text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3 h-3" />
              <span className="hidden sm:inline">Badan Gizi Nasional — Republik Indonesia</span>
              <span className="sm:hidden">Badan Gizi Nasional</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="font-bold text-emerald-300">Sistem Aktif</span>
              <span className="hidden md:inline text-blue-300/60">• Monitoring Rantai Pasok SPPG</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============ APP SHELL HEADER ============ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Hamburger Button (Mobile Drawer) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                title="Buka Menu Drawer"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              {/* Brand */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs p-1 flex items-center justify-center shrink-0">
                  <Image src="/logo.png" alt="Logo BGN" width={30} height={30} className="object-contain" priority />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight truncate leading-tight">
                      SPPG Wonodri 3
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-2.5 h-2.5" /> Terverifikasi BGN
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
                    Monitoring Stok & Rantai Pasok Dapur MBG
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Portal Utama</span>
              </Link>
              <Link
                href="/arsip"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5 text-blue-600" />
                <span>Arsip Operasional</span>
              </Link>
              <Link
                href="/absensi"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Absensi Relawan</span>
              </Link>
              <Link
                href="/stok"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 flex items-center gap-1 shadow-xs"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Monitoring Stok</span>
              </Link>
              <Link
                href="/admin"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Panel Operator"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Primary nav: modul utama bar */}
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white flex items-center gap-1.5 whitespace-nowrap border border-transparent hover:border-slate-200"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Portal
              </Link>
              <Link
                href="/arsip"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white flex items-center gap-1.5 whitespace-nowrap border border-transparent hover:border-slate-200"
              >
                <Archive className="w-3.5 h-3.5" />
                Arsip Operasional
              </Link>
              <Link
                href="/absensi"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white flex items-center gap-1.5 whitespace-nowrap border border-transparent hover:border-slate-200"
              >
                <Users className="w-3.5 h-3.5" />
                Absensi Relawan
              </Link>
              <Link
                href="/stok"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Boxes className="w-3.5 h-3.5" />
                Monitoring Stok
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white flex items-center gap-1.5 whitespace-nowrap border border-transparent hover:border-slate-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Panel Operator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ============ DRAWER KIRI (MOBILE MENU) ============ */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-slate-900 text-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                    <Image src="/logo.png" alt="Logo" width={22} height={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">SPPG Wonodri 3</h3>
                    <p className="text-[10px] text-slate-400">Navigasi Sentral ERP</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <Link
                  href="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  <span>Portal Utama (MBG)</span>
                </Link>
                <Link
                  href="/arsip"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Archive className="w-4 h-4 text-sky-400" />
                  <span>Katalog Arsip Operasional</span>
                </Link>
                <Link
                  href="/absensi"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Presensi 40 Relawan</span>
                </Link>
                <Link
                  href="/stok"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white font-bold"
                >
                  <Boxes className="w-4 h-4 text-white" />
                  <span>Monitoring Stok Gudang</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span>Panel Operator</span>
                </Link>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 text-[11px] text-slate-400">
              <p className="font-bold text-slate-300">Pagu Kuota: 1.553 Porsi / Hari</p>
              <p className="text-[10px] text-slate-500">Kecamatan Semarang Selatan</p>
            </div>
          </div>
        </div>
      )}

      {/* ============ MAIN CONTENT ============ */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-7 flex-1 space-y-5">
        {/* Banner Header Halaman */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                Rantai Pasok & Logistik
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">BGN TA 2026 — Dapur Mandiri Wonodri 3</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-blue-600" />
              Monitoring Stok & Inventaris Bahan Baku
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pengawasan ketersediaan logistik bahan makanan secara real-time untuk pemenuhan pagu <strong>1.553 Porsi / Hari</strong> (12 Sekolah & 1 Posyandu), mencakup barang masuk (GRN), pemotongan bahan masak (BOM), dan stok opname berkala.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => handleOpenRestock()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Terima Bahan Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenUsage()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Potong Masak Dapur</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Berita Acara</span>
            </button>
          </div>
        </div>

        {/* ============ EXECUTIVE METRICS STRIP ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total SKU */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bahan Baku</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.totalItems} SKU</div>
              <span className="text-[10px] text-slate-500 font-medium">5 Kategori Penyimpanan</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Card 2: Total Valuasi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Valuasi Aset Fisik</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatRupiah(summary.totalValuation)}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Saldo Riil di Gudang</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Warehouse className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: Status Buffer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status Buffer</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5">
                <span className="text-emerald-600">{summary.safeCount}</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-amber-500">{summary.warningCount}</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-rose-600">{summary.criticalCount}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Aman / Menipis / Kritis</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          {/* Card 4: Kebutuhan Porsi */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Kapasitas Produksi</span>
              <div className="text-xl sm:text-2xl font-black text-blue-900">1.553 Porsi</div>
              <span className="text-[10px] text-slate-500 font-medium">700 Besar + 853 Kecil</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* ============ NAVIGATION TABS (SUB-NAV) ============ */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveMainTab('inventory')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeMainTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Kartu Stok & Katalog</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('movements')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeMainTab === 'movements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Mutasi ({movements.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('bom')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                activeMainTab === 'bom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Kalkulator Kebutuhan Masak</span>
              <span className="sm:hidden">Kalkulator</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToBaseline}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              title="Reset ke Master Baseline Resmi 32 Bahan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============ TAB 1: KARTU STOK & INVENTARIS ============ */}
        {activeMainTab === 'inventory' && (
          <div className="space-y-4">
            {/* Toolbar Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama bahan, kode SKU, lokasi penyimpanan, atau suplier..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium transition-colors"
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

                {/* Status & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="ALL">Semua Status Buffer</option>
                    <option value="critical">Kritis (&lt; 1 Hari)</option>
                    <option value="warning">Menipis (1 - 2.5 Hari)</option>
                    <option value="safe">Stok Aman (&gt; 2.5 Hari)</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'name' | 'daysLeft' | 'currentStock' | 'valuation'
                      )
                    }
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="daysLeft">Urut: Hari Ketahanan</option>
                    <option value="currentStock">Urut: Jumlah Stok</option>
                    <option value="valuation">Urut: Valuasi Aset</option>
                    <option value="name">Urut: Nama Bahan</option>
                  </select>

                  {/* Toggle Direction */}
                  <button
                    type="button"
                    onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={`Urutan: ${sortDirection.toUpperCase()}`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>

                  {/* Export CSV */}
                  <button
                    type="button"
                    onClick={handleDownloadStockCSV}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Export Katalog Stok ke CSV"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kategori ({stockItems.length})
                </button>
                {(['Gudang Kering', 'Chiller & Freezer', 'Sayur & Buah', 'Bumbu & Rempah', 'Kemasan & Sanitasi'] as StockCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {getCategoryIcon(cat)}
                      <span>{cat}</span>
                      <span className="text-[10px] opacity-70">({summary.categoryCounts[cat] || 0})</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Inventory Table (Desktop) / Cards (Mobile) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Bahan Baku & SKU</th>
                      <th className="py-3 px-3">Kategori & Lokasi</th>
                      <th className="py-3 px-3 text-right">Stok Aktual</th>
                      <th className="py-3 px-3 text-right">Pakai / Hari</th>
                      <th className="py-3 px-3 text-center">Ketahanan Buffer</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Harga & Valuasi</th>
                      <th className="py-3 px-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400">
                          <Boxes className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          Tidak ada bahan baku yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const status = calculateStockStatus(item);
                        const daysLeft = getDaysLeft(item);
                        const pctOfMin = item.minStockAlert > 0 ? Math.min(100, Math.round((item.currentStock / item.minStockAlert) * 100)) : 100;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Nama & SKU */}
                            <td className="py-3.5 px-4">
                              <div className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                                  {item.sku}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                  {item.supplierName}
                                </span>
                              </div>
                            </td>

                            {/* Kategori & Lokasi */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">{item.storageLocation}</div>
                            </td>

                            {/* Stok Aktual */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="font-mono font-black text-sm text-slate-900">
                                {formatStockQty(item.currentStock, item.uom)}
                              </div>
                              <div className="text-[10px] text-slate-400">Min: {item.minStockAlert} {item.uom}</div>
                            </td>

                            {/* Pakai per hari */}
                            <td className="py-3.5 px-3 text-right font-mono">
                              <div className="font-bold text-slate-700">{item.dailyUsageAvg} {item.uom}</div>
                              <div className="text-[9px] text-slate-400">/ 1.553 porsi</div>
                            </td>

                            {/* Ketahanan Buffer Progress */}
                            <td className="py-3.5 px-3">
                              <div className="w-24 mx-auto space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="font-bold text-slate-700">{daysLeft} Hari</span>
                                  <span className="text-slate-400">{pctOfMin}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      status === 'critical'
                                        ? 'bg-rose-500'
                                        : status === 'warning'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(10, (daysLeft / 5) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-3 text-center">{getStatusBadge(status, daysLeft)}</td>

                            {/* Harga & Valuasi */}
                            <td className="py-3.5 px-3 text-right font-mono">
                              <div className="font-bold text-emerald-700">
                                {formatRupiah(item.currentStock * item.unitPrice)}
                              </div>
                              <div className="text-[10px] text-slate-400">@{formatRupiah(item.unitPrice)}/{item.uom}</div>
                            </td>

                            {/* Action Buttons */}
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
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                  title="- Catat Pakai Masak"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenOpname(item)}
                                  className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                                  title="Stok Opname Timbangan"
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetail(item)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Detail & Kartu Stok"
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
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{stockItems.length}</strong> bahan baku terdaftar
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  Data tersimpan aman di penyimpanan lokal peramban (LocalStorage v1).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 2: RIWAYAT MUTASI STOK ============ */}
        {activeMainTab === 'movements' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Buku Register Mutasi Stok (Ledger)</h3>
                <p className="text-xs text-slate-500">
                  Catatan audit trail seluruh pergerakan barang masuk dari suplier dan barang keluar ke dapur masak.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMovementsCSV}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileDown className="w-4 h-4 text-blue-600" />
                  <span>Download Riwayat CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Waktu & Ref</th>
                      <th className="py-3 px-3">Jenis</th>
                      <th className="py-3 px-4">Nama Bahan</th>
                      <th className="py-3 px-3 text-right">Mutasi Qty</th>
                      <th className="py-3 px-3 text-right">Sisa Stok</th>
                      <th className="py-3 px-4">Petugas & Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada catatan mutasi stok.
                        </td>
                      </tr>
                    ) : (
                      movements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <div className="font-bold text-slate-800">{m.date}</div>
                            <div className="text-slate-400 text-[10px]">{m.time} WIB • {m.reference}</div>
                          </td>
                          <td className="py-3 px-3">
                            {m.type === 'IN' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                + MASUK
                              </span>
                            )}
                            {m.type === 'OUT' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                                - KELUAR
                              </span>
                            )}
                            {m.type === 'ADJUST' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                ± OPNAME
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">{m.itemName}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            <span className={m.type === 'IN' ? 'text-emerald-700' : m.type === 'OUT' ? 'text-blue-700' : 'text-amber-700'}>
                              {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}
                              {m.qty} {m.uom}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 font-bold">
                            {m.balanceAfter} {m.uom}
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            <div className="font-bold text-slate-700">{m.loggedBy}</div>
                            <div className="text-slate-500 text-[10px]">{m.notes || '-'}</div>
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

        {/* ============ TAB 3: KALKULATOR KEBUTUHAN MASAK (KITCHEN BOM) ============ */}
        {activeMainTab === 'bom' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  Kalkulator Simulasi Kebutuhan Bahan (BOM 1.553 Porsi)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tabel di bawah menghitung estimasi kebutuhan gramasi bersih bahan pokok harian untuk pagu 1.553 porsi makanan (700 porsi besar @100g nasi + 853 porsi kecil @80g nasi) dibandingkan dengan stok aktual di gudang saat ini.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Karbohidrat (Beras) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Karbohidrat (Beras)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">124 kg / hari</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Besar (700 siswa):</span>
                    <strong className="font-mono">70 kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Kecil (853 siswa):</span>
                    <strong className="font-mono">54 kg</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Kebutuhan:</span>
                    <span className="font-mono text-blue-700">124 kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Stok Saat Ini:</span>
                    <span className="font-mono text-emerald-700">
                      {stockItems.find((i) => i.id === 'bhk-001')?.currentStock || 0} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 2: Protein Hewani (Ayam) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    Protein Hewani (Ayam)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">115 kg / hari</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Besar (@80g bersih):</span>
                    <strong className="font-mono">56 kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Kecil (@60g bersih):</span>
                    <strong className="font-mono">51.2 kg</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Karkas (+Yield):</span>
                    <span className="font-mono text-blue-700">115 kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Stok Saat Ini:</span>
                    <span className="font-mono text-emerald-700">
                      {stockItems.find((i) => i.id === 'chl-001')?.currentStock || 0} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 3: Sayuran (Wortel & Buncis) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Sayur Mayur Segar
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">68 kg / hari</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wortel (@25g/anak):</span>
                    <strong className="font-mono">38 kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buncis (@20g/anak):</span>
                    <strong className="font-mono">30 kg</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Kebutuhan Sayur:</span>
                    <span className="font-mono text-blue-700">68 kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Stok Wortel Gudang:</span>
                    <span className="font-mono text-emerald-700">
                      {stockItems.find((i) => i.id === 'say-001')?.currentStock || 0} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============ MODAL 1: RESTOCK / PENERIMAAN BAHAN (GRN) ============ */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Catat Bahan Masuk (Goods Receipt)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRestock} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Bahan Baku</label>
                <select
                  value={formRestockItemId}
                  onChange={(e) => {
                    setFormRestockItemId(e.target.value);
                    const item = stockItems.find((i) => i.id === e.target.value);
                    if (item) setFormRestockVendor(item.supplierName);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} ({item.currentStock} {item.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jumlah Masuk (Qty)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formRestockQty}
                    onChange={(e) => setFormRestockQty(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan (UoM)</label>
                  <input
                    type="text"
                    disabled
                    value={stockItems.find((i) => i.id === formRestockItemId)?.uom || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Suplier / Petani / Vendor</label>
                <input
                  type="text"
                  value={formRestockVendor}
                  onChange={(e) => setFormRestockVendor(e.target.value)}
                  placeholder="Nama vendor suplier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Faktur / Surat Jalan</label>
                <input
                  type="text"
                  value={formRestockInvoice}
                  onChange={(e) => setFormRestockInvoice(e.target.value)}
                  placeholder="PO-20261101-01..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hasil Uji Verifikasi Fisik & QC</label>
                <textarea
                  rows={2}
                  value={formRestockNotes}
                  onChange={(e) => setFormRestockNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Potong Stok Pemakaian Masak Dapur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUsage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bahan yang Digunakan</label>
                <select
                  value={formUsageItemId}
                  onChange={(e) => {
                    setFormUsageItemId(e.target.value);
                    const item = stockItems.find((i) => i.id === e.target.value);
                    if (item && item.dailyUsageAvg > 0) setFormUsageQty(item.dailyUsageAvg);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan</label>
                  <input
                    type="text"
                    disabled
                    value={stockItems.find((i) => i.id === formUsageItemId)?.uom || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alokasi Menu Sajian</label>
                <input
                  type="text"
                  value={formUsageMenu}
                  onChange={(e) => setFormUsageMenu(e.target.value)}
                  placeholder="Cth: Nasi Putih Chicken Katsu & Sup Sayur 1.553 Porsi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Seksi Pengolahan</label>
                <textarea
                  rows={2}
                  value={formUsageNotes}
                  onChange={(e) => setFormUsageNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Eksekusi Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL 3: STOK OPNAME FISIK ============ */}
      {showOpnameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">Penyesuaian Stok Opname Fisik</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOpnameModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOpname} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Bahan Baku</label>
                <select
                  value={formOpnameItemId}
                  onChange={(e) => {
                    setFormOpnameItemId(e.target.value);
                    const item = stockItems.find((i) => i.id === e.target.value);
                    if (item) setFormOpnamePhysicalQty(item.currentStock);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {stockItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name} (Sistem: {item.currentStock} {item.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Stok di Sistem</span>
                  <strong className="text-base font-mono text-slate-800">
                    {stockItems.find((i) => i.id === formOpnameItemId)?.currentStock || 0}{' '}
                    {stockItems.find((i) => i.id === formOpnameItemId)?.uom}
                  </strong>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok Fisik Aktual</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formOpnamePhysicalQty}
                    onChange={(e) => setFormOpnamePhysicalQty(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Penyesuaian / Selisih</label>
                <input
                  type="text"
                  value={formOpnameReason}
                  onChange={(e) => setFormOpnameReason(e.target.value)}
                  placeholder="Cth: Hasil penimbangan fisik akhir bulan / penyusutan air..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Terapkan Hasil Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL 4: DETAIL KARTU STOK ITEM ============ */}
      {showItemDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {selectedItem.sku}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{selectedItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowItemDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Kategori</span>
                <strong className="text-slate-900">{selectedItem.category}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Lokasi Simpan</span>
                <strong className="text-slate-900">{selectedItem.storageLocation}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Stok Fisik Tersedia</span>
                <strong className="text-emerald-700 text-sm font-mono font-black">
                  {selectedItem.currentStock} {selectedItem.uom}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Pemakaian Rata-rata</span>
                <strong className="text-slate-900 font-mono">
                  {selectedItem.dailyUsageAvg} {selectedItem.uom} / hari
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Harga Satuan Acuan</span>
                <strong className="text-slate-900 font-mono">{formatRupiah(selectedItem.unitPrice)}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Nilai Total Aset</span>
                <strong className="text-emerald-700 font-mono font-black">
                  {formatRupiah(selectedItem.currentStock * selectedItem.unitPrice)}
                </strong>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor / Suplier:</span>
                <strong className="text-slate-900">{selectedItem.supplierName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Restock Terakhir:</span>
                <span className="font-mono">{selectedItem.lastRestockDate}</span>
              </div>
              {selectedItem.expiryDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Kedaluwarsa:</span>
                  <span className="font-mono text-rose-600 font-bold">{selectedItem.expiryDate}</span>
                </div>
              )}
              {selectedItem.notes && (
                <div className="text-slate-500 text-[11px] pt-1">
                  <em>{selectedItem.notes}</em>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowItemDetailModal(false);
                  handleOpenRestock(selectedItem);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                + Restock Item Ini
              </button>
              <button
                type="button"
                onClick={() => setShowItemDetailModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL 5: CETAK BERITA ACARA STOK OPNAME A4 ============ */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  Pratinjau Lembar Berita Acara Rekapitulasi Stok Gudang (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dokumen A4 Print Ready */}
            <div className="bg-white text-slate-950 p-4 sm:p-8 border border-slate-300 rounded-lg space-y-5 font-serif text-xs">
              {/* Kop Resmi BGN SPPG */}
              <div className="border-b-2 border-slate-950 pb-4 flex items-center gap-4">
                <Image src="/logo.png" alt="Logo BGN" width={60} height={60} className="object-contain" priority />
                <div className="text-center flex-1">
                  <h4 className="text-xs uppercase font-bold tracking-widest text-slate-700">Badan Gizi Nasional</h4>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-950">
                    Satuan Pelayanan Pangan Bergizi (SPPG) Wonodri 3
                  </h2>
                  <p className="text-[10px] text-slate-600">
                    Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    Pagu Layanan: 1.553 Porsi / Hari • 12 Sekolah & 1 Posyandu • Kode Satpel: SPPG-SMG-003
                  </p>
                </div>
              </div>

              {/* Judul Surat */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black uppercase underline tracking-wider">
                  Berita Acara Rekapitulasi Fisik Stok Bahan Baku & Logistik
                </h3>
                <p className="text-[10px] font-mono text-slate-600">
                  Nomor: BA-SO/SPPG-SMG3/BGN/{new Date().getFullYear()}/{Date.now().toString().slice(-4)}
                </p>
                <p className="text-[11px] text-slate-700">
                  Tanggal Verifikasi: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Narasi Ringkas */}
              <p className="text-[11px] leading-relaxed text-justify">
                Pada hari ini, telah dilakukan audit fisik penghitungan stok (Stock Opname) terhadap seluruh bahan baku makanan bergizi gratis di fasilitas Central Kitchen SPPG Wonodri 3 dengan rincian ringkasan sebagai berikut:
              </p>

              {/* Tabel Ringkasan Cetak */}
              <table className="w-full text-left text-[10px] border-collapse border border-slate-400">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-400 p-1.5 text-center w-8">No</th>
                    <th className="border border-slate-400 p-1.5">SKU / Kode</th>
                    <th className="border border-slate-400 p-1.5">Nama Bahan Makanan</th>
                    <th className="border border-slate-400 p-1.5">Kategori / Lokasi</th>
                    <th className="border border-slate-400 p-1.5 text-right">Stok Fisik</th>
                    <th className="border border-slate-400 p-1.5 text-center">Status</th>
                    <th className="border border-slate-400 p-1.5 text-right">Nilai Aset (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item, idx) => {
                    const status = calculateStockStatus(item);
                    return (
                      <tr key={item.id}>
                        <td className="border border-slate-400 p-1.5 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-400 p-1.5 font-mono">{item.sku}</td>
                        <td className="border border-slate-400 p-1.5 font-bold">{item.name}</td>
                        <td className="border border-slate-400 p-1.5">{item.storageLocation}</td>
                        <td className="border border-slate-400 p-1.5 text-right font-mono font-bold">
                          {item.currentStock} {item.uom}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-center font-bold">
                          {status === 'critical' ? 'KRITIS' : status === 'warning' ? 'MENIPIS' : 'AMAN'}
                        </td>
                        <td className="border border-slate-400 p-1.5 text-right font-mono">
                          {formatRupiah(item.currentStock * item.unitPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={6} className="border border-slate-400 p-2 text-right uppercase">
                      Total Valuasi Aset Fisik Bahan Baku:
                    </td>
                    <td className="border border-slate-400 p-2 text-right font-mono text-xs">
                      {formatRupiah(summary.totalValuation)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Tanda Tangan 3 Pihak Sah */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-center text-[10px]">
                <div className="space-y-12">
                  <p>Petugas Logistik / Gudang,</p>
                  <div>
                    <p className="font-bold underline uppercase">Bambang Susanto</p>
                    <p className="text-slate-500">Staf Logistik SPPG</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p>Ahli Gizi Penanggung Jawab,</p>
                  <div>
                    <p className="font-bold underline uppercase">Sintia Mariam, A.Md.Gz</p>
                    <p className="text-slate-500">Ahli Gizi SPPG Wonodri 3</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p>Mengetahui / Mengesahkan,</p>
                  <div>
                    <p className="font-bold underline uppercase">Dicky Yusuf Mulyadi, S.M.</p>
                    <p className="text-slate-500">Kepala SPPG Wonodri 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ FOOTER ============ */}
      <footer className="bg-white border-t border-slate-200 mt-10 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-700">
            Satuan Pelayanan Pangan Bergizi (SPPG) Wonodri 3 — Kota Semarang
          </p>
          <p className="text-[11px]">
            Badan Gizi Nasional (BGN) Republik Indonesia • Pengawasan Rantai Pasok MBG 1.553 Porsi Harian
          </p>
        </div>
      </footer>
    </div>
  );
}
