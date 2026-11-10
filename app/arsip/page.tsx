'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  Search,
  Utensils,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  KeyRound,
  X,
} from 'lucide-react';
import { TopNav, BottomTabs, SiteFooter } from '@/components/SiteNav';
import { PageHeader, Stat, StatRow } from '@/components/Design';
import staticMenusData from '@/lib/staticMenus.json';
import { fetchMenusFromCloud } from '@/lib/cloudSync';
import { DailyMenuRecord } from '@/lib/data';
import {
  DEFAULT_ROSTER_40,
  loadRosterFromStorage,
  loadLedgerFromStorage,
  calculatePeriodSummary,
  saveLedgerToStorage,
  formatRupiah,
  formatIndoDate,
  AttendanceEntry,
  AttendanceStatus,
  VolunteerProfile,
} from '@/lib/attendance';
import { verifyPin, hasValidSession } from '@/lib/auth';

const ATTENDANCE_CLOUD_URL = 'https://sppg-sync-worker.cilokesteh.workers.dev/api/attendance';

function isValidPhoto(photo: unknown): photo is string {
  if (!photo || typeof photo !== 'string') return false;
  if (!photo.startsWith('data:image/')) return false;
  return photo.length >= 2048;
}

interface CloudAttendanceRecord {
  volunteerId: string;
  time?: string;
  checkInTime?: string;
  checkOutTime?: string;
  photoUrl?: string;
  checkInPhoto?: string;
  distanceMeters?: number;
  isWithinRadius?: boolean;
  status?: AttendanceStatus;
  notes?: string;
  paid?: boolean;
  earnedAmount?: number;
}

/**
 * Gabungkan catatan presensi cloud satu tanggal ke ledger — logika yang
 * sama persis dengan sinkronisasi cloud di modul Absensi (UnifiedPortal),
 * supaya angka Arsip dan Absensi selalu identik untuk tanggal yang sama.
 */
