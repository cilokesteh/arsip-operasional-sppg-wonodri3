'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_MENU_HISTORY,
  STANDARD_AKG_REFERENCE,
  DailyMenuRecord,
} from '@/lib/data';
import {
  Calendar as CalendarIcon,
  Users,
  Utensils,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Flame,
  Dna,
  Beef,
  Compass,
  Leaf,
  GraduationCap,
  Baby,
  HeartHandshake,
  Heart,
  Search,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-01');
  const [activeTab, setActiveTab] = useState<'akg' | 'menu' | 'dokumentasi' | 'penerima'>('akg');
  const [searchSite, setSearchSite] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Month navigation in calendar popup: Default Oktober 2026 (index 9)
  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  // Cek apakah ada data menu hasil sinkronisasi dari Google Sheet yang tersimpan di localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sppg_synced_menus');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMenuHistory(parsed);
          setSelectedDate(parsed[0].date);
        }
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, []);

  const currentMenu = menuHistory.find((m) => m.date === selectedDate) || menuHistory[0];

  const totalMaster = INITIAL_BENEFICIARIES.reduce((acc, site) => acc + site.masterCount, 0);

  const effectiveBeneficiaries = INITIAL_BENEFICIARIES.map((site) => {
    const override = currentMenu?.overrides?.find((o) => o.siteId === site.id);
    if (override) {
      return {
        ...site,
        isOverride: true,
        overrideCondition: override.condition,
        effectiveCount: override.effectiveCount,
        overrideReason: override.reason,
      };
    }
    return {
      ...site,
      isOverride: false,
      overrideCondition: null as 'libur' | 'penyesuaian' | null,
      effectiveCount: site.masterCount,
      overrideReason: '' as string,
    };
  });

  const totalEffective = effectiveBeneficiaries.reduce((acc, site) => acc + site.effectiveCount, 0);

  const filteredSites = effectiveBeneficiaries.filter((site) =>
    site.name.toLowerCase().includes(searchSite.toLowerCase())
  );

  const getGroupIcon = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case 'besar':
        return GraduationCap;
      case 'kecil':
        return Baby;
      case 'balita':
        return Heart;
      case 'busui':
        return HeartHandshake;
      default:
        return Award;
    }
  };

  const availableDatesSet = new Set(menuHistory.map((m) => m.date));
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col w-full overflow-x-hidden">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 p-1 flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/logo.png"
                alt="Logo BGN SPPG Wonodri 3"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate">
                  SPPG Wonodri 3
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                  BGN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                Dapur MBG Semarang Selatan
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 py-1.5 sm:px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] sm:text-xs">Kalender</span>
            </button>
            <button
              onClick={() => window.print()}
              title="Cetak Dokumen"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <Link
              href="/admin"
              className="px-2.5 py-1.5 sm:px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Portal Transparansi Menu & Kandungan Gizi MBG</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Menu & Angka Kandungan Gizi (AKG)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dokumentasi menu harian, verifikasi takaran gizi makro-mikro, dokumentasi proses dapur,
                dan jangkauan penerima manfaat unit SPPG Wonodri 3 Kota Semarang.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between min-w-[130px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Penerima Manfaat
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                    {totalEffective.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-bold text-blue-600">Porsi</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  12 Sekolah + 1 Posyandu
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between min-w-[130px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Distribusi Hari Ini
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-black text-slate-900">100% Siap</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                  Menu: {currentMenu.date}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
                Pilih Tanggal:
              </span>
              {menuHistory.map((m) => (
                <button
                  key={m.date}
                  onClick={() => setSelectedDate(m.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                    selectedDate === m.date
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {m.date}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Dipublikasikan: <span className="font-bold text-slate-800">{currentMenu.publishedAt}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Segment Tab Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex overflow-x-auto scrollbar-none">
          {[
            { id: 'akg' as const, label: 'Kandungan Gizi (AKG)', icon: Flame },
            { id: 'menu' as const, label: 'Rincian Menu', icon: Utensils },
            { id: 'dokumentasi' as const, label: 'Dokumentasi Dapur', icon: Camera },
            { id: 'penerima' as const, label: 'Penerima Manfaat (1.555)', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* TAB 1: KANDUNGAN GIZI (AKG) */}
        {activeTab === 'akg' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
              <span>Standar gramasi nutrisi harian untuk 5 kelompok sasaran porsi MBG.</span>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit">
                ✦ Pedoman Gizi Seimbang BGN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((card, idx) => {
                const Icon = getGroupIcon(card.groupName);
                return (
                  <div
                    key={idx}
                    className="app-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200/90"
                  >
                    <div>
                      <div
                        className="p-4 border-b flex items-center justify-between"
                        style={{ backgroundColor: card.bgLight, borderColor: `${card.color}30` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                            style={{ backgroundColor: card.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span
                              className="text-xs font-black uppercase tracking-wider block"
                              style={{ color: card.color }}
                            >
                              Porsi {card.groupName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              {card.portionBadge}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/80 border border-slate-200 text-slate-700 shadow-2xs">
                          {card.groupName}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 space-y-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Kelompok Sasaran:
                          </span>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug mt-0.5">
                            {card.targetCategory}
                          </h3>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Flame className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block leading-none">
                                Energi Total
                              </span>
                              <span className="text-[9px] text-amber-700 font-medium">Kalori Porsi</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-black text-amber-950 tabular-nums">
                              {card.energyKcal.toFixed(1)}
                            </span>
                            <span className="text-[11px] font-bold text-amber-700 ml-1">Kkal</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Protein</span>
                              <Dna className="w-3 h-3 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block tabular-nums">
                                {card.proteinG.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">g</span>
                              </span>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full w-[65%]" />
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Lemak</span>
                              <Beef className="w-3 h-3 text-rose-600" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block tabular-nums">
                                {card.fatG.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">g</span>
                              </span>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full w-[45%]" />
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Karbohidrat</span>
                              <Compass className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block tabular-nums">
                                {card.carbsG.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">g</span>
                              </span>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full w-[80%]" />
                              </div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Serat Pangan</span>
                              <Leaf className="w-3 h-3 text-teal-600" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-slate-900 block tabular-nums">
                                {card.fiberG.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">g</span>
                              </span>
                              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className="bg-teal-500 h-full rounded-full w-[50%]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-center text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                      ✦ STANDAR PEMENUHAN GIZI BGN ✦
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MENU COMPOSITION */}
        {activeTab === 'menu' && (
          <div className="app-card rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-900">
                  Menu Harian
                </span>
                <span className="text-xs font-bold text-slate-500">Tanggal: {currentMenu.date}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                {currentMenu.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {[
                { label: 'Karbohidrat Pokok', val: currentMenu.components.karbohidrat, tag: 'Beras Pulen Berkualitas' },
                { label: 'Lauk Hewani', val: currentMenu.components.laukHewani, tag: 'Protein Daging / Ayam Segar' },
                { label: 'Lauk Nabati', val: currentMenu.components.laukNabati, tag: 'Tahu / Tempe Tradisional' },
                { label: 'Sayuran & Serat', val: currentMenu.components.sayur, tag: 'Sayur Segar Kaya Vitamin' },
                { label: 'Buah Segar', val: currentMenu.components.buah, tag: 'Buah Pilihan Segar' },
                { label: 'Pelengkap Susu', val: currentMenu.components.pelengkap || 'Susu Pasteurisasi BGN', tag: 'Kalsium & Nutrisi Mikro' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {item.label}
                    </span>
                    <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {item.val}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 mt-3 block">
                    ✦ {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOKUMENTASI DAPUR (DENGAN SUPORT LINK GOOGLE DRIVE LANGSUNG) */}
        {activeTab === 'dokumentasi' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium">
              Dokumentasi dapur 3 tahap wajib memastikan higienitas pengolahan makanan bergizi untuk tanggal {currentMenu.date}.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {currentMenu.photos.map((p, idx) => (
                <div key={idx} className="app-card rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 sm:h-48 w-full bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg bg-slate-900/80 text-white backdrop-blur-xs shadow-xs">
                          {p.step}
                        </span>
                      </div>
                      {p.timeEstimate && (
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-600 text-white shadow-xs">
                            {p.timeEstimate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>SOP SPPG Wonodri 3</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Higienis Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PENERIMA MANFAAT */}
        {activeTab === 'penerima' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Data Master: <strong>1.555 Penerima Manfaat</strong> (12 Sekolah + 1 Posyandu)
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama sekolah / posyandu..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:hidden">
              {filteredSites.map((site, index) => (
                <div key={site.id} className="app-card rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">{index + 1}.</span>
                      <span className="font-extrabold text-xs text-slate-900 truncate">
                        {site.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {site.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Kuota: {site.masterCount} Siswa
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-blue-600 block tabular-nums">
                      {site.effectiveCount}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="app-card rounded-2xl overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">No</th>
                      <th className="py-3.5 px-4 sm:px-6">Nama Lembaga Penerima</th>
                      <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Master Kuota</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Distribusi Hari Ini</th>
                      <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSites.map((site, index) => (
                      <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                            {site.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-800 border border-blue-200">
                            {site.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-600">
                          {site.masterCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-black text-slate-900">
                          {site.effectiveCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900 text-xs sm:text-sm">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4 sm:px-6">
                        TOTAL PENERIMA MANFAAT
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-blue-600 text-sm sm:text-base font-black">
                        {totalEffective.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center text-[11px] text-emerald-800 font-bold">
                        100% Terverifikasi
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Calendar Modal Pop-up */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base">Arsip Kalender Menu</h3>
                  <p className="text-[10px] text-slate-300">Pilih tanggal menu yang ingin dilihat</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-black text-sm text-slate-900">
                  {monthNames[calendarMonth]} {calendarYear}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Min</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasMenu = availableDatesSet.has(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={dateStr}
                      disabled={!hasMenu}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setShowCalendarModal(false);
                      }}
                      className={`h-9 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : hasMenu
                          ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer font-black'
                          : 'text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <span>{day}</span>
                      {hasMenu && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Clean Footer */}
      <footer className="mt-auto py-6 px-4 bg-white border-t border-slate-200 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo SPPG"
              width={20}
              height={20}
              className="object-contain"
            />
            <span className="font-extrabold text-slate-900 text-xs">
              SPPG Wonodri 3 Kota Semarang
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Built by CilokTech Studio
          </div>
        </div>
      </footer>
    </div>
  );
}
