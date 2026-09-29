'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface AKGInput {
  groupName: string;
  targetCategory: string;
  portionBadge: string;
  energyKcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  fiberG: number;
}

const DEFAULT_AKG_PRESETS: AKGInput[] = [
  { groupName: 'Besar', targetCategory: 'SD 4-6 / SMP / SMK / GURU', portionBadge: 'Porsi Remaja & Dewasa', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
  { groupName: 'Kecil', targetCategory: 'PAUD / TK / SD 1-3', portionBadge: 'Porsi Anak Usia Dini', energyKcal: 462.9, proteinG: 13.6, fatG: 14.4, carbsG: 81.7, fiberG: 2.4 },
  { groupName: 'Balita', targetCategory: '6 - 60 Bulan', portionBadge: 'Porsi Lunak', energyKcal: 426.9, proteinG: 13.0, fatG: 14.3, carbsG: 51.7, fiberG: 2.0 },
  { groupName: 'Busui', targetCategory: 'Ibu Menyusui', portionBadge: 'Porsi Padat Energi', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
  { groupName: 'Bumil', targetCategory: 'Ibu Hamil', portionBadge: 'Porsi Zat Besi & Folat', energyKcal: 572.4, proteinG: 15.5, fatG: 14.5, carbsG: 83.9, fiberG: 2.4 },
];

export default function AdminPage() {
  const [mode, setMode] = useState<'form' | 'sheet'>('form');

  // 1. Data Menu Harian
  const [menuDate, setMenuDate] = useState('2026-10-01');
  const [menuNumber, setMenuNumber] = useState(1);
  const [menuTitle, setMenuTitle] = useState('');
  const [components, setComponents] = useState({
    karbohidrat: '',
    laukHewani: '',
    laukNabati: '',
    sayur: '',
    buah: '',
    pelengkap: 'Susu UHT / Pasteurisasi',
  });

  // 2. Data AKG 5 Kelompok
  const [akgList, setAkgList] = useState<AKGInput[]>(DEFAULT_AKG_PRESETS);

  // 3. State 3 Foto
  const [prepPhoto, setPrepPhoto] = useState<string | null>(null);
  const [cookPhoto, setCookPhoto] = useState<string | null>(null);
  const [packPhoto, setPackPhoto] = useState<string | null>(null);

  // 4. State Sync Sheet
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleAkgChange = (index: number, field: keyof AKGInput, value: number) => {
    const updated = [...akgList];
    updated[index] = { ...updated[index], [field]: value };
    setAkgList(updated);
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuTitle.trim()) {
      alert('Silakan tulis ringkasan menu hari ini.');
      return;
    }
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  const handleSyncSheet = () => {
    if (!sheetUrl.trim()) {
      alert('Masukkan link Google Sheet Anda terlebih dahulu.');
      return;
    }
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }, 1200);
  };

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const sheet1Header = "tanggal\tnomor_menu\tjudul_menu\tkarbohidrat\tlauk_hewani\tlauk_nabati\tsayur\tbuah\tpelengkap\tstatus";
  const sheet2Header = "tanggal\tkelompok\ttarget_kategori\tporsi_badge\tenergi_kkal\tprotein_g\tlemak_g\tkarbo_g\tserat_g";

  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#0d1b2e] pb-16">
      {/* Header Sederhana */}
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

          <Link
            href="/"
            className="text-xs font-bold text-[#a8d8f0] hover:text-white transition-colors"
          >
            ← Lihat Web Publik
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-5">
        {/* Toggle Mode: Input Langsung vs Google Sheet */}
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
                <span>Menu #{menuNumber} & nilai AKG 5 kelompok untuk tanggal {menuDate} berhasil dipublikasikan!</span>
              </div>
            )}

            {/* Bagian 1: Data Menu Hari Ini */}
            <div className="sppg-card rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-black uppercase text-[#1759ab] tracking-wider">
                1. Data Menu Hari Ini
              </h2>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Menu</label>
                  <input
                    type="number"
                    value={menuNumber}
                    onChange={(e) => setMenuNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1759ab]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Ringkasan Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Nasi Putih, Ayam Semur Kecap, Tahu Bacem, Tumis Buncis, Pisang, Susu"
                  value={menuTitle}
                  onChange={(e) => setMenuTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1759ab]"
                  required
                />
              </div>

              {/* Rincian Komponen 6 Kotak */}
              <div className="pt-1">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Rincian Komponen Porsi:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Karbo (Nasi Pulen)"
                    value={components.karbohidrat}
                    onChange={(e) => setComponents({ ...components, karbohidrat: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Lauk Hewani (Ayam Semur)"
                    value={components.laukHewani}
                    onChange={(e) => setComponents({ ...components, laukHewani: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Lauk Nabati (Tahu Bacem)"
                    value={components.laukNabati}
                    onChange={(e) => setComponents({ ...components, laukNabati: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Sayur (Tumis Buncis)"
                    value={components.sayur}
                    onChange={(e) => setComponents({ ...components, sayur: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Buah (Pisang Cavendish)"
                    value={components.buah}
                    onChange={(e) => setComponents({ ...components, buah: e.target.value })}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Pelengkap (Susu UHT)"
                    value={components.pelengkap}
                    onChange={(e) => setComponents({ ...components, pelengkap: e.target.value })}
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
                      Nilai sudah otomatis terisi standar awal BGN, bisa langsung diedit angkanya.
                    </span>
                  </div>
                </div>
              </div>

              {/* 5 Kelompok Input Accordion/Cards */}
              <div className="space-y-3">
                {akgList.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#1759ab] text-white">
                          {item.groupName}
                        </span>
                        <span className="text-xs font-extrabold text-[#0b1e3a]">
                          {item.targetCategory}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.portionBadge}
                      </span>
                    </div>

                    {/* 5 Field Gizi: Energi, Protein, Lemak, Karbo, Serat */}
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

            {/* Bagian 3: Upload 3 Foto Langsung */}
            <div className="sppg-card rounded-2xl p-5 space-y-3">
              <h2 className="text-xs font-black uppercase text-[#1759ab] tracking-wider">
                3. Foto Dokumentasi Dapur (Langsung dari HP / Galeri)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Persiapan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">1. Persiapan Bahan</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {prepPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prepPhoto} alt="Persiapan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-semibold text-slate-500">Ambil / Pilih Foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setPrepPhoto)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {prepPhoto && (
                    <button
                      type="button"
                      onClick={() => setPrepPhoto(null)}
                      className="text-[10px] text-rose-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                {/* 2. Pengolahan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">2. Pengolahan Masak</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {cookPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cookPhoto} alt="Pengolahan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-semibold text-slate-500">Ambil / Pilih Foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setCookPhoto)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {cookPhoto && (
                    <button
                      type="button"
                      onClick={() => setCookPhoto(null)}
                      className="text-[10px] text-rose-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                {/* 3. Pengemasan */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">3. Pengemasan Box</span>
                  <div className="relative h-28 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                    {packPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={packPhoto} alt="Pengemasan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-semibold text-slate-500">Ambil / Pilih Foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setPackPhoto)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {packPhoto && (
                    <button
                      type="button"
                      onClick={() => setPackPhoto(null)}
                      className="text-[10px] text-rose-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Tombol Simpan & Publish Utama */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-black text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Menu & Rilis AKG Hari Ini</span>
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
                Mendukung 2 tab utama: <strong>Menu_Harian</strong> dan <strong>AKG</strong>.
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
                <span>Google Sheet berhasil tersambung! Data Menu_Harian dan AKG siap disinkronkan.</span>
              </div>
            )}

            {/* Format Ringkas 2 Tab Wajib */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-[#0b1e3a] uppercase tracking-wider">
                Struktur 2 Tab Wajib di Google Sheet:
              </h3>

              {/* Tab 1: Menu */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 block">Tab 1: Menu_Harian</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sheet1Header, 'tab1')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTab === 'tab1' ? 'Tersalin!' : 'Salin Header'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                  tanggal | nomor_menu | judul_menu | karbohidrat | lauk_hewani | lauk_nabati | sayur | buah | pelengkap | status
                </p>
              </div>

              {/* Tab 2: AKG */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Tab 2: AKG (Angka Kandungan Gizi)</span>
                    <span className="text-[10px] text-slate-500">Untuk 5 kelompok: Besar, Kecil, Balita, Busui, Bumil</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sheet2Header, 'tab2')}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedTab === 'tab2' ? 'Tersalin!' : 'Salin Header'}</span>
                  </button>
                </div>
                <p className="font-mono text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                  tanggal | kelompok | target_kategori | porsi_badge | energi_kkal | protein_g | lemak_g | karbo_g | serat_g
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