function mergeCloudAttendanceDay(
  ledger: AttendanceEntry[],
  date: string,
  records: CloudAttendanceRecord[],
  rosterMap: Map<string, VolunteerProfile>
): AttendanceEntry[] {
  const others = ledger.filter((e) => e.date !== date);
  const dayMap = new Map<string, AttendanceEntry>(
    ledger.filter((e) => e.date === date).map((e) => [e.volunteerId, e])
  );

  records.forEach((cloud) => {
    const person = rosterMap.get(cloud.volunteerId);
    if (!person) return;
    const existing = dayMap.get(cloud.volunteerId);
    const cloudStatus = (cloud.status as AttendanceStatus) || 'Hadir';
    const isPresent = cloudStatus === 'Hadir' && person.isActive;
    const isAslap = cloud.volunteerId === 'v-1';
    const base: AttendanceEntry =
      existing ||
      ({
        id: `${date}:${cloud.volunteerId}`,
        volunteerId: cloud.volunteerId,
        date,
        status: cloudStatus,
        checkIn: isAslap ? '00:00' : person.defaultCheckIn,
        checkOut: isAslap ? '23:59' : person.defaultCheckOut,
        scheduledIn: person.defaultCheckIn,
        scheduledOut: person.defaultCheckOut,
        lateMinutes: 0,
        overtimeMinutes: 0,
        earnedAmount: isPresent ? person.dailyRate : 0,
        notes: '',
        paid: false,
        recordedAt: new Date().toISOString(),
        recordedBy: 'Cloud SPPG',
      } as AttendanceEntry);
    const finalCheckOut =
      cloud.checkOutTime ||
      (isAslap ? '23:59' : (base.checkOut === '13:00' ? person.defaultCheckOut : base.checkOut) || person.defaultCheckOut);
    dayMap.set(cloud.volunteerId, {
      ...base,
      status: cloudStatus,
      checkIn: cloud.checkInTime || cloud.time || (isAslap ? '00:00' : base.checkIn),
      checkOut: finalCheckOut,
      earnedAmount: isPresent ? person.dailyRate : 0,
      notes:
        cloud.notes ||
        (cloud.isWithinRadius
          ? `📍 Realtime Selfie (${cloud.distanceMeters ?? 0}m)`
          : `⚠️ Luar Dapur (${cloud.distanceMeters ?? 0}m)`),
      photoUrl: isValidPhoto(cloud.checkInPhoto || cloud.photoUrl)
        ? (cloud.checkInPhoto || cloud.photoUrl)
        : base.photoUrl,
      distanceMeters: cloud.distanceMeters ?? base.distanceMeters,
      isWithinRadius: cloud.isWithinRadius ?? base.isWithinRadius,
      paid: cloud.paid ?? base.paid,
    });
  });

  return [...others, ...Array.from(dayMap.values())].sort(
    (a, b) => a.date.localeCompare(b.date) || a.volunteerId.localeCompare(b.volunteerId)
  );
}

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

  useEffect(() => {
    const loadedRoster = loadRosterFromStorage();
    const loadedLedger = loadLedgerFromStorage(loadedRoster);
    setRoster(loadedRoster);
    setLedger(loadedLedger);

    // Pulihkan status buka upah dari sesi (token diverifikasi ke server)
    hasValidSession('operator')
      .then((valid) => {
        if (valid) setIsSalaryUnlocked(true);
      })
      .catch(() => {});

    try {
      const rawV1 = localStorage.getItem('sppg_synced_menus');
      const rawV2 = localStorage.getItem('sppg_synced_menus_v2');
      const listV1 = rawV1 ? JSON.parse(rawV1) : [];
      const listV2 = rawV2 ? JSON.parse(rawV2) : [];
      const byDate = new Map<string, DailyMenuRecord>();
      (staticMenusData as unknown as DailyMenuRecord[]).forEach((s) => byDate.set(s.date, s));
      (Array.isArray(listV2) ? listV2 : []).forEach((p: DailyMenuRecord) => byDate.set(p.date, { ...(byDate.get(p.date) || {}), ...p }));
      (Array.isArray(listV1) ? listV1 : []).forEach((p: DailyMenuRecord) => byDate.set(p.date, { ...(byDate.get(p.date) || {}), ...p }));
      const combined = Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
      if (combined.length > 0) {
        setMenuList(combined);
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

  // Sinkronisasi presensi cloud — sumber data yang sama dengan modul
  // Absensi. Sebelumnya Arsip hanya membaca ledger bawaan (impor Excel,
  // berhenti 31 Okt 2026), sehingga angkanya berbeda dari Absensi yang
  // membaca cloud. Kini setiap tanggal yang ditampilkan/di cetak ditarik
  // dari cloud dan digabungkan ke ledger dengan logika yang sama.
  const cloudSyncedDatesRef = useRef<Set<string>>(new Set());
  const ledgerLoadedRef = useRef<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    ledgerLoadedRef.current = true;
    setIsDataLoaded(true);
  }, []);

  // Simpan ledger hasil gabungan cloud ke storage lokal (kunci yang sama
  // dengan modul Absensi) agar muatan berikutnya langsung konsisten.
  useEffect(() => {
    if (ledgerLoadedRef.current && ledger.length > 0) {
      saveLedgerToStorage(ledger);
    }
  }, [ledger]);

  useEffect(() => {
    if (!isDataLoaded) return;
    const datesToSync = new Set<string>([...paginatedDates, printDateTarget]);
    datesToSync.forEach((dateStr) => {
      if (!dateStr || cloudSyncedDatesRef.current.has(dateStr)) return;
      cloudSyncedDatesRef.current.add(dateStr);
      (async () => {
        try {
          const res = await fetch(`${ATTENDANCE_CLOUD_URL}?date=${dateStr}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.success && Array.isArray(data.records) && data.records.length > 0) {
            setLedger((prev) => mergeCloudAttendanceDay(prev, dateStr, data.records, rosterMap));
          }
        } catch {
          // Cloud tidak terjangkau: tetap pakai ledger bawaan apa adanya.
        }
      })();
    });
  }, [paginatedDates, printDateTarget, rosterMap, isDataLoaded]);

  // Printable entries for SPJ modal — hanya data presensi yang benar-benar
  // tercatat. Tanggal tanpa data tidak lagi diisi daftar karangan dari
  // roster; modal menampilkan pemberitahuan bahwa data belum tersedia.
  const printableEntries = useMemo(() => {
    return ledger.filter((e) => e.date === printDateTarget);
  }, [printDateTarget, ledger]);

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

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyPin(inputPin.trim(), 'operator');
    if (result.ok) {
      setIsSalaryUnlocked(true);
      setShowPinModal(false);
      setShowPrintModal(true);
      setInputPin('');
      setPinError('');
    } else if (result.reason === 'wrong') {
      setPinError('PIN verifikasi salah! Khusus pimpinan/operator resmi.');
    } else if (result.reason === 'rate_limited') {
      setPinError('Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.');
    } else {
      setPinError('Verifikasi PIN belum dikonfigurasi di server. Hubungi pengurus SPPG.');
    }
  };

  const renderSalary = (amount: number) => {
    if (!isSalaryUnlocked) {
      return <span className="font-mono text-slate-400">••••••</span>;
    }
    return <span className="font-mono font-bold text-ink">{formatRupiah(amount)}</span>;
  };

  return (
    <div className="min-h-screen bg-paper print:bg-white text-ink flex flex-col w-full overflow-x-hidden has-bottom-tabs">
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
                Dapur MBG, Semarang Selatan
              </span>
            </span>
          </Link>

          <TopNav />

          <button
            type="button"
            onClick={() => handleOpenPrintForDate(printDateTarget || allUniqueDates[0])}
            aria-label="Cetak SPJ"
            title="Cetak SPJ Presensi (Perlu PIN)"
            className="inline-flex items-center gap-2 px-3 min-h-10 rounded-lg text-sm font-semibold text-white bg-ink hover:bg-ink-soft shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cetak SPJ</span>
          </button>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex-1 space-y-5 sm:space-y-6 print:hidden">
        <PageHeader
          eyebrow="Direktori Resmi • BGN TA 2026"
          title="Arsip Operasional & Dokumen SPPG"
          subtitle="Katalog seluruh riwayat harian pelaksanaan Program Makan Bergizi Gratis (MBG), mencakup menu sajian, dokumentasi alur dapur, alokasi 13 sekolah/posyandu, dan lembar SPJ presensi relawan."
          actions={
            <StatRow>
              <Stat label="Total Arsip" value={allUniqueDates.length} unit="Hari" />
              <Stat label="Menu Tersedia" value={menuList.length} unit="Menu" />
              <Stat label="Porsi / Hari" value="1.553" />
            </StatRow>
          }
        />

        {/* Filter & Toolbar Bar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan tanggal (cth: 21 Oktober) atau nama masakan..."
                className="w-full bg-slate-50 border border-line rounded-xl pl-10 pr-4 py-2 text-sm sm:text-sm text-slate-900 focus:outline-none focus:border-gold focus:bg-white font-medium transition-colors"
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
              <div className="flex items-center gap-1.5 bg-slate-50 border border-line rounded-xl px-3 py-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-gold shrink-0" />
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
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
              <div className="flex items-center gap-1.5 bg-slate-50 border border-line rounded-xl px-3 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value as typeof selectedTypeFilter)}
                  className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Hari</option>
                  <option value="MENU">Ada Menu Sajian MBG</option>
                  <option value="WORKDAY">Hari Kerja (Senin-Jumat)</option>
                  <option value="WEEKEND">Akhir Pekan (Sabtu-Minggu)</option>
                </select>
              </div>

              {/* Per Page */}
              <div className="flex items-center gap-1 bg-slate-50 border border-line rounded-xl px-2.5 py-1.5">
                <span className="text-[13px] text-slate-500 font-medium">Tampil:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
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
          <div className="flex items-center justify-between text-sm text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
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
                className="text-ink hover:text-ink font-bold underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* ============ GRID KARTU ARSIP ============ */}
        {filteredDates.length === 0 ? (
          <div className="bg-white rounded-xl border border-line p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Tidak ada arsip yang sesuai</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Coba ganti kata kunci pencarian atau reset filter bulan untuk melihat tanggal lainnya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDates.map((dateStr) => {
              const dayRecords = ledger.filter((e) => e.date === dateStr);
              // Hanya data presensi yang benar-benar tercatat — tanggal
              // tanpa data tidak diisi ringkasan karangan dari roster.
              const summary = dayRecords.length > 0 ? calculatePeriodSummary(dayRecords) : null;
              const menu = menuByDate.get(dateStr);
              const d = new Date(`${dateStr}T12:00:00`);
              const dayOfWeek = d.getDay();
              const isSunday = dayOfWeek === 0;
              const isSaturday = dayOfWeek === 6;
              const isWeekend = isSunday || isSaturday;

              return (
                <div
                  key={dateStr}
                  className="bg-white rounded-2xl border border-line shadow-[0_1px_2px_rgb(16_34_63/0.04)] hover:border-gold hover:shadow-md transition-all flex flex-col justify-between p-4 sm:p-5 space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Card: Tanggal & Badge Hari */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isWeekend ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {formatIndoDate(dateStr).split(',')[0]}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 pt-1 group-hover:text-ink transition-colors">
                          {formatIndoDate(dateStr).split(',').slice(1).join(',').trim()}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono block">Kode: {dateStr}</span>
                      </div>

                      {menu ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-leaf-soft text-leaf border border-leaf/30 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-leaf" />
                          <span>Menu MBG</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 shrink-0">
                          Presensi Saja
                        </span>
                      )}
                    </div>

                    {/* Informasi Menu & Sajian */}
                    {menu ? (
                      <div className="bg-ink/[0.03] rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 line-clamp-1">
                          <Utensils className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="truncate">{menu.title}</span>
                        </div>
                        <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                          {menu.components?.laukHewani ? `${menu.components.laukHewani} • ` : ''}
                          {menu.components?.sayur ? `${menu.components.sayur} • ` : ''}
                          {menu.components?.buah || 'Menu lengkap BGN'}
                        </p>
                      </div>
                    ) : (
                      <p className="px-1 py-1 text-[13px] text-slate-400 italic">
                        {isSunday ? 'Hari Libur Rutin Dapur' : 'Dokumen menu belum diunggah ke sistem.'}
                      </p>
                    )}

                    {/* Ringkasan Presensi Relawan — data internal (kehadiran &
                        upah). Hanya tampil setelah sesi operator membuka kunci
                        PIN; pengunjung publik tidak perlu melihat angka
                        presensi kosong (0/…) atau beban upah bertanda ••••••. */}
                    {isSalaryUnlocked && !summary && (
                    <p className="text-[13px] text-slate-400 italic pt-1">
                      Belum ada data presensi tercatat untuk tanggal ini.
                    </p>
                    )}
                    {isSalaryUnlocked && summary && (
                    <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-xs text-slate-400 block font-medium">Relawan Hadir</span>
                        <strong className="text-sm font-mono font-bold text-leaf">
                          {summary.statusCounts.Hadir} / {roster.filter((p) => p.isActive).length} Orang
                        </strong>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                        <span className="text-xs text-slate-400 block font-medium">Beban Upah</span>
                        <strong className="text-sm font-mono font-bold text-ink block truncate">
                          {renderSalary(summary.totalEarned)}
                        </strong>
                      </div>
                    </div>
                    )}
                  </div>

                  {/* Action Buttons: 3 Aksi Cepat */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    {menu ? (
                      <Link
                        href={`/?date=${dateStr}`}
                        className="flex-1 py-1.5 px-2 bg-ink hover:bg-ink-soft text-white rounded-lg text-center text-sm font-bold transition-colors flex items-center justify-center gap-1"
                        title="Buka Laporan Menu MBG Resmi"
                      >
                        <Utensils className="w-3 h-3" />
                        <span>Menu</span>
                      </Link>
                    ) : (
                      <span className="flex-1 py-1.5 px-2 bg-slate-100 text-slate-400 rounded-lg text-center text-sm font-semibold">
                        No Menu
                      </span>
                    )}

                    <Link
                      href={`/absensi?date=${dateStr}`}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-center text-sm font-bold transition-colors flex items-center justify-center gap-1 border border-line"
                      title="Buka Presensi Relawan Tanggal Ini"
                    >
                      <Users className="w-3 h-3 text-slate-600" />
                      <span>Presensi</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenPrintForDate(dateStr)}
                      className="p-1.5 bg-slate-50 hover:bg-ink/5 text-slate-600 hover:text-ink border border-line hover:border-ink/15 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
            <div className="text-sm text-slate-500 font-medium">
              Menampilkan <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> –{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredDates.length)}</strong> dari{' '}
              <strong>{filteredDates.length}</strong> tanggal
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-ink text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-line'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="text-slate-400 text-sm px-1">
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
                className="px-3 py-1.5 rounded-lg text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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
          <div className="bg-white rounded-xl border border-line shadow-2xl max-w-xs w-full p-5 space-y-3 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">PIN Otoritas Upah</h3>
              <p className="text-[13px] text-slate-500">Masukkan PIN resmi untuk mencetak lembar SPJ & upah.</p>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-gold"
                />
                {pinError && (
                  <p className="text-[13px] font-bold text-rose-600 text-center mt-1">
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
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-ink hover:bg-ink-soft text-white text-sm font-bold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:bg-white print:z-auto print:block print:overflow-visible">
          <div className="report-sheet bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full print:max-w-none print:rounded-none print:p-0 print:my-0 print:space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-leaf" />
                <h3 className="font-bold text-base text-slate-900">
                  Pratinjau Lembar SPJ Amprah Upah Relawan (A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={printableEntries.length === 0}
                  className="px-3.5 py-1.5 bg-ink hover:bg-ink-soft text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

            {printableEntries.length === 0 ? (
              <div className="border border-dashed border-line rounded-xl p-8 text-center space-y-2">
                <p className="font-bold text-slate-900">Belum ada data presensi untuk tanggal ini</p>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Lembar SPJ hanya diterbitkan dari data presensi yang benar-benar tercatat
                  (sinkron dengan modul Absensi). Tanggal: {formatIndoDate(printDateTarget)}.
                </p>
              </div>
            ) : (
            <div className="space-y-5 print:space-y-3 text-slate-900 print:text-black">
              <div className="text-center border-b-2 border-slate-900 pb-3 print:pb-2 space-y-1 break-inside-avoid">
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

              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left text-[11px] print:text-[10px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-1.5 print:p-1 border border-slate-300 text-center w-8">NO</th>
                      <th className="p-1.5 print:p-1 border border-slate-300">NAMA LENGKAP</th>
                      <th className="p-1.5 print:p-1 border border-slate-300">DIVISI</th>
                      <th className="p-1.5 print:p-1 border border-slate-300 text-center">STATUS</th>
                      <th className="p-1.5 print:p-1 border border-slate-300 text-center">MASUK</th>
                      <th className="p-1.5 print:p-1 border border-slate-300 text-right">TARIF</th>
                      <th className="p-1.5 print:p-1 border border-slate-300 text-right">HAK UPAH</th>
                      <th className="p-1.5 print:p-1 border border-slate-300 text-center w-20">TTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printableEntries.map((entry) => {
                      const person = rosterMap.get(entry.volunteerId);
                      if (!person) return null;
                      return (
                        <tr key={entry.id} className="border-b border-slate-200 break-inside-avoid">
                          <td className="p-1.5 print:p-1 border border-slate-300 text-center font-mono font-bold">
                            {person.no}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 font-bold">
                            {person.name}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-slate-600">
                            {person.dutySection}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                entry.status === 'Hadir'
                                  ? 'bg-leaf-soft text-leaf'
                                  : entry.status === 'Izin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-center font-mono whitespace-nowrap">
                            {entry.status === 'Hadir' ? entry.checkIn : '-'}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-right font-mono whitespace-nowrap">
                            {formatRupiah(person.dailyRate)}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-right font-mono font-bold whitespace-nowrap">
                            {formatRupiah(entry.earnedAmount)}
                          </td>
                          <td className="p-1.5 print:p-1 border border-slate-300 text-center">
                            <span className="block border-b border-slate-400 h-5 mx-1" />
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold border-t border-slate-300 break-inside-avoid">
                      <td colSpan={6} className="p-2 print:p-1 border border-slate-300 text-right uppercase">
                        Total Hak Upah Relawan:
                      </td>
                      <td className="p-2 print:p-1 border border-slate-300 text-right font-mono text-xs text-ink whitespace-nowrap">
                        {formatRupiah(printableSummary.totalEarned)}
                      </td>
                      <td className="p-2 print:p-1 border border-slate-300 text-center text-[10px] text-slate-500">
                        {printableSummary.statusCounts.Hadir} Orang
                      </td>
                    </tr>
                  </tbody>

                </table>
              </div>

              {/* Tanda Tangan Pejabat */}
              <div className="grid grid-cols-2 gap-8 print:gap-4 pt-6 print:pt-3 text-center text-xs break-inside-avoid">
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
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <SiteFooter />

      <BottomTabs />
    </div>
  );
}
