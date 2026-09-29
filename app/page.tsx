'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  INITIAL_BENEFICIARIES,
  INITIAL_MENU_HISTORY,
  DailyMenuRecord,
} from '@/lib/data';
import {
  Calendar,
  Users,
  Utensils,
  Camera,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
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
  ExternalLink,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [activeTab, setActiveTab] = useState<'akg' | 'menu' | 'dokumentasi' | 'penerima'>('akg');
  const [searchSite, setSearchSite] = useState<string>('');

  const currentMenu = menuHistory.find((m) => m.date === selectedDate) || menuHistory[0];

  const totalMaster = INITIAL_BENEFICIARIES.reduce((acc, site) => acc + site.masterCount, 0);

  const effectiveBeneficiaries = INITIAL_BENEFICIARIES.map((site) => {
    const override = currentMenu.overrides?.find((o) => o.siteId === site.id);
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

  // Helper Card Style Map
  const getCardTheme = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case 'besar':
        return {
          wrapper: 'neu-morphism-amber',
          badge: 'bg-amber-500/10 text-amber-700',
          watermark: 'text-amber-700',
          icon: GraduationCap,
        };
      case 'kecil':
        return {
          wrapper: 'neu-morphism-emerald',
          badge: 'bg-emerald-500/10 text-emerald-700',
          watermark: 'text-emerald-700',
          icon: Baby,
        };
      case 'balita':
        return {
          wrapper: 'neu-morphism-rose',
          badge: 'bg-rose-500/10 text-rose-700',
          watermark: 'text-rose-700',
          icon: Heart,
        };
      case 'busui':
        return {
          wrapper: 'neu-morphism-blue',
          badge: 'bg-blue-500/10 text-blue-700',
          watermark: 'text-blue-700',
          icon: HeartHandshake,
        };
      case 'bumil':
      default:
        return {
          wrapper: 'neu-morphism-purple',
          badge: 'bg-purple-500/10 text-purple-700',
          watermark: 'text-purple-700',
          icon: ShieldCheck,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf0f7] text-slate-800 antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Header Neumorphic Fixed (Sesuai Martajasah) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-xs px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200/80 neu-flat flex items-center justify-center p-1.5 shrink-0 select-none">
              <span className="font-black text-emerald-700 text-sm tracking-tighter">W3</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-base font-black text-slate-800 tracking-tight leading-tight truncate flex items-center gap-1.5">
                <span>Angka Kandungan Gizi</span>
                <span className="hidden sm:inline-block px-2 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  MBG
                </span>
              </h1>
              <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                SPPG Wonodri 3 • Kota Semarang
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Beneficiaries pill badge */}
            <div className="neu-btn hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl">
              <div className="w-5 h-5 rounded-lg neu-inset flex items-center justify-center text-emerald-600">
                <Users className="w-3 h-3" />
              </div>
              <span className="text-xs font-black text-slate-800 tabular-nums">
                {totalEffective.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-bold text-slate-500 hidden sm:inline">Penerima</span>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              title="Cetak Laporan / Simpan PDF"
              className="neu-btn p-2 rounded-xl text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Admin link */}
            <Link
              href="/admin"
              title="Panel Sinkronisasi Google Sheet"
              className="neu-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold text-emerald-800 hover:text-emerald-950 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tim Teknis</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-3 sm:px-6 pt-20 pb-24 flex-1 space-y-4 sm:space-y-6">
        {/* 2. Sub-Header: Date Strip & Navigation (Neumorphic) */}
        <section className="neu-flat rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-emerald-700 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-600 text-white shadow-2xs">
                  Menu #{currentMenu.menuNumber}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedDate === '2026-09-29' ? 'Distribusi Hari Ini' : 'Arsip Riwayat'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                {currentMenu.title}
              </h2>
            </div>
          </div>

          {/* Quick Date Switcher */}
          <div className="flex items-center gap-2 self-start md:self-center overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
              Pilih Tanggal:
            </span>
            <div className="flex items-center gap-1.5">
              {menuHistory.map((m) => (
                <button
                  key={m.date}
                  onClick={() => setSelectedDate(m.date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedDate === m.date
                      ? 'neu-btn-primary shadow-md'
                      : 'neu-btn text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {m.date}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Segment Tabs (Floating Neumorphic Pill bar) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto p-1.5 neu-inset rounded-2xl">
          {[
            { id: 'akg' as const, label: 'Kandungan Gizi (AKG)', icon: Flame },
            { id: 'menu' as const, label: 'Rincian Menu', icon: Utensils },
            { id: 'dokumentasi' as const, label: 'Dokumentasi Dapur (3 Tahap)', icon: Camera },
            { id: 'penerima' as const, label: 'Penerima Manfaat (1.555)', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[130px] sm:min-w-0 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  isActive
                    ? 'neu-flat text-emerald-800 shadow-sm border border-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: KANDUNGAN GIZI (AKG) — PERSIS MARTAJASAH */}
        {activeTab === 'akg' && (
          <div className="space-y-4 sm:space-y-6">
            {currentMenu.nutritionCards.map((card, idx) => {
              const theme = getCardTheme(card.groupName);
              const GroupIcon = theme.icon;

              return (
                <section
                  key={idx}
                  className={`rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all ${theme.wrapper}`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg neu-flat flex items-center justify-center shrink-0 ${theme.badge}`}
                      >
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-800 tracking-tight">
                        {card.groupName}
                      </h2>
                    </div>

                    <div className="px-2.5 py-0.5 rounded-full bg-white/80 neu-flat-sm text-[10px] sm:text-xs font-bold text-slate-600">
                      {card.portionBadge}
                    </div>
                  </div>

                  {/* Body Content 2-Column */}
                  <div className="flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-4 md:items-center">
                    {/* Visual Vector Container Sesuai Martajasah */}
                    <div className="md:col-span-6 flex flex-col items-center justify-center w-full relative">
                      <div className="neu-inset rounded-xl sm:rounded-2xl p-3 w-full flex items-center justify-center overflow-hidden bg-[#e2e8f1]/70 relative border border-slate-200/50 shadow-inner min-h-[160px] sm:min-h-[190px]">
                        {/* Decorative Repeating Watermark Vector */}
                        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-20">
                          <svg
                            className="w-full h-full"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 800 500"
                            preserveAspectRatio="xMidYMid slice"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <g className={`${theme.watermark} fill-current font-extrabold tracking-widest text-[13px] opacity-60`}>
                              <text x="50" y="45" transform="rotate(-6 50 45)">✦ SPPG WONODRI 3 ✦</text>
                              <text x="520" y="70" transform="rotate(4 520 70)">★ SPPG WONODRI 3 ★</text>
                              <text x="180" y="260" transform="rotate(-4 180 260)">✦ MAKANAN BERGIZI ✦</text>
                              <text x="480" y="320" transform="rotate(5 480 320)">✦ SPPG WONODRI 3 ✦</text>
                              <text x="60" y="450" transform="rotate(-3 60 450)">★ GENERASI SEHAT & CERDAS ★</text>
                              <text x="510" y="470" transform="rotate(3 510 470)">✦ BGN INDONESIA ✦</text>
                            </g>
                          </svg>
                        </div>

                        {/* Middle Badge / Foto */}
                        <div className="relative z-10 p-4 bg-white/85 backdrop-blur-xs rounded-xl neu-flat text-center space-y-1">
                          <span className="text-[11px] font-black uppercase text-emerald-800 block tracking-wider">
                            Porsi Standar {card.groupName}
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-800 block">
                            {card.targetCategory}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Takar Saji Higienis Terverifikasi
                          </span>
                        </div>

                        <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-slate-900/70 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold">
                          {card.targetCategory}
                        </div>
                      </div>
                    </div>

                    {/* Numeric Gizi Matrix Grid */}
                    <div className="md:col-span-6 flex flex-col justify-center gap-2 sm:gap-2.5 w-full">
                      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                        {/* Energi Total */}
                        <div className="rounded-xl p-2.5 sm:p-3 col-span-2 flex flex-row items-center justify-between text-left relative overflow-hidden bg-orange-50/80 hover:bg-orange-50 border border-orange-200/80 shadow-2xs">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100/90 flex items-center justify-center shrink-0">
                              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                            </div>
                            <div className="min-w-0 pr-2 flex-1">
                              <span className="block text-xs sm:text-sm font-extrabold text-orange-950 leading-tight">
                                Energi Total
                              </span>
                              <span className="block text-[9px] sm:text-[10px] text-orange-700/70 mt-0.5">
                                Kalori Porsi
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1 shrink-0 ml-1">
                            <span className="text-lg sm:text-[22px] font-black text-orange-950 leading-none">
                              {card.energyKcal.toFixed(2)}
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-orange-700">Kkal</span>
                          </div>
                        </div>

                        {/* Protein */}
                        <div className="rounded-xl p-2.5 sm:p-3 col-span-1 flex flex-row items-center justify-between text-left gap-2 overflow-hidden bg-emerald-50/80 hover:bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-emerald-100/90 flex items-center justify-center shrink-0">
                              <Dna className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="min-w-0 pr-1 flex-1">
                              <span className="block text-[10px] sm:text-[11px] font-extrabold text-emerald-950 leading-tight">
                                Protein
                              </span>
                              <span className="block text-[8px] sm:text-[9px] text-emerald-700/70">
                                Hewani & Nabati
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 shrink-0 ml-auto">
                            <span className="text-sm sm:text-base font-black text-emerald-950 leading-none">
                              {card.proteinG.toFixed(2)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700">g</span>
                          </div>
                        </div>

                        {/* Lemak */}
                        <div className="rounded-xl p-2.5 sm:p-3 col-span-1 flex flex-row items-center justify-between text-left gap-2 overflow-hidden bg-rose-50/80 hover:bg-rose-50 border border-rose-200/80 shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-rose-100/90 flex items-center justify-center shrink-0">
                              <Beef className="w-3.5 h-3.5 text-rose-600" />
                            </div>
                            <div className="min-w-0 pr-1 flex-1">
                              <span className="block text-[10px] sm:text-[11px] font-extrabold text-rose-950 leading-tight">
                                Lemak
                              </span>
                              <span className="block text-[8px] sm:text-[9px] text-rose-700/70">
                                Lemak Total
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 shrink-0 ml-auto">
                            <span className="text-sm sm:text-base font-black text-rose-950 leading-none">
                              {card.fatG.toFixed(2)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-rose-700">g</span>
                          </div>
                        </div>

                        {/* Karbohidrat */}
                        <div className="rounded-xl p-2.5 sm:p-3 col-span-1 flex flex-row items-center justify-between text-left gap-2 overflow-hidden bg-blue-50/80 hover:bg-blue-50 border border-blue-200/80 shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-blue-100/90 flex items-center justify-center shrink-0">
                              <Compass className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div className="min-w-0 pr-1 flex-1">
                              <span className="block text-[10px] sm:text-[11px] font-extrabold text-blue-950 leading-tight">
                                Karbo
                              </span>
                              <span className="block text-[8px] sm:text-[9px] text-blue-700/70">
                                Energi Pokok
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 shrink-0 ml-auto">
                            <span className="text-sm sm:text-base font-black text-blue-950 leading-none">
                              {card.carbsG.toFixed(2)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-blue-700">g</span>
                          </div>
                        </div>

                        {/* Serat */}
                        <div className="rounded-xl p-2.5 sm:p-3 col-span-1 flex flex-row items-center justify-between text-left gap-2 overflow-hidden bg-teal-50/80 hover:bg-teal-50 border border-teal-200/80 shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-teal-100/90 flex items-center justify-center shrink-0">
                              <Leaf className="w-3.5 h-3.5 text-teal-600" />
                            </div>
                            <div className="min-w-0 pr-1 flex-1">
                              <span className="block text-[10px] sm:text-[11px] font-extrabold text-teal-950 leading-tight">
                                Serat
                              </span>
                              <span className="block text-[8px] sm:text-[9px] text-teal-700/70">
                                Sayur & Buah
                              </span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 shrink-0 ml-auto">
                            <span className="text-sm sm:text-base font-black text-teal-950 leading-none">
                              {card.fiberG.toFixed(2)}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-teal-700">g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* TAB 2: MENU COMPOSITION */}
        {activeTab === 'menu' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="neu-flat rounded-2xl p-5 sm:p-7 space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  Menu MBG Terverifikasi
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {currentMenu.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Karbohidrat Pokok', val: currentMenu.components.karbohidrat, tag: 'Beras Pandan Wangi' },
                  { label: 'Lauk Hewani', val: currentMenu.components.laukHewani, tag: 'Protein Ayam Ungkep' },
                  { label: 'Lauk Nabati', val: currentMenu.components.laukNabati, tag: 'Tahu Bacem Gurih' },
                  { label: 'Sayuran / Serat', val: currentMenu.components.sayur, tag: 'Buncis & Jagung' },
                  { label: 'Buah Segar', val: currentMenu.components.buah, tag: 'Pisang Cavendish' },
                  { label: 'Pelengkap Susu', val: currentMenu.components.pelengkap || 'Susu Pasteurisasi', tag: 'Kalsium & Vitamin D' },
                ].map((item, i) => (
                  <div key={i} className="neu-inset rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                        {item.label}
                      </span>
                      <p className="font-extrabold text-sm text-slate-900 leading-snug">
                        {item.val}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                      ✦ {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOKUMENTASI DAPUR (3 TAHAP) */}
        {activeTab === 'dokumentasi' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {currentMenu.photos.map((photo, idx) => (
                <div key={idx} className="neu-flat rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                          {photo.step}
                        </span>
                      </div>
                      {photo.timeEstimate && (
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white shadow-xs">
                            {photo.timeEstimate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-1.5">
                      <h3 className="font-black text-sm text-slate-900 leading-snug">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100/70 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>SOP Dapur Wonodri 3</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Higienis
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
            {/* Search Input */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Data Master: <strong>1.555 Penerima</strong> (12 Sekolah + 1 Posyandu)
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-300 neu-inset focus:outline-none"
                />
              </div>
            </div>

            {/* Table Card */}
            <div className="neu-flat rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-200/60 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Nama Sekolah / Posyandu</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Master Kuota</th>
                      <th className="py-3 px-4 text-right">Distribusi Hari Ini</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {filteredSites.map((site, index) => (
                      <tr key={site.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                            {site.name}
                          </span>
                          {site.isOverride && (
                            <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {site.overrideReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                            {site.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-600">
                          {site.masterCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {site.effectiveCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-200/70 border-t-2 border-slate-300 font-black text-slate-900 text-xs sm:text-sm">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4">
                        TOTAL PENERIMA
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-700 text-sm sm:text-base font-black">
                        {totalEffective.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[10px] text-slate-500 font-bold">
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

      {/* Footer Neumorphic */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="text-center sm:text-left">
            <span className="font-black text-slate-900 block text-xs">
              SPPG WONODRI 3 • ARSIP OPERASIONAL MBG
            </span>
            <span>Mendukung Pemenuhan Gizi Nasional di Kota Semarang</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.sppgwonodri3.web.id/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 flex items-center gap-1 font-bold"
            >
              <span>Profil Unit Wonodri 3</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="font-semibold text-slate-400">Built by CilokTech Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
