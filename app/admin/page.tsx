'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Layers,
  AlertCircle,
  Save,
  Check,
} from 'lucide-react';
import { INITIAL_BENEFICIARIES } from '@/lib/data';

export default function AdminPage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [activeSubTab, setActiveSubTab] = useState<'sheet' | 'publish' | 'overrides'>('sheet');
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'
  );

  // Form State untuk Publish Menu Baru
  const [newMenu, setNewMenu] = useState({
    date: '2026-09-30',
    menuNumber: 77,
    title: 'Nasi Kuning Gurih, Ayam Suwir Bumbu Rujak, Perkedel Kentang, Urap Sayur, Semangka, & Susu',
    components: {
      karbohidrat: 'Nasi Kuning Beras Aromatik Santan Encer',
      laukHewani: 'Ayam Suwir Panggang Bumbu Rujak',
      laukNabati: 'Perkedel Kentang Daun Bawang',
      sayur: 'Urap Sayur Segar (Bayam, Tauge, Kacang Panjang)',
      buah: 'Semangka Potong Segar',
      pelengkap: 'Susu Pasteurisasi Segar',
    },
    prepPhotoUploaded: true,
    cookPhotoUploaded: true,
    packPhotoUploaded: true,
  });

  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSyncSheet = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }, 1500);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg">Panel Kendali Tim Teknis</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  SPPG Wonodri 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sinkronisasi Google Sheet, Verifikasi Foto 3 Tahap, & Rilis Menu
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            ← Kembali ke Halaman Publik
          </Link>
        </div>
      </header>

      {/* Admin Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-2 border-b border-slate-200">
          {[
            { id: 'sheet' as const, label: '1. Sinkronisasi Google Sheet', icon: FileSpreadsheet },
            { id: 'publish' as const, label: '2. Review & Publish Menu Harian', icon: Layers },
            { id: 'overrides' as const, label: '3. Penyesuaian Sekolah / Libur', icon: AlertCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* SUBTAB 1: GOOGLE SHEET SYNC */}
        {activeSubTab === 'sheet' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Hybrid Workflow Aktif</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  Sinkronisasi Data Operasional dari Google Sheet
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tim gizi & dapur cukup menginput menu, gramasi AKG, dan catatan harian di Google Sheet.
                  Sistem menarik data terbaru secara otomatis atau dapat ditarik manual via tombol di bawah.
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    URL Google Spreadsheet Operasional
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      onClick={handleSyncSheet}
                      disabled={syncStatus === 'syncing'}
                      className="px-5 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Tarik Data Sheet'}</span>
                    </button>
                  </div>
                </div>

                {syncStatus === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Berhasil menyinkronkan 3 tab (Menu_Harian, AKG_Master, Penerima_Manfaat). Tidak ada konflik data.
                    </span>
                  </div>
                )}
              </div>

              {/* Format Tab Sheet Panduan */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider mb-3">
                  Format Tab Wajib di Google Sheet:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block mb-1">Tab 1: Menu_Harian</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Kolom: <code>tanggal</code>, <code>nomor_menu</code>, <code>judul_menu</code>,{' '}
                      <code>karbohidrat</code>, <code>lauk_hewani</code>, <code>lauk_nabati</code>,{' '}
                      <code>sayur</code>, <code>buah</code>, <code>pelengkap</code>.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block mb-1">Tab 2: AKG</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Kolom: <code>tanggal</code>, <code>kelompok</code>, <code>energi_kkal</code>,{' '}
                      <code>protein_g</code>, <code>lemak_g</code>, <code>karbo_g</code>, <code>serat_g</code>.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="font-bold text-slate-900 block mb-1">Tab 3: Penyesuaian</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Kolom: <code>tanggal</code>, <code>id_sekolah</code>, <code>kondisi (libur/tambah)</code>,{' '}
                      <code>jumlah_efektif</code>, <code>alasan</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: REVIEW & PUBLISH MENU (MANUAL SETELAH PENGEMASAN) */}
        {activeSubTab === 'publish' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-black text-slate-900">
                  Form Rilis Menu (Setelah Pengemasan Selesai)
                </h2>
                <p className="text-xs text-slate-500">
                  Sesuai SOP, tombol publikasi dieksekusi setelah 3 tahap foto dokumentasi lengkap diunggah.
                </p>
              </div>

              {publishSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Menu #{newMenu.menuNumber} berhasil dipublikasikan ke arsip operasional!</span>
                </div>
              )}

              <form onSubmit={handlePublish} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Layanan</label>
                    <input
                      type="date"
                      value={newMenu.date}
                      onChange={(e) => setNewMenu({ ...newMenu, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Urut Menu</label>
                    <input
                      type="number"
                      value={newMenu.menuNumber}
                      onChange={(e) => setNewMenu({ ...newMenu, menuNumber: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Rangkuman Menu</label>
                  <input
                    type="text"
                    value={newMenu.title}
                    onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  />
                </div>

                {/* Gate Foto 3 Tahap Wajib */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Verifikasi 3 Tahap Dokumentasi Foto
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                      Syarat Mutlak Publish
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-emerald-200 bg-white flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">1. Foto Persiapan</span>
                        <span className="text-[11px] text-slate-500 block mb-3">Sortasi & pencucian bahan</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Foto Terlampir (05:15)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 bg-white flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">2. Foto Pengolahan</span>
                        <span className="text-[11px] text-slate-500 block mb-3">Memasak suhu &gt;85°C</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Foto Terlampir (06:45)</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-200 bg-white flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">3. Foto Pengemasan</span>
                        <span className="text-[11px] text-slate-500 block mb-3">Porsi & segel box</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Foto Terlampir (08:15)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Menu Hari Ini Sekarang</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBTAB 3: PENYESUAIAN SEKOLAH / LIBUR */}
        {activeSubTab === 'overrides' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="max-w-3xl space-y-2 mb-6">
                <h2 className="text-xl font-black text-slate-900">
                  Data Master Penerima & Pengecualian Harian
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Data master bersifat tetap (1.555 penerima). Jika suatu sekolah libur pada tanggal tertentu,
                  catat tanggal dan kondisinya di sini agar distribusi harian berkurang otomatis tanpa mengubah master data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {INITIAL_BENEFICIARIES.map((site) => (
                  <div
                    key={site.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{site.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Kategori: {site.type} • Master: {site.masterCount} Penerima
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                      onClick={() => alert(`Pengaturan penyesuaian khusus untuk ${site.name} siap dikonfigurasi.`)}
                    >
                      Set Libur / Override
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
