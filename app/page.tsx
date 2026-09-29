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
  ShieldCheck,
  Info,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [activeTab, setActiveTab] = useState<'menu' | 'akg' | 'dokumentasi' | 'penerima'>('menu');
  const [searchSite, setSearchSite] = useState<string>('');

  // Menu yang sedang aktif dipilih
  const currentMenu = menuHistory.find((m) => m.date === selectedDate) || menuHistory[0];

  // Hitung total penerima master
  const totalMaster = INITIAL_BENEFICIARIES.reduce((acc, site) => acc + site.masterCount, 0);

  // Filter penerima bila ada override di tanggal ini
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar / Branding */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              W3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                  SPPG WONODRI 3
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Transparansi MBG
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Arsip Operasional Resmi & Angka Kandungan Gizi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Tim Teknis / Sync Sheet</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Quick Banner */}
      <section className="bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Unit Pelayanan Pemenuhan Gizi (SPPG) Terverifikasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Arsip Operasional SPPG Wonodri 3
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                Portal keterbukaan data menu harian, kandungan gizi (AKG), dokumentasi higienitas dapur
                (persiapan, pengolahan, pengemasan), serta jangkauan penerima manfaat Kota Semarang.
              </p>
            </div>

            {/* Quick Stats Widget */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700">
              <div className="border-r border-slate-700/60 pr-3">
                <span className="text-xs text-slate-400 block font-medium">Baseline Penerima</span>
                <span className="text-xl sm:text-2xl font-black text-white">{totalMaster.toLocaleString('id-ID')}</span>
                <span className="text-[11px] text-emerald-400 block mt-0.5">12 Sekolah + 1 Posyandu</span>
              </div>
              <div className="border-r border-slate-700/60 pr-3">
                <span className="text-xs text-slate-400 block font-medium">Distribusi Hari Ini</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">{totalEffective.toLocaleString('id-ID')}</span>
                <span className="text-[11px] text-slate-300 block mt-0.5">Porsi Terverifikasi</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-400 block font-medium">Status Menu #{currentMenu.menuNumber}</span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-teal-300 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Published
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{currentMenu.publishedAt}</span>
              </div>
            </div>
          </div>

          {/* Date Selector Navigation */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1.5 mr-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Pilih Arsip Tanggal:
            </span>
            {menuHistory.map((menu) => (
              <button
                key={menu.date}
                onClick={() => setSelectedDate(menu.date)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedDate === menu.date
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>Menu #{menu.menuNumber}</span>
                <span className="text-xs opacity-80">({menu.date})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tab Controller */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-8">
          {[
            { id: 'menu' as const, label: 'Komposisi Menu', icon: Utensils },
            { id: 'akg' as const, label: 'Angka Kandungan Gizi (AKG)', icon: Layers },
            { id: 'dokumentasi' as const, label: 'Dokumentasi Proses', icon: Camera },
            { id: 'penerima' as const, label: 'Penerima Manfaat (Sekolah & Posyandu)', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* TAB 1: MENU COMPOSITION */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <span>Menu Distribusi Harian</span>
                    <span>•</span>
                    <span>Nomor Menu #{currentMenu.menuNumber}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentMenu.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tanggal Layanan: <strong className="text-slate-700">{currentMenu.date}</strong> | Diterbitkan:{' '}
                    <span className="text-emerald-700 font-medium">{currentMenu.publishedAt}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-center">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Higienitas & Kalori Sesuai Standar BGN</span>
                  </div>
                </div>
              </div>

              {/* 6 Komponen Gizi Seimbang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Sumber Karbohidrat',
                    val: currentMenu.components.karbohidrat,
                    badge: 'Energi Pokok',
                    color: 'amber',
                  },
                  {
                    label: 'Lauk Hewani',
                    val: currentMenu.components.laukHewani,
                    badge: 'Protein Tinggi',
                    color: 'rose',
                  },
                  {
                    label: 'Lauk Nabati',
                    val: currentMenu.components.laukNabati,
                    badge: 'Protein & Mineral',
                    color: 'indigo',
                  },
                  {
                    label: 'Sayuran Hijau / Serat',
                    val: currentMenu.components.sayur,
                    badge: 'Vitamin & Serat',
                    color: 'emerald',
                  },
                  {
                    label: 'Buah Segar',
                    val: currentMenu.components.buah,
                    badge: 'Mikronutrien Alami',
                    color: 'orange',
                  },
                  {
                    label: 'Pelengkap Tambahan',
                    val: currentMenu.components.pelengkap || 'Susu Pasteurisasi',
                    badge: 'Kalsium & D3',
                    color: 'sky',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <p className="font-extrabold text-slate-900 text-base leading-snug">
                        {item.val}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Quick Link to AKG */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-lg">Ingin melihat rincian gramasi kalori & nutrisi makro?</h3>
                <p className="text-xs text-emerald-100">
                  Data kandungan gizi dihitung per kategori porsi: PAUD/TK, SD 4-6/SMP, Balita, Busui, dan Bumil.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('akg')}
                className="px-4 py-2 bg-white text-emerald-800 text-xs font-extrabold rounded-xl hover:bg-emerald-50 transition-colors shadow-xs whitespace-nowrap"
              >
                Buka Tab AKG Sekarang →
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AKG (ANGKA KANDUNGAN GIZI) */}
        {activeTab === 'akg' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Tabel Angka Kandungan Gizi (AKG)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Rincian gizi resmi untuk tanggal <strong className="text-slate-800">{currentMenu.date}</strong> (Menu #{currentMenu.menuNumber}).
                </p>
              </div>

              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Format kartu seragam sesuai standar rujukan gizi Martajasah / BGN</span>
              </div>
            </div>

            {/* AKG Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMenu.nutritionCards.map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-6 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-black tracking-wider uppercase bg-emerald-600 text-white rounded-md">
                        {card.groupName}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {card.portionBadge}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 mt-2">
                      {card.targetCategory}
                    </h3>
                  </div>

                  {/* Nilai Gizi List */}
                  <div className="p-6 space-y-4">
                    {/* Energi Card */}
                    <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block">Energi Total</span>
                        <span className="text-[11px] text-emerald-600">Kalori Porsi</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-emerald-950">
                          {card.energyKcal.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 ml-1">Kkal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Protein */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block">Protein</span>
                        <span className="text-[10px] text-slate-400 block mb-1">Hewani & Nabati</span>
                        <div className="font-black text-base text-slate-900">
                          {card.proteinG.toFixed(2)} <span className="text-xs font-semibold text-slate-500">g</span>
                        </div>
                      </div>

                      {/* Lemak */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block">Lemak</span>
                        <span className="text-[10px] text-slate-400 block mb-1">Lemak Total</span>
                        <div className="font-black text-base text-slate-900">
                          {card.fatG.toFixed(2)} <span className="text-xs font-semibold text-slate-500">g</span>
                        </div>
                      </div>

                      {/* Karbohidrat */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block">Karbohidrat</span>
                        <span className="text-[10px] text-slate-400 block mb-1">Energi Pokok</span>
                        <div className="font-black text-base text-slate-900">
                          {card.carbsG.toFixed(2)} <span className="text-xs font-semibold text-slate-500">g</span>
                        </div>
                      </div>

                      {/* Serat */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-500 font-medium block">Serat Pangan</span>
                        <span className="text-[10px] text-slate-400 block mb-1">Sayur & Buah</span>
                        <div className="font-black text-base text-slate-900">
                          {card.fiberG.toFixed(2)} <span className="text-xs font-semibold text-slate-500">g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
                    ✦ SPPG WONODRI 3 • MAKANAN BERGIZI GRATIS ✦
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOKUMENTASI PROSES (PERSIAPAN, PENGOLAHAN, PENGEMASAN) */}
        {activeTab === 'dokumentasi' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Dokumentasi Dapur & Pengolahan Harian
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Transparansi 3 tahap wajib: Persiapan, Pengolahan, dan Pengemasan sebelum distribusi.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
                Tanggal: {currentMenu.date}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentMenu.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                          {photo.step}
                        </span>
                      </div>
                      {photo.timeEstimate && (
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-600 text-white">
                            {photo.timeEstimate}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-2">
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                        {photo.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">SOP SPPG Wonodri 3</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PENERIMA MANFAAT */}
        {activeTab === 'penerima' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Daftar Sekolah & Posyandu Penerima Manfaat
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Baseline resmi: <strong className="text-slate-900">1.555 Penerima</strong> (12 Sekolah + 1 Posyandu) di wilayah pelayanan SPPG Wonodri 3.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama sekolah / posyandu..."
                  value={searchSite}
                  onChange={(e) => setSearchSite(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">No</th>
                      <th className="py-3.5 px-4 sm:px-6">Nama Lembaga Penerima</th>
                      <th className="py-3.5 px-4 sm:px-6">Kategori</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Master Penerima</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Distribusi Hari Ini</th>
                      <th className="py-3.5 px-4 sm:px-6 text-center">Status Layanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSites.map((site, index) => (
                      <tr key={site.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span className="font-extrabold text-slate-900 block text-sm">
                            {site.name}
                          </span>
                          {site.isOverride && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                              Catatan: {site.overrideReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              site.type === 'SD'
                                ? 'bg-blue-100 text-blue-800'
                                : site.type === 'TK'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {site.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-600">
                          {site.masterCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right font-black text-slate-900 text-sm">
                          {site.effectiveCount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          {site.isOverride && site.overrideCondition === 'libur' ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full">
                              Libur Sekolah
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                              Distribusi Aktif
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-900 text-sm">
                    <tr>
                      <td colSpan={3} className="py-4 px-4 sm:px-6">
                        TOTAL AKUMULASI PENERIMA
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-slate-600">
                        {totalMaster.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right text-emerald-700 text-base font-black">
                        {totalEffective.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
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

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-white border-t border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-extrabold text-sm text-white block">
              SPPG WONODRI 3 • ARSIP OPERASIONAL RESMI
            </span>
            <p>
              Mendukung Program Makan Bergizi Gratis (MBG) Nasional di Kota Semarang.
            </p>
            <p className="text-[11px] text-slate-500">
              Dokumentasi menu, takaran gizi (AKG), serta verifikasi penerima manfaat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="https://www.sppgwonodri3.web.id/portfolio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
            >
              <span>Lihat Profil Unit SPPG Wonodri 3</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-500">Built by CilokTech Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
