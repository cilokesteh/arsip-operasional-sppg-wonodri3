'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  INITIAL_MENU_HISTORY,
  STANDARD_AKG_REFERENCE,
  DailyMenuRecord,
  getBeneficiariesForDate,
} from '@/lib/data';
import {
  Calendar as CalendarIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Search,
  Clock,
  PlusCircle,
  Lock,
  KeyRound,
  ShieldAlert,
  Users,
  LayoutDashboard,
  Utensils,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Truck,
  ChefHat,
  Building2,
  Wheat,
  Beef,
  Bean,
  Salad,
  Apple,
  Gauge,
  Package,
  Timer,
  BadgeCheck,
  Landmark,
  CalendarCheck,
  CircleCheck,
  Info,
  MapPin,
  School,
  Baby,
  ArrowRight,
  Sparkles,
  Flame,
  Download,
  Archive,
} from 'lucide-react';
import { formatTanggalIndo } from '@/lib/dateUtils';
import { fetchMenusFromCloud, saveSingleMenuToCloud } from '@/lib/cloudSync';
import staticMenusData from '@/lib/staticMenus.json';
import OfficialReport from '@/components/OfficialReport';

type WorkspaceTab = 'overview' | 'menu' | 'akg' | 'dapur' | 'distribusi' | 'dokumen';

const WORKSPACE_TABS: { id: WorkspaceTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Ringkasan Eksekutif', short: 'Ringkasan', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu & Sajian Harian', short: 'Menu', icon: Utensils },
  { id: 'akg', label: 'Analisis Kandungan Gizi', short: 'AKG', icon: Activity },
  { id: 'dapur', label: 'Dapur, HACCP & Distribusi', short: 'Dapur', icon: ChefHat },
  { id: 'distribusi', label: 'Direktori Titik Layanan', short: 'Distribusi', icon: Truck },
  { id: 'dokumen', label: 'Dokumen Resmi (Cetak)', short: 'Dokumen', icon: FileText },
];

const COMPONENT_META: { key: keyof DailyMenuRecord['components']; label: string; icon: React.ElementType; tint: string; ring: string }[] = [
  { key: 'karbohidrat', label: 'Karbohidrat', icon: Wheat, tint: 'text-amber-700', ring: 'bg-amber-50 border-amber-200' },
  { key: 'laukHewani', label: 'Lauk Hewani', icon: Beef, tint: 'text-rose-700', ring: 'bg-rose-50 border-rose-200' },
  { key: 'laukNabati', label: 'Lauk Nabati', icon: Bean, tint: 'text-emerald-700', ring: 'bg-emerald-50 border-emerald-200' },
  { key: 'sayur', label: 'Sayuran', icon: Salad, tint: 'text-green-700', ring: 'bg-lime-50 border-lime-200' },
  { key: 'buah', label: 'Buah Segar', icon: Apple, tint: 'text-violet-700', ring: 'bg-violet-50 border-violet-200' },
];

const STEP_ICONS: Record<string, React.ElementType> = {
  Persiapan: Package,
  Pengolahan: Flame,
  Pengemasan: ChefHat,
  Distribusi: Truck,
  Pencucian: Sparkles,
};

