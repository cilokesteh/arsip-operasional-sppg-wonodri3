'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, KeyRound, ShieldAlert, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { UnifiedPortal } from '@/components/UnifiedPortal';
import { verifyPin, hasValidSession, clearSession } from '@/lib/auth';


export default function AbsensiPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    // Cek apakah operator sudah login di sesi browser ini
    // (token diverifikasi ke server)
    let cancelled = false;
    hasValidSession()
      .then((valid) => {
        if (!cancelled && valid) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPinError('');

    const result = await verifyPin(pinInput.trim());
    if (result.ok) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else if (result.reason === 'wrong') {
      setPinError('PIN salah! Akses presensi relawan khusus pengurus & operator resmi SPPG.');
      setPinInput('');
    } else if (result.reason === 'rate_limited') {
      setPinError('Terlalu banyak percobaan salah. Coba lagi dalam 10 menit.');
      setPinInput('');
    } else {
      setPinError('Verifikasi PIN belum dikonfigurasi di server. Hubungi pengurus SPPG.');
    }
    setIsSubmitting(false);
  };

  const handleLockSession = () => {
    clearSession();
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
  };

  // Jangan render apapun sebelum client hydration selesai untuk cegah visual flicker
  if (!isReady) {
    return (
      <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-line border-t-ink rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  // Jika belum terautentikasi: Tampilkan Fullscreen Security Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-between p-4 sm:p-6">
        {/* Top Navbar Minimalis */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
          <Link
            href="/arsip"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-ink bg-white hover:bg-ink/5 px-3 py-1.5 rounded-lg transition-colors border border-line"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Arsip</span>
          </Link>
          <span className="text-[13px] font-mono text-slate-500 font-bold tracking-widest">
            SPPG-RESTRICTED
          </span>
        </div>

        {/* Card Form PIN */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div className="surface p-6 sm:p-8 relative overflow-hidden">

            {/* Header Badge & Icon */}
            <div className="text-center mb-6 relative">
              <div className="inline-flex p-3.5 rounded-2xl bg-gold-soft border border-gold/40 text-gold-ink mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <div className="inline-block mx-auto mb-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 ">
                Dokumen Internal Rahasia
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Presensi Relawan SPPG
              </h1>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                Data kehadiran, jadwal, dan personel relawan dilindungi. Masukkan PIN Otoritas resmi untuk membuka.
              </p>
            </div>

            {/* Form PIN */}
            <form onSubmit={handleVerifyPin} className="space-y-4 relative">
              <div>
                <label className="text-[13px] font-bold text-slate-700 block mb-1.5">
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
                    className="w-full pl-10 pr-4 py-3 text-base text-center tracking-widest font-mono text-ink bg-white border border-line rounded-xl focus:ring-2 focus:ring-gold focus:border-gold focus:outline-none transition-all placeholder:text-slate-400"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm font-semibold text-rose-700 flex items-start gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !pinInput.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-ink hover:bg-ink-soft active:bg-ink disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi & Buka Presensi</span>
              </button>
            </form>

            {/* Navigasi Alternatif */}
            <div className="mt-6 pt-5 border-t border-line flex flex-col gap-2 text-center">
              <Link
                href="/arsip"
                className="text-sm font-bold text-slate-600 hover:text-ink transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Buka Katalog Arsip Operasional Publik</span>
                <span>→</span>
              </Link>
              <Link
                href="/admin"
                className="text-[13px] font-semibold text-slate-500 hover:text-ink transition-colors"
              >
                Masuk via Panel Operator Resmi
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-md w-full mx-auto text-center pb-2">
          <p className="text-xs text-slate-600 font-medium">
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
      <div className="bg-white text-ink border-b border-line px-3 py-1.5 text-sm font-medium flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
          <span className="text-ink font-bold text-[13px] sm:text-sm">
            Sesi Otoritas Presensi Relawan Aktif
          </span>
          <span className="hidden md:inline text-xs text-slate-500 font-mono">
            (PIN Terverifikasi)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/arsip"
            className="text-[13px] font-semibold text-slate-700 hover:text-ink px-3 min-h-9 inline-flex items-center rounded-lg bg-ink/5 hover:bg-ink/10 transition-colors"
          >
            Ke Arsip
          </Link>
          <button
            type="button"
            onClick={handleLockSession}
            className="text-[13px] font-semibold text-rose-700 hover:text-rose-800 px-3 min-h-9 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
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
