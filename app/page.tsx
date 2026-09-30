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
  CheckCircle2,
  FileText,
  Building2,
  ShieldCheck,
  Search,
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
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col font-sans">
      {/* 1. Top Bar Navigasi Sistem */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
              <Image src="/logo.png" alt="Logo BGN" width={24} height={24} className="object-contain" priority />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-white block leading-tight tracking-tight">
                Sistem Informasi & Arsip Operasional MBG
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                SPPG Wonodri 3 • Badan Gizi Nasional
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Arsip: {selectedDate}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
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

      {/* 2. DOKUMEN LAPORAN RESMI (STANDARD OPERATIONAL REPORT) */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="report-sheet bg-white rounded-xl border border-slate-300 shadow-sm p-6 sm:p-10 space-y-7">
          {/* KOP RESMI LAPORAN */}
          <div className="border-b-2 border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <Image
                  src="/logo.png"
                  alt="Logo BGN"
                  width={56}
                  height={56}
                  className="object-contain shrink-0 mt-0.5"
                  priority
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Badan Gizi Nasional (BGN) Republik Indonesia
                  </span>
                  <h1 className="text-base sm:text-xl font-black uppercase text-slate-900 tracking-tight leading-snug">
                    Satuan Pelayanan Pemenuhan Gizi (SPPG) Wonodri 3
                  </h1>
                  <p className="text-xs text-slate-600 leading-tight">
                    Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Program Makan Bergizi Gratis (MBG) • Wilayah Pelayanan Semarang Selatan
                  </p>
                </div>
              </div>

              {/* Status Dokumen Metadata */}
              <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 text-xs text-slate-600 shrink-0 space-y-1">
                <div className="inline-block px-2.5 py-0.5 bg-slate-100 rounded text-[10px] font-black uppercase tracking-wider text-slate-800 border border-slate-200">
                  Dokumen Operasional Resmi
                </div>
                <div>Tanggal: <strong className="text-slate-900">{currentMenu.date}</strong></div>
                <div>Status: <strong className="text-emerald-700">Terdistribusi (100%)</strong></div>
                <div>Total Porsi: <strong className="text-slate-900">{totalMaster} Siswa</strong></div>
              </div>
            </div>
          </div>

          {/* I. INFORMASI MENU & KOMPOSISI MAKANAN */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <span>I. Menu Harian & Komposisi Porsi</span>
              </h2>
              <span className="text-[10px] text-slate-500">Nomor Menu #{currentMenu.menuNumber || 1}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Foto Porsi Makanan Sajian */}
              <div className="md:col-span-4 relative h-56 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                  alt={currentMenu.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                  Foto Sajian MBG {currentMenu.date}
                </div>
              </div>

              {/* Rincian Menu & 5 Komponen */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Nama Menu:</span>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {currentMenu.title}
                  </h3>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
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
                        <td className="py-2 px-3 font-bold text-slate-700">1. Karbohidrat</td>
                        <td className="py-2 px-3 text-slate-900 font-medium">{currentMenu.components.karbohidrat}</td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500">Sumber Energi</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-700">2. Lauk Hewani</td>
                        <td className="py-2 px-3 text-slate-900 font-medium">{currentMenu.components.laukHewani}</td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500">Protein Hewani</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-700">3. Lauk Nabati</td>
                        <td className="py-2 px-3 text-slate-900 font-medium">{currentMenu.components.laukNabati}</td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500">Protein Nabati</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-700">4. Sayuran</td>
                        <td className="py-2 px-3 text-slate-900 font-medium">{currentMenu.components.sayur}</td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500">Serat & Vitamin</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-700">5. Buah Segar</td>
                        <td className="py-2 px-3 text-slate-900 font-medium">{currentMenu.components.buah}</td>
                        <td className="py-2 px-3 text-center text-[10px] text-slate-500">Mikronutrien</td>
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
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono text-[11px]">
              {currentMenu.uraianPekerjaan || (
                '1. Pembersihan dan sterilisasi dapur operasional mulai pukul 04:00 WIB.\n2. Sortasi sayur dan bahan baku segar dari petani lokal.\n3. Pengolahan masakan dengan suhu inti di atas 85°C untuk menjamin keamanan pangan.\n4. Penataan porsi makanan hangat sesuai gramasi standar BGN.\n5. Penyegelan kotak makanan dan keberangkatan armada distribusi pukul 08:30 WIB ke 12 sekolah dan 1 posyandu.'
              )}
            </div>
          </section>

          {/* III. TABEL STANDAR ANGKA KANDUNGAN GIZI (AKG) */}
          <section className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                III. Verifikasi Angka Kandungan Gizi (AKG) 5 Kelompok
              </h2>
              <span className="text-[10px] text-slate-500">Rujukan: Pedoman Gizi Seimbang BGN</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Kelompok Porsi</th>
                    <th className="py-2.5 px-3">Sasaran Penerima</th>
                    <th className="py-2.5 px-3 text-right">Energi Total</th>
                    <th className="py-2.5 px-3 text-right">Protein</th>
                    <th className="py-2.5 px-3 text-right">Lemak</th>
                    <th className="py-2.5 px-3 text-right">Karbohidrat</th>
                    <th className="py-2.5 px-3 text-right">Serat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-extrabold text-blue-900 bg-slate-50/50">
                        {item.groupName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">
                        {item.targetCategory}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 tabular-nums">
                        {item.energyKcal.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">Kkal</span>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{item.proteinG.toFixed(1)} g</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{item.fatG.toFixed(1)} g</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{item.carbsG.toFixed(1)} g</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{item.fiberG.toFixed(1)} g</td>
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
                  <div className="relative h-32 w-full bg-slate-200">
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

          {/* V. DATA PENERIMA MANFAAT (12 SEKOLAH + 1 POSYANDU) */}
          <section className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                V. Daftar Alokasi Penerima Manfaat ({totalMaster} Porsi)
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

            <div className="border border-slate-200 rounded-lg overflow-hidden">
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

          {/* TANDA TANGAN / PENGESAHAN DOKUMEN RESMI (3 KOLOM RESMI) */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div>
              <p className="font-semibold text-slate-500">Penanggung Jawab Gizi</p>
              <div className="h-16" />
              <p className="font-black text-slate-900 underline">Tim Ahli Gizi SPPG</p>
              <p className="text-[10px] text-slate-500">SPPG Wonodri 3 Kota Semarang</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Kepala Dapur Operasional</p>
              <div className="h-16" />
              <p className="font-black text-slate-900 underline">Koordinator Produksi</p>
              <p className="text-[10px] text-slate-500">Dapur MBG Wonodri 3</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500">Mengetahui & Menyetujui</p>
              <div className="h-16" />
              <p className="font-black text-slate-900 underline">Ka. SPPG Wonodri 3</p>
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
