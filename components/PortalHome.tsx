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
  CalendarCheck,
  CircleCheck,
  Info,
  MapPin,
  School,
  Baby,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import { formatTanggalIndo } from '@/lib/dateUtils';
import { toIsoDateLocal } from '@/lib/attendance';
import { fetchMenusFromCloud, saveSingleMenuToCloud } from '@/lib/cloudSync';
import staticMenusData from '@/lib/staticMenus.json';
import OfficialReport from '@/components/OfficialReport';
import { TopNav, BottomTabs, SiteFooter } from '@/components/SiteNav';

type WorkspaceTab = 'overview' | 'menu' | 'akg' | 'dapur' | 'distribusi' | 'dokumen';

const WORKSPACE_TABS: { id: WorkspaceTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Ringkasan Eksekutif', short: 'Ringkasan', icon: LayoutDashboard },
  { id: 'menu', label: 'Menu & Sajian Harian', short: 'Menu', icon: Utensils },
  { id: 'akg', label: 'Analisis Kandungan Gizi', short: 'Gizi', icon: Activity },
  { id: 'dapur', label: 'Dapur, HACCP & Distribusi', short: 'Dapur', icon: ChefHat },
  { id: 'distribusi', label: 'Direktori Titik Layanan', short: 'Layanan', icon: Truck },
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
  // Default ke HARI INI supaya laporan terbaru langsung tampil walau fetch cloud lambat/gagal
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDateLocal(new Date()));
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [searchBeneficiary, setSearchBeneficiary] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SD' | 'TK' | 'Posyandu'>('ALL');

  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Status sinkronisasi cloud: selama true dan tanggal terpilih belum punya
  // menu lokal, tampilkan status memuat — BUKAN "Belum ada laporan". Laporan
  // terbaru tersimpan di cloud, jadi menyimpulkan kosong sebelum sinkron
  // selesai membuat pengunjung mengira laporan hari ini belum terbit.
  const [isSyncingMenus, setIsSyncingMenus] = useState<boolean>(true);

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
        // Hanya ikuti tanggal terbaru kalau user TIDAK memilih tanggal spesifik via URL
        // DAN tanggal terbaru itu memang hari ini atau lebih baru dari pilihan sekarang
        if (typeof window !== 'undefined' && !window.location.search.includes('date=')) {
          const newest = combined[0].date;
          const today = toIsoDateLocal(new Date());
          setSelectedDate((cur) => (newest >= cur ? newest : cur === today ? today : newest));
        }
      }
    } catch {
      /* fallback */
    }

    // Jaring pengaman: bila cloud lambat/tidak terjangkau, jangan biarkan
    // halaman terjebak di status memuat — tampilkan data lokal apa adanya.
    const syncTimeout = setTimeout(() => setIsSyncingMenus(false), 8000);

    fetchMenusFromCloud()
      .then((cloudMenus) => {
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

          if (typeof window !== 'undefined' && !window.location.search.includes('date=')) {
            const newest = merged[0].date;
            const today = toIsoDateLocal(new Date());
            setSelectedDate((cur) => (newest >= cur ? newest : cur === today ? today : newest));
          }

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
      })
      .finally(() => {
        clearTimeout(syncTimeout);
        setIsSyncingMenus(false);
      });
  }, []);

  const currentMenu = menuHistory.find((m) => m.date === selectedDate);
  const isLoadingReport = isSyncingMenus && !currentMenu;
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


  /* menuHistory terurut DESC (terbaru di index 0). Tanggal dibandingkan sebagai
     teks ISO (YYYY-MM-DD), jadi tombol tetap bekerja walau tanggal yang dipilih
     belum punya laporan. */
  const olderMenu = menuHistory.find((m) => m.date < selectedDate);
  const newerMenu = [...menuHistory].reverse().find((m) => m.date > selectedDate);
  const goOlder = () => {
    if (olderMenu) setSelectedDate(olderMenu.date);
  };
  const goNewer = () => {
    if (newerMenu) setSelectedDate(newerMenu.date);
  };
  const hasOlder = Boolean(olderMenu);
  const hasNewer = Boolean(newerMenu);
  const latestDate = menuHistory[0]?.date;
  const statusLabel = isLoadingReport
    ? 'Memuat laporan…'
    : currentMenu?.status === 'published'
    ? 'Diterbitkan'
    : currentMenu
    ? 'Draf'
    : 'Belum ada laporan';
  const statusClass =
    currentMenu?.status === 'published'
      ? 'bg-leaf-soft text-leaf'
      : currentMenu
      ? 'bg-gold-soft text-gold-ink'
      : 'bg-slate-200 text-slate-700';
  const statusDot =
    currentMenu?.status === 'published' ? 'bg-leaf' : currentMenu ? 'bg-gold' : 'bg-slate-500';

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
    // Tidak ada laporan pada tanggal terpilih = tidak ada dokumen untuk dicetak.
    if (!currentMenu) return;
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
    <div className="min-h-screen bg-paper text-ink flex flex-col w-full overflow-x-hidden has-bottom-tabs">
      {/* ============ HEADER ============ */}
      <header className="bg-white border-b border-line sticky top-0 z-40 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label="SPPG Wonodri 3, beranda">
            <Image src="/logo.png" alt="" width={32} height={32} className="object-contain shrink-0" priority />
            <span className="min-w-0">
              <span className="block font-heading font-bold text-[15px] leading-tight truncate">
                SPPG Wonodri 3
              </span>
              <span className="block text-xs text-slate-600 leading-tight truncate">
                Dapur MBG, Semarang Selatan
              </span>
            </span>
          </Link>

          <TopNav />

          <button
            type="button"
            onClick={handleOpenPrintModal}
            disabled={!currentMenu}
            aria-label="Cetak resmi"
            title={
              currentMenu
                ? 'Cetak dokumen resmi (perlu PIN operator)'
                : 'Belum ada laporan pada tanggal ini untuk dicetak'
            }
            className="inline-flex items-center gap-2 px-3 min-h-10 rounded-lg text-sm font-semibold text-white bg-ink hover:bg-ink-soft shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cetak resmi</span>
          </button>
        </div>
      </header>

      {/* ============ MAIN ============ */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex-1 space-y-5 sm:space-y-6">
        {/* ---------- JUDUL + PEMILIH TANGGAL ---------- */}
        <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-600">
              Laporan harian{currentMenu ? ` nomor ${currentMenu.menuNumber || 1}` : ''}
            </p>
            <h1 className="font-heading text-2xl sm:text-4xl font-bold leading-tight mt-0.5">
              {formatTanggalIndo(selectedDate)}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
              {statusLabel}
            </span>
          </div>

          <div className="flex items-stretch gap-2" role="group" aria-label="Pilih tanggal laporan">
            <button
              type="button"
              onClick={goOlder}
              disabled={!hasOlder}
              aria-label="Laporan sebelumnya"
              title="Laporan sebelumnya"
              className="w-11 min-h-11 inline-flex items-center justify-center rounded-lg border border-line bg-white text-slate-700 hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={openCalendar}
              className="flex-1 sm:flex-none px-4 min-h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white text-sm font-semibold hover:bg-ink/5 cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-gold" aria-hidden="true" />
              Pilih tanggal
            </button>
            <button
              type="button"
              onClick={goNewer}
              disabled={!hasNewer}
              aria-label="Laporan berikutnya"
              title="Laporan berikutnya"
              className="w-11 min-h-11 inline-flex items-center justify-center rounded-lg border border-line bg-white text-slate-700 hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ---------- RINGKASAN ANGKA ---------- */}
        {/* Hanya tampil bila tanggal terpilih memang punya laporan. Angka ini
            berasal dari data master penerima manfaat, jadi menampilkannya di
            hari tanpa laporan akan terbaca sebagai data hari itu. */}
        {currentMenu && (
        <dl className="no-print panel grid grid-cols-3 divide-x divide-line">
          {[
            {
              label: 'Porsi hari ini',
              value: totalMaster.toLocaleString('id-ID'),
              unit: 'porsi',
              detail: 'Seluruh titik layanan aktif',
            },
            {
              label: 'Titik layanan',
              value: String(activeBeneficiaries.length),
              unit: 'lokasi',
              detail: `${totalPorsiSD} porsi SD, ${totalPorsiTK} TK, ${totalPorsiPosyandu} Posyandu`,
            },
            {
              label: 'Foto dapur',
              value: String(currentMenu?.photos.length || 0),
              unit: 'tahap',
              detail: 'Dari persiapan sampai distribusi',
            },
          ].map((stat) => (
            <div key={stat.label} className="px-3 py-3 sm:px-5 sm:py-4 min-w-0">
              <dt className="text-xs sm:text-sm text-slate-600">{stat.label}</dt>
              <dd className="mt-0.5">
                <span className="font-heading text-2xl sm:text-3xl font-bold tabular-nums">{stat.value}</span>
                <span className="ml-1.5 text-xs sm:text-sm text-slate-600">{stat.unit}</span>
                <span className="hidden sm:block text-xs text-slate-600 mt-1">{stat.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
        )}

        {/* ---------- TAB ---------- */}
        {/* Tab bagian laporan hanya bermakna bila ada laporan; tanpa laporan
            halaman cukup menampilkan satu panel kosong (empty state). */}
        {currentMenu && (
        <div className="no-print sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-paper/95 backdrop-blur border-b border-line">
          <div role="tablist" aria-label="Bagian laporan" className="flex gap-1 overflow-x-auto no-scrollbar">
            {WORKSPACE_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 min-h-11 text-sm border-b-2 -mb-px cursor-pointer transition-colors ${
                    active
                      ? 'border-gold text-ink font-semibold'
                      : 'border-transparent text-slate-600 hover:text-ink font-medium'
                  }`}
                >
                  {tab.short}
                </button>
              );
            })}
          </div>
        </div>
        )}

        {/* ---------- ISI ---------- */}
        {isLoadingReport ? (
          <div className="panel p-8 sm:p-12 text-center" role="status" aria-live="polite">
            <div
              className="w-8 h-8 border-[3px] border-line border-t-ink rounded-full animate-spin mx-auto"
              aria-hidden="true"
            />
            <h2 className="font-heading text-lg font-bold mt-3">
              Memuat laporan {formatTanggalIndo(selectedDate)}…
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Sedang memeriksa data terbaru. Status kosong baru ditampilkan setelah
              pemeriksaan selesai.
            </p>
          </div>
        ) : !currentMenu ? (
          <div className="panel p-8 sm:p-12 text-center">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="font-heading text-lg font-bold mt-3">
              Belum ada laporan untuk {formatTanggalIndo(selectedDate)}
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
              Laporan tampil di sini setelah operator menerbitkannya. Anda bisa melihat laporan terbaru
              atau memilih tanggal lain.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              {latestDate && latestDate !== selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(latestDate)}
                  className="px-4 min-h-11 rounded-lg text-sm font-semibold text-white bg-ink hover:bg-ink-soft cursor-pointer"
                >
                  Lihat laporan terbaru ({formatTanggalIndo(latestDate)})
                </button>
              )}
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 px-4 min-h-11 rounded-lg text-sm font-semibold border border-line bg-white hover:bg-ink/5"
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" />
                Input laporan (operator)
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ==================== TAB: RINGKASAN ==================== */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                {/* Menu hari ini, disajikan seperti isi ompreng */}
                <section className="lg:col-span-12 panel overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-5">
                    <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto md:min-h-72 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                        alt={currentMenu.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:col-span-3 p-4 sm:p-6 flex flex-col">
                      <p className="text-sm text-slate-600">Menu hari ini</p>
                      <h2 className="font-heading text-xl sm:text-2xl font-bold leading-snug mt-1">
                        {currentMenu.title}
                      </h2>
                      <ul className="mt-4 grid grid-cols-6 gap-2 p-2 rounded-xl bg-tray" aria-label="Isi ompreng">
                        {COMPONENT_META.map((c, i) => (
                          <li
                            key={c.key}
                            className={`${i < 2 ? 'col-span-3' : 'col-span-2'} bg-white rounded-lg p-2.5 min-w-0`}
                          >
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${c.tint}`}>
                              <c.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              {c.label}
                            </span>
                            <span className="block text-sm font-semibold leading-snug mt-1 break-words">
                              {currentMenu.components[c.key]}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setActiveTab('menu')}
                        className="mt-3 self-start inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-ink underline underline-offset-4 decoration-gold decoration-2 cursor-pointer"
                      >
                        Lihat uraian kegiatan
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Komposisi porsi ringkas */}
                <section className="lg:col-span-7 bg-white rounded-xl border border-line">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-line bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-violet-700" />
                      <h2 className="text-base font-semibold text-slate-900">
                        Sebaran Energi per Kelompok Porsi
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('akg')}
                      className="text-xs font-bold text-ink hover:text-ink cursor-pointer"
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
                            <span className="text-[13px] font-semibold text-slate-900">
                              {item.groupName}
                              <span className="text-xs font-medium text-slate-400 ml-1.5">
                                {item.targetCategory}
                              </span>
                            </span>
                            <span className="text-[13px] font-bold tabular-nums text-slate-900 shrink-0">
                              {item.energyKcal.toFixed(1)}
                              <span className="text-[11px] text-slate-400 font-bold ml-0.5">Kkal</span>
                              {std && (
                                <span
                                  className={`ml-1.5 text-[11px] font-bold ${
                                    delta >= 0 ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                                >
                                  {delta >= 0 ? '+' : ''}
                                  {delta.toFixed(0)}%
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 border border-line flex">
                            <div className="h-full bg-sky-500" style={{ width: `${split.protein}%` }} title={`Protein ${split.protein}%`} />
                            <div className="h-full bg-amber-400" style={{ width: `${split.fat}%` }} title={`Lemak ${split.fat}%`} />
                            <div className="h-full bg-emerald-500" style={{ width: `${split.carbs}%` }} title={`Karbohidrat ${split.carbs}%`} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 pt-1 text-xs font-semibold text-slate-500">
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
                <section className="lg:col-span-5 bg-white rounded-xl border border-line">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-line bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-ink" />
                      <h2 className="text-base font-semibold text-slate-900">
                        Sebaran Penerima Manfaat
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('distribusi')}
                      className="text-xs font-bold text-ink hover:text-ink cursor-pointer"
                    >
                      Direktori →
                    </button>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {[
                      { label: 'Sekolah Dasar (SD)', value: totalPorsiSD, icon: School, tint: 'bg-ink/50' },
                      { label: 'Taman Kanak-kanak (TK)', value: totalPorsiTK, icon: Baby, tint: 'bg-emerald-500' },
                      { label: 'Posyandu', value: totalPorsiPosyandu, icon: Users, tint: 'bg-amber-500' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-[13px] mb-1">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <row.icon className="w-3.5 h-3.5 text-slate-400" /> {row.label}
                          </span>
                          <span className="font-bold tabular-nums text-slate-900">
                            {row.value.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 border border-line overflow-hidden">
                          <div
                            className={`h-full ${row.tint}`}
                            style={{ width: `${totalMaster ? (row.value / totalMaster) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        Total Kumulatif
                      </span>
                      <span className="text-sm font-bold text-ink tabular-nums">
                        {totalMaster.toLocaleString('id-ID')} Porsi
                      </span>
                    </div>
                  </div>
                </section>
                {/* Status & Timeline ringkasan */}
                <section className="lg:col-span-12 bg-white rounded-xl border border-line">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-line bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-700" />
                      <h2 className="text-base font-semibold text-slate-900">
                        Status Alur Operasional
                      </h2>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    {currentMenu.photos.length > 0 ? (
                      <ol className="grid gap-x-10 gap-y-3 md:grid-cols-2">
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
                                  <span className="text-[13px] font-bold text-slate-900 ">
                                    {p.step}
                                  </span>
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="w-2.5 h-2.5 inline -mt-0.5" /> Selesai
                                  </span>
                                  {p.timeEstimate && (
                                    <span className="text-xs font-semibold text-slate-400 inline-flex items-center gap-0.5">
                                      <Timer className="w-3 h-3" /> {p.timeEstimate}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[13px] text-slate-600 block leading-snug">{p.title}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                        <p className="text-sm text-slate-500">
                          Dokumentasi foto tahapan dapur belum diunggah untuk tanggal ini.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            )}

            {/* ==================== TAB: MENU ==================== */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                <section className="lg:col-span-5 bg-white rounded-xl border border-line overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 border-b border-line bg-slate-50 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-ink" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Sajian & Komposisi
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-line bg-slate-100 aspect-[16/10] w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                        alt={currentMenu.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block">
                        Nama Menu
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                        {currentMenu.title}
                      </h3>
                      {currentMenu.publishedAt && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <CalendarCheck className="w-3 h-3" /> Dipublikasikan {currentMenu.publishedAt}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-400 block">
                        Komposisi 5 Komponen
                      </span>
                      {COMPONENT_META.map((c, i) => (
                        <div
                          key={c.key}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-line bg-slate-50"
                        >
                          <div className="w-7 h-7 rounded-lg bg-white border border-line flex items-center justify-center shrink-0">
                            <c.icon className={`w-3.5 h-3.5 ${c.tint}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-slate-400 block leading-none">
                              {i + 1}. {c.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 truncate block leading-tight">
                              {currentMenu.components[c.key]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="lg:col-span-7 bg-white rounded-xl border border-line">
                  <div className="px-4 sm:px-5 py-3 border-b border-line bg-slate-50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Uraian Kegiatan Operasional
                    </h2>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="p-4 rounded-xl bg-slate-50 border border-line text-[13px] sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                      {currentMenu.uraianPekerjaan ||
                        'Uraian kegiatan belum diisi untuk tanggal ini.'}
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: 'Suhu Masak', value: '> 85°C', icon: Flame, tint: 'text-rose-600' },
                        { label: 'Gramasi Porsi', value: 'Sesuai AKG', icon: ScaleIcon, tint: 'text-gold' },
                        { label: 'Higienitas', value: 'Terjaga', icon: ShieldCheck, tint: 'text-emerald-600' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="p-3 rounded-xl border border-line bg-white flex items-center gap-2.5"
                        >
                          <s.icon className={`w-4 h-4 shrink-0 ${s.tint}`} />
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-slate-400 block leading-none">
                              {s.label}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{s.value}</span>
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
                <div className="bg-white rounded-xl border border-line p-4 sm:p-5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-ink/5 border border-ink/15">
                    <Info className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                    <p className="text-[13px] sm:text-sm text-ink leading-relaxed">
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
                        className="bg-white rounded-xl border border-line overflow-hidden"
                      >
                        <div
                          className="px-4 py-3 border-b border-line flex items-center justify-between"
                          style={{ backgroundColor: item.bgLight }}
                        >
                          <div className="min-w-0">
                            <span
                              className="text-sm font-bold block leading-tight"
                              style={{ color: item.color }}
                            >
                              Porsi {item.groupName}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 block truncate">
                              {item.targetCategory}
                            </span>
                          </div>
                          <div className="text-right shrink-0 pl-2">
                            <span className="text-base font-bold text-slate-900 tabular-nums leading-none">
                              {item.energyKcal.toFixed(1)}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 block">KKAL</span>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          {/* Energi vs standar */}
                          {std && (
                            <div>
                              <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="text-slate-500">Energi vs Standar BGN</span>
                                <span className={delta >= 0 ? 'text-emerald-600' : 'text-amber-600'}>
                                  {delta >= 0 ? '+' : ''}
                                  {delta.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 border border-line overflow-hidden relative">
                                <div
                                  className={`h-full ${delta >= 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${Math.min(100, (item.energyKcal / std) * 100)}%` }}
                                />
                                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500/60" style={{ left: '100%' }} />
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold">
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
                              <div key={m.l} className="p-2 rounded-lg border border-line bg-slate-50">
                                <span className="text-[11px] font-bold text-slate-400 block leading-none">
                                  {m.l}
                                </span>
                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                  {m.v.toFixed(1)}g
                                </span>
                                <div className="h-1.5 rounded-full bg-slate-200 mt-1 overflow-hidden">
                                  <div className={`h-full ${m.c}`} style={{ width: `${m.pct}%` }} />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">{m.pct}% energi</span>
                              </div>
                            ))}
                          </div>

                          {/* Serat relatif */}
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                              <span className="text-slate-500">Serat</span>
                              <span className="text-slate-900 tabular-nums">{item.fiberG.toFixed(1)} g</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 border border-line overflow-hidden">
                              <div
                                className="h-full bg-violet-500"
                                style={{ width: `${Math.max(4, fiberPct)}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              Perbandingan relatif antar kelompok
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-400 block">
                              Target Makronutrien (%)
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {Object.entries(item.recommendedPct).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-line capitalize"
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
                <div className="bg-white rounded-xl border border-line p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h2 className="text-base font-semibold text-slate-900">
                      Timeline Alur Dapur & Distribusi
                    </h2>
                  </div>
                  {currentMenu.photos.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      Dokumentasi tahapan dapur belum tersedia untuk tanggal ini.
                    </p>
                  ) : (
                    <div className="relative">
                      <div className="hidden md:block absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-leaf/50 via-gold/50 to-line" />
                      <ol className="space-y-4">
                        {currentMenu.photos.map((p, idx) => {
                          const StepIcon = STEP_ICONS[p.step] || Package;
                          return (
                            <li key={idx} className="relative flex gap-4">
                              <div className="relative z-10 w-10 h-10 rounded-xl bg-white border-2 border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                                <StepIcon className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                    Tahap {idx + 1}
                                  </span>
                                  <span className="text-sm font-bold text-slate-900 ">{p.step}</span>
                                  {p.timeEstimate && (
                                    <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-0.5">
                                      <Timer className="w-3 h-3" /> {p.timeEstimate}
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                                  <div className="sm:col-span-2">
                                    <div className="relative rounded-xl overflow-hidden border border-line bg-slate-100 aspect-[4/3] w-full">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                                      {p.title}
                                    </h4>
                                    <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed mt-1">
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
                <div className="bg-white rounded-xl border border-line">
                  <div className="px-4 sm:px-5 py-3 border-b border-line bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-ink" />
                      <h2 className="text-base font-semibold text-slate-900">
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
                          className="w-full pl-7 pr-2 py-1.5 text-[13px] border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-gold focus:outline-none"
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-ink text-white border-ink'
                              : 'bg-white text-slate-600 border-line hover:bg-slate-50'
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
                            isLibur ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-line'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span
                              className={`font-semibold block truncate text-sm ${
                                isLibur ? 'text-slate-500 line-through' : 'text-slate-900'
                              }`}
                            >
                              {index + 1}. {site.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold">
                              Kategori {site.type} {isLibur && `• ${site.reason || 'Libur'}`}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`font-bold text-sm block tabular-nums ${
                                isLibur ? 'text-amber-800' : 'text-ink'
                              }`}
                            >
                              {site.masterCount} Porsi
                            </span>
                            <span
                              className={`text-[11px] font-bold ${
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
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100 border-b border-line text-slate-800 font-bold text-xs ">
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
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                <span className={isLibur ? 'line-through text-slate-500' : ''}>
                                  {site.name}
                                </span>
                                {isLibur && (
                                  <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[11px] font-bold">
                                    {site.reason || 'Libur Sekolah'}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-1.5 py-0.2 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-line">
                                  {site.type}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-400">
                                <MapPin className="w-3.5 h-3.5 inline" />
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                                  isLibur ? 'text-amber-800' : 'text-slate-900'
                                }`}
                              >
                                {site.masterCount}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isLibur ? (
                                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    Libur (0)
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                                    <CircleCheck className="w-3 h-3" /> Tersalurkan
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                        <tr>
                          <td colSpan={4} className="py-3 px-4">
                            TOTAL AKUMULASI DISTRIBUSI HARIAN
                          </td>
                          <td className="py-3 px-3 text-right text-sm font-bold text-ink tabular-nums">
                            {totalMaster} Porsi
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-800 font-semibold text-xs">
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
                <div className="no-print bg-white rounded-xl border border-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900">
                        Pratinjau Dokumen Resmi
                      </h3>
                      <p className="text-[13px] text-slate-500 leading-snug">
                        Format KOP operasional BGN — sama persis dengan naskah cetak resmi (Berita Acara
                        &amp; SPJ A4). Seluruh nominal dan data keuangan tetap terproteksi.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenPrintModal}
                    className="px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-ink hover:bg-ink-soft flex items-center gap-1.5 justify-center cursor-pointer shrink-0"
                  >
                    <Lock className="w-3.5 h-3.5 text-gold" />
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
      <SiteFooter />

      <BottomTabs />

      {/* ============ MODAL PIN ============ */}
      {showPinModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
          onClick={() => setShowPinModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-xl border border-line shadow-2xl max-w-sm w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="pin-modal-title" className="font-semibold text-base text-slate-900 leading-tight">
                    Otorisasi Cetak Dokumen
                  </h3>
                  <span className="text-xs text-slate-500 block">Khusus Tim & Operator SPPG</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                aria-label="Tutup"
                className="p-2.5 -m-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Dokumen ini memuat pengesahan resmi SPPG Wonodri 3 Kota Semarang. Masukkan{' '}
              <strong>Kode PIN Operator</strong> untuk mengunduh / mencetak PDF:
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3.5">
              <div>
                <label htmlFor="pin-input" className="text-sm font-semibold text-slate-700 block mb-1.5">
                  Masukkan PIN (5 Digit):
                </label>
                <div className="relative">
                  <input
                    id="pin-input"
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
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-sm font-bold text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 min-h-11 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 min-h-11 rounded-xl text-sm font-semibold text-white bg-ink hover:bg-ink-soft transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Pilih tanggal laporan"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-xl border border-line shadow-xl max-w-sm w-full p-4 pb-6 sm:pb-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-semibold text-sm text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={prevMonth} aria-label="Bulan sebelumnya" className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button type="button" onClick={nextMonth} aria-label="Bulan berikutnya" className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  aria-label="Tutup kalender"
                  className="p-2.5 rounded-lg hover:bg-slate-100 cursor-pointer ml-1"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 ">
              <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
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
                    aria-label={`${day} ${monthNames[calendarMonth]} ${calendarYear}${hasMenu ? ", ada laporan" : ""}`}
                    aria-pressed={isSelected}
                    className={`h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-ink text-white'
                        : hasMenu
                        ? 'bg-gold-soft text-gold-ink hover:bg-gold-soft/70 font-bold border border-gold/30'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-gold-soft border border-gold/30" /> Ada laporan
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-ink" /> Dipilih
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