export default function PortalHome() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(
    (staticMenusData as unknown as DailyMenuRecord[]) || INITIAL_MENU_HISTORY
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    staticMenusData && staticMenusData.length > 0 ? staticMenusData[0].date : '2026-10-02'
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [searchBeneficiary, setSearchBeneficiary] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SD' | 'TK' | 'Posyandu'>('ALL');

  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const OFFICIAL_PRINT_PIN = '91206';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const qDate = params.get('date');
        if (qDate) setSelectedDate(qDate);
      } catch {}
    }

    try {
      // BACA & GABUNGKAN SEMUA SUMBER LOKAL (V1 & V2) AGAR APA YANG DISIMPAN DI ADMIN LANGSUNG TAMPIL DI PORTAL
      const V1 = 'sppg_synced_menus';
      const V2 = 'sppg_synced_menus_v2';
      const rawV1 = localStorage.getItem(V1);
      const rawV2 = localStorage.getItem(V2);
      const listV1: DailyMenuRecord[] = rawV1 ? JSON.parse(rawV1) : [];
      const listV2: DailyMenuRecord[] = rawV2 ? JSON.parse(rawV2) : [];

      const byDate = new Map<string, DailyMenuRecord>();
      (staticMenusData as unknown as DailyMenuRecord[]).forEach((s) => byDate.set(s.date, s));
      (Array.isArray(listV2) ? listV2 : []).forEach((p: DailyMenuRecord) => {
        if (p?.date) byDate.set(p.date, { ...(byDate.get(p.date) || {}), ...p });
      });
      (Array.isArray(listV1) ? listV1 : []).forEach((p: DailyMenuRecord) => {
        if (p?.date) byDate.set(p.date, { ...(byDate.get(p.date) || {}), ...p });
      });
      const combined = Array.from(byDate.values()).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      if (combined.length > 0) {
        setMenuHistory(combined);
        try {
          localStorage.setItem(V1, JSON.stringify(combined));
          localStorage.setItem(V2, JSON.stringify(combined));
        } catch {}
        if (typeof window !== 'undefined' && !window.location.search.includes('date=')) {
          setSelectedDate(combined[0].date);
        }
      }
    } catch {
      /* fallback */
    }

    fetchMenusFromCloud().then((cloudMenus) => {
      if (cloudMenus && cloudMenus.length > 0) {
        setMenuHistory((prev) => {
          /* CLOUD WINS untuk tanggal yang ADA DI CLOUD.
             Tanggal yang HANYA ada di lokal (mis. tgl baru yang tersimpan dari admin)
             TETAP DIPERTAHANKAN — jangan sampai data lokal hilang. */
          const byDate = new Map<string, DailyMenuRecord>();
          prev.forEach((localItem) => byDate.set(localItem.date, localItem));
          cloudMenus.forEach((c) => {
            const localItem = byDate.get(c.date);
            if (!localItem) {
              byDate.set(c.date, c);
            } else {
              // Cloud menang; local hanya melengkapi field yang kosong di cloud
              byDate.set(c.date, {
                ...localItem,
                ...c,
                photos: c.photos && c.photos.length > 0 ? c.photos : localItem.photos,
                menuPhotoUrl:
                  c.menuPhotoUrl && c.menuPhotoUrl.trim() !== '' ? c.menuPhotoUrl : localItem.menuPhotoUrl,
              });
            }
          });

          const merged = Array.from(byDate.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          try {
            localStorage.setItem('sppg_synced_menus', JSON.stringify(merged));
            localStorage.setItem('sppg_synced_menus_v2', JSON.stringify(merged));
          } catch {}

          // AUTO-SYNC BACK TO CLOUD:
          // Jika ada data yang tersimpan dari admin lokal (seperti tgl 26 Okt) tapi belum masuk ke cloud,
          // langsung sinkronkan ke Cloudflare KV!
          const cloudDates = new Set(cloudMenus.map((c) => c.date));
          merged.forEach((item) => {
            if (item?.date && !cloudDates.has(item.date) && item.status === 'published') {
              saveSingleMenuToCloud(item).catch(() => {});
            }
          });

          return merged;
        });
      }
    });
  }, []);

  const currentMenu = menuHistory.find((m) => m.date === selectedDate);
  const baselineBeneficiaries = getBeneficiariesForDate(selectedDate);

  const activeBeneficiaries = baselineBeneficiaries.map((site) => {
    const override = currentMenu?.overrides?.find((o) => o.siteId === site.id);
    if (override) {
      return {
        ...site,
        masterCount: override.condition === 'libur' ? 0 : override.effectiveCount,
        condition: override.condition,
        reason: override.reason,
      };
    }
    return { ...site, condition: undefined, reason: undefined };
  });

  const totalMaster = activeBeneficiaries.reduce((acc, site) => acc + site.masterCount, 0);

  const filteredBeneficiaries = activeBeneficiaries.filter((b) => {
    const matchName = b.name.toLowerCase().includes(searchBeneficiary.toLowerCase());
    const matchType = typeFilter === 'ALL' || b.type === typeFilter;
    return matchName && matchType;
  });

  const availableDatesSet = useMemo(() => new Set(menuHistory.map((m) => m.date)), [menuHistory]);

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const openCalendar = () => {
    // Sinkronkan kalender ke bulan dari tanggal yang sedang dipilih
    const d = new Date(selectedDate + 'T00:00:00');
    if (!Number.isNaN(d.getTime())) {
      setCalendarMonth(d.getMonth());
      setCalendarYear(d.getFullYear());
    }
    setShowCalendarModal(true);
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  /* ============ DERIVED METRICS ============ */
  const nutrition = currentMenu?.nutritionCards || STANDARD_AKG_REFERENCE;
  const referenceByGroup = useMemo(() => {
    const map = new Map<string, number>();
    STANDARD_AKG_REFERENCE.forEach((r) => map.set(r.groupName, r.energyKcal));
    return map;
  }, []);

  const macroSplit = (item: (typeof nutrition)[number]) => {
    const p = item.proteinG * 4;
    const f = item.fatG * 9;
    const c = item.carbsG * 4;
    const total = p + f + c || 1;
    return {
      protein: Math.round((p / total) * 100),
      fat: Math.round((f / total) * 100),
      carbs: Math.round((c / total) * 100),
    };
  };

  const maxFiber = useMemo(
    () => Math.max(...nutrition.map((n) => n.fiberG), 1),
    [nutrition]
  );

  const totalPorsiSD = activeBeneficiaries
    .filter((b) => b.type === 'SD')
    .reduce((a, b) => a + b.masterCount, 0);
  const totalPorsiTK = activeBeneficiaries
    .filter((b) => b.type === 'TK')
    .reduce((a, b) => a + b.masterCount, 0);
  const totalPorsiPosyandu = activeBeneficiaries
    .filter((b) => b.type === 'Posyandu')
    .reduce((a, b) => a + b.masterCount, 0);

  const publishedCount = menuHistory.filter((m) => m.status === 'published').length;
  const totalPhotoCoverage = menuHistory.reduce((a, m) => a + m.photos.length, 0);

  /* menuHistory terurut DESC (terbaru di index 0).
     "Sebelumnya" = tanggal lebih lama => index + 1
     "Berikutnya"   = tanggal lebih baru => index - 1 */
  const dateIndex = menuHistory.findIndex((m) => m.date === selectedDate);
  const goOlder = () => {
    const next = menuHistory[dateIndex + 1];
    if (next) setSelectedDate(next.date);
  };
  const goNewer = () => {
    const next = menuHistory[dateIndex - 1];
    if (next) setSelectedDate(next.date);
  };
  const hasOlder = dateIndex >= 0 && dateIndex < menuHistory.length - 1;
  const hasNewer = dateIndex > 0;

  /* ============ ESC untuk tutup modal (PIN & Kalender) ============ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setShowPinModal(false);
      setShowCalendarModal(false);
      setPinError('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ============ PRINT / PIN ============ */
  const handleOpenPrintModal = () => {
    const sessionAuth = sessionStorage.getItem('sppg_print_auth');
    if (sessionAuth === 'true') {
      setActiveTab('dokumen');
      setTimeout(() => window.print(), 250);
    } else {
      setInputPin('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === OFFICIAL_PRINT_PIN) {
      sessionStorage.setItem('sppg_print_auth', 'true');
      setShowPinModal(false);
      setInputPin('');
      setPinError('');
      setActiveTab('dokumen');
      setTimeout(() => window.print(), 300);
    } else {
      setPinError('PIN verifikasi salah! Khusus operator resmi.');
    }
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
              <span className="hidden md:inline text-blue-300/60">• Sinkronisasi BGN Terjaga</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============ APP SHELL HEADER ============ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm p-1 flex items-center justify-center shrink-0">
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
                  Portal Sistem Informasi Operasional MBG • Semarang Selatan
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={goOlder}
                disabled={!hasOlder}
                className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Laporan sebelumnya (tanggal lebih lama)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={openCalendar}
                className="px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Pilih tanggal laporan"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="hidden sm:inline">{formatTanggalIndo(selectedDate)}</span>
                <span className="sm:hidden">{selectedDate.slice(8)}/{selectedDate.slice(5, 7)}</span>
              </button>

              <button
                onClick={goNewer}
                disabled={!hasNewer}
                className="hidden sm:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                title="Laporan berikutnya (tanggal lebih baru)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenPrintModal}
                title="Cetak Dokumen Resmi (Wajib PIN)"
                className="px-2.5 sm:px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold text-white bg-[#0b1f3a] hover:bg-[#14315c] flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Lock className="w-3 h-3 text-blue-300 shrink-0" />
                <span className="hidden sm:inline">Cetak Resmi</span>
                <Printer className="w-3.5 h-3.5 sm:hidden" />
              </button>

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
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
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

      {/* ============ MAIN ============ */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 space-y-4 sm:space-y-5">
        {/* ---------- PAGE HEAD ---------- */}
        <div className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                Dashboard Operasional SPPG
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Real-time
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Ringkasan -{formatTanggalIndo(selectedDate)} • Laporan #
              {currentMenu?.menuNumber || '-'} • Status:{' '}
              <span className={currentMenu?.status === 'published' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {currentMenu?.status === 'published' ? 'Diterbitkan' : currentMenu ? 'Draf' : 'Belum Ada'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200">
              <FileText className="w-3 h-3 text-slate-400" /> {publishedCount} laporan terbit
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200">
              <BadgeCheck className="w-3 h-3 text-slate-400" /> {totalPhotoCoverage} foto terverifikasi
            </span>
          </div>
        </div>

        {/* ---------- EXECUTIVE KPI STRIP ---------- */}
        <section className="no-print grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              label: 'Total Alokasi Porsi',
              value: totalMaster.toLocaleString('id-ID'),
              unit: 'porsi/hari',
              sub: `${activeBeneficiaries.length} titik layanan aktif`,
              icon: Package,
              accent: 'from-blue-600 to-blue-700',
              iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
            },
            {
              label: 'Titik Distribusi',
              value: String(activeBeneficiaries.length),
              unit: 'lembaga',
              sub: `${totalPorsiSD} SD • ${totalPorsiTK} TK • ${totalPorsiPosyandu} Posyandu`,
              icon: Truck,
              accent: 'from-emerald-600 to-emerald-700',
              iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            {
              label: 'Dokumentasi Dapur',
              value: String(currentMenu?.photos.length || 0),
              unit: 'tahap terfoto',
              sub: currentMenu ? `Tercatat ${formatTanggalIndo(currentMenu.date)}` : 'Belum ada data',
              icon: ChefHat,
              accent: 'from-amber-500 to-amber-600',
              iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
            },
            {
              label: 'Kelompok Porsi Aktif',
              value: String(nutrition.length),
              unit: 'kategori penerima',
              sub: 'Besar • Kecil • Balita • Busui • Bumil',
              icon: Users,
              accent: 'from-violet-600 to-violet-700',
              iconBg: 'bg-violet-50 text-violet-700 border-violet-200',
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4 flex items-start gap-3"
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center shrink-0 ${kpi.iconBg}`}>
                <kpi.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
                  {kpi.label}
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums leading-none">
                    {kpi.value}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">{kpi.unit}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium block mt-1 truncate">
                  {kpi.sub}
                </span>
              </div>
            </div>
          ))}
        </section>

        {/* ---------- WORKSPACE TAB NAV ---------- */}
        <div className="no-print bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {WORKSPACE_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#0b1f3a] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- WORKSPACE CONTENT ---------- */}
        {!currentMenu ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 sm:p-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-extrabold text-base text-slate-900">
                Laporan Belum Diterbitkan untuk {formatTanggalIndo(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Operator dapat mengisi rincian menu, komposisi gizi, dan foto tahapan dapur melalui panel
                operator. Laporan akan otomatis tayang di portal ini setelah diterbitkan.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Laporan di Panel Operator</span>
            </Link>
          </div>
        ) : (
          <>
            {/* ==================== TAB: RINGKASAN ==================== */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                {/* Hero Menu */}
                <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-blue-700" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Menu Sajian Hari Ini
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Menu #{currentMenu.menuNumber || 1}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                      <div className="sm:col-span-2">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                            alt={currentMenu.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/80 to-transparent">
                            <span className="text-[10px] font-bold text-white">
                              {formatTanggalIndo(currentMenu.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-3 space-y-2.5">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Nama Menu
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
                            {currentMenu.title}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {COMPONENT_META.map((c) => (
                            <div
                              key={c.key}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${c.ring}`}
                            >
                              <c.icon className={`w-3.5 h-3.5 shrink-0 ${c.tint}`} />
                              <div className="min-w-0">
                                <span className="text-[9px] font-bold uppercase text-slate-500 block leading-none">
                                  {c.label}
                                </span>
                                <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 truncate block leading-tight">
                                  {currentMenu.components[c.key]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setActiveTab('menu')}
                          className="w-full sm:w-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <span>Detail Komposisi Porsi</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Status & Timeline ringkasan */}
                <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-700" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Status Alur Operasional
                      </h2>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {currentMenu.photos.length > 0 ? (
                      <ol className="space-y-2.5">
                        {currentMenu.photos.map((p, idx) => {
                          const StepIcon = STEP_ICONS[p.step] || Package;
                          return (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                                  <StepIcon className="w-3.5 h-3.5" />
                                </div>
                                {idx < currentMenu.photos.length - 1 && (
                                  <div className="w-px flex-1 min-h-[10px] bg-emerald-200 mt-1" />
                                )}
                              </div>
                              <div className="min-w-0 pb-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-black text-slate-900 uppercase">
                                    {p.step}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="w-2.5 h-2.5 inline -mt-0.5" /> Selesai
                                  </span>
                                  {p.timeEstimate && (
                                    <span className="text-[10px] font-semibold text-slate-400 inline-flex items-center gap-0.5">
                                      <Timer className="w-3 h-3" /> {p.timeEstimate}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-600 block leading-snug">{p.title}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                        <p className="text-xs text-slate-500">
                          Dokumentasi foto tahapan dapur belum diunggah untuk tanggal ini.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Komposisi porsi ringkas */}
                <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-violet-700" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Sebaran Energi per Kelompok Porsi
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('akg')}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      Analisis Lengkap →
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {nutrition.map((item) => {
                      const split = macroSplit(item);
                      const std = referenceByGroup.get(item.groupName);
                      const delta = std ? ((item.energyKcal - std) / std) * 100 : 0;
                      return (
                        <div key={item.groupName}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-extrabold text-slate-900">
                              {item.groupName}
                              <span className="text-[10px] font-medium text-slate-400 ml-1.5">
                                {item.targetCategory}
                              </span>
                            </span>
                            <span className="text-[11px] font-black tabular-nums text-slate-900 shrink-0">
                              {item.energyKcal.toFixed(1)}
                              <span className="text-[9px] text-slate-400 font-bold ml-0.5">Kkal</span>
                              {std && (
                                <span
                                  className={`ml-1.5 text-[9px] font-bold ${
                                    delta >= 0 ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                                >
                                  {delta >= 0 ? '+' : ''}
                                  {delta.toFixed(0)}%
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex">
                            <div className="h-full bg-sky-500" style={{ width: `${split.protein}%` }} title={`Protein ${split.protein}%`} />
                            <div className="h-full bg-amber-400" style={{ width: `${split.fat}%` }} title={`Lemak ${split.fat}%`} />
                            <div className="h-full bg-emerald-500" style={{ width: `${split.carbs}%` }} title={`Karbohidrat ${split.carbs}%`} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 pt-1 text-[10px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Protein
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Lemak
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Karbohidrat
                      </span>
                    </div>
                  </div>
                </section>

                {/* Sebaran penerima */}
                <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Sebaran Penerima Manfaat
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('distribusi')}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      Direktori →
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {[
                      { label: 'Sekolah Dasar (SD)', value: totalPorsiSD, icon: School, tint: 'bg-blue-500' },
                      { label: 'Taman Kanak-kanak (TK)', value: totalPorsiTK, icon: Baby, tint: 'bg-emerald-500' },
                      { label: 'Posyandu', value: totalPorsiPosyandu, icon: Users, tint: 'bg-amber-500' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <row.icon className="w-3.5 h-3.5 text-slate-400" /> {row.label}
                          </span>
                          <span className="font-black tabular-nums text-slate-900">
                            {row.value.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                          <div
                            className={`h-full ${row.tint}`}
                            style={{ width: `${totalMaster ? (row.value / totalMaster) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Kumulatif
                      </span>
                      <span className="text-sm font-black text-blue-800 tabular-nums">
                        {totalMaster.toLocaleString('id-ID')} Porsi
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ==================== TAB: MENU ==================== */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-blue-700" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Sajian & Komposisi
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                        alt={currentMenu.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Nama Menu
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                        {currentMenu.title}
                      </h3>
                      {currentMenu.publishedAt && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CalendarCheck className="w-3 h-3" /> Dipublikasikan {currentMenu.publishedAt}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        Komposisi 5 Komponen
                      </span>
                      {COMPONENT_META.map((c, i) => (
                        <div
                          key={c.key}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                        >
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <c.icon className={`w-3.5 h-3.5 ${c.tint}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                              {i + 1}. {c.label}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 truncate block leading-tight">
                              {currentMenu.components[c.key]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Uraian Kegiatan Operasional
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                      {currentMenu.uraianPekerjaan ||
                        'Uraian kegiatan belum diisi untuk tanggal ini.'}
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Suhu Masak', value: '> 85°C', icon: Flame, tint: 'text-rose-600' },
                        { label: 'Gramasi Porsi', value: 'Sesuai AKG', icon: ScaleIcon, tint: 'text-blue-600' },
                        { label: 'Higienitas', value: 'Terjaga', icon: ShieldCheck, tint: 'text-emerald-600' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5"
                        >
                          <s.icon className={`w-4 h-4 shrink-0 ${s.tint}`} />
                          <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                              {s.label}
                            </span>
                            <span className="text-xs font-black text-slate-900">{s.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ==================== TAB: AKG ==================== */}
            {activeTab === 'akg' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] sm:text-xs text-blue-900 leading-relaxed">
                      Nilai energi di bawah dihitung dari komposisi menu hari ini berdasarkan standar
                      acuan BGN. Persentase energi menampilkan sebaran makronutrien (protein, lemak,
                      karbohidrat), sedangkan perbandingan tiap kelompok diukur terhadap standar acuan
                      untuk kelompok penerima yang sama.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {nutrition.map((item) => {
                    const split = macroSplit(item);
                    const std = referenceByGroup.get(item.groupName);
                    const delta = std ? ((item.energyKcal - std) / std) * 100 : 0;
                    const fiberPct = (item.fiberG / maxFiber) * 100;
                    return (
                      <div
                        key={item.groupName}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                      >
                        <div
                          className="px-4 py-3 border-b border-slate-200 flex items-center justify-between"
                          style={{ backgroundColor: item.bgLight }}
                        >
                          <div className="min-w-0">
                            <span
                              className="text-sm font-black block leading-tight"
                              style={{ color: item.color }}
                            >
                              Porsi {item.groupName}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600 block truncate">
                              {item.targetCategory}
                            </span>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <span className="text-base font-black text-slate-900 tabular-nums leading-none">
                              {item.energyKcal.toFixed(1)}
                            </span>
                            <span className="text-[9px] font-black text-slate-500 block">KKAL</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Energi vs standar */}
                          {std && (
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                <span className="text-slate-500">Energi vs Standar BGN</span>
                                <span className={delta >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                                  {delta >= 0 ? '+' : ''}
                                  {delta.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative">
                                <div
                                  className={`h-full ${delta >= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${Math.min(100, (item.energyKcal / std) * 100)}%` }}
                                />
                                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500/60" style={{ left: '100%' }} />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                Standar acuan: {std.toFixed(1)} Kkal
                              </span>
                            </div>
                          )}

                          {/* Makronutrien */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { l: 'Protein', v: item.proteinG, pct: split.protein, c: 'bg-sky-500' },
                              { l: 'Lemak', v: item.fatG, pct: split.fat, c: 'bg-amber-400' },
                              { l: 'Karbo', v: item.carbsG, pct: split.carbs, c: 'bg-emerald-500' },
                            ].map((m) => (
                              <div key={m.l} className="p-2 rounded-lg border border-slate-200 bg-slate-50">
                                <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                  {m.l}
                                </span>
                                <span className="text-xs font-black text-slate-900 tabular-nums">
                                  {m.v.toFixed(1)}g
                                </span>
                                <div className="h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                                  <div className={`h-full ${m.c}`} style={{ width: `${m.pct}%` }} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">{m.pct}% energi</span>
                              </div>
                            ))}
                          </div>

                          {/* Serat relatif */}
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                              <span className="text-slate-500">Serat</span>
                              <span className="text-slate-900 tabular-nums">{item.fiberG.toFixed(1)} g</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                              <div
                                className="h-full bg-violet-500"
                                style={{ width: `${Math.max(4, fiberPct)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-slate-400 font-semibold">
                              Perbandingan relatif antar kelompok
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                              Target Makronutrien (%)
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {Object.entries(item.recommendedPct).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 capitalize"
                                >
                                  {k}: {v}%
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================== TAB: DAPUR ==================== */}
            {activeTab === 'dapur' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Timeline Alur Dapur & Distribusi
                    </h2>
                  </div>
                  {currentMenu.photos.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      Dokumentasi tahapan dapur belum tersedia untuk tanggal ini.
                    </p>
                  ) : (
                    <div className="relative">
                      <div className="hidden md:block absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-300 via-blue-300 to-slate-200" />
                      <ol className="space-y-4">
                        {currentMenu.photos.map((p, idx) => {
                          const StepIcon = STEP_ICONS[p.step] || Package;
                          return (
                            <li key={idx} className="relative flex gap-4">
                              <div className="relative z-10 w-10 h-10 rounded-xl bg-white border-2 border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                                <StepIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    Tahap {idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-900 uppercase">{p.step}</span>
                                  {p.timeEstimate && (
                                    <span className="text-[10px] font-bold text-slate-500 inline-flex items-center gap-0.5">
                                      <Timer className="w-3 h-3" /> {p.timeEstimate}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                  <div className="sm:col-span-2">
                                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] w-full">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                                      {p.title}
                                    </h4>
                                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1">
                                      {p.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TAB: DISTRIBUSI ==================== */}
            {activeTab === 'distribusi' && (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-700" />
                      <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Direktori Titik Layanan ({activeBeneficiaries.length} Lokasi)
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-56">
                        <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari lembaga..."
                          value={searchBeneficiary}
                          onChange={(e) => setSearchBeneficiary(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter chips */}
                  <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 flex-wrap">
                    {(['ALL', 'SD', 'TK', 'Posyandu'] as const).map((t) => {
                      const active = typeFilter === t;
                      const label = t === 'ALL' ? 'Semua' : t;
                      const count =
                        t === 'ALL'
                          ? activeBeneficiaries.length
                          : activeBeneficiaries.filter((b) => b.type === t).length;
                      return (
                        <button
                          key={t}
                          onClick={() => setTypeFilter(t)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0b1f3a] text-white border-[#0b1f3a]'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile cards */}
                  <div className="grid grid-cols-1 gap-1.5 p-3 sm:hidden">
                    {filteredBeneficiaries.map((site, index) => {
                      const isLibur = site.masterCount === 0;
                      return (
                        <div
                          key={site.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            isLibur ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span
                              className={`font-extrabold block truncate text-xs ${
                                isLibur ? 'text-slate-500 line-through' : 'text-slate-900'
                              }`}
                            >
                              {index + 1}. {site.name}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase font-semibold">
                              Kategori {site.type} {isLibur && `• ${site.reason || 'Libur'}`}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`font-black text-xs block tabular-nums ${
                                isLibur ? 'text-amber-800' : 'text-blue-900'
                              }`}
                            >
                              {site.masterCount} Porsi
                            </span>
                            <span
                              className={`text-[9px] font-bold ${
                                isLibur ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {isLibur ? 'Libur (Off)' : 'Tersalurkan'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-4 w-10">No</th>
                          <th className="py-2.5 px-3">Nama Lembaga Sekolah / Posyandu</th>
                          <th className="py-2.5 px-3 w-28">Kategori</th>
                          <th className="py-2.5 px-3 w-20 text-center">Armada</th>
                          <th className="py-2.5 px-3 w-32 text-right">Alokasi Porsi</th>
                          <th className="py-2.5 px-3 w-28 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBeneficiaries.map((site, index) => {
                          const isLibur = site.masterCount === 0;
                          return (
                            <tr key={site.id} className={`hover:bg-slate-50 ${isLibur ? 'bg-amber-50/40' : ''}`}>
                              <td className="py-2.5 px-4 text-slate-400 font-semibold tabular-nums">
                                {index + 1}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">
                                <span className={isLibur ? 'line-through text-slate-500' : ''}>
                                  {site.name}
                                </span>
                                {isLibur && (
                                  <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                                    {site.reason || 'Libur Sekolah'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                  {site.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-400">
                                <MapPin className="w-3.5 h-3.5 inline" />
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-black tabular-nums ${
                                  isLibur ? 'text-amber-800' : 'text-slate-900'
                                }`}
                              >
                                {site.masterCount}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isLibur ? (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    Libur (0)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                                    <CircleCheck className="w-3 h-3" /> Tersalurkan
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
                        <tr>
                          <td colSpan={4} className="py-3 px-4">
                            TOTAL AKUMULASI DISTRIBUSI HARIAN
                          </td>
                          <td className="py-3 px-3 text-right text-sm font-black text-blue-900 tabular-nums">
                            {totalMaster} Porsi
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-800 font-extrabold text-[10px]">
                            100% LENGKAP
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB: DOKUMEN RESMI ==================== */}
            {activeTab === 'dokumen' && (
              <div className="space-y-3">
                <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Pratinjau Dokumen Resmi
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Format KOP operasional BGN — sama persis dengan naskah cetak resmi (Berita Acara
                        &amp; SPJ A4). Seluruh nominal dan data keuangan tetap terproteksi.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenPrintModal}
                    className="px-4 py-2.5 rounded-lg text-xs font-black text-white bg-[#0b1f3a] hover:bg-[#14315c] flex items-center gap-1.5 justify-center cursor-pointer shadow-sm shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5 text-blue-300" />
                    <span>Cetak / Simpan PDF</span>
                  </button>
                </div>

                <OfficialReport
                  menu={currentMenu}
                  beneficiaries={activeBeneficiaries}
                  totalMaster={totalMaster}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="no-print mt-4 bg-[#0b1f3a] text-blue-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Portal Transparansi Operasional • SPPG Wonodri 3 Kota Semarang
          </span>
          <span className="flex items-center gap-3">
            <span>Badan Gizi Nasional</span>
            <span className="hidden sm:inline text-blue-400/40">•</span>
            <span>Semarang Selatan</span>
          </span>
        </div>
      </footer>

      {/* ============ MODAL PIN ============ */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    Otorisasi Cetak Dokumen
                  </h3>
                  <span className="text-[10px] text-slate-500 block">Khusus Tim & Operator SPPG</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dokumen ini memuat pengesahan resmi SPPG Wonodri 3 Kota Semarang. Masukkan{' '}
              <strong>Kode PIN Operator</strong> untuk mengunduh / mencetak PDF:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                  Masukkan PIN (5 Digit):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Ketik PIN resmi..."
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Buka Cetak</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL KALENDER ============ */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-sm text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="p-1 rounded hover:bg-slate-100 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasMenu = availableDatesSet.has(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowCalendarModal(false);
                    }}
                    className={`h-8 rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : hasMenu
                        ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 font-black border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1 text-[10px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> Ada laporan
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-900" /> Dipilih
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Ikon substitute untuk skala (lucide tidak menyediakan Scale di versi ini) */
function ScaleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7 2 14h6L5 7Z" />
      <path d="M19 7l-3 7h6l-3-7Z" />
    </svg>
  );
}
