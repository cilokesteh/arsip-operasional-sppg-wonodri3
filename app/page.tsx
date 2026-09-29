'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Award,
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
        return ShieldCheck;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#0d1b2e] flex flex-col w-full overflow-x-hidden">
      {/* 1. Mobile-Optimized Compact Header */}
      <header className="sticky top-0 z-50 bg-[#0b1e3a] text-white border-b border-[#174a8a]/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-white/20">
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
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate">
                  SPPG Wonodri 3
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#c9a227] text-[#0b1e3a] shrink-0">
                  BGN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#a5cdf9] truncate">
                Dapur MBG Semarang Selatan
              </p>
            </div>
          </Link>

          {/* Action Header */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => window.print()}
              title="Cetak PDF"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-white bg-[#1759ab] hover:bg-[#1d6fd0] border border-[#5fa8f0]/30 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#a8d8f0]" />
              <span className="hidden sm:inline ml-1.5">Cetak</span>
            </button>
            <Link
              href="/admin"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0b1e3a] bg-white hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1759ab]" />
              <span className="text-[11px]">Teknis</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Compact Mobile-First Hero Section */}
      <section className="sppg-gradient text-white py-5 sm:py-8 px-3.5 sm:px-6 border-b border-[#cfe4fc]/30">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#a8d8f0] text-[10px] sm:text-xs font-bold">
              <Award className="w-3 h-3 text-[#c9a227]" />
              <span>Transparansi Menu & AKG MBG</span>
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight">
              Arsip Operasional MBG Harian
            </h1>
            <p className="text-[11px] sm:text-xs text-[#cfe4fc] leading-normal">
              Informasi kandungan gizi (AKG), menu, foto dapur, dan penerima manfaat SPPG Wonodri 3.
            </p>
          </div>

          {/* Quick Metrics Bar: 2-Col Mobile Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="p-3 rounded-xl bg-[#0b1e3a]/90 border border-[#5fa8f0]/40">
              <span className="text-[10px] font-bold text-[#a5cdf9] uppercase tracking-wider block">
                Total Distribusi
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                  {totalEffective.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-bold text-[#c9a227]">Porsi</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-300 block mt-0.5">
                12 Sekolah + 1 Posyandu
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0b1e3a]/90 border border-[#5fa8f0]/40">
              <span className="text-[10px] font-bold text-[#a5cdf9] uppercase tracking-wider block">
                Status Menu
              </span>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white">Menu #{currentMenu.menuNumber}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-300 font-medium block mt-0.5 truncate">
                Rilis: {currentMenu.publishedAt}
              </span>
            </div>
          </div>

          {/* Date Selector Navigation Bar */}
          <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-extrabold text-[#a8d8f0] uppercase tracking-wider whitespace-nowrap mr-1">
              Tanggal:
            </span>
            {menuHistory.map((m) => (
              <button
                key={m.date}
                onClick={() => setSelectedDate(m.date)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedDate === m.date
                    ? 'bg-[#c9a227] text-[#0b1e3a] font-extrabold shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                {m.date}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Segment Tab Bar (Full Width Responsive Scroll) */}
      <div className="bg-white border-b border-[#cfe4fc] sticky top-13 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex overflow-x-auto scrollbar-none">
          {[
            { id: 'akg' as const, label: 'Kandungan Gizi', icon: Flame },
            { id: 'menu' as const, label: 'Menu Makanan', icon: Utensils },
            { id: 'dokumentasi' as const, label: 'Foto Dapur', icon: Camera },
            { id: 'penerima' as const, label: 'Penerima (1.555)', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-[#1759ab] text-[#1759ab] bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-[#0b1e3a]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1759ab]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <main className="max-w-6xl mx-auto w-full px-3.5 sm:px-6 py-5 sm:py-8 flex-1 space-y-5 sm:space-y-6">
        {/* TAB 1: KANDUNGAN GIZI (AKG) — Mobile-First Cards */}
        {activeTab === 'akg' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Rincian gizi resmi untuk 5 kelompok porsi sasaran.</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Standar BGN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {currentMenu.nutritionCards.map((card, idx) => {
                const Icon = getGroupIcon(card.groupName);
                return (
                  <div
                    key={idx}
                    className="sppg-card rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Top */}
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#e8f2fe] to-[#f4f9ff] border-b border-[#cfe4fc] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#1759ab] text-white flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#1759ab] uppercase tracking-wide block">
                              Porsi {card.groupName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold block">
                              {card.portionBadge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body Target Group */}
                      <div className="p-3.5 sm:p-4 space-y-3">
                        <h3 className="font-extrabold text-xs sm:text-sm text-[#0b1e3a] leading-snug">
                          {card.targetCategory}
                        </h3>

                        {/* Energi Hero Metric */}
                        <div className="p-2.5 sm:p-3 rounded-lg bg-[#0b1e3a] text-white flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[#c9a227]">
                              <Flame className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] text-[#a5cdf9] font-bold uppercase tracking-wider">
                              Energi Total
                            </span>
                          </div>
                          <div>
                            <span className="text-base sm:text-lg font-black text-white tabular-nums">
                              {card.energyKcal.toFixed(1)}
                            </span>
                            <span className="text-[10px] font-bold text-[#c9a227] ml-1">Kkal</span>
                          </div>
                        </div>

                        {/* 4 Makronutrien Grid (2x2) */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-0.5">
                              <span className="text-[9px] font-bold uppercase">Protein</span>
                              <Dna className="w-2.5 h-2.5 text-emerald-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.proteinG.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[8px] text-slate-400">Hewani & Nabati</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-0.5">
                              <span className="text-[9px] font-bold uppercase">Lemak</span>
                              <Beef className="w-2.5 h-2.5 text-rose-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.fatG.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[8px] text-slate-400">Lemak Total</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-0.5">
                              <span className="text-[9px] font-bold uppercase">Karbo</span>
                              <Compass className="w-2.5 h-2.5 text-blue-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.carbsG.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[8px] text-slate-400">Energi Pokok</span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-0.5">
                              <span className="text-[9px] font-bold uppercase">Serat</span>
                              <Leaf className="w-2.5 h-2.5 text-teal-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.fiberG.toFixed(1)} <span className="text-[9px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[8px] text-slate-400">Sayur & Buah</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border-t border-[#cfe4fc] text-center text-[9px] font-bold text-[#1759ab] tracking-wider uppercase">
                      ✦ SPPG WONODRI 3 ✦
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MENU COMPOSITION */}
        {activeTab === 'menu' && (
          <div className="sppg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="border-b border-[#cfe4fc] pb-3">
              <span className="text-[10px] font-extrabold uppercase text-[#1759ab] tracking-wider">
                Menu Terverifikasi • Nomor Urut #{currentMenu.menuNumber}
              </span>
              <h2 className="text-base sm:text-xl font-black text-[#0b1e3a] mt-0.5 leading-snug">
                {currentMenu.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                Tanggal: <strong>{currentMenu.date}</strong> | Dapur: <strong>Jl. Erlangga Raya No 38</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {[
                { label: 'Karbohidrat Pokok', val: currentMenu.components.karbohidrat, tag: 'Beras Pulen Berkualitas' },
                { label: 'Lauk Hewani', val: currentMenu.components.laukHewani, tag: 'Protein Segar' },
                { label: 'Lauk Nabati', val: currentMenu.components.laukNabati, tag: 'Olahan Kedelai Higienis' },
                { label: 'Sayuran & Serat', val: currentMenu.components.sayur, tag: 'Sayur Segar Kaya Vitamin' },
                { label: 'Buah Segar', val: currentMenu.components.buah, tag: 'Buah Pilihan Segar' },
                { label: 'Pelengkap Susu', val: currentMenu.components.pelengkap || 'Susu Pasteurisasi', tag: 'Kalsium & Vitamin D' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#f4f9ff] border border-[#cfe4fc] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      {item.label}
                    </span>
                    <p className="font-extrabold text-xs sm:text-sm text-[#0b1e3a] leading-snug">
                      {item.val}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#1759ab] mt-2 block">
                    ✦ {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOKUMENTASI DAPUR (FOTO REAL SPPG WONODRI 3) */}
        {activeTab === 'dokumentasi' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium">
              Dokumentasi dapur 3 tahap wajib memastikan higienitas pengolahan makanan bergizi.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
              {[
                {
                  step: 'Persiapan',
                  title: 'Sortasi Bahan Baku & Higienitas',
                  desc: 'Pembersihan dan sortasi higienis bahan baku di dapur persiapan SPPG Wonodri 3.',
                  image: '/about-kitchen.jpg',
                  time: '04:00 - 05:30 WIB',
                },
                {
                  step: 'Pengolahan',
                  title: 'Pemasakan Standar Suhu Tinggi',
                  desc: 'Pengolahan makanan hangat menggunakan peralatan berstandar BGN.',
                  image: '/hero-kitchen.jpg',
                  time: '05:30 - 07:15 WIB',
                },
                {
                  step: 'Pengemasan',
                  title: 'Plating Porsi & Segel Thermal',
                  desc: 'Pengecekan gramasi tiap kelompok dan penyegelan box siap kirim.',
                  image: '/gallery-1.jpg',
                  time: '07:15 - 08:30 WIB',
                },
              ].map((p, idx) => (
                <div key={idx} className="sppg-card rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 sm:h-48 w-full bg-slate-100">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-[#0b1e3a]/90 text-white">
                          {p.step}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-[#1759ab] text-white">
                          {p.time}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 space-y-1">
                      <h3 className="font-extrabold text-xs sm:text-sm text-[#0b1e3a] leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-[#cfe4fc] flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span>SOP SPPG Wonodri 3</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Higienis
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PENERIMA MANFAAT — Mobile Card / Table View */}
        {activeTab === 'penerima' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-slate-600 font-medium">
                Data Master: <strong>1.555 Penerima</strong> (12 Sekolah + 1 Posyandu)
              </div>
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-[#cfe4fc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1759ab]"
                />
              </div>
            </div>

            {/* Mobile Cards (tampil di layar HP < 640px) */}
            <div className="grid grid-cols-1 gap-2.5 sm:hidden">
              {filteredSites.map((site, index) => (
                <div key={site.id} className="sppg-card rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">{index + 1}.</span>
                      <span className="font-extrabold text-xs text-[#0b1e3a] truncate">
                        {site.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-900">
                        {site.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Master: {site.masterCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#1759ab] block tabular-nums">
                      {site.effectiveCount}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (tampil di sm ke atas) */}
            <div className="sppg-card rounded-2xl overflow-hidden hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#e8f2fe] border-b border-[#cfe4fc] text-[#0b1e3a] font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">No</th>
                      <th className="py-3 px-4">Nama Lembaga Penerima</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Master Kuota</th>
                      <th className="py-3 px-4 text-right">Distribusi Hari Ini</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfe4fc]/60">
                    {filteredSites.map((site, index) => (
                      <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-[#0b1e3a] block text-xs sm:text-sm">
                            {site.name}
                          </span>
                          {site.isOverride && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5 inline-block">
                              {site.overrideReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-200">
                            {site.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-600">
                          {site.masterCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-black text-[#0b1e3a]">
                          {site.effectiveCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#e8f2fe] border-t-2 border-[#cfe4fc] font-black text-[#0b1e3a] text-xs sm:text-sm">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4">
                        TOTAL PENERIMA MANFAAT
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#1759ab] text-sm sm:text-base font-black">
                        {totalEffective.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-emerald-800 font-bold">
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

      {/* 5. Mobile-Friendly Footer */}
      <footer className="mt-auto py-6 px-4 bg-[#0b1e3a] text-white border-t border-[#174a8a]/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo SPPG"
              width={22}
              height={22}
              className="object-contain"
            />
            <span className="font-extrabold text-white text-xs">
              SPPG Wonodri 3 Kota Semarang
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <a
              href="https://www.sppgwonodri3.web.id/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a227] hover:text-[#e8d5a3] font-bold"
            >
              Portofolio Unit
            </a>
            <span>•</span>
            <span className="text-slate-400">Built by CilokTech Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
