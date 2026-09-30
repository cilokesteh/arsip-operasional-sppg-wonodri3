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
} from 'lucide-react';

export default function HomePage() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(INITIAL_MENU_HISTORY);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-01');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showAllSchools, setShowAllSchools] = useState<boolean>(false);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Header Minimalis & Elegan */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Logo" width={26} height={26} className="object-contain" priority />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              SPPG Wonodri 3
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedDate}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <Link
              href="/admin"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Panel Admin"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Lembar Laporan Harian Terpadu (Single Clean Sheet) */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-6">
          {/* Header Lembar Kerja */}
          <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Laporan Operasional MBG Harian
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 leading-snug">
                {currentMenu.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Tanggal: <strong>{currentMenu.date}</strong> • Penerima: <strong>{totalMaster} Porsi (12 Sekolah + 1 Posyandu)</strong>
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 no-print cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak Dokumen</span>
            </button>
          </div>

          {/* Foto Sajian & 5 Komponen Makanan Pokok */}
          <div className="space-y-3">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              1. Menu & Komposisi Makanan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Foto Porsi Makanan */}
              <div className="md:col-span-5 relative h-52 sm:h-56 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentMenu.menuPhotoUrl || '/gallery-1.jpg'}
                  alt={currentMenu.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 5 Komponen Menu */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Karbohidrat</span>
                  <span className="font-bold text-slate-900">{currentMenu.components.karbohidrat}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Lauk Hewani</span>
                  <span className="font-bold text-slate-900">{currentMenu.components.laukHewani}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Lauk Nabati</span>
                  <span className="font-bold text-slate-900">{currentMenu.components.laukNabati}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Sayuran</span>
                  <span className="font-bold text-slate-900">{currentMenu.components.sayur}</span>
                </div>
                <div className="sm:col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Buah Segar</span>
                  <span className="font-bold text-slate-900">{currentMenu.components.buah}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Uraian Pekerjaan Operasional */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              2. Uraian Pekerjaan Operasional
            </h2>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
              {currentMenu.uraianPekerjaan ||
                '1. Sterilisasi dapur & higienitas (04:00 WIB)\n2. Sortasi bahan baku sayur & lauk segar\n3. Pengolahan masakan suhu >85°C\n4. Food plating gramasi porsi BGN\n5. Penyegelan thermal box & distribusi (08:30 WIB)'}
            </div>
          </div>

          {/* Tabel Nilai Gizi (AKG) — 1 Tabel Ringkas, Bersih, Enak Dibaca */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                3. Angka Kandungan Gizi (AKG)
              </h2>
              <span className="text-[10px] text-slate-400">Standar BGN</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Kelompok</th>
                      <th className="py-2.5 px-3">Sasaran</th>
                      <th className="py-2.5 px-3 text-right">Energi</th>
                      <th className="py-2.5 px-3 text-right">Protein</th>
                      <th className="py-2.5 px-3 text-right">Lemak</th>
                      <th className="py-2.5 px-3 text-right">Karbo</th>
                      <th className="py-2.5 px-3 text-right">Serat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(currentMenu.nutritionCards || STANDARD_AKG_REFERENCE).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-extrabold text-blue-700">{item.groupName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{item.targetCategory}</td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 tabular-nums">
                          {item.energyKcal.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">Kkal</span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.proteinG.toFixed(1)}g</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.fatG.toFixed(1)}g</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.carbsG.toFixed(1)}g</td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.fiberG.toFixed(1)}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Foto Dokumentasi Dapur 3 Tahap */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              4. Dokumentasi Dapur
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentMenu.photos.map((p, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="relative h-28 w-full bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <span className="text-[10px] font-black uppercase text-blue-600 block">{p.step}</span>
                    <span className="text-xs font-bold text-slate-800 block truncate">{p.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Penerima Manfaat (Ringkas & Bisa Dibuka Lengkap) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                5. Penerima Manfaat ({totalMaster} Siswa)
              </h2>
              <button
                onClick={() => setShowAllSchools(!showAllSchools)}
                className="text-xs font-bold text-blue-600 hover:underline no-print cursor-pointer"
              >
                {showAllSchools ? 'Tutup Daftar' : 'Lihat 13 Sekolah/Posyandu'}
              </button>
            </div>

            {showAllSchools ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Lembaga</th>
                      <th className="py-2 px-3">Tipe</th>
                      <th className="py-2 px-3 text-right">Kuota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INITIAL_BENEFICIARIES.map((s, idx) => (
                      <tr key={s.id}>
                        <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{s.name}</td>
                        <td className="py-2 px-3 text-slate-500">{s.type}</td>
                        <td className="py-2 px-3 text-right font-black text-slate-900">{s.masterCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>Total 12 Sekolah Dasar/TK + 1 Posyandu Erlangga di Semarang Selatan</span>
                <span className="font-black text-slate-900">{totalMaster} Porsi</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full p-4 space-y-3">
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
                    className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
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

      {/* Footer Minimalis */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white no-print">
        SPPG Wonodri 3 • Badan Gizi Nasional (BGN) • Built by CilokTech Studio
      </footer>
    </div>
  );
}
