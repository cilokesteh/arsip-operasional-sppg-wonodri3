'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, ShieldAlert, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { UnifiedPortal } from '@/components/UnifiedPortal';

const OFFICIAL_PIN = '91206';
const AUTH_STORAGE_KEY = 'sppg_absensi_auth';

export default function AbsensiPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Cek apakah operator sudah login di sesi browser ini
    try {
      const auth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore storage error
    } finally {
      setIsReady(true);
    }
  }, []);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPinError('');

    if (pinInput.trim() === OFFICIAL_PIN) {
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN salah! Akses presensi relawan khusus pengurus & operator resmi SPPG.');
      setPinInput('');
    }
    setIsSubmitting(false);
  };

  const handleLockSession = () => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Jangan render apapun sebelum client hydration selesai untuk cegah visual flicker
  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-400">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  // Jika belum terautentikasi: Tampilkan Fullscreen Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
        {/* Top Navbar Minimalis */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/arsip"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Arsip</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-widest">
            SPPG-RESTRICTED
          </span>
        </div>

        {/* Card Form PIN */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Glow Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge & Icon */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/20 border border-blue-500/30 text-blue-400 shadow-inner mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <div className="inline-block mx-auto mb-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-extrabold text-rose-400 uppercase tracking-wider">
                Dokumen Internal Rahasia
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Presensi Relawan SPPG
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
                Data kehadiran, jadwal, dan personel relawan dilindungi. Masukkan PIN Otoritas resmi untuk membuka.
              </p>
            </div>

            {/* Form PIN */}
            <form onSubmit={handleVerifyPin} className="space-y-4 relative">
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                  PIN Otoritas (5 Digit):
                </label>
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="•••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base text-center tracking-widest font-mono text-white bg-slate-950/80 border border-slate-700/80 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-600"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs font-semibold text-rose-300 flex items-start gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !pinInput.trim()}
                className="w-full py-3 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi & Buka Presensi</span>
              </button>
            </form>

            {/* Navigasi Alternatif */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-2 text-center">
              <Link
                href="/arsip"
                className="text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Buka Katalog Arsip Operasional Publik</span>
                <span>→</span>
              </Link>
              <Link
                href="/admin"
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Masuk via Panel Operator Resmi
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-md w-full mx-auto text-center pb-2">
          <p className="text-[10px] text-slate-600 font-medium">
            SPPG Wonodri 3 • Sistem Manajemen Internal & Keterbukaan MBG
          </p>
        </div>
      </div>
    );
  }

  // Jika terautentikasi: Render modul presensi dengan top security banner
  return (
    <div className="relative">
      {/* Security Status Bar (Sticky di bagian paling atas) */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 px-3 py-1.5 text-xs font-medium flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold text-[11px] sm:text-xs">
            Sesi Otoritas Presensi Relawan Aktif
          </span>
          <span className="hidden md:inline text-[10px] text-slate-400 font-mono">
            (PIN Terverifikasi)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/arsip"
            className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Ke Arsip
          </Link>
          <button
            type="button"
            onClick={handleLockSession}
            className="text-[11px] font-bold text-rose-300 hover:text-white px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
            title="Kunci kembali dokumen ini"
          >
            <LogOut className="w-3 h-3" />
            <span>Kunci Sesi</span>
          </button>
        </div>
      </div>

      {/* Render Portal Absensi Lengkap */}
      <UnifiedPortal initialCategory="absensi" />
    </div>
  );
}
