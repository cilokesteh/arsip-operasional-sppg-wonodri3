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
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Search,
  Flame,
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-01');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [searchBeneficiary, setSearchBeneficiary] = useState<string>('');

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

  const filteredBeneficiaries = INITIAL_BENEFICIARIES.filter((b) =>
    b.name.toLowerCase().includes(searchBeneficiary.toLowerCase())
  );

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
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col font-sans w-full overflow-x-hidden">
      {/* 1. Top Bar Navigasi Sistem (Mobile Friendly) */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight tracking-tight truncate">
                SPPG Wonodri 3
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate">
                Laporan Harian MBG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">{selectedDate}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] sm:text-xs">Cetak</span>
            </button>
            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Panel Operator"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DOKUMEN LAPORAN RESMI (RESPONSIF MOBILE & DESKTOP) */}
      <main className="max-w-5xl mx-auto w-full px-2.5 sm:px-6 py-4 sm:py-8 flex-1">
        <div className="report-sheet bg-white rounded-xl border border-slate-300 shadow-sm p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-7">
          
          {/* KOP RESMI LAPORAN */}
          <div className="border-b-2 border-slate-800 pb-4 sm:pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <Image
                  src="/logo.png"
                  alt="Logo BGN"
                  width={48}
                  height={48}
                  className="object-contain shrink-0 mt-0.5 w-10 h-10 sm:w-14 sm:h-14"
                  priority
                />
                <div className="space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Badan Gizi Nasional (BGN) Republik Indonesia
                  </span>
                  <h1 className="text-sm sm:text-lg md:text-xl font-black uppercase text-slate-900 tracking-tight leading-snug">
                    SPPG Wonodri 3 Kota Semarang
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-tight">
                    Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    Program Makan Bergizi Gratis (MBG) • Semarang Selatan
                  </p>
                </div>
              </div>

              {/* Status Dokumen Metadata */}
              <div className="bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:text-right border sm:border-0 border-slate-200 text-xs text-slate-600 shrink-0 space-y-1">
                <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                  Laporan Operasional Resmi
                </div>
                <div className="text-[11px] sm:text-xs">Tanggal: <strong className="text-slate-900">{currentMenu.date}</strong></div>
                <div className="text-[11px] sm:text-xs">Alokasi: <strong className="text-slate-900">{totalMaster} Porsi (100%)</strong></div>
              </div>
            </div>
          </div>

          {/* I. INFORMASI MENU & KOMPOSISI MAKANAN */}
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                I. Menu Harian & Komposisi Porsi
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold">Menu #{currentMenu.menuNumber || 1}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
              {/* Foto Porsi Makanan Sajian */}
              <div className="md:col-span-4 relative h-48 sm:h-56 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                  alt={currentMenu.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                  Sajian {currentMenu.date}
                </div>
              </div>

              {/* Rincian Menu & 5 Komponen */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Nama Menu:</span>
                  <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 leading-snug">
                    {currentMenu.title}
                  </h3>
                </div>

                {/* 5 Komponen: List Card di Mobile, Table di Tablet/Desktop */}
                <div className="grid grid-cols-1 sm:hidden gap-1.5 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-600">Karbohidrat:</span>
                    <span className="font-extrabold text-slate-900 text-right">{currentMenu.components.karbohidrat}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-600">Lauk Hewani:</span>
                    <span className="font-extrabold text-slate-900 text-right">{currentMenu.components.laukHewani}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-600">Lauk Nabati:</span>
                    <span className="font-extrabold text-slate-900 text-right">{currentMenu.components.laukNabati}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-600">Sayuran:</span>
                    <span className="font-extrabold text-slate-900 text-right">{currentMenu.components.sayur}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-600">Buah Segar:</span>
                    <span className="font-extrabold text-slate-900 text-right">{currentMenu.components.buah}</span>
                  </div>
                </div>

                {/* Table Komponen (Tablet/Desktop/Print) */}
                <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3 w-1/3">Komponen Bahan</th>
                        <th className="py-2 px-3">Uraian Masakan</th>
                        <th className="py-2 px-3 w-28 text-center">Fungsi Gizi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-slate-700">1. Karbohidrat</td>
                        <td className="py-1.5 px-3 text-slate-900 font-medium">{currentMenu.components.karbohidrat}</td>
                        <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Sumber Energi</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-slate-700">2. Lauk Hewani</td>
                        <td className="py-1.5 px-3 text-slate-900 font-medium">{currentMenu.components.laukHewani}</td>
                        <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Protein Hewani</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-slate-700">3. Lauk Nabati</td>
                        <td className="py-1.5 px-3 text-slate-900 font-medium">{currentMenu.components.laukNabati}</td>
                        <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Protein Nabati</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-slate-700">4. Sayuran</td>
                        <td className="py-1.5 px-3 text-slate-900 font-medium">{currentMenu.components.sayur}</td>
                        <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Serat & Vitamin</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-3 font-bold text-slate-700">5. Buah Segar</td>
                        <td className="py-1.5 px-3 text-slate-900 font-medium">{currentMenu.components.buah}</td>
                        <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Mikronutrien</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* II. URAIAN PEKERJAAN OPERASIONAL & DISTRIBUSI */}
          <section className="space-y-2">
            <div className="border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                II. Uraian Pekerjaan Operasional & Distribusi
              </h2>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
              {currentMenu.uraianPekerjaan || (
                '1. Pembersihan dan sterilisasi dapur operasional mulai pukul 04:00 WIB.\n2. Sortasi sayur dan bahan baku segar dari petani lokal.\n3. Pengolahan masakan dengan suhu inti di atas 85°C untuk menjamin keamanan pangan.\n4. Penataan porsi makanan hangat sesuai gramasi standar BGN.\n5. Penyegelan kotak makanan dan keberangkatan armada distribusi pukul 08:30 WIB ke 12 sekolah dan 1 posyandu.'
              )}
            </div>
          </section>

          {/* III. TABEL STANDAR ANGKA KANDUNGAN GIZI (AKG) — RESPONSIF MOBILE */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                III. Verifikasi Angka Kandungan Gizi (AKG)
              </h2>
              <span className="text-[10px] text-slate-500">Standar BGN</span>
            </div>

            {/* Mobile View: Kartu Ringkas Gizi per Kelompok (Sangat Enak Dibaca di HP) */}
            <div className="grid grid-cols-1 gap-2.5 sm:hidden">
              {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-blue-900 block">Porsi {item.groupName}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{item.targetCategory}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-orange-950 block tabular-nums">
                        {item.energyKcal.toFixed(1)} <span className="text-[10px] text-orange-700 font-bold">Kkal</span>
                      </span>
                    </div>
                  </div>

                  {/* 4 Komponen Makro 4 Kotak Kecil */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1 border-t border-slate-200/80">
                    <div className="p-1 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[9px]">Protein</span>
                      <span className="font-extrabold text-slate-900">{item.proteinG.toFixed(1)}g</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[9px]">Lemak</span>
                      <span className="font-extrabold text-slate-900">{item.fatG.toFixed(1)}g</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[9px]">Karbo</span>
                      <span className="font-extrabold text-slate-900">{item.carbsG.toFixed(1)}g</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 block text-[9px]">Serat</span>
                      <span className="font-extrabold text-slate-900">{item.fiberG.toFixed(1)}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (sm ke atas & Print) */}
            <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Kelompok</th>
                    <th className="py-2.5 px-3">Sasaran Penerima</th>
                    <th className="py-2.5 px-3 text-right">Energi</th>
                    <th className="py-2.5 px-3 text-right">Protein</th>
                    <th className="py-2.5 px-3 text-right">Lemak</th>
                    <th className="py-2.5 px-3 text-right">Karbohidrat</th>
                    <th className="py-2.5 px-3 text-right">Serat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-extrabold text-blue-900 bg-slate-50/50">
                        {item.groupName}
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {item.targetCategory}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900 tabular-nums">
                        {item.energyKcal.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">Kkal</span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">{item.proteinG.toFixed(1)} g</td>
                      <td className="py-2 px-3 text-right tabular-nums">{item.fatG.toFixed(1)} g</td>
                      <td className="py-2 px-3 text-right tabular-nums">{item.carbsG.toFixed(1)} g</td>
                      <td className="py-2 px-3 text-right tabular-nums">{item.fiberG.toFixed(1)} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* IV. DOKUMENTASI PROSES DAPUR 3 TAHAP */}
          <section className="space-y-2">
            <div className="border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                IV. Dokumentasi Higienitas Dapur (3 Tahap Wajib)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentMenu.photos.map((p, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="relative h-36 sm:h-32 w-full bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-black uppercase">
                      {p.step}
                    </div>
                  </div>
                  <div className="p-2.5 space-y-0.5">
                    <span className="font-extrabold text-xs text-slate-900 block truncate">{p.title}</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">{p.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* V. DATA PENERIMA MANFAAT (RESPONSIF MOBILE) */}
          <section className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                V. Alokasi Penerima Manfaat ({totalMaster} Porsi)
              </h2>
              <div className="relative w-full sm:w-56 no-print">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  value={searchBeneficiary}
                  onChange={(e) => setSearchBeneficiary(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 text-[11px] border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            {/* Mobile View: List Card Sekolah */}
            <div className="grid grid-cols-1 gap-1.5 sm:hidden text-xs">
              {filteredBeneficiaries.map((site, index) => (
                <div key={site.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="font-extrabold text-slate-900 block truncate text-xs">
                      {index + 1}. {site.name}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">
                      Kategori {site.type}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-blue-900 text-xs block tabular-nums">
                      {site.masterCount} Porsi
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">Tersalurkan</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3 w-10">No</th>
                    <th className="py-2 px-3">Nama Lembaga Sekolah / Posyandu</th>
                    <th className="py-2 px-3 w-28">Kategori</th>
                    <th className="py-2 px-3 w-32 text-right">Alokasi Porsi</th>
                    <th className="py-2 px-3 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBeneficiaries.map((site, index) => (
                    <tr key={site.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-400 font-semibold">{index + 1}</td>
                      <td className="py-1.5 px-3 font-extrabold text-slate-900">{site.name}</td>
                      <td className="py-1.5 px-3">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {site.type}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-right font-black text-slate-900 tabular-nums">
                        {site.masterCount}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="text-[10px] font-bold text-emerald-700">Tersalurkan</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3">
                      TOTAL AKUMULASI DISTRIBUSI HARIAN
                    </td>
                    <td className="py-2.5 px-3 text-right text-sm font-black text-blue-900 tabular-nums">
                      {totalMaster} Porsi
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-800 font-extrabold text-[10px]">
                      100% LENGKAP
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* TANDA TANGAN / PENGESAHAN DOKUMEN RESMI (3 PIHAK) */}
          <div className="pt-6 sm:pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-center text-xs text-slate-700">
            <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
              <p className="font-semibold text-slate-500 text-[11px]">Penanggung Jawab Gizi</p>
              <div className="h-10 sm:h-16" />
              <p className="font-black text-slate-900 underline text-xs">Tim Ahli Gizi SPPG</p>
              <p className="text-[10px] text-slate-500">SPPG Wonodri 3 Kota Semarang</p>
            </div>
            <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
              <p className="font-semibold text-slate-500 text-[11px]">Kepala Dapur Operasional</p>
              <div className="h-10 sm:h-16" />
              <p className="font-black text-slate-900 underline text-xs">Koordinator Produksi</p>
              <p className="text-[10px] text-slate-500">Dapur MBG Wonodri 3</p>
            </div>
            <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
              <p className="font-semibold text-slate-500 text-[11px]">Mengetahui & Menyetujui</p>
              <div className="h-10 sm:h-16" />
              <p className="font-black text-slate-900 underline text-xs">Ka. SPPG Wonodri 3</p>
              <p className="text-[10px] text-slate-500">Kepala Satuan Pelayanan</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Kalender */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xs w-full p-4 space-y-3">
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
                <button onClick={() => setShowCalendarModal(false)} className="p-1 rounded hover:bg-slate-100 cursor-pointer ml-1">
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
                    disabled={!hasMenu}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowCalendarModal(false);
                    }}
                    className={`h-8 rounded text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : hasMenu
                        ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 cursor-pointer font-black'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 border-t border-slate-200 bg-white no-print">
        Dokumen Pengawasan Program MBG • SPPG Wonodri 3 Kota Semarang
      </footer>
    </div>
  );
}
