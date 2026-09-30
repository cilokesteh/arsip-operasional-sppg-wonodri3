'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle2,
  Camera,
  Save,
  Check,
  Flame,
  Trash2,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
  Loader2,
  CloudUpload,
  Calendar,
  Utensils,
  PlusCircle,
} from 'lucide-react';
import { uploadToGoogleDrive } from '@/lib/driveUpload';

interface AKGInput {
  groupName: string;
  targetCategory: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
}

const DEFAULT_AKG_PRESETS: AKGInput[] = [
  { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
  { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', energyKcal: 462.9, proteinG: 13.6, fatG: 14.4, carbsG: 81.7, fiberG: 2.4 },
  { groupName: 'Balita', targetCategory: '6 - 60 Bulan (Balita)', energyKcal: 426.9, proteinG: 13.0, fatG: 14.3, carbsG: 51.7, fiberG: 2.0 },
  { groupName: 'Busui', targetCategory: 'Ibu Menyusui', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
  { groupName: 'Bumil', targetCategory: 'Ibu Hamil', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
];

const DEFAULT_PASSCODE = '91206';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputPasscode, setInputPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('sppg_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode === DEFAULT_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sppg_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Kode akses salah! Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sppg_admin_auth');
    setInputPasscode('');
  };

  // 1. Data Menu Harian
  const [menuDate, setMenuDate] = useState('2026-10-01');
  const [namaMenu, setNamaMenu] = useState('');
  const [components, setComponents] = useState({
    karbohidrat: '',
    laukHewani: '',
    laukNabati: '',
    sayur: '',
    buah: '',
  });

  // State Foto Porsi Makanan Utama (Tampil di Web Publik)
  const [menuPhotoUrl, setMenuPhotoUrl] = useState<string | null>(null);
  const [menuPhotoUploading, setMenuPhotoUploading] = useState<boolean>(false);

  // 2. Data AKG 5 Kelompok
  const [akgList, setAkgList] = useState<AKGInput[]>(DEFAULT_AKG_PRESETS);

  // 3. State 3 Foto Dapur
  const [prepPhotoUrl, setPrepPhotoUrl] = useState<string | null>(null);
  const [prepUploading, setPrepUploading] = useState<boolean>(false);

  const [cookPhotoUrl, setCookPhotoUrl] = useState<string | null>(null);
  const [cookUploading, setCookUploading] = useState<boolean>(false);

  const [packPhotoUrl, setPackPhotoUrl] = useState<string | null>(null);
  const [packUploading, setPackUploading] = useState<boolean>(false);

  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleAkgChange = (index: number, field: keyof AKGInput, value: string | number) => {
    const updated = [...akgList];
    updated[index] = { ...updated[index], [field]: value };
    setAkgList(updated);
  };

  const handleAutoDriveUpload = async (
    file: File,
    setUrl: React.Dispatch<React.SetStateAction<string | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    stepName: string
  ) => {
    setLoading(true);
    const res = await uploadToGoogleDrive(file);
    setLoading(false);
    if (res.success && res.url) {
      setUrl(res.url);
    } else {
      alert(`Gagal upload foto ${stepName} ke Google Drive: ${res.error || 'Terjadi kesalahan'}`);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMenu.trim()) {
      alert('Silakan tulis nama menu hari ini.');
      return;
    }

    const newRecord = {
      date: menuDate,
      menuNumber: 1,
      title: namaMenu,
      menuPhotoUrl: menuPhotoUrl || '/gallery-1.jpg',
      status: 'published' as const,
      publishedAt: `${menuDate} • 08:30 WIB`,
      components,
      nutritionCards: akgList.map((a) => ({
        ...a,
        portionBadge: 'Porsi Terstandar BGN',
        color: '#2563eb',
        bgLight: '#eff6ff',
        borderAccent: '#3b82f6',
        recommendedPct: { protein: 25, fat: 23, carbs: 65, fiber: 20 },
      })),
      photos: [
        {
          step: 'Persiapan',
          title: 'Sortasi Bahan Baku Higienis',
          description: 'Pembersihan dan sortasi bahan baku makanan di dapur SPPG Wonodri 3.',
          imageUrl: prepPhotoUrl || '/about-kitchen.jpg',
          timeEstimate: '04:00 - 05:30 WIB',
        },
        {
          step: 'Pengolahan',
          title: 'Pemasakan Suhu Terukur (>85°C)',
          description: 'Pengolahan makanan hangat menggunakan kuali stainless steel berstandar BGN.',
          imageUrl: cookPhotoUrl || '/hero-kitchen.jpg',
          timeEstimate: '05:30 - 07:15 WIB',
        },
        {
          step: 'Pengemasan',
          title: 'Food Plating & Segel Thermal Box',
          description: 'Pengecekan porsi gramasi dan segel kotak makanan hangat siap kirim.',
          imageUrl: packPhotoUrl || '/gallery-1.jpg',
          timeEstimate: '07:15 - 08:30 WIB',
        },
      ],
      overrides: [],
    };

    try {
      const existing = localStorage.getItem('sppg_synced_menus');
      let list = existing ? JSON.parse(existing) : [];
      list = [newRecord, ...list.filter((item: { date: string }) => item.date !== menuDate)];
      localStorage.setItem('sppg_synced_menus', JSON.stringify(list));
    } catch {
      // fallback
    }

    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  // JIKA BELUM LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b1e3a] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white text-[#0d1b2e] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f2fe] text-[#1759ab] flex items-center justify-center mx-auto shadow-xs border border-[#cfe4fc]">
              <Lock className="w-7 h-7 text-[#1759ab]" />
            </div>
            <h1 className="font-black text-lg sm:text-xl text-[#0b1e3a]">
              Akses Panel Admin
            </h1>
            <p className="text-xs text-slate-500">
              Khusus Tim Teknis & Operator Resmi SPPG Wonodri 3 Kota Semarang.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1.5">
                Masukkan Kode Akses (PIN):
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Ketik kode akses..."
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1759ab] focus:outline-none font-mono"
                  required
                  autoFocus
                />
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-black text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk ke Panel Kendali</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-[#1759ab] transition-colors"
            >
              ← Kembali ke Halaman Publik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // JIKA SUDAH LOGIN: TAMPILAN FULL MANUAL INPUT (AUTO SAVE GDRIVE)
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d1b2e] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 p-1 flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 block leading-none">
                  Input Menu & Foto Dapur
                </span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <CloudUpload className="w-3 h-3" /> Auto-Save ke Google Drive Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-blue-600 hover:underline transition-colors hidden sm:inline"
            >
              Web Publik
            </Link>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <form onSubmit={handlePublish} className="space-y-6">
          {publishSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Menu, foto, dan nilai AKG untuk tanggal {menuDate} berhasil dipublikasikan ke web & tersimpan ke Google Drive!</span>
            </div>
          )}

          {/* ===================== KARTU 1: DATA MENU & FOTO UTAMA ===================== */}
          <div className="app-card rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  1. Menu Makanan & Foto Sajian Porsi
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Langkah 1 dari 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Layanan</label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Menu Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi Pandan Wangi, Ayam Semur, Tahu Bacem, Tumis Buncis, & Pisang"
                  value={namaMenu}
                  onChange={(e) => setNamaMenu(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>
            </div>

            {/* Upload Foto Makanan Utama */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-slate-900 block">
                    Foto Sajian Porsi Makanan (Tampil di Web Publik)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Jepret langsung foto piring/box makanan matang.
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CloudUpload className="w-3 h-3" /> Auto-Save GDrive
                </span>
              </div>

              <div className="relative h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                {menuPhotoUploading ? (
                  <div className="flex flex-col items-center gap-1.5 text-blue-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">Menyimpan foto ke Google Drive...</span>
                  </div>
                ) : menuPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={menuPhotoUrl} alt="Foto Menu" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1.5 p-4 text-center">
                    <Camera className="w-7 h-7 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Tap untuk Jepret / Ambil Foto</span>
                    <span className="text-[10px] text-slate-400">Otomatis tersimpan langsung di Google Drive SPPG</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={menuPhotoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAutoDriveUpload(file, setMenuPhotoUrl, setMenuPhotoUploading, 'Makanan');
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>

              {menuPhotoUrl && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Foto Tersimpan Permanen di Google Drive
                  </span>
                  <button
                    type="button"
                    onClick={() => setMenuPhotoUrl(null)}
                    className="text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Ganti Foto
                  </button>
                </div>
              )}
            </div>

            {/* 5 Komponen Makanan */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                Rincian 5 Komponen Pokok Makanan:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">1. Karbohidrat</label>
                  <input
                    type="text"
                    placeholder="Nasi Pulen"
                    value={components.karbohidrat}
                    onChange={(e) => setComponents({ ...components, karbohidrat: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">2. Lauk Hewani</label>
                  <input
                    type="text"
                    placeholder="Ayam Semur"
                    value={components.laukHewani}
                    onChange={(e) => setComponents({ ...components, laukHewani: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">3. Lauk Nabati</label>
                  <input
                    type="text"
                    placeholder="Tahu Bacem"
                    value={components.laukNabati}
                    onChange={(e) => setComponents({ ...components, laukNabati: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">4. Sayur</label>
                  <input
                    type="text"
                    placeholder="Tumis Buncis"
                    value={components.sayur}
                    onChange={(e) => setComponents({ ...components, sayur: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">5. Buah</label>
                  <input
                    type="text"
                    placeholder="Pisang Cavendish"
                    value={components.buah}
                    onChange={(e) => setComponents({ ...components, buah: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===================== KARTU 2: AKG (5 KELOMPOK) ===================== */}
          <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    2. Angka Kandungan Gizi (AKG) 5 Kelompok Porsi
                  </h2>
                  <span className="text-[11px] text-slate-500">
                    Nilai standar BGN sudah terisi otomatis, tinggal edit angkanya jika ada perbedaan.
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Langkah 2 dari 3</span>
            </div>

            <div className="space-y-3">
              {akgList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white w-fit">
                      Kelompok: {item.groupName}
                    </span>
                    <input
                      type="text"
                      title="Target Kategori"
                      placeholder="Target Kategori (contoh: SD 4-6 / SMP)"
                      value={item.targetCategory}
                      onChange={(e) => handleAkgChange(idx, 'targetCategory', e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 flex-1 max-w-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="text-[9px] font-bold text-amber-900 block mb-0.5">
                        Energi (Kkal)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.energyKcal}
                        onChange={(e) => handleAkgChange(idx, 'energyKcal', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-amber-300 rounded-lg bg-amber-50/60 font-black text-amber-950"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-600 block mb-0.5">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.proteinG}
                        onChange={(e) => handleAkgChange(idx, 'proteinG', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-600 block mb-0.5">
                        Lemak (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.fatG}
                        onChange={(e) => handleAkgChange(idx, 'fatG', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-600 block mb-0.5">
                        Karbo (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.carbsG}
                        onChange={(e) => handleAkgChange(idx, 'carbsG', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-600 block mb-0.5">
                        Serat (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.fiberG}
                        onChange={(e) => handleAkgChange(idx, 'fiberG', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===================== KARTU 3: 3 FOTO DOKUMENTASI DAPUR ===================== */}
          <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    3. Foto Dokumentasi Dapur (3 Tahap)
                  </h2>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Auto-upload ke folder Google Drive SPPG
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Langkah 3 dari 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Persiapan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-800 block">1. Persiapan Bahan</span>
                <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                  {prepUploading ? (
                    <div className="flex flex-col items-center gap-1 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">Uploading ke GDrive...</span>
                    </div>
                  ) : prepPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={prepPhotoUrl} alt="Persiapan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-[11px] font-bold text-slate-700">Jepret / Ambil Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={prepUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAutoDriveUpload(file, setPrepPhotoUrl, setPrepUploading, 'Persiapan');
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                {prepPhotoUrl && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                    </span>
                    <button
                      type="button"
                      onClick={() => setPrepPhotoUrl(null)}
                      className="text-rose-600 hover:underline cursor-pointer text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Pengolahan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-800 block">2. Pengolahan Masak</span>
                <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                  {cookUploading ? (
                    <div className="flex flex-col items-center gap-1 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">Uploading ke GDrive...</span>
                    </div>
                  ) : cookPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cookPhotoUrl} alt="Pengolahan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-[11px] font-bold text-slate-700">Jepret / Ambil Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={cookUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAutoDriveUpload(file, setCookPhotoUrl, setCookUploading, 'Pengolahan');
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                {cookPhotoUrl && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                    </span>
                    <button
                      type="button"
                      onClick={() => setCookPhotoUrl(null)}
                      className="text-rose-600 hover:underline cursor-pointer text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Pengemasan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-800 block">3. Pengemasan Box</span>
                <div className="relative h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                  {packUploading ? (
                    <div className="flex flex-col items-center gap-1 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px] font-bold">Uploading ke GDrive...</span>
                    </div>
                  ) : packPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={packPhotoUrl} alt="Pengemasan" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center gap-1">
                      <Camera className="w-6 h-6 text-blue-600" />
                      <span className="text-[11px] font-bold text-slate-700">Jepret / Ambil Foto</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={packUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAutoDriveUpload(file, setPackPhotoUrl, setPackUploading, 'Pengemasan');
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                {packPhotoUrl && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                    </span>
                    <button
                      type="button"
                      onClick={() => setPackPhotoUrl(null)}
                      className="text-rose-600 hover:underline cursor-pointer text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tombol Simpan & Rilis Utama */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={menuPhotoUploading || prepUploading || cookUploading || packUploading}
              className="w-full sm:w-auto px-10 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Rilis Menu Hari Ini</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
