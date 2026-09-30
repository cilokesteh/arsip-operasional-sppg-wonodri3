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
  FileText,
  Layers,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-01');
  const [searchSite, setSearchSite] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Month navigation in calendar popup
  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

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
      // fallback
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
      {/* 1. Header Publik Resmi */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
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

          {/* Action Header */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 py-1.5 sm:px-3 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] sm:text-xs">Pilih Tanggal</span>
            </button>
            <button
              onClick={() => window.print()}
              title="Cetak Semua Data Sekali Klik"
              className="px-3 py-1.5 rounded-lg text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan Lengkap</span>
            </button>
            <Link
              href="/admin"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1759ab]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Kop Cetak Formal (Hanya tampil saat dicetak PDF/Kertas) */}
      <div className="hidden print:block p-6 border-b-2 border-slate-900 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                SATUAN PELAYANAN PEMENUHAN GIZI (SPPG) WONODRI 3
              </h1>
              <p className="text-xs text-slate-700">
                Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang
              </p>
              <p className="text-[10px] text-slate-500">
                Badan Gizi Nasional (BGN) • Program Makan Bergizi Gratis (MBG)
              </p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="font-black block">LAPORAN OPERASIONAL HARIAN</span>
            <span className="text-slate-600">Tanggal: {currentMenu.date}</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Dashboard Hero */}
      <section className="bg-white border-b border-slate-200/80 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Dashboard Terpadu Operasional SPPG Wonodri 3</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Laporan & Transparansi Menu MBG Harian
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-normal">
                Satu halaman terpadu: Menu Makanan, Uraian Pekerjaan, Nilai Gizi (AKG), Foto Dapur 3 Tahap, dan 1.555 Penerima Manfaat.
              </p>
            </div>

            {/* Tombol Cetak Sekali Klik di Dashboard */}
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="px-5 py-3 rounded-xl text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak 1-Klik (PDF / Print)</span>
              </button>
            </div>
          </div>

          {/* Quick Date Switcher Strip */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              Tanggal Operasional: <strong className="text-slate-900">{currentMenu.date}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SATU HALAMAN DASHBOARD LENGKAP (ALL-IN-ONE) */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 space-y-8">
        {/* ===================== SEKSI 1: MENU UTAMA & FOTO SAJIAN ===================== */}
        <section className="app-card rounded-3xl p-5 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  1. Sajian Menu & 5 Komponen Makanan
                </h2>
                <span className="text-[11px] text-slate-500">Standar Porsi Pemenuhan Gizi Seimbang BGN</span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {currentMenu.date}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
            {/* Foto Makanan */}
            <div className="lg:w-1/2 relative h-64 sm:h-76 w-full rounded-2xl overflow-hidden shadow-sm bg-slate-100 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                alt={currentMenu.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                  Sajian Hari Ini
                </span>
              </div>
            </div>

            {/* Judul & Detail Menu */}
            <div className="lg:w-1/2 space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider">
                  Menu Harian Resmi
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                  {currentMenu.title}
                </h3>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">Jangkauan Penerima Hari Ini:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-blue-700 tabular-nums">
                    {totalEffective.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Porsi Didistribusikan</span>
                  <span className="text-xs text-slate-400">• 12 Sekolah + 1 Posyandu</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Kotak Komponen Makanan */}
          <div className="pt-2">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block mb-2.5">
              Rincian 5 Komponen Porsi:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: '1. Karbohidrat', val: currentMenu.components.karbohidrat },
                { label: '2. Lauk Hewani', val: currentMenu.components.laukHewani },
                { label: '3. Lauk Nabati', val: currentMenu.components.laukNabati },
                { label: '4. Sayuran', val: currentMenu.components.sayur },
                { label: '5. Buah Segar', val: currentMenu.components.buah },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                    {item.label}
                  </span>
                  <p className="font-extrabold text-xs text-slate-900 leading-snug">
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SEKSI 2: URAIAN PEKERJAAN OPERASIONAL ===================== */}
        <section className="app-card rounded-3xl p-5 sm:p-7 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                2. Uraian Pekerjaan Operasional & Distribusi
              </h2>
              <span className="text-[11px] text-slate-500">Log tahapan penyiapan dari dapur hingga serah terima sekolah</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
            {currentMenu.uraianPekerjaan || (
              '1. Pembersihan dan sterilisasi dapur operasional mulai pukul 04:00 WIB.\n2. Sortasi sayur dan bahan baku segar dari petani lokal.\n3. Pengolahan lauk hewani dan nabati dengan suhu mendidih di atas 85°C.\n4. Penataan porsi makanan hangat ke dalam wadah thermal box food-grade.\n5. Keberangkatan armada distribusi pukul 08:30 WIB ke 12 sekolah dan 1 posyandu.'
            )}
          </div>
        </section>

        {/* ===================== SEKSI 3: ANGKA KANDUNGAN GIZI (AKG) ===================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  3. Angka Kandungan Gizi (AKG) 5 Kelompok Porsi
                </h2>
                <span className="text-[11px] text-slate-500">Gramasi Energi, Protein, Lemak, Karbohidrat, & Serat</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((card, idx) => {
              const Icon = getGroupIcon(card.groupName);
              return (
                <div key={idx} className="app-card rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div
                      className="p-3.5 border-b flex items-center justify-between"
                      style={{ backgroundColor: card.bgLight, borderColor: `${card.color}30` }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: card.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase block" style={{ color: card.color }}>
                            Porsi {card.groupName}
                          </span>
                          <span className="text-[10px] text-slate-500">{card.portionBadge}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {card.targetCategory}
                      </h4>

                      {/* Energi */}
                      <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-950 uppercase">Energi Total</span>
                        <div className="text-right">
                          <span className="text-lg font-black text-orange-950 tabular-nums">
                            {card.energyKcal.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold text-orange-700 ml-1">Kkal</span>
                        </div>
                      </div>

                      {/* 4 Komponen Makro */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-500 block">Protein</span>
                          <span className="text-xs font-black text-slate-900">{card.proteinG.toFixed(1)} g</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-500 block">Lemak</span>
                          <span className="text-xs font-black text-slate-900">{card.fatG.toFixed(1)} g</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-500 block">Karbo</span>
                          <span className="text-xs font-black text-slate-900">{card.carbsG.toFixed(1)} g</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-500 block">Serat</span>
                          <span className="text-xs font-black text-slate-900">{card.fiberG.toFixed(1)} g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================== SEKSI 4: DOKUMENTASI DAPUR (3 TAHAP) ===================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  4. Foto Dokumentasi Dapur (3 Tahap)
                </h2>
                <span className="text-[11px] text-slate-500">Persiapan, Pengolahan Suhu Tinggi, dan Pengemasan Thermal Box</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currentMenu.photos.map((p, idx) => (
              <div key={idx} className="app-card rounded-2xl overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-slate-900/80 text-white">
                        {p.step}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{p.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{p.description}</p>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                  <span>SOP SPPG Wonodri 3</span>
                  <span className="flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== SEKSI 5: DAFTAR 1.555 PENERIMA MANFAAT ===================== */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  5. Data Penerima Manfaat (12 Sekolah + 1 Posyandu)
                </h2>
                <span className="text-[11px] text-slate-500">Baseline Resmi: 1.555 Penerima di Semarang Selatan</span>
              </div>
            </div>

            <div className="relative w-full sm:w-64 no-print">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sekolah..."
                value={searchSite}
                onChange={(e) => setSearchSite(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="app-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Nama Lembaga Penerima</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Master Kuota</th>
                    <th className="py-3 px-4 text-right">Distribusi Hari Ini</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSites.map((site, index) => (
                    <tr key={site.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-4 font-extrabold text-slate-900">{site.name}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {site.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-600">{site.masterCount}</td>
                      <td className="py-2.5 px-4 text-right font-black text-blue-700">{site.effectiveCount}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900 text-xs">
                  <tr>
                    <td colSpan={3} className="py-3 px-4">TOTAL DISTRIBUSI</td>
                    <td className="py-3 px-4 text-right text-slate-600">{totalMaster}</td>
                    <td className="py-3 px-4 text-right text-blue-600 text-sm font-black">{totalEffective}</td>
                    <td className="py-3 px-4 text-center text-emerald-700 font-bold">100% Siap</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Calendar Modal Pop-up */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 no-print">
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

      {/* 5. Clean Footer */}
      <footer className="mt-auto py-6 px-4 bg-white border-t border-slate-200 text-slate-500 text-xs no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo SPPG" width={20} height={20} className="object-contain" />
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
