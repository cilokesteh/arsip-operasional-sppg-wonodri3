'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  INITIAL_MENU_HISTORY,
  DailyMenuRecord,
  getBeneficiariesForDate,
} from '@/lib/data';
import {
  Calendar as CalendarIcon,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Clock,
  PlusCircle,
  Lock,
  KeyRound,
  ShieldCheck,
  Landmark,
  Archive,
  Users,
  Utensils,
} from 'lucide-react';
import { formatTanggalIndo } from '@/lib/dateUtils';
import { fetchMenusFromCloud } from '@/lib/cloudSync';
import staticMenusData from '@/lib/staticMenus.json';
import OfficialReport from '@/components/OfficialReport';

export default function PortalHome() {
  const [menuHistory, setMenuHistory] = useState<DailyMenuRecord[]>(
    (staticMenusData as unknown as DailyMenuRecord[]) || INITIAL_MENU_HISTORY
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    staticMenusData && staticMenusData.length > 0 ? staticMenusData[0].date : '2026-10-23'
  );

  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [calendarMonth, setCalendarMonth] = useState<number>(9);
  const [calendarYear, setCalendarYear] = useState<number>(2026);

  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const OFFICIAL_PRINT_PIN = '91206';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const qDate = params.get('date');
        if (qDate) setSelectedDate(qDate);
      } catch {}
    }

    try {
      const V2 = 'sppg_synced_menus_v2';
      const saved = localStorage.getItem(V2);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const byDate = new Map<string, DailyMenuRecord>();
          (staticMenusData as unknown as DailyMenuRecord[]).forEach((s) => byDate.set(s.date, s));
          parsed.forEach((p: DailyMenuRecord) => {
            const existing = byDate.get(p.date);
            if (!existing) {
              byDate.set(p.date, p);
            } else {
              byDate.set(p.date, { ...existing, ...p });
            }
          });
          const combined = Array.from(byDate.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setMenuHistory(combined);
          if (typeof window !== 'undefined' && !window.location.search.includes('date=')) {
            setSelectedDate(combined[0].date);
          }
        }
      }
    } catch {}

    fetchMenusFromCloud().then((cloudMenus) => {
      if (cloudMenus && cloudMenus.length > 0) {
        setMenuHistory((prev) => {
          const byDate = new Map<string, DailyMenuRecord>();
          prev.forEach((localItem) => byDate.set(localItem.date, localItem));
          cloudMenus.forEach((c) => {
            const localItem = byDate.get(c.date);
            if (!localItem) {
              byDate.set(c.date, c);
            } else {
              byDate.set(c.date, {
                ...localItem,
                ...c,
                photos: c.photos && c.photos.length > 0 ? c.photos : localItem.photos,
                menuPhotoUrl:
                  c.menuPhotoUrl && c.menuPhotoUrl.trim() !== '' ? c.menuPhotoUrl : localItem.menuPhotoUrl,
              });
            }
          });
          const merged = Array.from(byDate.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          try {
            localStorage.setItem('sppg_synced_menus_v2', JSON.stringify(merged));
          } catch {}
          if (typeof window !== 'undefined' && !window.location.search.includes('date=')) {
            setSelectedDate(merged[0].date);
          }
          return merged;
        });
      }
    });
  }, []);

  const currentMenu = menuHistory.find((m) => m.date === selectedDate);
  const baselineBeneficiaries = getBeneficiariesForDate(selectedDate);

  const activeBeneficiaries = useMemo(() => {
    if (!currentMenu?.overrides || currentMenu.overrides.length === 0) {
      return baselineBeneficiaries;
    }
    const overrideMap = new Map(currentMenu.overrides.map((o) => [o.siteId, o]));
    return baselineBeneficiaries.map((b) => {
      const ov = overrideMap.get(b.id);
      if (!ov) return b;
      return {
        ...b,
        masterCount: ov.condition === 'libur' ? 0 : ov.effectiveCount,
        reason: ov.reason,
        condition: ov.condition,
      };
    });
  }, [baselineBeneficiaries, currentMenu]);

  const totalMaster = activeBeneficiaries.reduce((sum, b) => sum + b.masterCount, 0);

  /* Navigasi Tanggal (older / newer) */
  const dateIndex = menuHistory.findIndex((m) => m.date === selectedDate);
  const goOlder = () => {
    const next = menuHistory[dateIndex + 1];
    if (next) setSelectedDate(next.date);
  };
  const goNewer = () => {
    const next = menuHistory[dateIndex - 1];
    if (next) setSelectedDate(next.date);
  };
  const hasOlder = dateIndex >= 0 && dateIndex < menuHistory.length - 1;
  const hasNewer = dateIndex > 0;

  /* Kalender Helper */
  const openCalendar = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    if (!isNaN(d.getTime())) {
      setCalendarMonth(d.getMonth());
      setCalendarYear(d.getFullYear());
    }
    setShowCalendarModal(true);
  };

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

  /* ESC Listener */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setShowPinModal(false);
      setShowCalendarModal(false);
      setPinError('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Print Handler */
  const handleOpenPrintModal = () => {
    const sessionAuth = sessionStorage.getItem('sppg_print_auth');
    if (sessionAuth === 'true') {
      window.print();
    } else {
      setInputPin('');
      setPinError('');
      setShowPinModal(true);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim() === OFFICIAL_PRINT_PIN) {
      sessionStorage.setItem('sppg_print_auth', 'true');
      setShowPinModal(false);
      setInputPin('');
      setPinError('');
      setTimeout(() => window.print(), 250);
    } else {
      setPinError('PIN verifikasi salah! Khusus operator resmi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased w-full overflow-x-hidden">
      {/* ============ INSTITUTIONAL MASTHEAD ============ */}
      <div className="bg-[#0b1f3a] text-white no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 py-1.5 text-[10px] sm:text-[11px] font-medium text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <Landmark className="w-3 h-3" />
              <span>Badan Gizi Nasional — Republik Indonesia</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              <span className="font-bold text-emerald-300">Sistem Aktif</span>
            </span>
          </div>
        </div>
      </div>

      {/* ============ APP SHELL HEADER ============ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs p-1 flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Logo BGN" width={30} height={30} className="object-contain" priority />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight truncate leading-tight">
                    SPPG Wonodri 3
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    <ShieldCheck className="w-2.5 h-2.5" /> Terverifikasi BGN
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
                  Laporan Harian Makan Bergizi Gratis (MBG)
                </span>
              </div>
            </div>

            {/* Navigasi Utama Yang Simpel */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/arsip"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                title="Buka Katalog Arsip Tanggal"
              >
                <Archive className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Katalog Arsip</span>
              </Link>

              <Link
                href="/absensi"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                title="Presensi Relawan"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Absensi</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenPrintModal}
                title="Cetak Dokumen Resmi (Wajib PIN)"
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>

              <Link
                href="/admin"
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                title="Panel Operator"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ============ MAIN REPORT FLOW ============ */}
      <main className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-5 sm:py-6 flex-1 space-y-4">
        {/* Date Selector Bar Yang Tenang & Jelas */}
        <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goOlder}
              disabled={!hasOlder}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-slate-200"
              title="Laporan tanggal sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={openCalendar}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{formatTanggalIndo(selectedDate)}</span>
            </button>

            <button
              onClick={goNewer}
              disabled={!hasNewer}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed border border-slate-200"
              title="Laporan tanggal berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Target: <strong className="text-slate-900">{totalMaster} Porsi (100%)</strong>
            </span>
            <Link
              href={`/absensi?date=${selectedDate}`}
              className="text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <span>Presensi Hari Ini →</span>
            </Link>
          </div>
        </div>

        {/* Laporan Resmi Harian (Mengalir Utuh ke Bawah) */}
        {!currentMenu ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-10 sm:p-14 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-slate-900">
                Belum Ada Laporan untuk {formatTanggalIndo(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500">
                Silakan pilih tanggal lain melalui tombol panah di atas atau buka katalog arsip lengkap.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Link
                href="/arsip"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Buka Katalog Arsip
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                + Input di Panel Admin
              </Link>
            </div>
          </div>
        ) : (
          <OfficialReport
            menu={currentMenu}
            beneficiaries={activeBeneficiaries}
            totalMaster={totalMaster}
          />
        )}
      </main>

      {/* Modal Kalender Tanggal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xs w-full p-4 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-sm text-slate-900">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => setShowCalendarModal(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer ml-1">
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
                const dStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dStr === selectedDate;
                const hasMenu = menuHistory.some((m) => m.date === dStr);

                return (
                  <button
                    key={dStr}
                    onClick={() => {
                      setSelectedDate(dStr);
                      setShowCalendarModal(false);
                    }}
                    className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : hasMenu
                        ? 'bg-blue-50 text-blue-900 hover:bg-blue-100 font-black border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100'
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

      {/* Modal PIN Cetak Dokumen */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xs w-full p-5 space-y-3 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">PIN Cetak Resmi</h3>
              <p className="text-[11px] text-slate-500">Masukkan PIN resmi pimpinan untuk mencetak dokumen.</p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-blue-600"
                />
                {pinError && (
                  <p className="text-[11px] font-bold text-rose-600 text-center mt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setInputPin('');
                    setPinError('');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                >
                  Buka & Cetak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white no-print">
        Portal Informasi Operasional • SPPG Wonodri 3 Kota Semarang
      </footer>
    </div>
  );
}
