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
  Save,
  Check,
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
  OpnameSession,
  loadOpnameDraftFromStorage,
  saveOpnameDraftToStorage,
  clearOpnameDraftFromStorage,
  generateOpnameCSV,
} from '@/lib/stock';

export default function StockMonitoringPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Active Main Workflow Tab
  const [activeMainTab, setActiveMainTab] = useState<'inventory' | 'opname' | 'movements' | 'bom'>('inventory');

  // Filters & Search for Inventory Tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'daysLeft' | 'currentStock' | 'valuation'>('daysLeft');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter for Movements Tab
  const [movementFilterType, setMovementFilterType] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUST'>('ALL');
  const [movementSearch, setMovementSearch] = useState<string>('');

  // Stock Opname Session & Draft State (Fitur Unggulan StokKita)
  const [opnameSession, setOpnameSession] = useState<OpnameSession | null>(null);
  const [opnameSearch, setOpnameSearch] = useState<string>('');
  const [isOpnameDirty, setIsOpnameDirty] = useState<boolean>(false);

  // Interactive Modals
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form State for Tambah Master Bahan Baru
  const [formAddSku, setFormAddSku] = useState<string>('');
  const [formAddName, setFormAddName] = useState<string>('');
  const [formAddCategory, setFormAddCategory] = useState<StockCategory>('Gudang Kering');
  const [formAddUom, setFormAddUom] = useState<string>('kg');
  const [formAddLocation, setFormAddLocation] = useState<string>('Gudang Kering');
  const [formAddInitialStock, setFormAddInitialStock] = useState<number>(0);
  const [formAddMinAlert, setFormAddMinAlert] = useState<number>(10);
  const [formAddDailyUsage, setFormAddDailyUsage] = useState<number>(5);
  const [formAddUnitPrice, setFormAddUnitPrice] = useState<number>(15000);
  const [formAddSupplier, setFormAddSupplier] = useState<string>('');
  const [formAddNotes, setFormAddNotes] = useState<string>('');

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

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Initial Data from LocalStorage on mount
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

  // Kalkulasi total masuk & keluar periode ini
  const totalMasukRp = useMemo(() => {
    return movements
      .filter((m) => m.type === 'IN')
      .reduce((sum, m) => {
        const item = stockItems.find((i) => i.id === m.itemId);
        return sum + m.qty * (item?.unitPrice || 0);
      }, 0);
  }, [movements, stockItems]);

  const totalMutasiKeluar = useMemo(() => {
    return movements.filter((m) => m.type === 'OUT').length;
  }, [movements]);

  // Filtered & Sorted Stock Items for Inventory Tab
  const filteredItems = useMemo(() => {
    return stockItems
      .filter((item) => {
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
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
        } else if (sortBy === 'valuation') {
          valA = a.currentStock * a.unitPrice;
          valB = b.currentStock * b.unitPrice;
        }

        return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [stockItems, selectedCategory, selectedStatus, searchQuery, sortBy, sortDirection]);

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
    if (!opnameSession) return { totalRows: 0, itemsDiff: 0, totalDiffNominal: 0, matchPct: 100 };

    let itemsDiff = 0;
    let totalDiffNominal = 0;

    opnameSession.rows.forEach((r) => {
      const diff = Number((r.physicalQty - r.systemQty).toFixed(2));
      if (diff !== 0) {
        itemsDiff++;
        totalDiffNominal += diff * r.unitPrice;
      }
    });

    const totalRows = opnameSession.rows.length;
    const matchPct = totalRows > 0 ? Number((((totalRows - itemsDiff) / totalRows) * 100).toFixed(1)) : 100;

    return { totalRows, itemsDiff, totalDiffNominal, matchPct };
  }, [opnameSession]);

  // Filtered Opname Rows
  const filteredOpnameRows = useMemo(() => {
    if (!opnameSession) return [];
    if (!opnameSearch.trim()) return opnameSession.rows;
    const q = opnameSearch.toLowerCase();
    return opnameSession.rows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q) || r.storageLocation.toLowerCase().includes(q)
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

  // Simpan Draf Opname (Bisa lanjut kapan saja!)
  const handleSaveOpnameDraft = () => {
    if (!opnameSession) return;
    saveOpnameDraftToStorage(opnameSession);
    setIsOpnameDirty(false);
    showToast('💾 Draf Stock Opname berhasil disimpan ke penyimpanan lokal.');
  };

  // Finalisasi & Terapkan Opname Fisik ke Saldo Stok Sistem
  const handleFinalizeOpname = () => {
    if (!opnameSession) return;

    if (
      !window.confirm(
        `Apakah Anda yakin ingin menyelesaikan Stock Opname? Saldo stok ${opnameStats.itemsDiff} item yang berselisih akan otomatis disesuaikan ke stok fisik aktual.`
      )
    ) {
      return;
    }

    // 1. Update stok sistem sesuai stok fisik aktual
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

    // 2. Buat log mutasi untuk item yang berselisih
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

    // 3. Simpan perubahan ke storage
    setStockItems(updatedStockItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedStockItems);
    saveMovementsToStorage(updatedMovements);

    // Tandai opname selesai dan update draft
    const completedSession: OpnameSession = {
      ...opnameSession,
      status: 'completed',
      savedAt: new Date().toISOString(),
    };
    setOpnameSession(completedSession);
    saveOpnameDraftToStorage(completedSession);
    setIsOpnameDirty(false);

    showToast(
      `✅ Stock Opname Selesai! Saldo ${opnameStats.itemsDiff} item berhasil disesuaikan dengan akurasi ${opnameStats.matchPct}%.`
    );
  };

  // Reset Draf Opname ke Saldo Sistem Saat Ini
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
        unitPrice: item.unitPrice,
        notes: 'Kondisi kemasan & fisik baik',
      }));

      const resetSession: OpnameSession = {
        id: `OPN-${new Date().toISOString().slice(0, 10)}`,
        date: new Date().toISOString().slice(0, 10),
        title: 'Audit Fisik Berkala Stok Gudang SPPG Wonodri 3',
        checkerName: 'Bambang Susanto (Staf Logistik)',
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
    setFormAddCategory('Gudang Kering');
    setFormAddUom('kg');
    setFormAddLocation('Gudang Kering Rak A');
    setFormAddInitialStock(0);
    setFormAddMinAlert(10);
    setFormAddDailyUsage(5);
    setFormAddUnitPrice(15000);
    setFormAddSupplier('');
    setFormAddNotes('');
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
      name: formAddName.trim(),
      category: formAddCategory,
      uom: formAddUom,
      storageLocation: formAddLocation || 'Gudang Utama',
      currentStock: Number(formAddInitialStock) || 0,
      minStockAlert: Number(formAddMinAlert) || 0,
      dailyUsageAvg: Number(formAddDailyUsage) || 0,
      unitPrice: Number(formAddUnitPrice) || 0,
      supplierName: formAddSupplier || '-',
      lastRestockDate: new Date().toISOString().slice(0, 10),
      notes: formAddNotes || undefined,
    };

    const updated = [newItem, ...stockItems];
    setStockItems(updated);
    saveStockToStorage(updated);

    // Update opname session rows
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
        unitPrice: newItem.unitPrice,
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
      alert('Inventory masih kosong! Silakan klik "+ Tambah Bahan Baku" terlebih dahulu.');
      return;
    }
    if (item) {
      setFormRestockItemId(item.id);
      setFormRestockVendor(item.supplierName);
    } else {
      setFormRestockItemId(stockItems[0]?.id || '');
      setFormRestockVendor(stockItems[0]?.supplierName || '');
    }
    setFormRestockQty(50);
    setFormRestockInvoice(`INV-${Date.now().toString().slice(-6)}`);
    setShowRestockModal(true);
  };

  const handleOpenUsage = (item?: StockItem) => {
    if (stockItems.length === 0) {
      alert('Inventory masih kosong! Silakan tambahkan bahan terlebih dahulu.');
      return;
    }
    if (item) {
      setFormUsageItemId(item.id);
      setFormUsageQty(item.dailyUsageAvg > 0 ? item.dailyUsageAvg : 10);
    } else {
      setFormUsageItemId(stockItems[0]?.id || '');
      setFormUsageQty(stockItems[0]?.dailyUsageAvg || 20);
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

  // Submit Restock (Penerimaan Bahan Supplier)
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

  // Reset to Baseline 32 Items
  const handleResetToBaseline = () => {
    if (window.confirm('Muat 32 data master baseline bahan baku rekomendasi SPPG Wonodri 3?')) {
      setStockItems(DEFAULT_STOCK_ITEMS_32);
      saveStockToStorage(DEFAULT_STOCK_ITEMS_32);
      clearOpnameDraftFromStorage();
      const newOpname = loadOpnameDraftFromStorage(DEFAULT_STOCK_ITEMS_32);
      setOpnameSession(newOpname);
      showToast('📦 32 Bahan master baseline berhasil dimuat.');
    }
  };

  // Kosongkan Total Seluruh Inventory
  const handleClearAllInventory = () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin MENGOSONGKAN seluruh data inventaris & stok? Semua data lokal akan dibersihkan agar Anda bisa menginput data murni dari awal.'
      )
    ) {
      setStockItems([]);
      setMovements([]);
      saveStockToStorage([]);
      saveMovementsToStorage([]);
      clearOpnameDraftFromStorage();
      const emptyOpname = loadOpnameDraftFromStorage([]);
      setOpnameSession(emptyOpname);
      showToast('🗑️ Seluruh data stok & inventaris berhasil dikosongkan total.');
    }
  };

  // Download CSVs
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

  const handleDownloadOpnameCSV = () => {
    if (!opnameSession) return;
    const csv = generateOpnameCSV(opnameSession);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SPPG_Wonodri3_Stock_Opname_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 File CSV Hasil Stock Opname berhasil diunduh.');
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
              <span className="hidden md:inline text-blue-300/60">• Manajemen Inventaris &amp; Stok Gudang</span>
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
                    Sistem Manajemen Inventaris &amp; Stok Gudang Dapur MBG
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
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 flex items-center gap-1 shadow-xs">
                <Boxes className="w-3.5 h-3.5" />
                <span>Stok Gudang</span>
              </span>
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
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-default">
                <Boxes className="w-3.5 h-3.5" />
                Monitoring Stok
              </span>
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
                <span className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white font-bold">
                  <Boxes className="w-4 h-4 text-white" />
                  <span>Monitoring Stok Gudang</span>
                </span>
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
                Sistem Inventaris Dapur Mandiri
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">BGN TA 2026 — SPPG Wonodri 3 Kota Semarang</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-blue-600" />
              Sistem Manajemen Stok &amp; Logistik Gudang
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Catat mutasi bahan masuk/keluar, jalankan stock opname timbangan fisik dengan deteksi selisih otomatis, dan cetak berita acara resmi untuk pagu <strong>1.553 Porsi / Hari</strong>.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddItem()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Bahan Baru</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenRestock()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Bahan Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenUsage()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Pakai Masak</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* ============ 4 METRICS KPI CARDS (MATCHING STOKKITA SYSTEM) ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Bahan Baku */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bahan Baku</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.totalItems} Item</div>
              <span className="text-[10px] text-slate-500 font-medium">Bahan Baku Terdaftar</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Card 2: Penerimaan Masuk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Penerimaan Masuk</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {formatRupiah(totalMasukRp)}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Nilai Masuk Dari Supplier</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Warehouse className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: Pemakaian Dapur */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pemakaian Dapur</span>
              <div className="text-xl sm:text-2xl font-black text-blue-900">
                {totalMutasiKeluar} Mutasi
              </div>
              <span className="text-[10px] text-blue-600 font-medium">1.553 Porsi MBG Harian</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
              <Utensils className="w-5 h-5 text-purple-600" />
            </div>
          </div>

          {/* Card 4: Akurasi Opname */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Akurasi Opname</span>
              <div className="text-xl sm:text-2xl font-black text-amber-700">
                {opnameStats.matchPct}%
              </div>
              <span className="text-[10px] text-amber-600 font-medium">
                {opnameStats.itemsDiff === 0 ? 'Fisik & Sistem Klop 100%' : `${opnameStats.itemsDiff} Item Selisih`}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* ============ 4 WORKFLOW TABS (SUB-NAV) ============ */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* Tab 1: Live Inventory */}
            <button
              type="button"
              onClick={() => setActiveMainTab('inventory')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
                activeMainTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Master Bahan &amp; Stok</span>
            </button>

            {/* Tab 2: Stock Opname (StokKita Feature) */}
            <button
              type="button"
              onClick={() => setActiveMainTab('opname')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
                activeMainTab === 'opname'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Stock Opname &amp; Hitung Fisik</span>
              {isOpnameDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" title="Draf Belum Disimpan" />
              )}
            </button>

            {/* Tab 3: Riwayat Mutasi */}
            <button
              type="button"
              onClick={() => setActiveMainTab('movements')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
                activeMainTab === 'movements'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Mutasi Masuk &amp; Keluar</span>
            </button>

            {/* Tab 4: BOM Kebutuhan Masak */}
            <button
              type="button"
              onClick={() => setActiveMainTab('bom')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
                activeMainTab === 'bom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Kalkulator Kebutuhan Masak</span>
              <span className="sm:hidden">Kalkulator BOM</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleClearAllInventory}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
              title="Kosongkan seluruh data inventory untuk input murni dari nol"
            >
              <span>Kosongkan Data</span>
            </button>
            <button
              type="button"
              onClick={handleResetToBaseline}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              title="Muat 32 Bahan Master Rekomendasi BGN"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============ TAB 1: MASTER BAHAN & STOK GUDANG (LIVE INVENTORY) ============ */}
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

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'name' | 'daysLeft' | 'currentStock' | 'valuation')
                    }
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="daysLeft">Urut: Hari Ketahanan</option>
                    <option value="currentStock">Urut: Jumlah Stok</option>
                    <option value="valuation">Urut: Valuasi Aset</option>
                    <option value="name">Urut: Nama Bahan</option>
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

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Bahan Baku &amp; SKU</th>
                      <th className="py-3 px-3">Kategori &amp; Lokasi</th>
                      <th className="py-3 px-3 text-right">Stok Aktual</th>
                      <th className="py-3 px-3 text-right">Pakai / Hari</th>
                      <th className="py-3 px-3 text-center">Ketahanan Buffer</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Harga &amp; Valuasi</th>
                      <th className="py-3 px-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <Boxes className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                          <p className="font-bold text-slate-700 text-sm">Inventory Belum Memiliki Data Bahan Baku</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            Mulai tambahkan bahan baku dapur Anda secara manual atau muat 32 master data baseline BGN.
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => handleOpenAddItem()}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Tambah Bahan Baku Baru</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetToBaseline()}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Muat Master Rekomendasi (32 Bahan)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const status = calculateStockStatus(item);
                        const daysLeft = getDaysLeft(item);
                        const pctOfMin =
                          item.minStockAlert > 0
                            ? Math.min(100, Math.round((item.currentStock / item.minStockAlert) * 100))
                            : 100;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
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

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">{item.storageLocation}</div>
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <div className="font-mono font-black text-sm text-slate-900">
                                {formatStockQty(item.currentStock, item.uom)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Min: {item.minStockAlert} {item.uom}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-right font-mono">
                              <div className="font-bold text-slate-700">
                                {item.dailyUsageAvg} {item.uom}
                              </div>
                              <div className="text-[9px] text-slate-400">/ 1.553 porsi</div>
                            </td>

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

                            <td className="py-3.5 px-3 text-center">{getStatusBadge(status, daysLeft)}</td>

                            <td className="py-3.5 px-3 text-right font-mono">
                              <div className="font-bold text-emerald-700">
                                {formatRupiah(item.currentStock * item.unitPrice)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                @{formatRupiah(item.unitPrice)}/{item.uom}
                              </div>
                            </td>

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
                                  onClick={() => handleOpenDetail(item)}
                                  className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                  title="Detail &amp; Kartu Stok"
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
                  Valuasi total fisik gudang: <strong>{formatRupiah(summary.totalValuation)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 2: STOCK OPNAME & HITUNG FISIK (FITUR UTAMA STOKKITA) ============ */}
        {activeMainTab === 'opname' && opnameSession && (
          <div className="space-y-4">
            {/* Opname Session Banner & Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Sesi Hitung Fisik (Opname)
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-mono text-slate-500">{opnameSession.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Stock Opname Timbangan Fisik Berkala
                  </h3>
                  <p className="text-xs text-slate-500">
                    Petugas Checker: <strong>{opnameSession.checkerName}</strong> • Tanggal: <strong>{opnameSession.date}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveOpnameDraft}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Draf Opname</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalizeOpname}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Selesaikan &amp; Terapkan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOpnameCSV}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Export Hasil Opname ke CSV"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Export CSV</span>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Item Dicek</span>
                  <strong className="text-lg font-black text-slate-900">{opnameStats.totalRows} Bahan</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Item Berselisih</span>
                  <strong className={`text-lg font-black ${opnameStats.itemsDiff > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {opnameStats.itemsDiff} Item
                  </strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Nilai Selisih Nominal</span>
                  <strong className={`text-lg font-black font-mono ${opnameStats.totalDiffNominal < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {formatRupiah(opnameStats.totalDiffNominal)}
                  </strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Tingkat Akurasi Fisik</span>
                  <strong className="text-lg font-black text-blue-700">{opnameStats.matchPct}%</strong>
                </div>
              </div>
            </div>

            {/* Opname Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={opnameSearch}
                  onChange={(e) => setOpnameSearch(e.target.value)}
                  placeholder="Cari bahan pada lembar opname..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-xs text-slate-500 shrink-0 font-medium">
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

            {/* Opname Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">No</th>
                      <th className="py-3 px-4">Bahan Baku &amp; SKU</th>
                      <th className="py-3 px-3">Lokasi Simpan</th>
                      <th className="py-3 px-3 text-right">Stok Sistem</th>
                      <th className="py-3 px-4 text-center w-36">Input Fisik Riil</th>
                      <th className="py-3 px-3 text-right">Selisih (+/-)</th>
                      <th className="py-3 px-3 text-right">Nilai Selisih</th>
                      <th className="py-3 px-4">Catatan Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOpnameRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500">
                          <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-bold text-slate-700">Belum Ada Item pada Lembar Opname</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Tambahkan master bahan baku terlebih dahulu atau muat master baseline.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddItem()}
                            className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>+ Tambah Bahan Baku Baru</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredOpnameRows.map((row, idx) => {
                      const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
                      const diffNominal = diff * row.unitPrice;

                      return (
                        <tr key={row.itemId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{row.name}</div>
                            <div className="font-mono text-[10px] text-blue-700">{row.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">{row.storageLocation}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                            {row.systemQty} {row.uom}
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
                              <span className="text-[10px] text-slate-500 font-mono">{row.uom}</span>
                            </div>
                          </td>

                          {/* Selisih Otomatis */}
                          <td className="py-3 px-3 text-right font-mono font-black">
                            {diff === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : diff > 0 ? (
                              <span className="text-emerald-600">+{diff} {row.uom}</span>
                            ) : (
                              <span className="text-rose-600">{diff} {row.uom}</span>
                            )}
                          </td>

                          {/* Nilai Selisih Nominal */}
                          <td className="py-3 px-3 text-right font-mono font-bold">
                            {diffNominal === 0 ? (
                              <span className="text-slate-400">Rp 0</span>
                            ) : diffNominal > 0 ? (
                              <span className="text-emerald-700">+{formatRupiah(diffNominal)}</span>
                            ) : (
                              <span className="text-rose-600">{formatRupiah(diffNominal)}</span>
                            )}
                          </td>

                          {/* Catatan Checker */}
                          <td className="py-2 px-4">
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleOpnameNotesChange(row.itemId, e.target.value)}
                              placeholder="Catatan fisik..."
                              className="w-full bg-transparent border-b border-slate-200 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-amber-500"
                            />
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Action */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  {isOpnameDirty ? (
                    <span className="text-amber-700 font-bold">
                      ⚠️ Jangan lupa klik &quot;Simpan Draf Opname&quot; agar angka tidak hilang saat berpindah menu.
                    </span>
                  ) : (
                    <span>Data draf aman tersimpan di penyimpanan lokal peramban.</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOpnameDraft}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    Simpan Draf
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalizeOpname}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">Buku Register Mutasi Stok (Audit Trail)</h3>
                <p className="text-xs text-slate-500">
                  Pencatatan real-time penerimaan supplier dan pemotongan bahan masak harian MBG.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenRestock()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Masuk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUsage()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>- Pakai</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMovementsCSV}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Mutasi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={movementSearch}
                  onChange={(e) => setMovementSearch(e.target.value)}
                  placeholder="Cari transaksi mutasi, no referensi, atau nama bahan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['ALL', 'IN', 'OUT', 'ADJUST'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMovementFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      movementFilterType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'ALL'
                      ? 'Semua Mutasi'
                      : t === 'IN'
                      ? '+ Masuk (Supplier)'
                      : t === 'OUT'
                      ? '- Keluar (Masak)'
                      : '± Opname'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Movements */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
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
                            <span
                              className={
                                m.type === 'IN'
                                  ? 'text-emerald-700'
                                  : m.type === 'OUT'
                                  ? 'text-blue-700'
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

        {/* ============ TAB 4: KALKULATOR RESEP & BOM MASAK (1.553 PORSI) ============ */}
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

      {/* ============ MODAL 0: TAMBAH MASTER BAHAN BAKU BARU ============ */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Tambah Master Bahan Baku Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formAddSku}
                    onChange={(e) => setFormAddSku(e.target.value)}
                    placeholder="BGN-GDK-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Penyimpanan</label>
                  <select
                    value={formAddCategory}
                    onChange={(e) => setFormAddCategory(e.target.value as StockCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Gudang Kering">Gudang Kering</option>
                    <option value="Chiller & Freezer">Chiller &amp; Freezer</option>
                    <option value="Sayur & Buah">Sayur &amp; Buah</option>
                    <option value="Bumbu & Rempah">Bumbu &amp; Rempah</option>
                    <option value="Kemasan & Sanitasi">Kemasan &amp; Sanitasi</option>
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
                  placeholder="Cth: Beras Premium Mentik Wangi / Telur Ayam Ras"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Satuan (UoM)</label>
                  <input
                    type="text"
                    required
                    value={formAddUom}
                    onChange={(e) => setFormAddUom(e.target.value)}
                    placeholder="kg, liter, butir, pack, ikat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    value={formAddLocation}
                    onChange={(e) => setFormAddLocation(e.target.value)}
                    placeholder="Rak A-01 / Chiller Ruang 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stok Awal Fisik</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formAddInitialStock}
                    onChange={(e) => setFormAddInitialStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Harga Satuan Modal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formAddUnitPrice}
                    onChange={(e) => setFormAddUnitPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Suplier / Vendor</label>
                  <input
                    type="text"
                    value={formAddSupplier}
                    onChange={(e) => setFormAddSupplier(e.target.value)}
                    placeholder="Nama petani / suplier..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={formAddNotes}
                  onChange={(e) => setFormAddNotes(e.target.value)}
                  placeholder="Kriteria QC spesifikasi bahan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Bahan Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <label className="font-bold text-slate-700 block mb-1">Hasil Uji Verifikasi Fisik &amp; QC</label>
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
                  placeholder="Cth: Nasi Putih Chicken Katsu &amp; Sup Sayur 1.553 Porsi"
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

      {/* ============ MODAL 3: DETAIL KARTU STOK ITEM ============ */}
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

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteItem(selectedItem.id, selectedItem.name)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700"
                >
                  + Restock Item Ini
                </button>
                <button
                  type="button"
                  onClick={() => setShowItemDetailModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL 4: CETAK BERITA ACARA STOK OPNAME A4 ============ */}
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
                    Pagu Layanan: 1.553 Porsi / Hari • 12 Sekolah &amp; 1 Posyandu • Kode Satpel: SPPG-SMG-003
                  </p>
                </div>
              </div>

              {/* Judul Surat */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black uppercase underline tracking-wider">
                  Berita Acara Rekapitulasi Fisik Stok Bahan Baku &amp; Logistik
                </h3>
                <p className="text-[10px] font-mono text-slate-600">
                  Nomor: BA-SO/SPPG-SMG3/BGN/{new Date().getFullYear()}/{Date.now().toString().slice(-4)}
                </p>
                <p className="text-[11px] text-slate-700">
                  Tanggal Verifikasi:{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
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
