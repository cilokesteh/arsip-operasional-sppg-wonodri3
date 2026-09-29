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
    <div className="min-h-screen bg-[#f4f9ff] text-[#0d1b2e] flex flex-col">
      {/* 1. Header Resmi SPPG Wonodri 3 (Navy Blue + BGN Gold Standard) */}
      <header className="sticky top-0 z-50 bg-[#0b1e3a] text-white border-b border-[#174a8a]/40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs shrink-0 border border-white/20">
              <Image
                src="/logo.png"
                alt="Logo Resmi SPPG Wonodri 3"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-[#a8d8f0] transition-colors">
                  SPPG Wonodri 3
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-[#c9a227] text-[#0b1e3a]">
                  BGN
                </span>
              </div>
              <p className="text-[11px] text-[#a5cdf9] font-medium tracking-wide">
                Satuan Pelayanan Pemenuhan Gizi • Kota Semarang
              </p>
            </div>
          </Link>

          {/* Action Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1759ab] hover:bg-[#1d6fd0] border border-[#5fa8f0]/30 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#a8d8f0]" />
              <span className="hidden sm:inline">Cetak Dokumen</span>
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0b1e3a] bg-white hover:bg-slate-100 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1759ab]" />
              <span>Tim Teknis</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Formal Navy Hero Banner */}
      <section className="sppg-gradient text-white pt-8 pb-10 px-4 sm:px-6 relative overflow-hidden border-b border-[#cfe4fc]/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#a8d8f0] text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Dokumen Resmi Transparansi Program MBG Nasional</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Arsip Operasional & Angka Kandungan Gizi
              </h1>
              <p className="text-xs sm:text-sm text-[#cfe4fc] leading-relaxed">
                Pencatatan harian menu makanan bergizi, uji gramasi nutrisi per kategori porsi,
                dokumentasi higienitas dapur, serta pengawasan jangkauan penerima manfaat di Kota Semarang.
              </p>
            </div>

            {/* Total Beneficiaries Stat Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1e3a]/90 backdrop-blur-md border border-[#5fa8f0]/40 shadow-lg shrink-0 min-w-[240px]">
              <span className="text-[11px] font-bold text-[#a5cdf9] uppercase tracking-wider block">
                Total Distribusi Efektif
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                  {totalEffective.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-[#c9a227]">Penerima</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">12 Sekolah + 1 Posyandu</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              </div>
            </div>
          </div>

          {/* Date Selector Navigation Strip */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-[#a8d8f0] uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 mr-1">
                <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                Pilih Arsip Tanggal:
              </span>
              {menuHistory.map((m) => (
                <button
                  key={m.date}
                  onClick={() => setSelectedDate(m.date)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedDate === m.date
                      ? 'bg-[#c9a227] text-[#0b1e3a] font-extrabold shadow-md'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                  }`}
                >
                  {m.date} (Menu #{m.menuNumber})
                </button>
              ))}
            </div>

            <div className="text-xs text-[#a5cdf9] font-medium">
              Status Rilis: <strong className="text-white">{currentMenu.publishedAt}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Navigation Tabs (SPPG Clean Style) */}
      <div className="bg-white border-b border-[#cfe4fc] shadow-2xs sticky top-18 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex space-x-1 sm:space-x-6 overflow-x-auto">
          {[
            { id: 'akg' as const, label: 'Kandungan Gizi (AKG)', icon: Flame },
            { id: 'menu' as const, label: 'Komposisi Menu Harian', icon: Utensils },
            { id: 'dokumentasi' as const, label: 'Dokumentasi Dapur 3 Tahap', icon: Camera },
            { id: 'penerima' as const, label: 'Daftar Sekolah & Posyandu (1.555)', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#1759ab] text-[#1759ab]'
                    : 'border-transparent text-slate-500 hover:text-[#0b1e3a] hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1759ab]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Body */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 space-y-8">
        {/* TAB 1: KANDUNGAN GIZI (AKG) — Formal SPPG Cards */}
        {activeTab === 'akg' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cfe4fc]/80 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0b1e3a]">
                  Angka Kandungan Gizi (AKG) Harian
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Rincian takaran gizi terstandarisasi untuk 5 kelompok sasaran penerima manfaat SPPG Wonodri 3.
                </p>
              </div>

              <div className="gold-badge px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8a6d1d]" />
                <span>Pedoman Standar Gizi Seimbang BGN</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentMenu.nutritionCards.map((card, idx) => {
                const Icon = getGroupIcon(card.groupName);
                return (
                  <div
                    key={idx}
                    className="sppg-card rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Top */}
                      <div className="p-5 bg-gradient-to-r from-[#e8f2fe] to-[#f4f9ff] border-b border-[#cfe4fc] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#1759ab] text-white flex items-center justify-center shadow-xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#1759ab] uppercase tracking-wider block">
                              Porsi {card.groupName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold block">
                              {card.portionBadge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body Target Group */}
                      <div className="p-5 space-y-4">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#0b1e3a] leading-snug min-h-[40px]">
                          {card.targetCategory}
                        </h3>

                        {/* Energi Hero Metric */}
                        <div className="p-3.5 rounded-xl bg-[#0b1e3a] text-white flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#c9a227]">
                              <Flame className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[11px] text-[#a5cdf9] font-bold uppercase tracking-wider block leading-none">
                                Energi Total
                              </span>
                              <span className="text-[10px] text-slate-300">Kalori Porsi</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                              {card.energyKcal.toFixed(1)}
                            </span>
                            <span className="text-xs font-bold text-[#c9a227] ml-1">Kkal</span>
                          </div>
                        </div>

                        {/* 4 Makronutrien Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Protein</span>
                              <Dna className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.proteinG.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Hewani & Nabati</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Lemak</span>
                              <Beef className="w-3 h-3 text-rose-600" />
                            </div>
                            <span className="text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.fatG.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Lemak Total</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Karbo</span>
                              <Compass className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.carbsG.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Energi Pokok</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="flex items-center justify-between text-slate-500 mb-1">
                              <span className="text-[10px] font-bold uppercase">Serat</span>
                              <Leaf className="w-3 h-3 text-teal-600" />
                            </div>
                            <span className="text-sm font-black text-[#0d1b2e] block tabular-nums">
                              {card.fiberG.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">g</span>
                            </span>
                            <span className="text-[9px] text-slate-400">Sayur & Buah</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-[#cfe4fc] text-center text-[10px] font-bold text-[#1759ab] tracking-wider uppercase">
                      ✦ SPPG WONODRI 3 • MAKANAN BERGIZI GRATIS ✦
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MENU COMPOSITION */}
        {activeTab === 'menu' && (
          <div className="sppg-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#cfe4fc] pb-4">
              <span className="text-xs font-extrabold uppercase text-[#1759ab] tracking-wider">
                Menu Terverifikasi • Nomor Urut #{currentMenu.menuNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0b1e3a] mt-1">
                {currentMenu.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tanggal: <strong>{currentMenu.date}</strong> | Dapur Produksi: <strong>Jl. Erlangga Raya No 38, Pleburan</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Sumber Karbohidrat Pokok', val: currentMenu.components.karbohidrat, tag: 'Beras Pulen Lokal Berkualitas' },
                { label: 'Lauk Hewani', val: currentMenu.components.laukHewani, tag: 'Protein Daging / Ayam Segar' },
                { label: 'Lauk Nabati', val: currentMenu.components.laukNabati, tag: 'Tahu / Tempe Tradisional Higienis' },
                { label: 'Sayuran Hijau & Serat', val: currentMenu.components.sayur, tag: 'Sayuran Segar Kaya Vitamin' },
                { label: 'Buah Segar Pencuci Mulut', val: currentMenu.components.buah, tag: 'Buah Pilihan Kaya Antioksidan' },
                { label: 'Pelengkap Susu', val: currentMenu.components.pelengkap || 'Susu Pasteurisasi', tag: 'Kalsium & Vitamin D' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {item.label}
                    </span>
                    <p className="font-extrabold text-sm sm:text-base text-[#0b1e3a] leading-snug">
                      {item.val}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#1759ab] mt-3 block">
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
              Dokumentasi dapur 3 tahap wajib memastikan higienitas pengolahan makanan bergizi sebelum tiba di sekolah.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  step: 'Persiapan',
                  title: 'Sortasi Bahan Baku & Higienitas Dapur',
                  desc: 'Pembersihan dan sortasi higienis bahan baku di dapur persiapan SPPG Wonodri 3.',
                  image: '/about-kitchen.jpg',
                  time: '04:00 - 05:30 WIB',
                },
                {
                  step: 'Pengolahan',
                  title: 'Proses Pemasakan Standar Suhu Tinggi',
                  desc: 'Pengolahan makanan hangat menggunakan peralatan stainless steel berstandar BGN.',
                  image: '/hero-kitchen.jpg',
                  time: '05:30 - 07:15 WIB',
                },
                {
                  step: 'Pengemasan',
                  title: 'Plating Porsi & Segel Wadah Thermal',
                  desc: 'Pengecekan gramasi tiap kelompok penerima dan penyegelan box siap kirim.',
                  image: '/gallery-1.jpg',
                  time: '07:15 - 08:30 WIB',
                },
              ].map((p, idx) => (
                <div key={idx} className="sppg-card rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full bg-slate-100">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#0b1e3a]/90 text-white shadow-xs">
                          {p.step}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#1759ab] text-white shadow-xs">
                          {p.time}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-extrabold text-base text-[#0b1e3a] leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border-t border-[#cfe4fc] flex items-center justify-between text-xs text-slate-500 font-semibold">
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
                Data Master: <strong>1.555 Penerima</strong> (12 Sekolah + 1 Posyandu Wilayah Semarang Selatan)
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama sekolah / posyandu..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs border border-[#cfe4fc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1759ab]"
                />
              </div>
            </div>

            <div className="sppg-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#e8f2fe] border-b border-[#cfe4fc] text-[#0b1e3a] font-extrabold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">No</th>
                      <th className="py-3.5 px-4 sm:px-6">Nama Lembaga Penerima</th>
                      <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Master Kuota</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Distribusi Hari Ini</th>
                      <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfe4fc]/60">
                    {filteredSites.map((site, index) => (
                      <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="font-extrabold text-[#0b1e3a] block text-xs sm:text-sm">
                            {site.name}
                          </span>
                          {site.isOverride && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5 inline-block">
                              {site.overrideReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                              site.type === 'SD'
                                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                : site.type === 'TK'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {site.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-600">
                          {site.masterCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-black text-[#0b1e3a]">
                          {site.effectiveCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Distribusi Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#e8f2fe] border-t-2 border-[#cfe4fc] font-black text-[#0b1e3a] text-xs sm:text-sm">
                    <tr>
                      <td colSpan={3} className="py-4 px-4 sm:px-6">
                        TOTAL PENERIMA MANFAAT
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-[#1759ab] text-sm sm:text-base font-black">
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

      {/* 5. Footer Resmi SPPG Wonodri 3 */}
      <footer className="mt-auto py-10 px-4 sm:px-6 bg-[#0b1e3a] text-white border-t border-[#174a8a]/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo BGN SPPG Wonodri 3"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-white block text-sm">
                SPPG Wonodri 3 Kota Semarang
              </span>
              <p className="text-[11px] text-[#a5cdf9]">
                Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.sppgwonodri3.web.id/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c9a227] hover:text-[#e8d5a3] flex items-center gap-1 font-bold"
            >
              <span>Lihat Portofolio Lengkap</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="text-slate-400 font-medium">Built by CilokTech Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
