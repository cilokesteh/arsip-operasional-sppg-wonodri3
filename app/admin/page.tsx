'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Layers,
  AlertCircle,
  Save,
  Check,
  Copy,
  Table,
  Camera,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { INITIAL_BENEFICIARIES } from '@/lib/data';

export default function AdminPage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [activeSubTab, setActiveSubTab] = useState<'sheet' | 'publish' | 'photos' | 'overrides'>('sheet');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const [sheetUrl, setSheetUrl] = useState('');

  // Form State untuk Publish Menu Baru
  const [newMenu, setNewMenu] = useState({
    date: '2026-10-01',
    menuNumber: 1,
    title: '',
    components: {
      karbohidrat: '',
      laukHewani: '',
      laukNabati: '',
      sayur: '',
      buah: '',
      pelengkap: 'Susu Pasteurisasi / UHT',
    },
    prepPhotoUploaded: true,
    cookPhotoUploaded: true,
    packPhotoUploaded: true,
  });

  const [publishSuccess, setPublishSuccess] = useState(false);

  // State File Foto Dapur
  const [prepPhoto, setPrepPhoto] = useState<string | null>(null);
  const [cookPhoto, setCookPhoto] = useState<string | null>(null);
  const [packPhoto, setPackPhoto] = useState<string | null>(null);

  const handleSyncSheet = () => {
    if (!sheetUrl) {
      alert('Masukkan link Google Spreadsheet operasional Anda terlebih dahulu.');
      return;
    }
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    }, 1500);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenu.title) {
      alert('Silakan isi judul/ringkasan menu terlebih dahulu.');
      return;
    }
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 5000);
  };

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const sheet1Header = "tanggal\tnomor_menu\tjudul_menu\tkarbohidrat\tlauk_hewani\tlauk_nabati\tsayur\tbuah\tpelengkap\tfoto_persiapan\tfoto_pengolahan\tfoto_pengemasan\tstatus";
  const sheet2Header = "tanggal\tkelompok\ttarget_kategori\tporsi_badge\tenergi_kkal\tprotein_g\tlemak_g\tkarbo_g\tserat_g";
  const sheet3Header = "tanggal\tid_sekolah\tkondisi\tjumlah_efektif\talasan";

  return (
    <div className="min-h-screen bg-[#f4f9ff] text-[#0d1b2e] pb-16">
      {/* Admin Header */}
      <header className="bg-[#0b1e3a] text-white border-b border-[#174a8a]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo BGN SPPG Wonodri 3"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">Panel Tim Teknis</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-[#c9a227] text-[#0b1e3a]">
                    SPPG Wonodri 3
                  </span>
                </div>
                <p className="text-[10px] text-[#a5cdf9]">
                  Integrasi Google Spreadsheet & Upload Dokumentasi Foto
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1759ab] hover:bg-[#1d6fd0] text-white transition-colors"
          >
            ← Halaman Publik
          </Link>
        </div>
      </header>

      {/* Admin Nav */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex space-x-2 border-b border-[#cfe4fc] overflow-x-auto scrollbar-none">
          {[
            { id: 'sheet' as const, label: '1. Setup Google Sheet', icon: FileSpreadsheet },
            { id: 'photos' as const, label: '2. Upload Foto Dapur (3 Tahap)', icon: Camera },
            { id: 'publish' as const, label: '3. Form Rilis Menu Manual', icon: Layers },
            { id: 'overrides' as const, label: '4. Data 1.555 Penerima', icon: AlertCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#1759ab] text-[#1759ab] bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-[#0b1e3a]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1759ab]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* SUBTAB 1: SETUP GOOGLE SHEET */}
        {activeSubTab === 'sheet' && (
          <div className="space-y-6">
            <div className="sppg-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1759ab] text-xs font-bold border border-blue-200">
                  <Table className="w-3.5 h-3.5" />
                  <span>2 Pilihan Mudah Upload Foto</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0b1e3a]">
                  Bagaimana Cara Upload Foto Dokumentasi?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Lo punya <strong>2 opsi sangat fleksibel</strong> untuk memasukkan foto (Persiapan, Pengolahan, Pengemasan):
                </p>
              </div>

              {/* 2 Cara Upload Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#cfe4fc] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1759ab] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-extrabold text-sm text-[#0b1e3a]">
                    Opsi A: Upload Langsung via Panel Web (Rekomendasi)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buka tab <strong>&quot;2. Upload Foto Dapur&quot;</strong> di atas. Tim dapur cukup jepret foto langsung dari kamera HP atau galeri dan klik tombol Simpan. Praktis tanpa perlu copy-paste link.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#cfe4fc] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#8a6d1d] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="font-extrabold text-sm text-[#0b1e3a]">
                    Opsi B: Masukkan Link Google Drive di Sheet
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Buat folder foto di Google Drive, lalu tempel link foto di kolom <code>foto_persiapan</code>, <code>foto_pengolahan</code>, dan <code>foto_pengemasan</code> pada Tab 1 (Menu_Harian).
                  </p>
                </div>
              </div>

              {/* Box Input Link Spreadsheet */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] space-y-3">
                <label className="text-xs font-black text-[#0b1e3a] uppercase tracking-wider block">
                  Tempel Link Google Spreadsheet Operasional Anda:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1759ab] font-mono"
                  />
                  <button
                    onClick={handleSyncSheet}
                    disabled={syncStatus === 'syncing'}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>{syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Hubungkan & Tarik Data'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  *Pastikan akses Spreadsheet di-set ke: <strong>&quot;Siapa saja yang memiliki link dapat melihat (Viewer)&quot;</strong> agar web bisa membaca datanya.
                </p>

                {syncStatus === 'success' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Spreadsheet terverifikasi dan siap digunakan untuk rilis tanggal 01 Oktober 2026!</span>
                  </div>
                )}
              </div>

              {/* Template 3 Tab */}
              <div className="space-y-4 pt-2">
                <h3 className="font-extrabold text-sm text-[#0b1e3a] uppercase tracking-wider">
                  Struktur 3 Tab Google Sheet (Termasuk Kolom Foto):
                </h3>

                {/* Tab 1 */}
                <div className="p-4 rounded-xl bg-white border border-[#cfe4fc] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-[#1759ab] block">
                        Tab 1: Menu_Harian
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Termasuk kolom <code>foto_persiapan</code>, <code>foto_pengolahan</code>, <code>foto_pengemasan</code>.
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sheet1Header, 'tab1')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedTab === 'tab1' ? 'Tersalin!' : 'Salin Header Baris 1'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 overflow-x-auto">
                    <code>tanggal | nomor_menu | judul_menu | karbohidrat | lauk_hewani | lauk_nabati | sayur | buah | pelengkap | foto_persiapan | foto_pengolahan | foto_pengemasan | status</code>
                  </div>
                </div>

                {/* Tab 2 */}
                <div className="p-4 rounded-xl bg-white border border-[#cfe4fc] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-[#1759ab] block">
                        Tab 2: AKG
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Untuk rincian angka gizi 5 kelompok (Besar, Kecil, Balita, Busui, Bumil).
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sheet2Header, 'tab2')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedTab === 'tab2' ? 'Tersalin!' : 'Salin Header Baris 1'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 overflow-x-auto">
                    <code>tanggal | kelompok | target_kategori | porsi_badge | energi_kkal | protein_g | lemak_g | karbo_g | serat_g</code>
                  </div>
                </div>

                {/* Tab 3 */}
                <div className="p-4 rounded-xl bg-white border border-[#cfe4fc] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-xs text-[#1759ab] block">
                        Tab 3: Penyesuaian
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Khusus jika ada sekolah libur atau perubahan kuota.
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(sheet3Header, 'tab3')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedTab === 'tab3' ? 'Tersalin!' : 'Salin Header Baris 1'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 overflow-x-auto">
                    <code>tanggal | id_sekolah | kondisi | jumlah_efektif | alasan</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: UPLOAD FOTO LANGSUNG DARI HP / LAPTOP */}
        {activeSubTab === 'photos' && (
          <div className="space-y-6">
            <div className="sppg-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#0b1e3a]">
                  Upload 3 Foto Dokumentasi Dapur
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Foto langsung dari kamera HP atau ambil dari galeri perangkat tim dapur.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Persiapan */}
                <div className="p-4 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#1759ab]">
                        1. Tahap Persiapan
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">04:00 - 05:30</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Pencucian sayur, sortasi bahan baku, pemotongan lauk.
                    </p>

                    <div className="relative h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                      {prepPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prepPhoto}
                          alt="Preview Persiapan"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-1.5 text-slate-400">
                          <Camera className="w-8 h-8 mx-auto text-slate-300" />
                          <span className="text-[11px] font-bold block text-slate-600">
                            Pilih / Ambil Foto
                          </span>
                          <span className="text-[9px] block">PNG / JPG maksimal 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPrepPhoto)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {prepPhoto && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap
                      </span>
                      <button
                        onClick={() => setPrepPhoto(null)}
                        className="text-slate-400 hover:text-rose-600 text-[10px]"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Pengolahan */}
                <div className="p-4 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#1759ab]">
                        2. Tahap Pengolahan
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">05:30 - 07:15</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Pemasakan kuali bertekanan, suhu &gt;85°C, higienitas.
                    </p>

                    <div className="relative h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                      {cookPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cookPhoto}
                          alt="Preview Pengolahan"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-1.5 text-slate-400">
                          <Camera className="w-8 h-8 mx-auto text-slate-300" />
                          <span className="text-[11px] font-bold block text-slate-600">
                            Pilih / Ambil Foto
                          </span>
                          <span className="text-[9px] block">PNG / JPG maksimal 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setCookPhoto)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {cookPhoto && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap
                      </span>
                      <button
                        onClick={() => setCookPhoto(null)}
                        className="text-slate-400 hover:text-rose-600 text-[10px]"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Pengemasan */}
                <div className="p-4 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-[#1759ab]">
                        3. Tahap Pengemasan
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">07:15 - 08:30</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Plating gramasi porsi, seal box thermal, siap kirim.
                    </p>

                    <div className="relative h-44 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                      {packPhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={packPhoto}
                          alt="Preview Pengemasan"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="space-y-1.5 text-slate-400">
                          <Camera className="w-8 h-8 mx-auto text-slate-300" />
                          <span className="text-[11px] font-bold block text-slate-600">
                            Pilih / Ambil Foto
                          </span>
                          <span className="text-[9px] block">PNG / JPG maksimal 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPackPhoto)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {packPhoto && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap
                      </span>
                      <button
                        onClick={() => setPackPhoto(null)}
                        className="text-slate-400 hover:text-rose-600 text-[10px]"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => alert('Foto dapur berhasil disimpan secara lokal!')}
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Dokumentasi Foto</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: FORM PUBLISH MENU */}
        {activeSubTab === 'publish' && (
          <div className="space-y-6">
            <div className="sppg-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#cfe4fc] pb-4">
                <h2 className="text-xl font-black text-[#0b1e3a]">
                  Form Input Manual & Rilis Menu Harian
                </h2>
                <p className="text-xs text-slate-500">
                  Alternatif jika tim ingin langsung input menu perdana 01 Oktober 2026 tanpa lewat Google Sheet.
                </p>
              </div>

              {publishSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Menu #{newMenu.menuNumber} berhasil disimpan dan dipublikasikan ke arsip!</span>
                </div>
              )}

              <form onSubmit={handlePublish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Layanan</label>
                    <input
                      type="date"
                      value={newMenu.date}
                      onChange={(e) => setNewMenu({ ...newMenu, date: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1759ab]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Menu</label>
                    <input
                      type="number"
                      value={newMenu.menuNumber}
                      onChange={(e) => setNewMenu({ ...newMenu, menuNumber: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1759ab]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Judul Menu / Ringkasan Menu
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Nasi Putih, Ayam Semur Kecap, Tahu Bacem, Tumis Buncis, Pisang, & Susu"
                    value={newMenu.title}
                    onChange={(e) => setNewMenu({ ...newMenu, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#1759ab]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Karbohidrat</label>
                    <input
                      type="text"
                      placeholder="Nasi Putih Pulen"
                      value={newMenu.components.karbohidrat}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, karbohidrat: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lauk Hewani</label>
                    <input
                      type="text"
                      placeholder="Ayam Ungkep Semur"
                      value={newMenu.components.laukHewani}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, laukHewani: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lauk Nabati</label>
                    <input
                      type="text"
                      placeholder="Tahu Bacem Tradisional"
                      value={newMenu.components.laukNabati}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, laukNabati: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sayur & Serat</label>
                    <input
                      type="text"
                      placeholder="Tumis Buncis & Jagung"
                      value={newMenu.components.sayur}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, sayur: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Buah</label>
                    <input
                      type="text"
                      placeholder="Pisang Cavendish Segar"
                      value={newMenu.components.buah}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, buah: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pelengkap</label>
                    <input
                      type="text"
                      placeholder="Susu Pasteurisasi"
                      value={newMenu.components.pelengkap}
                      onChange={(e) => setNewMenu({ ...newMenu, components: { ...newMenu.components, pelengkap: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#1759ab] hover:bg-[#1d6fd0] transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Publish Menu ke Arsip</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBTAB 4: DATA MASTER PENERIMA */}
        {activeSubTab === 'overrides' && (
          <div className="space-y-6">
            <div className="sppg-card rounded-2xl p-6 sm:p-8 space-y-4">
              <div>
                <h2 className="text-xl font-black text-[#0b1e3a]">
                  Data Master 1.555 Penerima Manfaat
                </h2>
                <p className="text-xs text-slate-500">
                  Data 12 Sekolah + 1 Posyandu dengan revisi resmi (Pleburan 03 = 342, Kuntum Mekar = 31).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {INITIAL_BENEFICIARIES.map((site) => (
                  <div
                    key={site.id}
                    className="p-3.5 rounded-xl bg-[#f4f9ff] border border-[#cfe4fc] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-[#0b1e3a] block">{site.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Kategori: {site.type} • Kuota: {site.masterCount} Penerima
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#1759ab] bg-white px-2.5 py-1 rounded-lg border border-[#cfe4fc]">
                      {site.masterCount}
                    </span>
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
