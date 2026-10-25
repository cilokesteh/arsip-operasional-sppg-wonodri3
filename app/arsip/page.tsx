'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Search,
  FileText,
  Utensils,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  LayoutDashboard,
  FileSpreadsheet,
  KeyRound,
  X,
  Archive,
} from 'lucide-react';
import staticMenusData from '@/lib/staticMenus.json';
import { fetchMenusFromCloud } from '@/lib/cloudSync';
import { DailyMenuRecord } from '@/lib/data';
import {
  DEFAULT_ROSTER_40,
  loadRosterFromStorage,
  loadLedgerFromStorage,
  calculatePeriodSummary,
  buildDailyEntries,
  formatRupiah,
  formatIndoDate,
  AttendanceEntry,
  VolunteerProfile,
} from '@/lib/attendance';

export default function ArsipPage() {
  const [roster, setRoster] = useState<VolunteerProfile[]>(DEFAULT_ROSTER_40);
  const [ledger, setLedger] = useState<AttendanceEntry[]>([]);
  const [menuList, setMenuList] = useState<DailyMenuRecord[]>(
    (staticMenusData as unknown as DailyMenuRecord[]) || []
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'MENU' | 'WORKDAY' | 'WEEKEND'>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  // Modal Cetak SPJ
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDateTarget, setPrintDateTarget] = useState<string>('2026-10-21');
  const [isSalaryUnlocked, setIsSalaryUnlocked] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const OFFICIAL_PIN = '91206';

  useEffect(() => {
    const loadedRoster = loadRosterFromStorage();
    const loadedLedger = loadLedgerFromStorage(loadedRoster);
    setRoster(loadedRoster);
    setLedger(loadedLedger);

    try {
      const unlocked = sessionStorage.getItem('sppg_salary_unlocked') === 'true';
      setIsSalaryUnlocked(unlocked);
    } catch {}

    try {
      const saved = localStorage.getItem('sppg_synced_menus_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const byDate = new Map<string, DailyMenuRecord>();
          (staticMenusData as unknown as DailyMenuRecord[]).forEach((s) => byDate.set(s.date, s));
          parsed.forEach((p: DailyMenuRecord) => byDate.set(p.date, { ...(byDate.get(p.date) || {}), ...p }));
          setMenuList(Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date)));
        }
      }
    } catch {}

    fetchMenusFromCloud().then((cloudMenus) => {
      if (cloudMenus && cloudMenus.length > 0) {
        setMenuList((prev) => {
          const byDate = new Map<string, DailyMenuRecord>();
          prev.forEach((item) => byDate.set(item.date, item));
          cloudMenus.forEach((c) => byDate.set(c.date, { ...(byDate.get(c.date) || {}), ...c }));
          return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
        });
      }
    });
  }, []);

  // Map menu by date
  const menuByDate = useMemo(() => {
    const map = new Map<string, DailyMenuRecord>();
    menuList.forEach((m) => map.set(m.date, m));
    return map;
  }, [menuList]);

  // Map all unique dates available in ledger and static menus
  const allUniqueDates = useMemo(() => {
    const dateSet = new Set<string>();
    ledger.forEach((e) => dateSet.add(e.date));
    menuList.forEach((m) => dateSet.add(m.date));
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [ledger, menuList]);

  // Extract available months for dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    allUniqueDates.forEach((d) => {
      months.add(d.slice(0, 7)); // YYYY-MM
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [allUniqueDates]);

  // Filtered dates
  const filteredDates = useMemo(() => {
    return allUniqueDates.filter((dateStr) => {
      // Month filter
      if (selectedMonthFilter !== 'ALL' && !dateStr.startsWith(selectedMonthFilter)) {
        return false;
      }

      const d = new Date(`${dateStr}T12:00:00`);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const hasMenu = menuByDate.has(dateStr);

      // Type filter
      if (selectedTypeFilter === 'MENU' && !hasMenu) return false;
      if (selectedTypeFilter === 'WORKDAY' && isWeekend) return false;
      if (selectedTypeFilter === 'WEEKEND' && !isWeekend) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const dateFormatted = formatIndoDate(dateStr).toLowerCase();
        const menuTitle = (menuByDate.get(dateStr)?.title || '').toLowerCase();
        const matchesDate = dateStr.includes(q) || dateFormatted.includes(q);
        const matchesMenu = menuTitle.includes(q);
        if (!matchesDate && !matchesMenu) return false;
      }

      return true;
    });
  }, [allUniqueDates, selectedMonthFilter, selectedTypeFilter, searchQuery, menuByDate]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMonthFilter, selectedTypeFilter, itemsPerPage]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDates.length / itemsPerPage));
  const paginatedDates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDates.slice(start, start + itemsPerPage);
  }, [filteredDates, currentPage, itemsPerPage]);

  const rosterMap = useMemo(() => {
    const map = new Map<string, VolunteerProfile>();
    roster.forEach((p) => map.set(p.id, p));
    return map;
  }, [roster]);

  // Printable entries for SPJ modal
  const printableEntries = useMemo(() => {
    const target = ledger.filter((e) => e.date === printDateTarget);
    if (target.length > 0) return target;
    return buildDailyEntries(roster, printDateTarget);
  }, [printDateTarget, ledger, roster]);

  const printableSummary = useMemo(() => calculatePeriodSummary(printableEntries), [printableEntries]);

  // PIN Actions
  const handleOpenPrintForDate = (date: string) => {
    setPrintDateTarget(date);
    if (!isSalaryUnlocked) {
      setInputPin('');
      setPinError('');
      setShowPinModal(true);
    } else {
      setShowPrintModal(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === OFFICIAL_PIN) {
      setIsSalaryUnlocked(true);
      try {
        sessionStorage.setItem('sppg_salary_unlocked', 'true');
      } catch {}
      setShowPinModal(false);
      setShowPrintModal(true);
      setInputPin('');
      setPinError('');
    } else {
      setPinError('PIN verifikasi salah! Khusus pimpinan/operator resmi.');
    }
  };

  const renderSalary = (amount: number) => {
    if (!isSalaryUnlocked) {
      return <span className="font-mono text-slate-400">••••••</span>;
    }
    return <span className="font-mono font-bold text-blue-900">{formatRupiah(amount)}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased w-full overflow-x-hidden">
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
              <span className="hidden md:inline text-blue-300/60">• Direktori Arsip Terbuka</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============ APP SHELL HEADER ============ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
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
                  Portal Arsip Dokumen & Operasional Harian MBG
                </span>
              </div>
            </div>

            {/* Quick Nav Links */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Portal Utama</span>
              </Link>
              <Link
                href="/absensi"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Absensi</span>
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

        {/* Primary nav: modul utama */}
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
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 flex items-center gap-1.5 whitespace-nowrap shadow-xs"
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

      {/* ============ MAIN CONTENT ============ */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-7 flex-1 space-y-5">
        {/* Banner Header Halaman */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
                Direktori Resmi
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">BGN TA 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Arsip Operasional & Dokumen SPPG
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Katalog seluruh riwayat harian pelaksanaan Program Makan Bergizi Gratis (MBG), mencakup menu sajian, dokumentasi alur dapur, alokasi 13 sekolah/posyandu, dan lembar SPJ presensi relawan.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Arsip</span>
              <strong className="text-lg font-black text-slate-900">{allUniqueDates.length} Hari</strong>
            </div>
            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Menu Tersedia</span>
              <strong className="text-lg font-black text-blue-900">{staticMenusData.length} Menu</strong>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Porsi / Hari</span>
              <strong className="text-lg font-black text-emerald-900">1.553</strong>
            </div>
          </div>
        </div>

        {/* Filter & Toolbar Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan tanggal (cth: 21 Oktober) atau nama masakan..."
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

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bulan Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Bulan</option>
                  {availableMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatIndoDate(`${m}-01`).split(' ').slice(1).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipe Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value as typeof selectedTypeFilter)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Hari</option>
                  <option value="MENU">Ada Menu Sajian MBG</option>
                  <option value="WORKDAY">Hari Kerja (Senin-Jumat)</option>
                  <option value="WEEKEND">Akhir Pekan (Sabtu-Minggu)</option>
                </select>
              </div>

              {/* Per Page */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Tampil:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Active Filters Feedback */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
            <span>
              Menemukan <strong>{filteredDates.length}</strong> tanggal operasional (Halaman {currentPage} dari {totalPages})
            </span>
            {(searchQuery || selectedMonthFilter !== 'ALL' || selectedTypeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMonthFilter('ALL');
                  setSelectedTypeFilter('ALL');
                }}
                className="text-blue-700 hover:text-blue-800 font-bold underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* ============ GRID KARTU ARSIP ============ */}
        {filteredDates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Tidak ada arsip yang sesuai</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba ganti kata kunci pencarian atau reset filter bulan untuk melihat tanggal lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDates.map((dateStr) => {
              const dayRecords = ledger.filter((e) => e.date === dateStr);
              const summary = calculatePeriodSummary(dayRecords.length > 0 ? dayRecords : buildDailyEntries(roster, dateStr));
              const menu = menuByDate.get(dateStr);
              const d = new Date(`${dateStr}T12:00:00`);
              const dayOfWeek = d.getDay();
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;
              const isWeekend = isSunday || isSaturday;

              return (
                <div
                  key={dateStr}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-4 sm:p-5 space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Card: Tanggal & Badge Hari */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isWeekend ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {formatIndoDate(dateStr).split(',')[0]}
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 pt-1 group-hover:text-blue-700 transition-colors">
                          {formatIndoDate(dateStr).split(',').slice(1).join(',').trim()}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono block">Kode: {dateStr}</span>
                      </div>

                      {menu ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Menu MBG</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 shrink-0">
                          Presensi Saja
                        </span>
                      )}
                    </div>

                    {/* Informasi Menu & Sajian */}
                    {menu ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 line-clamp-1">
                          <Utensils className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{menu.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {menu.components?.laukHewani ? `${menu.components.laukHewani} • ` : ''}
                          {menu.components?.sayur ? `${menu.components.sayur} • ` : ''}
                          {menu.components?.buah || 'Menu lengkap BGN'}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-xl p-3 text-[11px] text-slate-400 italic">
                        {isSunday ? 'Hari Libur Rutin Dapur' : 'Dokumen Menu Belum Diunggah ke Sistem'}
                      </div>
                    )}

                    {/* Ringkasan Presensi Relawan */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block font-medium">Relawan Hadir</span>
                        <strong className="text-xs font-mono font-bold text-emerald-700">
                          {summary.statusCounts.Hadir} / {roster.filter((p) => p.isActive).length} Orang
                        </strong>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-[10px] text-slate-400 block font-medium">Beban Upah</span>
                        <strong className="text-xs font-mono font-bold text-blue-900 block truncate">
                          {renderSalary(summary.totalEarned)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: 3 Aksi Cepat */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {menu ? (
                      <Link
                        href={`/?date=${dateStr}`}
                        className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                        title="Buka Laporan Menu MBG Resmi"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>Menu</span>
                      </Link>
                    ) : (
                      <span className="flex-1 py-1.5 px-2 bg-slate-100 text-slate-400 rounded-lg text-center text-xs font-semibold">
                        No Menu
                      </span>
                    )}

                    <Link
                      href={`/absensi?date=${dateStr}`}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-center text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-slate-200"
                      title="Buka Presensi Relawan Tanggal Ini"
                    >
                      <Users className="w-3 h-3 text-slate-600" />
                      <span>Presensi</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenPrintForDate(dateStr)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                      title="Pratinjau & Cetak Lembar SPJ A4"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============ PAGINASI KONTROL ============ */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> –{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredDates.length)}</strong> dari{' '}
              <strong>{filteredDates.length}</strong> tanggal
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Tampilkan jika dekat dengan current page atau ujung
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="text-slate-400 text-xs px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ============ MODAL PIN OTORITAS ============ */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xs w-full p-5 space-y-3 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">PIN Otoritas Upah</h3>
              <p className="text-[11px] text-slate-500">Masukkan PIN resmi untuk mencetak lembar SPJ & upah.</p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {pinError && (
                  <p className="text-[11px] font-bold text-rose-600 text-center mt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                >
                  Buka
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL PRINT SPJ A4 ============ */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Pratinjau Lembar SPJ Amprah Upah Relawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 text-slate-900 print:text-black">
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <h2 className="text-base font-black uppercase tracking-wider">
                  SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3
                </h2>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-700">
                  BERITA ACARA & REKAPITULASI AMPRAH UPAH RELAWAN DAPUR
                </h3>
                <p className="text-[11px] text-slate-500">
                  Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang
                </p>
                <div className="text-xs font-mono font-bold text-slate-800 pt-0.5">
                  Tanggal: {formatIndoDate(printDateTarget)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1.5 border border-slate-300 text-center w-8">NO</th>
                      <th className="p-1.5 border border-slate-300">NAMA LENGKAP</th>
                      <th className="p-1.5 border border-slate-300">DIVISI</th>
                      <th className="p-1.5 border border-slate-300 text-center">STATUS</th>
                      <th className="p-1.5 border border-slate-300 text-center">MASUK</th>
                      <th className="p-1.5 border border-slate-300 text-right">TARIF</th>
                      <th className="p-1.5 border border-slate-300 text-right">HAK UPAH</th>
                      <th className="p-1.5 border border-slate-300 text-center w-20">TTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableEntries.map((entry) => {
                      const person = rosterMap.get(entry.volunteerId);
                      if (!person) return null;
                      return (
                        <tr key={entry.id} className="border-b border-slate-200">
                          <td className="p-1.5 border border-slate-300 text-center font-mono font-bold">
                            {person.no}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-bold">
                            {person.name}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-slate-600">
                            {person.dutySection}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                entry.status === 'Hadir'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : entry.status === 'Izin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center font-mono">
                            {entry.status === 'Hadir' ? entry.checkIn : '-'}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono">
                            {formatRupiah(person.dailyRate)}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-right font-mono font-bold">
                            {formatRupiah(entry.earnedAmount)}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center font-mono text-[9px] text-slate-300">
                            ( .................... )
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t border-slate-300">
                      <td colSpan={6} className="p-2 border border-slate-300 text-right uppercase">
                        Total Hak Upah Relawan:
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-xs text-blue-900">
                        {formatRupiah(printableSummary.totalEarned)}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-[10px] text-slate-500">
                        {printableSummary.statusCounts.Hadir} Orang
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Tanda Tangan Pejabat */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div>
                  <span className="text-slate-500 block">Mengetahui / Memeriksa:</span>
                  <strong className="block pt-1 pb-16">Ahli Gizi SPPG Wonodri 3</strong>
                  <span className="font-bold underline">Sintia Mariam, A.Md.Gz</span>
                  <span className="text-[10px] text-slate-400 block">NIP. 19960412 202601 2 008</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Penanggung Jawab Operasional:</span>
                  <strong className="block pt-1 pb-16">Asisten Lapangan SPPG</strong>
                  <span className="font-bold underline">Arief Rahman Hakim</span>
                  <span className="text-[10px] text-slate-400 block">NIP. 19910411 202601 1 004</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-slate-400 border-t border-slate-200 bg-white no-print">
        Direktori Arsip Operasional Resmi • SPPG Wonodri 3 Kota Semarang
      </footer>
    </div>
  );
}
