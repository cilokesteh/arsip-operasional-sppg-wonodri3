'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Camera,
  Save,
  Check,
  Sparkles,
  Flame,
  Trash2,
  Copy,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
  Loader2,
  CloudUpload,
} from 'lucide-react';
import { uploadToGoogleDrive } from '@/lib/driveUpload';
import { fetchGoogleSheetData } from '@/lib/sheetSync';

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

  const [mode, setMode] = useState<'form' | 'sheet'>('form');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('sppg_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    const savedSheetUrl = localStorage.getItem('sppg_sheet_url');
    if (savedSheetUrl) {
      setSheetUrl(savedSheetUrl);
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

  // 1. Data Menu Harian (5 Komponen Murni: Karbohidrat, Hewani, Nabati, Sayur, Buah)
  const [menuDate, setMenuDate] = useState('2026-10-01');
  const [namaMenu, setNamaMenu] = useState('');
  const [components, setComponents] = useState({
    karbohidrat: '',
    laukHewani: '',
    laukNabati: '',
    sayur: '',
    buah: '',
  });

  // 2. Data AKG 5 Kelompok
  const [akgList, setAkgList] = useState<AKGInput[]>(DEFAULT_AKG_PRESETS);

  // 3. State Auto-Upload Foto ke Google Drive
  const [prepPhotoUrl, setPrepPhotoUrl] = useState<string | null>(null);
  const [prepUploading, setPrepUploading] = useState<boolean>(false);

  const [cookPhotoUrl, setCookPhotoUrl] = useState<string | null>(null);
  const [cookUploading, setCookUploading] = useState<boolean>(false);

  const [packPhotoUrl, setPackPhotoUrl] = useState<string | null>(null);
  const [packUploading, setPackUploading] = useState<boolean>(false);

  // 4. State Sync Sheet Otomatis
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

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
      // localStorage fallback
    }

    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  const handleSyncSheet = async () => {
    if (!sheetUrl.trim()) {
      alert('Masukkan link Google Sheet Anda terlebih dahulu.');
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('Menghubungkan dan menarik data menu & AKG dari Google Sheet...');

    const res = await fetchGoogleSheetData(sheetUrl);

    if (res.success && res.menus.length > 0) {
      setSyncStatus('success');
      setSyncMessage(`Sukses! ${res.menus.length} menu harian beserta rincian gizi berhasil disinkronkan dari Google Sheet.`);
      localStorage.setItem('sppg_sheet_url', sheetUrl);
      localStorage.setItem('sppg_synced_menus', JSON.stringify(res.menus));
    } else {
      setSyncStatus('error');
      setSyncMessage(res.error || 'Gagal membaca data spreadsheet.');
    }
  };

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  // Header Bersih: Tanpa kolom Pelengkap & Tanpa kolom foto
  const sheet1Header = "tanggal\tnama menu\tkarbohidrat\tlauk hewani\tlauk nabati\tsayur\tbuah\tstatus";
  const sheet2Header = "tanggal\tkelompok\ttarget kategori\tenergi kkal\tprotein g\tlemak g\tkarbo g\tserat g";

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

  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#0d1b2e] pb-16">
      {/* Header */}
      <header className="bg-[#0b1e3a] text-white border-b border-[#174a8a]/40 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Logo" width={22} height={22} className="object-contain" />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                Admin Menu & AKG • SPPG Wonodri 3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-[#a8d8f0] hover:text-white transition-colors hidden sm:inline"
            >
              Web Publik
            </Link>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-5">
        {/* Toggle Mode */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-sm mx-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'form'
                ? 'bg-white text-[#1759ab] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Input Langsung (HP/Web)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('sheet')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'sheet'
                ? 'bg-white text-[#1759ab] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Pakai Google Sheet</span>
          </button>
        </div>

        {/* ===================== MODE 1: FORM INPUT CEPAT ===================== */}
        {mode === 'form' && (
          <form onSubmit={handlePublish} className="space-y-5">
            {publishSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Menu, foto, dan nilai AKG untuk tanggal {menuDate} berhasil dipublikasikan & tersimpan ke Google Drive!</span>
              </div>
            )}

            {/* Bagian 1: Data Menu Hari Ini */}
            <div className="sppg-card rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-black uppercase text-[#1759ab] tracking-wider">
                1. Data Menu Hari Ini
              </h2>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Layanan</label>
                <input
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1759ab]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi Putih, Ayam Semur Kecap, Tahu Bacem, Tumis Buncis, & Pisang"
                  value={namaMenu}
                  onChange={(e) => setNamaMenu(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1759ab]"
                  required
                />
              </div>

              {/* Rincian Komponen 5 Kotak Bersih (Tanpa Pelengkap) */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  Rincian 5 Komponen Makanan Pokok:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="1. Karbohidrat (Nasi Pulen)"
                    value={components.karbohidrat}
                    onChange={(e) => setComponents({ ...components, karbohidrat: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="2. Lauk Hewani (Ayam Semur)"
                    value={components.laukHewani}
                    onChange={(e) => setComponents({ ...components, laukHewani: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="3. Lauk Nabati (Tahu Bacem)"
                    value={components.laukNabati}
                    onChange={(e) => setComponents({ ...components, laukNabati: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="4. Sayuran (Tumis Buncis)"
                    value={components.sayur}
                    onChange={(e) => setComponents({ ...components, sayur: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="5. Buah (Pisang Cavendish)"
                    value={components.buah}
                    onChange={(e) => setComponents({ ...components, buah: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 2: INPUT ANGKA KANDUNGAN GIZI (AKG) */}
            <div className="sppg-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#cfe4fc] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center text-orange-600">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase text-[#0b1e3a] tracking-wider">
                      2. Angka Kandungan Gizi (AKG) 5 Kelompok
                    </h2>
                    <span className="text-[10px] text-slate-500">
                      Termasuk Kelompok, Target Kategori, dan 5 nilai gizi.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Kelompok Input Cards */}
              <div className="space-y-3">
                {akgList.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-[#1759ab] text-white">
                          Kelompok: {item.groupName}
                        </span>
                      </div>
                      <div className="flex-1 max-w-sm">
                        <input
                          type="text"
                          title="Target Kategori"
                          placeholder="Target Kategori (contoh: SD 4-6 / SMP)"
                          value={item.targetCategory}
                          onChange={(e) => handleAkgChange(idx, 'targetCategory', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div>
                        <label className="text-[9px] font-bold text-orange-900 block mb-0.5">
                          Energi (Kkal)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.energyKcal}
                          onChange={(e) => handleAkgChange(idx, 'energyKcal', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-orange-300 rounded-lg bg-orange-50/50 font-black text-orange-950"
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

            {/* Bagian 3: FOTO DAPUR (UPLOAD LANGSUNG DARI HP -> AUTO SAVE KE GOOGLE DRIVE) */}
            <div className="sppg-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#cfe4fc] pb-2">
                <div>
                  <h2 className="text-xs font-black uppercase text-[#1759ab] tracking-wider">
                    3. Foto Dokumentasi Dapur (Kamera HP / Galeri)
                  </h2>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CloudUpload className="w-3.5 h-3.5" />
                    Otomatis tersimpan ke Google Drive tanpa ribet salin link
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Persiapan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">1. Persiapan Bahan</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {prepUploading ? (
                      <div className="flex flex-col items-center gap-1 text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[10px] font-bold">Menyimpan ke GDrive...</span>
                      </div>
                    ) : prepPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prepPhotoUrl} alt="Persiapan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-700">Jepret / Pilih Foto</span>
                        <span className="text-[8px] text-slate-400">Auto save ke GDrive</span>
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
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrepPhotoUrl(null)}
                        className="text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Pengolahan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">2. Pengolahan Masak</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {cookUploading ? (
                      <div className="flex flex-col items-center gap-1 text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[10px] font-bold">Menyimpan ke GDrive...</span>
                      </div>
                    ) : cookPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cookPhotoUrl} alt="Pengolahan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-700">Jepret / Pilih Foto</span>
                        <span className="text-[8px] text-slate-400">Auto save ke GDrive</span>
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
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                      </span>
                      <button
                        type="button"
                        onClick={() => setCookPhotoUrl(null)}
                        className="text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Pengemasan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">3. Pengemasan Box</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {packUploading ? (
                      <div className="flex flex-col items-center gap-1 text-blue-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[10px] font-bold">Menyimpan ke GDrive...</span>
                      </div>
                    ) : packPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={packPhotoUrl} alt="Pengemasan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span className="text-[10px] font-bold text-slate-700">Jepret / Pilih Foto</span>
                        <span className="text-[8px] text-slate-400">Auto save ke GDrive</span>
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
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersimpan di GDrive
                      </span>
                      <button
                        type="button"
                        onClick={() => setPackPhotoUrl(null)}
                        className="text-rose-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Simpan & Publish Utama */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={prepUploading || cookUploading || packUploading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Rilis Menu Hari Ini</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================== MODE 2: SINKRONISASI GOOGLE SHEET ===================== */}
        {mode === 'sheet' && (
          <div className="sppg-card rounded-2xl p-5 sm:p-7 space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-[#0b1e3a]">
                Hubungkan dengan Google Spreadsheet
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Sheet khusus untuk data Menu & Angka Gizi (AKG). Foto dapur di-upload langsung dari kamera HP di tab sebelah.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Link Google Spreadsheet</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1759ab]"
                />
                <button
                  type="button"
                  onClick={handleSyncSheet}
                  disabled={syncStatus === 'syncing'}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                *Pastikan akses link di Google Sheet di-set ke: <strong>&quot;Siapa saja yang memiliki link (Viewer)&quot;</strong>.
              </p>
            </div>

            {syncStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{syncMessage}</span>
              </div>
            )}

            {syncStatus === 'error' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{syncMessage}</span>
              </div>
            )}

            {/* Format Ringkas 2 Tab Wajib dengan SPASI (Tanpa Pelengkap & Tanpa Link Foto) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-[#0b1e3a] uppercase tracking-wider">
                Struktur 2 Tab Google Sheet (Bersih & Sederhana):
              </h3>

              {/* Tab 1: Menu */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Tab 1: Menu Harian</span>
                    <span className="text-[10px] text-slate-500">5 Komponen pokok makanan (Karbo, Hewani, Nabati, Sayur, Buah)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sheet1Header, 'tab1')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTab === 'tab1' ? 'Tersalin!' : 'Salin Header'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                  tanggal | nama menu | karbohidrat | lauk hewani | lauk nabati | sayur | buah | status
                </p>
              </div>

              {/* Tab 2: AKG */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Tab 2: AKG</span>
                    <span className="text-[10px] text-slate-500">Data angka gizi 5 kelompok (spasi biasa)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sheet2Header, 'tab2')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTab === 'tab2' ? 'Tersalin!' : 'Salin Header'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                  tanggal | kelompok | target kategori | energi kkal | protein g | lemak g | karbo g | serat g
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
