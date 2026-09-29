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
  Sparkles,
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

  // CilokTech Signature Minimalist Color Palettes for Nutrition Groups
  const getGroupConfig = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case 'besar':
        return {
          icon: GraduationCap,
          colorBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          accentBorder: 'border-l-4 border-l-emerald-600',
          metricBg: 'bg-emerald-500/5',
        };
      case 'kecil':
        return {
          icon: Baby,
          colorBadge: 'bg-teal-50 text-teal-800 border-teal-200',
          accentBorder: 'border-l-4 border-l-teal-600',
          metricBg: 'bg-teal-500/5',
        };
      case 'balita':
        return {
          icon: Heart,
          colorBadge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
          accentBorder: 'border-l-4 border-l-cyan-600',
          metricBg: 'bg-cyan-500/5',
        };
      case 'busui':
        return {
          icon: HeartHandshake,
          colorBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          accentBorder: 'border-l-4 border-l-indigo-600',
          metricBg: 'bg-indigo-500/5',
        };
      case 'bumil':
      default:
        return {
          icon: ShieldCheck,
          colorBadge: 'bg-slate-100 text-slate-800 border-slate-300',
          accentBorder: 'border-l-4 border-l-slate-700',
          metricBg: 'bg-slate-500/5',
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. CilokTech Studio Header: Clean, Typography-Driven, Professional */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              W3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  SPPG Wonodri 3
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  Arsip Operasional
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Unit Pelayanan Pemenuhan Gizi • Kota Semarang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tim Teknis</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Headline & Overview Banner */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparansi MBG Harian Resmi</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Menu & Angka Kandungan Gizi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Dokumentasi menu harian, verifikasi gramasi gizi makro-mikro, dokumentasi proses dapur,
                serta pencatatan distribusi untuk 12 sekolah dan 1 posyandu.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Penerima
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">
                    {totalEffective.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Porsi</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  12 Sekolah + 1 Posyandu
                </span>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Status Distribusi
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-black text-slate-900">Terverifikasi</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Menu #{currentMenu.menuNumber} • {currentMenu.date}
                </span>
              </div>
            </div>
          </div>

          {/* Date Selector Navigation Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Arsip:
              </span>
              {menuHistory.map((m) => (
                <button
                  key={m.date}
                  onClick={() => setSelectedDate(m.date)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    selectedDate === m.date
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {m.date} (Menu #{m.menuNumber})
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Dipublikasikan: <span className="font-semibold text-slate-800">{currentMenu.publishedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Modern Bento Tabs */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { id: 'akg' as const, label: 'Kandungan Gizi (AKG)', icon: Flame },
            { id: 'menu' as const, label: 'Komposisi Menu', icon: Utensils },
            { id: 'dokumentasi' as const, label: 'Dokumentasi Dapur', icon: Camera },
            { id: 'penerima' as const, label: 'Daftar Penerima Manfaat', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* TAB 1: KANDUNGAN GIZI (AKG) — Modern Clean Bento Cards */}
        {activeTab === 'akg' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Menampilkan standar gramasi gizi untuk 5 kategori penerima manfaat.</span>
              <span className="hidden sm:inline text-slate-400">Rujukan Gizi: Standar Porsi MBG</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentMenu.nutritionCards.map((card, idx) => {
                const config = getGroupConfig(card.groupName);
                const CardIcon = config.icon;

                return (
                  <div
                    key={idx}
                    className={`bento-card rounded-xl p-4 sm:p-5 ${config.accentBorder} flex flex-col md:flex-row md:items-center justify-between gap-5`}
                  >
                    {/* Left: Category Label & Portion Description */}
                    <div className="md:w-1/3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider border ${config.colorBadge}`}>
                          {card.groupName}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {card.portionBadge}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                        {card.targetCategory}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Ditakar sesuai indeks kebutuhan metabolisme harian penerima manfaat.
                      </p>
                    </div>

                    {/* Right: Modern Crisp Metrics Grid */}
                    <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                      {/* Energi Total */}
                      <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-orange-50/80 border border-orange-200/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-orange-900">
                          <span className="text-[10px] font-extrabold uppercase">Energi</span>
                          <Flame className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-lg font-black text-orange-950 block tabular-nums leading-none">
                            {card.energyKcal.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold text-orange-700">Kkal</span>
                        </div>
                      </div>

                      {/* Protein */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-extrabold uppercase">Protein</span>
                          <Dna className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-base font-black text-slate-900 block tabular-nums leading-none">
                            {card.proteinG.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">gram</span>
                        </div>
                      </div>

                      {/* Lemak */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-extrabold uppercase">Lemak</span>
                          <Beef className="w-3.5 h-3.5 text-rose-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-base font-black text-slate-900 block tabular-nums leading-none">
                            {card.fatG.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">gram</span>
                        </div>
                      </div>

                      {/* Karbohidrat */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-extrabold uppercase">Karbo</span>
                          <Compass className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-base font-black text-slate-900 block tabular-nums leading-none">
                            {card.carbsG.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">gram</span>
                        </div>
                      </div>

                      {/* Serat */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-[10px] font-extrabold uppercase">Serat</span>
                          <Leaf className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                        <div className="mt-2">
                          <span className="text-base font-black text-slate-900 block tabular-nums leading-none">
                            {card.fiberG.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">gram</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: KOMPOSISI MENU */}
        {activeTab === 'menu' && (
          <div className="bento-card rounded-xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-extrabold uppercase text-emerald-700 tracking-wider">
                Menu Terverifikasi • Nomor #{currentMenu.menuNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {currentMenu.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Karbohidrat Utama', val: currentMenu.components.karbohidrat, tag: 'Beras Pulen Lokal' },
                { label: 'Lauk Hewani', val: currentMenu.components.laukHewani, tag: 'Sumber Protein Utama' },
                { label: 'Lauk Nabati', val: currentMenu.components.laukNabati, tag: 'Protein Nabati Gurih' },
                { label: 'Sayuran & Serat', val: currentMenu.components.sayur, tag: 'Vitamin & Serat Alami' },
                { label: 'Buah Segar', val: currentMenu.components.buah, tag: 'Mikronutrien Segar' },
                { label: 'Pelengkap Tambahan', val: currentMenu.components.pelengkap || 'Susu Pasteurisasi', tag: 'Kalsium & Nutrisi Mikro' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {item.label}
                    </span>
                    <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {item.val}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-3 block">
                    ✦ {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOKUMENTASI DAPUR (3 TAHAP) */}
        {activeTab === 'dokumentasi' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-medium">
              Dokumentasi dapur wajib memenuhi standar higienitas sebelum makanan didistribusikan.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentMenu.photos.map((photo, idx) => (
                <div key={idx} className="bento-card rounded-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-900/90 text-white shadow-xs">
                          {photo.step}
                        </span>
                      </div>
                      {photo.timeEstimate && (
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-700 text-white shadow-xs">
                            {photo.timeEstimate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>SOP Dapur Wonodri 3</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sesuai Standar
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
                Data Master: <strong>1.555 Penerima</strong> (12 Sekolah + 1 Posyandu)
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari sekolah / posyandu..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bento-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
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
                      <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 block text-xs sm:text-sm">
                            {site.name}
                          </span>
                          {site.isOverride && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5 inline-block">
                              {site.overrideReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              site.type === 'SD'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : site.type === 'TK'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
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
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-900 text-xs sm:text-sm">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4">
                        TOTAL PENERIMA MANFAAT
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-700 text-sm sm:text-base font-black">
                        {totalEffective.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[10px] text-slate-500 font-semibold">
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

      {/* 5. Footer Clean CilokTech Style */}
      <footer className="mt-auto py-8 px-4 sm:px-6 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <span className="font-extrabold text-slate-900 block text-xs">
              SPPG WONODRI 3 • ARSIP OPERASIONAL MBG
            </span>
            <span>Mendukung Pemenuhan Gizi Nasional Anak Indonesia di Kota Semarang</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://www.sppgwonodri3.web.id/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 flex items-center gap-1 font-bold text-slate-700"
            >
              <span>Profil Unit SPPG</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span className="font-medium text-slate-400">Built by CilokTech Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
