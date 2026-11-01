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
  Scale,
  ChefHat,
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
  generateStockCSV,
  generateMovementsCSV,
  DEFAULT_STOCK_ITEMS_16,
  DEFAULT_STOCK_MOVEMENTS_32,
  OpnameSession,
  loadOpnameDraftFromStorage,
  saveOpnameDraftToStorage,
  clearOpnameDraftFromStorage,
  generateOpnameCSV,
} from '@/lib/stock';

export default function StockMonitoringPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(DEFAULT_STOCK_ITEMS_16);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

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

  // Modal Print Type: Masuk (01 Nov), Keluar Masak (02 Nov), atau Rekap Mutasi
  const [printReportType, setPrintReportType] = useState<'MASUK' | 'KELUAR' | 'MUTASI'>('KELUAR');

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
  const [formAddCategory, setFormAddCategory] = useState<StockCategory>('Bahan Kering');
  const [formAddUom, setFormAddUom] = useState<string>('KG');
  const [formAddLocation, setFormAddLocation] = useState<string>('Gudang Kering');
  const [formAddInitialStock, setFormAddInitialStock] = useState<number>(10);
  const [formAddMinAlert, setFormAddMinAlert] = useState<number>(5);
  const [formAddDailyUsage, setFormAddDailyUsage] = useState<number>(2);
  const [formAddSupplier, setFormAddSupplier] = useState<string>('');
  const [formAddNotes, setFormAddNotes] = useState<string>('Penerimaan tgl 01 Nov 2026');

  // Form States for Restock
  const [formRestockItemId, setFormRestockItemId] = useState<string>('bhk-01');
  const [formRestockDate, setFormRestockDate] = useState<string>('2026-11-01');
  const [formRestockQty, setFormRestockQty] = useState<number>(20);
  const [formRestockVendor, setFormRestockVendor] = useState<string>('');
  const [formRestockInvoice, setFormRestockInvoice] = useState<string>('GRN-20261101-01');
  const [formRestockNotes, setFormRestockNotes] = useState<string>('Bahan baku masuk tgl 01 Nov 2026');

  // Form States for Usage
  const [formUsageItemId, setFormUsageItemId] = useState<string>('bhk-01');
  const [formUsageQty, setFormUsageQty] = useState<number>(10);
  const [formUsageMenu, setFormUsageMenu] = useState<string>('Produksi Dapur MBG 1.553 Porsi (02 Nov 2026)');
  const [formUsageNotes, setFormUsageNotes] = useState<string>('Dikeluarkan penuh untuk pengolahan masak dapur');

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
  }, [stockItems, selectedCategory, selectedLocation, selectedStatus, searchQuery, sortBy, sortDirection]);

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
    setFormAddSupplier('');
    setFormAddNotes('Penerimaan masuk 01 Nov 2026');
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
      supplierName: formAddSupplier || 'Supplier SPPG',
      lastRestockDate: '2026-11-01',
      lastUsageDate: '2026-11-02',
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
      setFormRestockVendor(stockItems[0]?.supplierName || '');
    }
    setFormRestockDate('2026-11-01');
    setFormRestockQty(20);
    setFormRestockInvoice(`GRN-20261101-${Date.now().toString().slice(-4)}`);
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
          lastRestockDate: formRestockDate || '2026-11-01',
          supplierName: formRestockVendor || item.supplierName,
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: formRestockDate || '2026-11-01',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'IN',
      qty: qty,
      uom: target.uom,
      balanceAfter: Number((target.currentStock + qty).toFixed(2)),
      reference: formRestockInvoice || 'GRN-20261101-01',
      loggedBy: 'Nur Khafidin (Petugas Timbangan)',
      notes: formRestockNotes || 'Penerimaan bahan baku masuk tgl 01 Nov 2026',
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
          lastUsageDate: '2026-11-02',
        };
      }
      return item;
    });

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: '2026-11-02',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      itemId: target.id,
      itemName: target.name,
      type: 'OUT',
      qty: qty,
      uom: target.uom,
      balanceAfter: newBalance,
      reference: formUsageMenu || 'BOM-MSK-20261102',
      loggedBy: 'Seksi Pengolahan Dapur',
      notes: formUsageNotes || 'Pemakaian bahan masak MBG tgl 02 Nov 2026',
    };

    const updatedMovements = [newMovement, ...movements];

    setStockItems(updatedItems);
    setMovements(updatedMovements);
    saveStockToStorage(updatedItems);
    saveMovementsToStorage(updatedMovements);

    setShowUsageModal(false);
    showToast(`🍳 Pemakaian dapur dicatat: -${qty} ${target.uom} ${target.name}`);
  };

  // Reset to Baseline 16 Items (Masuk 01 Nov -> Keluar 02 Nov)
  const handleResetToBaseline = () => {
    if (window.confirm('Muat ulang 16 bahan baku masuk 01 Nov & pengeluaran masak tgl 02 Nov 2026?')) {
      setStockItems(DEFAULT_STOCK_ITEMS_16);
      setMovements(DEFAULT_STOCK_MOVEMENTS_32);
      saveStockToStorage(DEFAULT_STOCK_ITEMS_16);
      saveMovementsToStorage(DEFAULT_STOCK_MOVEMENTS_32);
      clearOpnameDraftFromStorage();
      const newOpname = loadOpnameDraftFromStorage(DEFAULT_STOCK_ITEMS_16);
      setOpnameSession(newOpname);
      showToast('📦 Data mutasi 01 Nov (Masuk) & 02 Nov (Keluar Masak) berhasil dimuat.');
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
    link.setAttribute('download', `SPPG_Wonodri3_Stok_01_02_Nov2026.csv`);
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
      default:
        return <Boxes className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: StockStatus, daysLeft: number) => {
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          SELESAI DIMASAK (02 NOV)
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
        <CheckCircle2 className="w-3 h-3 text-blue-600" />
        STANDBY GUDANG
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
              <span className="hidden md:inline text-blue-300/60">• Logistik Bahan Masuk (01 Nov) &amp; Masak (02 Nov)</span>
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
                    Monitoring Stok: Masuk 01 Nov &bull; Masak 02 Nov 2026 (1.553 Porsi)
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

        {/* Primary nav bar */}
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
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-7 flex-1 space-y-5 print:hidden">
        {/* Banner Header Halaman */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Selesai Dimasak (02 Nov 2026)
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">BGN TA 2026 — SPPG Wonodri 3 Kota Semarang</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-blue-600" />
              Monitoring Stok &amp; Kuantitas Bahan Masak
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Barang datang tgl <strong>01 Nov 2026</strong> (158.6 KG + 156 Unit) telah <strong>dikeluarkan penuh pada tgl 02 Nov 2026</strong> untuk memasak <strong>1.553 Porsi MBG</strong>.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddItem()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Bahan Baru</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenRestock()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Masuk (Supplier)</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenUsage()}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <MinusCircle className="w-4 h-4 shrink-0" />
              <span>- Pakai Masak</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600 shrink-0" />
              <span>Cetak Berita Acara</span>
            </button>
          </div>
        </div>

        {/* ============ 4 METRICS KPI CARDS (KUANTITAS FISIK MURNI) ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Item Bahan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bahan Baku</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.totalItems} Item</div>
              <span className="text-[10px] text-slate-500 font-medium">Masuk 01 &bull; Keluar 02 Nov</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Card 2: Total Muatan Masuk (01 Nov) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Masuk (01 Nov 2026)</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                {summary.totalKgMasuk} KG
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">+{summary.totalQtyNonKgMasuk} Unit Satuan Lain</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Card 3: Keluar Masak (02 Nov) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Keluar Masak (02 Nov)</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-700">
                {summary.totalKgKeluar} KG
              </div>
              <span className="text-[10px] text-indigo-600 font-medium">1.553 Porsi MBG Selesai</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          {/* Card 4: Sisa Stok Saat Ini */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sisa Stok Fisik</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {summary.currentKgSisa} KG
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Habis Terpakai Masak 100%</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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
              <span>Daftar Bahan &amp; Stok Fisik</span>
            </button>

            {/* Tab 2: Stock Opname */}
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
              <span>Stock Opname (Hitung Fisik)</span>
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
              <span>Mutasi Masuk &amp; Keluar ({movements.length})</span>
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
              title="Kosongkan seluruh data inventory"
            >
              <span>Kosongkan</span>
            </button>
            <button
              type="button"
              onClick={handleResetToBaseline}
              className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              title="Muat Ulang 16 Bahan Masuk 01 Nov & Keluar 02 Nov"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============ TAB 1: DAFTAR BAHAN & STOK FISIK ============ */}
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
                    placeholder="Cari bahan makanan, SKU, golongan, atau lokasi simpan..."
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

                {/* Status, Location & Sort Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="ALL">Semua Lokasi</option>
                    <option value="Gudang Basah">Gudang Basah ({summary.gudangBasahCount})</option>
                    <option value="Gudang Kering">Gudang Kering ({summary.gudangKeringCount})</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="critical">Selesai Dimasak</option>
                    <option value="warning">Menipis</option>
                    <option value="safe">Standby Gudang</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'daysLeft' | 'currentStock')}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
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
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Export Daftar Stok ke CSV"
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
                  ] as StockCategory[]
                ).map((cat) => (
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
                ))}
              </div>
            </div>

            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
                  <Boxes className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-bold text-slate-700 text-sm">Inventory Belum Memiliki Data Bahan Baku</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mulai tambahkan bahan baru atau muat 16 bahan masuk 01 Nov 2026.
                  </p>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenAddItem()}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Tambah Bahan Baru</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetToBaseline()}
                      className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Muat 16 Bahan Masuk 01 Nov 2026</span>
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
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-sm leading-snug">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="font-mono text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.sku}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                              {getCategoryIcon(item.category)}
                              <span>{item.category}</span>
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                item.storageLocation === 'Gudang Basah'
                                  ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {item.storageLocation}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">{getStatusBadge(status, daysLeft)}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <div className="border-r border-slate-200 pr-1">
                          <span className="text-[9px] uppercase font-bold text-emerald-700 block">Masuk (01 Nov)</span>
                          <span className="font-mono font-black text-sm text-slate-800 mt-0.5 block">
                            {item.initialStock} {item.uom}
                          </span>
                        </div>
                        <div className="border-r border-slate-200 px-1">
                          <span className="text-[9px] uppercase font-bold text-indigo-700 block">Keluar (02 Nov)</span>
                          <span className="font-mono font-black text-sm text-indigo-900 mt-0.5 block">
                            {item.usedStock} {item.uom}
                          </span>
                        </div>
                        <div className="pl-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Sisa Stok</span>
                          <span className="font-mono font-black text-sm text-slate-900 mt-0.5 block">
                            {item.currentStock} {item.uom}
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 italic bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        {item.notes}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-xs">
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
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Bahan Makanan &amp; SKU</th>
                      <th className="py-3 px-3">Lokasi / Golongan</th>
                      <th className="py-3 px-3 text-right">Masuk (01 Nov)</th>
                      <th className="py-3 px-3 text-right">Keluar (02 Nov)</th>
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
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>+ Tambah Bahan Baru</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetToBaseline()}
                              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Muat 16 Bahan Masuk 01 Nov 2026</span>
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
                              <div className="font-black text-slate-900 text-xs sm:text-sm leading-tight">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                                  {item.sku}
                                </span>
                                <span className="text-[10px] text-slate-400">Masuk: 01 Nov &bull; Masak: 02 Nov</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    item.storageLocation === 'Gudang Basah'
                                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {item.storageLocation}
                                </span>
                              </div>
                            </td>

                            {/* Masuk (01 Nov) */}
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                              +{item.initialStock}
                            </td>

                            {/* Keluar (02 Nov) */}
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700 text-sm">
                              -{item.usedStock}
                            </td>

                            {/* Sisa Stok */}
                            <td className="py-3.5 px-3 text-right font-mono font-black text-sm text-slate-900">
                              {item.currentStock}
                            </td>

                            {/* Satuan */}
                            <td className="py-3.5 px-3 text-center">
                              <span className="font-black text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                                {item.uom}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3 text-center">{getStatusBadge(status, daysLeft)}</td>

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
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Menampilkan <strong>{filteredItems.length}</strong> bahan baku terdaftar
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  Total Masuk 01 Nov: <strong>{summary.totalKgMasuk} KG</strong> &bull; Total Masak 02 Nov: <strong>{summary.totalKgKeluar} KG</strong> (1.553 Porsi MBG)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB 2: STOCK OPNAME & HITUNG FISIK ============ */}
        {activeMainTab === 'opname' && opnameSession && (
          <div className="space-y-4">
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
                    Stock Opname Timbangan Fisik Dapur (Paska Masak 02 Nov)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Petugas: <strong>{opnameSession.checkerName}</strong> &bull; Tanggal: <strong>{opnameSession.date}</strong>
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
              <div className="grid grid-cols-3 gap-3">
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

            {/* Mobile Opname Cards (md:hidden) */}
            <div className="md:hidden space-y-3">
              {filteredOpnameRows.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">Belum Ada Item pada Lembar Opname</p>
                </div>
              ) : (
                filteredOpnameRows.map((row, idx) => {
                  const diff = Number((row.physicalQty - row.systemQty).toFixed(2));
                  return (
                    <div
                      key={row.itemId}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm leading-snug">{row.name}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {row.category} &bull; {row.storageLocation}
                            </span>
                          </div>
                        </div>

                        <div>
                          {diff === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              KLOP (0 {row.uom})
                            </span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              +{diff} {row.uom}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              {diff} {row.uom}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 items-center">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Stok Sistem</span>
                          <div className="font-mono font-black text-lg text-slate-800 mt-0.5">
                            {row.systemQty} <span className="text-xs text-slate-500">{row.uom}</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-amber-800 block">
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
                              className="w-full bg-white border-2 border-amber-400 rounded-lg py-1.5 px-2 text-right font-mono font-black text-lg text-slate-900 focus:outline-none focus:border-amber-600 shadow-xs"
                            />
                            <span className="font-mono font-bold text-xs text-slate-600 shrink-0">{row.uom}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => handleOpnameNotesChange(row.itemId, e.target.value)}
                          placeholder="Catatan kondisi fisik (kemasan baik/utuh)..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  );
                })
              )}

              {/* Mobile Footer Save/Finalize Action Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                <button
                  type="button"
                  onClick={handleSaveOpnameDraft}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Draf Opname</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeOpname}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Selesaikan &amp; Terapkan Opname</span>
                </button>
              </div>
            </div>

            {/* Desktop Opname Table (hidden md:block) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black tracking-wider">
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
                            <div className="font-mono text-[10px] text-blue-700">{row.sku}</div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            <span className="font-bold block">{row.category}</span>
                            <span className="text-[10px] text-slate-400">{row.storageLocation}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
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
                              <span className="text-[10px] text-slate-500 font-mono">{row.uom}</span>
                            </div>
                          </td>

                          {/* Selisih Otomatis */}
                          <td className="py-3 px-3 text-right font-mono font-black">
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
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                KLOP
                              </span>
                            ) : diff > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                                LEBIH
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
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
                              className="w-full bg-transparent border-b border-slate-200 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-amber-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Action */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">
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
                  Daftar transaksi barang masuk tgl 01 Nov 2026 dan barang keluar masak dapur tgl 02 Nov 2026.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenRestock()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Masuk (Supplier)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUsage()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>- Pakai Masak</span>
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
                      ? `Semua Mutasi (${movements.length})`
                      : t === 'IN'
                      ? `+ Masuk 01 Nov (${movements.filter((m) => m.type === 'IN').length})`
                      : t === 'OUT'
                      ? `- Keluar Masak 02 Nov (${movements.filter((m) => m.type === 'OUT').length})`
                      : '± Opname'}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Movements Cards (md:hidden) */}
            <div className="md:hidden space-y-2.5">
              {filteredMovements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  Tidak ada catatan mutasi yang cocok.
                </div>
              ) : (
                filteredMovements.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-mono text-[10px] text-slate-500">
                        <strong>{m.date}</strong> &bull; {m.time} WIB
                      </div>
                      <div>
                        {m.type === 'IN' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            + MASUK (01 NOV)
                          </span>
                        )}
                        {m.type === 'OUT' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                            - KELUAR MASAK (02 NOV)
                          </span>
                        )}
                        {m.type === 'ADJUST' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                            ± OPNAME
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs">{m.itemName}</h4>
                      <span
                        className={`font-mono font-black text-sm ${
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
                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 font-mono">
                      <span>Ref: <strong className="text-slate-700">{m.reference}</strong></span>
                      <span>Sisa: <strong className="text-slate-800">{m.balanceAfter} {m.uom}</strong></span>
                    </div>
                    {m.notes && <p className="text-[10px] text-slate-500 italic">{m.notes}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table Movements (hidden md:block) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                            <div className="text-slate-400 text-[10px]">{m.time} WIB &bull; {m.reference}</div>
                          </td>
                          <td className="py-3 px-3">
                            {m.type === 'IN' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                + MASUK (01 NOV)
                              </span>
                            )}
                            {m.type === 'OUT' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                - KELUAR MASAK (02 NOV)
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
                  Kalkulator Kebutuhan Bahan Masak Dapur (BOM 1.553 Porsi)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kebutuhan bahan pangan untuk pengolahan menu sajian 1.553 Porsi MBG tanggal <strong>Senin, 02 November 2026</strong> telah terpenuhi 100% dari penerimaan logistik tgl 01 November 2026.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Box 1: Ikan Dorry Fillet */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    Protein Hewani (Dorry Fillet)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">65 KG Keluar Masak</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Besar (700 anak):</span>
                    <strong className="font-mono">35 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Porsi Kecil (853 anak):</span>
                    <strong className="font-mono">30 KG</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Dimasak:</span>
                    <span className="font-mono text-indigo-700">65 KG</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (02 Nov)</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Tempe */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Protein Nabati (Tempe)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">80 PAPAN Keluar Masak</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Potongan per Papan:</span>
                    <strong className="font-mono">~20 Potong</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kapasitas 80 Papan:</span>
                    <strong className="font-mono">1.600 Potong</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Target MBG Terpenuhi:</span>
                    <span className="font-mono text-indigo-700">1.553 Porsi</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (02 Nov)</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Sayur Buncis & Labu Siam */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-green-800 bg-green-50 px-2 py-0.5 rounded">
                    Sayur Mayur Segar
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">60 KG Keluar Masak</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Buncis Dimasak:</span>
                    <strong className="font-mono">30 KG</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Labu Siam Dimasak:</span>
                    <strong className="font-mono">30 KG</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                    <span>Total Sayur MBG:</span>
                    <span className="font-mono text-indigo-700">60 KG</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Status Pengolahan:</span>
                    <span className="font-mono text-emerald-700">Selesai 100% (02 Nov)</span>
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
                    placeholder="BGN-SKU-001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Bahan Kering">Bahan Kering (Gudang Kering)</option>
                    <option value="Rempah">Rempah (Gudang Kering)</option>
                    <option value="Protein Hewani">Protein Hewani (Gudang Basah)</option>
                    <option value="Protein Nabati">Protein Nabati (Gudang Kering)</option>
                    <option value="Sayur">Sayur (Gudang Basah)</option>
                    <option value="Buah">Buah (Gudang Basah)</option>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Penyimpanan</label>
                  <select
                    value={formAddLocation}
                    onChange={(e) => setFormAddLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Suplier / Petani</label>
                <input
                  type="text"
                  value={formAddSupplier}
                  onChange={(e) => setFormAddSupplier(e.target.value)}
                  placeholder="Nama supplier..."
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Catat Bahan Baku Masuk</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
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
                  placeholder="GRN-20261101-01..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Penerimaan / Hasil QC</label>
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
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
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
                <MinusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Potong Pemakaian Masak Dapur</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    if (item && item.currentStock > 0) setFormUsageQty(item.currentStock);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
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
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-500 font-mono"
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
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs cursor-pointer"
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
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Golongan</span>
                <strong className="text-slate-900">{selectedItem.category}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Lokasi Simpan</span>
                <strong className="text-slate-900">{selectedItem.storageLocation}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Masuk (01 Nov 2026)</span>
                <strong className="text-emerald-700 text-sm font-mono font-black">
                  {selectedItem.initialStock} {selectedItem.uom}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Keluar Masak (02 Nov)</span>
                <strong className="text-indigo-700 text-sm font-mono font-black">
                  {selectedItem.usedStock} {selectedItem.uom}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 col-span-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Sisa Stok Fisik Gudang</span>
                <strong className="text-slate-900 text-base font-mono font-black">
                  {selectedItem.currentStock} {selectedItem.uom}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                  ✓ Selesai dimasak untuk 1.553 Porsi MBG tgl 02 Nov 2026
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
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
                  + Restock
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

              {/* Selector Jenis Dokumen */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPrintReportType('KELUAR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printReportType === 'KELUAR'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Masak (02 Nov)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintReportType('MASUK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printReportType === 'MASUK'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Masuk (01 Nov)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintReportType('MUTASI')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printReportType === 'MUTASI'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Rekap Mutasi
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
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
              <div className="report-sheet bg-white text-slate-950 p-4 sm:p-10 border border-slate-300 rounded-xl shadow-md max-w-3xl mx-auto space-y-6 font-serif text-xs print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full">
                {/* Official KOP BGN SPPG */}
                <div className="border-b-2 border-slate-950 pb-4 text-center relative">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Image
                      src="/logo.png"
                      alt="Logo BGN"
                      width={55}
                      height={55}
                      className="object-contain shrink-0"
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
                  <div className="border-t border-slate-950 mt-3 pt-0.5" />
                </div>

                {/* Judul Dokumen Sesuai Pilihan */}
                <div className="text-center space-y-1">
                  <h3 className="text-sm sm:text-base font-black uppercase underline tracking-wider text-slate-950">
                    {printReportType === 'MASUK' && 'BERITA ACARA REKAPITULASI FISIK BAHAN BAKU MASUK'}
                    {printReportType === 'KELUAR' && 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK (BOM)'}
                    {printReportType === 'MUTASI' && 'BUKU REGISTER REKAPITULASI MUTASI BAHAN BAKU (01 - 02 NOV 2026)'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-600">
                    {printReportType === 'MASUK' && 'Nomor: BA-LOG/SPPG-SMG3/BGN/2026/1101'}
                    {printReportType === 'KELUAR' && 'Nomor: BA-BOM/SPPG-SMG3/BGN/2026/1102'}
                    {printReportType === 'MUTASI' && 'Nomor: REG-MUTASI/SPPG-SMG3/BGN/2026/11'}
                  </p>
                  <p className="text-[11px] text-slate-700 font-bold">
                    {printReportType === 'MASUK' && 'Tanggal Penerimaan: Minggu, 01 November 2026'}
                    {printReportType === 'KELUAR' && 'Tanggal Pengolahan Masak: Senin, 02 November 2026'}
                    {printReportType === 'MUTASI' && 'Periode Mutasi: 01 s/d 02 November 2026'}
                  </p>
                </div>

                {/* Narasi Resmi Sesuai Pilihan */}
                <p className="text-[11px] leading-relaxed text-justify text-slate-800">
                  {printReportType === 'MASUK' &&
                    'Pada hari ini, Minggu tanggal 01 November 2026, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku makanan bergizi gratis di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra suplier/petani dengan rincian sebagai berikut:'}
                  {printReportType === 'KELUAR' &&
                    'Pada hari ini, Senin tanggal 02 November 2026 pukul 05:00 WIB, telah dikeluarkan dan dialokasikan seluruh stok bahan baku dari gudang penyimpanan untuk proses pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 Porsi (Menu: Nasi Putih, Ikan Dorry Fillet Crispy Saus Mayo Madu, Tempe, Sayur Buncis & Labu Siam, Buah Anggur Merah) dengan rincian sebagai berikut:'}
                  {printReportType === 'MUTASI' &&
                    'Rekapitulasi mutasi siklus bahan baku makanan Program MBG 1.553 Porsi SPPG Wonodri 3 periode 01 s/d 02 November 2026, mencakup kuantitas penerimaan barang masuk dan pengeluaran masak dapur secara penuh dengan saldo akhir stok fisik sebagai berikut:'}
                </p>

                {/* Tabel Dokumen A4 */}
                <div className="overflow-x-auto rounded border border-slate-400">
                  <table className="w-full text-left text-[10px] border-collapse min-w-[500px]">
                    <thead className="bg-slate-100 font-bold">
                      <tr className="border-b border-slate-400">
                        <th className="p-1.5 border-r border-slate-400 text-center w-8">NO</th>
                        <th className="p-1.5 border-r border-slate-400">GOLONGAN</th>
                        <th className="p-1.5 border-r border-slate-400">NAMA BAHAN MAKANAN</th>
                        {printReportType === 'MUTASI' ? (
                          <>
                            <th className="p-1.5 border-r border-slate-400 text-right">MASUK (01 NOV)</th>
                            <th className="p-1.5 border-r border-slate-400 text-right">KELUAR (02 NOV)</th>
                            <th className="p-1.5 border-r border-slate-400 text-right">SISA FISIK</th>
                          </>
                        ) : (
                          <th className="p-1.5 border-r border-slate-400 text-right">
                            {printReportType === 'MASUK' ? 'JUMLAH MASUK' : 'JUMLAH MASAK'}
                          </th>
                        )}
                        <th className="p-1.5 border-r border-slate-400 text-center">SATUAN</th>
                        <th className="p-1.5 border-r border-slate-400">LOKASI SIMPAN</th>
                        <th className="p-1.5 text-center">KETERANGAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {stockItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-1.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-300 font-semibold">{item.category}</td>
                          <td className="p-1.5 border-r border-slate-300 font-bold">{item.name}</td>
                          {printReportType === 'MUTASI' ? (
                            <>
                              <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-emerald-800">
                                {item.initialStock}
                              </td>
                              <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-indigo-800">
                                {item.usedStock}
                              </td>
                              <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-slate-900">
                                {item.currentStock}
                              </td>
                            </>
                          ) : (
                            <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold text-[11px]">
                              {printReportType === 'MASUK' ? item.initialStock : item.usedStock}
                            </td>
                          )}
                          <td className="p-1.5 border-r border-slate-300 text-center font-mono font-bold">
                            {item.uom}
                          </td>
                          <td className="p-1.5 border-r border-slate-300">{item.storageLocation}</td>
                          <td className="p-1.5 text-center font-medium text-emerald-800">
                            {printReportType === 'MASUK' && 'Diterima Baik'}
                            {printReportType === 'KELUAR' && '1.553 Porsi MBG'}
                            {printReportType === 'MUTASI' && 'Selesai Dimasak'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <tr>
                        <td colSpan={3} className="p-2 border-r border-slate-400 text-right uppercase">
                          {printReportType === 'MUTASI' ? 'Total Mutasi (Kg):' : 'Total Muatan Timbangan:'}
                        </td>
                        {printReportType === 'MUTASI' ? (
                          <>
                            <td className="p-2 border-r border-slate-400 text-right font-mono text-xs text-emerald-900">
                              {summary.totalKgMasuk} KG
                            </td>
                            <td className="p-2 border-r border-slate-400 text-right font-mono text-xs text-indigo-900">
                              {summary.totalKgKeluar} KG
                            </td>
                            <td className="p-2 border-r border-slate-400 text-right font-mono text-xs text-slate-900">
                              {summary.currentKgSisa} KG
                            </td>
                          </>
                        ) : (
                          <td className="p-2 border-r border-slate-400 text-right font-mono text-xs text-blue-900">
                            {printReportType === 'MASUK' ? summary.totalKgMasuk : summary.totalKgKeluar} KG
                          </td>
                        )}
                        <td
                          colSpan={printReportType === 'MUTASI' ? 2 : 3}
                          className="p-2 text-left font-mono text-[10px] text-slate-700"
                        >
                          + {summary.totalQtyNonKgMasuk} Unit Satuan Lain (L/Pouch/Btl/Papan/Krat)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Formal 4-Signatory Block: Responsive grid (2x2 on mobile, 4 cols in print & desktop) */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 sm:gap-3 text-center text-xs">
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
      <footer className="bg-white border-t border-slate-200 mt-10 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-700">
            Satuan Pelayanan Pangan Bergizi (SPPG) Wonodri 3 — Kota Semarang
          </p>
          <p className="text-[11px]">
            Badan Gizi Nasional (BGN) Republik Indonesia &bull; Logistik Masuk 01 Nov &bull; Masak 02 Nov 2026 (1.553 Porsi)
          </p>
        </div>
      </footer>
    </div>
  );
}
