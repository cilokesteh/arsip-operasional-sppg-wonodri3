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
  Utensils,
  FileText,
  Printer,
  Users,
  Calendar,
  Edit,
  RotateCcw,
} from 'lucide-react';
import { uploadToGoogleDrive } from '@/lib/driveUpload';
import { INITIAL_BENEFICIARIES, DailyMenuRecord } from '@/lib/data';

interface AKGInputRaw {
  groupName: string;
  targetCategory: string;
  energyKcal: string;
  proteinG: string;
  fatG: string;
  carbsG: string;
  fiberG: string;
}

const DEFAULT_PASSCODE = '91206';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputPasscode, setInputPasscode] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Mode panel: 'input' (input baru/edit form) atau 'list' (kelola/edit daftar arsip)
  const [activeTab, setActiveTab] = useState<'input' | 'list'>('input');
  const [savedMenuList, setSavedMenuList] = useState<DailyMenuRecord[]>([]);

  // 1. Data Menu Harian & Fitur Backdate
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

  // 2. INPUT AKG MASTER HANYA 2 KELOMPOK (BESAR & KECIL)
  const [akgBesar, setAkgBesar] = useState<Omit<AKGInputRaw, 'groupName' | 'targetCategory'>>({
    energyKcal: '',
    proteinG: '',
    fatG: '',
    carbsG: '',
    fiberG: '',
  });

  const [akgKecil, setAkgKecil] = useState<Omit<AKGInputRaw, 'groupName' | 'targetCategory'>>({
    energyKcal: '',
    proteinG: '',
    fatG: '',
    carbsG: '',
    fiberG: '',
  });

  // 3. State 3 Foto Dapur
  const [prepPhotoUrl, setPrepPhotoUrl] = useState<string | null>(null);
  const [prepUploading, setPrepUploading] = useState<boolean>(false);

  const [cookPhotoUrl, setCookPhotoUrl] = useState<string | null>(null);
  const [cookUploading, setCookUploading] = useState<boolean>(false);

  const [packPhotoUrl, setPackPhotoUrl] = useState<string | null>(null);
  const [packUploading, setPackUploading] = useState<boolean>(false);

  // 4. Data Alokasi Penerima Manfaat
  const [beneficiaryOverrides, setBeneficiaryOverrides] = useState<Record<string, { condition: 'aktif' | 'libur'; effectiveCount: number; reason: string }>>({});

  // 5. Uraian Kegiatan Operasional Dapur Baku Resmi SPPG Wonodri 3
  const [uraianKegiatan, setUraianKegiatan] = useState(
    `Uraian Kegiatan

1. Sterilisasi Area Dapur dan Penerapan Higienitas Operasional
   Melaksanakan sterilisasi area dapur serta memastikan penerapan standar kebersihan dan higienitas selama proses operasional berlangsung.

2. Sortasi dan Pemeriksaan Bahan Baku Segar
   Melakukan sortasi dan pemeriksaan kualitas bahan baku segar, meliputi sayuran, lauk hewani, dan lauk nabati sebelum proses pengolahan.

3. Proses Pengolahan Masakan
   Melaksanakan proses pengolahan makanan dengan memastikan suhu masakan terukur dan mencapai suhu di atas 85°C.

4. Food Plating Sesuai Standar Gramasi
   Melakukan penataan dan pembagian makanan (food plating) sesuai dengan standar gramasi dan ketentuan gizi yang telah ditetapkan oleh BGN.

5. Penyegelan dan Serah Terima Distribusi
   Melakukan penyegelan wadah/box serta proses serah terima makanan kepada armada distribusi untuk selanjutnya didistribusikan ke penerima manfaat.

Kesimpulan:
Secara keseluruhan, kegiatan operasional SPPG Wonodri 3 berjalan dengan lancar dan sesuai dengan tahapan operasional yang telah ditetapkan.`
  );

  const [publishSuccess, setPublishSuccess] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);

  // Load daftar arsip dan draft
  const loadSavedMenus = () => {
    try {
      const stored = localStorage.getItem('sppg_synced_menus');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedMenuList(parsed);
        }
      }
    } catch {
      // fallback
    }
  };
  // LOAD DRAFT TERSIMPAN SECARA OTOMATIS
  useEffect(() => {
    const authStatus = sessionStorage.getItem('sppg_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    loadSavedMenus();

    try {
      const savedDraft = localStorage.getItem('sppg_admin_draft_v2');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.menuDate) setMenuDate(draft.menuDate);
        if (draft.namaMenu) setNamaMenu(draft.namaMenu);
        if (draft.components) setComponents(draft.components);
        if (draft.akgBesar) setAkgBesar(draft.akgBesar);
        if (draft.akgKecil) setAkgKecil(draft.akgKecil);
        if (draft.menuPhotoUrl) setMenuPhotoUrl(draft.menuPhotoUrl);
        if (draft.prepPhotoUrl) setPrepPhotoUrl(draft.prepPhotoUrl);
        if (draft.cookPhotoUrl) setCookPhotoUrl(draft.cookPhotoUrl);
        if (draft.packPhotoUrl) setPackPhotoUrl(draft.packPhotoUrl);
        if (draft.beneficiaryOverrides) setBeneficiaryOverrides(draft.beneficiaryOverrides);
        if (draft.uraianKegiatan) setUraianKegiatan(draft.uraianKegiatan);
      }
    } catch {
      // fallback
    }
  }, []);

  // AUTO-SAVE SETIAP KALI USER EDIT APAPUN (AKG, MENU, KOMPONEN, FOTO, TANGGAL, DLL)
  useEffect(() => {
    if (!isAuthenticated) return;
    const draftPayload = {
      menuDate,
      namaMenu,
      components,
      akgBesar,
      akgKecil,
      menuPhotoUrl,
      prepPhotoUrl,
      cookPhotoUrl,
      packPhotoUrl,
      beneficiaryOverrides,
      uraianKegiatan,
      lastSaved: new Date().toISOString(),
    };
    try {
      localStorage.setItem('sppg_admin_draft_v2', JSON.stringify(draftPayload));
    } catch {
      // fallback
    }
  }, [
    isAuthenticated,
    menuDate,
    namaMenu,
    components,
    akgBesar,
    akgKecil,
    menuPhotoUrl,
    prepPhotoUrl,
    cookPhotoUrl,
    packPhotoUrl,
    beneficiaryOverrides,
    uraianKegiatan,
  ]);

  // FUNGSI PILIH & MUAT DATA ARSIP LAMA KE FORM UNTUK DI-EDIT
  const handleLoadMenuToEdit = (menu: DailyMenuRecord) => {
    setMenuDate(menu.date);
    setNamaMenu(menu.title || '');
    if (menu.components) {
      setComponents(menu.components);
    }
    setMenuPhotoUrl(menu.menuPhotoUrl || null);
    if (menu.uraianPekerjaan) {
      setUraianKegiatan(menu.uraianPekerjaan);
    }

    // Ekstrak nilai AKG Besar & Kecil dari arsip yang dipilih
    const besarCard = menu.nutritionCards?.find((c) => c.groupName.toLowerCase() === 'besar');
    if (besarCard) {
      setAkgBesar({
        energyKcal: String(besarCard.energyKcal || ''),
        proteinG: String(besarCard.proteinG || ''),
        fatG: String(besarCard.fatG || ''),
        carbsG: String(besarCard.carbsG || ''),
        fiberG: String(besarCard.fiberG || ''),
      });
    }

    const kecilCard = menu.nutritionCards?.find((c) => c.groupName.toLowerCase() === 'kecil');
    if (kecilCard) {
      setAkgKecil({
        energyKcal: String(kecilCard.energyKcal || ''),
        proteinG: String(kecilCard.proteinG || ''),
        fatG: String(kecilCard.fatG || ''),
        carbsG: String(kecilCard.carbsG || ''),
        fiberG: String(kecilCard.fiberG || ''),
      });
    }

    // Foto Dapur
    const pPrep = menu.photos?.find((p) => p.step.toLowerCase().includes('persiapan'));
    if (pPrep) setPrepPhotoUrl(pPrep.imageUrl);

    const pCook = menu.photos?.find((p) => p.step.toLowerCase().includes('pengolahan'));
    if (pCook) setCookPhotoUrl(pCook.imageUrl);

    const pPack = menu.photos?.find((p) => p.step.toLowerCase().includes('pengemasan'));
    if (pPack) setPackPhotoUrl(pPack.imageUrl);

    // Overrides
    if (menu.overrides && menu.overrides.length > 0) {
      const ovMap: Record<string, { condition: 'aktif' | 'libur'; effectiveCount: number; reason: string }> = {};
      menu.overrides.forEach((o) => {
        ovMap[o.siteId] = { condition: o.condition === 'libur' ? 'libur' : 'aktif', effectiveCount: o.effectiveCount, reason: o.reason };
      });
      setBeneficiaryOverrides(ovMap);
    } else {
      setBeneficiaryOverrides({});
    }

    setActiveTab('input');
    setEditingAlert(`Memuat data menu tanggal ${menu.date}. Silakan ubah bagian yang diinginkan lalu klik Simpan.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setEditingAlert(null), 7000);
  };

  // FUNGSI HAPUS SATU ARSIP MENU
  const handleDeleteMenu = (dateToDelete: string) => {
    if (confirm(`Yakin ingin menghapus arsip menu untuk tanggal ${dateToDelete}?`)) {
      try {
        const stored = localStorage.getItem('sppg_synced_menus');
        if (stored) {
          const list = JSON.parse(stored);
          const updated = list.filter((m: { date: string }) => m.date !== dateToDelete);
          localStorage.setItem('sppg_synced_menus', JSON.stringify(updated));
          setSavedMenuList(updated);
          alert(`Arsip menu tanggal ${dateToDelete} berhasil dihapus.`);
        }
      } catch {
        // fallback
      }
    }
  };

  // Bersihkan form untuk mulai input tanggal baru
  const handleResetForm = () => {
    setNamaMenu('');
    setMenuPhotoUrl(null);
    setPrepPhotoUrl(null);
    setCookPhotoUrl(null);
    setPackPhotoUrl(null);
    setComponents({ karbohidrat: '', laukHewani: '', laukNabati: '', sayur: '', buah: '' });
    setAkgBesar({ energyKcal: '', proteinG: '', fatG: '', carbsG: '', fiberG: '' });
    setAkgKecil({ energyKcal: '', proteinG: '', fatG: '', carbsG: '', fiberG: '' });
    setBeneficiaryOverrides({});
    alert('Form dikosongkan. Siap untuk input baru.');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode === DEFAULT_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sppg_admin_auth', 'true');
      setLoginError('');
      loadSavedMenus();
    } else {
      setLoginError('Kode akses salah! Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sppg_admin_auth');
    setInputPasscode('');
  };

  const sanitizeNumberString = (val: string) => {
    if (val.length > 1 && val.startsWith('0') && !val.startsWith('0.') && !val.startsWith('0,')) {
      return val.replace(/^0+/, '');
    }
    return val;
  };

  const handleAkgBesarChange = (field: keyof typeof akgBesar, rawValue: string) => {
    setAkgBesar((prev) => ({ ...prev, [field]: sanitizeNumberString(rawValue) }));
  };

  const handleAkgKecilChange = (field: keyof typeof akgKecil, rawValue: string) => {
    setAkgKecil((prev) => ({ ...prev, [field]: sanitizeNumberString(rawValue) }));
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
      alert('Silakan tulis nama menu.');
      return;
    }

    const parseNum = (s: string, def: number) => {
      const v = parseFloat(s.replace(',', '.'));
      return isNaN(v) ? def : v;
    };

    const generatedNutritionCards = [
      {
        groupName: 'Besar',
        targetCategory: 'SD 4-6 / SMP / SMK / GURU',
        portionBadge: 'Porsi Remaja & Dewasa',
        energyKcal: parseNum(akgBesar.energyKcal, 746.15),
        proteinG: parseNum(akgBesar.proteinG, 24.08),
        fatG: parseNum(akgBesar.fatG, 24.32),
        carbsG: parseNum(akgBesar.carbsG, 109.13),
        fiberG: parseNum(akgBesar.fiberG, 3.31),
        color: '#2563eb',
        bgLight: '#eff6ff',
        borderAccent: '#3b82f6',
        recommendedPct: { protein: 25, fat: 23, carbs: 65, fiber: 20 },
      },
      {
        groupName: 'Kecil',
        targetCategory: 'PAUD / TK / SD 1-3',
        portionBadge: 'Porsi Anak Usia Dini',
        energyKcal: parseNum(akgKecil.energyKcal, 656.9),
        proteinG: parseNum(akgKecil.proteinG, 21.98),
        fatG: parseNum(akgKecil.fatG, 23.9),
        carbsG: parseNum(akgKecil.carbsG, 89.86),
        fiberG: parseNum(akgKecil.fiberG, 3.26),
        color: '#059669',
        bgLight: '#ecfdf5',
        borderAccent: '#10b981',
        recommendedPct: { protein: 22, fat: 24, carbs: 60, fiber: 18 },
      },
      {
        groupName: 'Balita',
        targetCategory: '6 - 60 Bulan (Balita)',
        portionBadge: 'Sama dengan Porsi Kecil',
        energyKcal: parseNum(akgKecil.energyKcal, 656.9),
        proteinG: parseNum(akgKecil.proteinG, 21.98),
        fatG: parseNum(akgKecil.fatG, 23.9),
        carbsG: parseNum(akgKecil.carbsG, 89.86),
        fiberG: parseNum(akgKecil.fiberG, 3.26),
        color: '#d97706',
        bgLight: '#fffbeb',
        borderAccent: '#f59e0b',
        recommendedPct: { protein: 20, fat: 25, carbs: 45, fiber: 15 },
      },
      {
        groupName: 'Busui',
        targetCategory: 'Ibu Menyusui (Masa Laktasi)',
        portionBadge: 'Sama dengan Porsi Besar',
        energyKcal: parseNum(akgBesar.energyKcal, 746.15),
        proteinG: parseNum(akgBesar.proteinG, 24.08),
        fatG: parseNum(akgBesar.fatG, 24.32),
        carbsG: parseNum(akgBesar.carbsG, 109.13),
        fiberG: parseNum(akgBesar.fiberG, 3.31),
        color: '#e11d48',
        bgLight: '#fff1f2',
        borderAccent: '#f43f5e',
        recommendedPct: { protein: 26, fat: 22, carbs: 64, fiber: 22 },
      },
      {
        groupName: 'Bumil',
        targetCategory: 'Ibu Hamil (Trimester 1, 2, & 3)',
        portionBadge: 'Sama dengan Porsi Besar',
        energyKcal: parseNum(akgBesar.energyKcal, 746.15),
        proteinG: parseNum(akgBesar.proteinG, 24.08),
        fatG: parseNum(akgBesar.fatG, 24.32),
        carbsG: parseNum(akgBesar.carbsG, 109.13),
        fiberG: parseNum(akgBesar.fiberG, 3.31),
        color: '#7c3aed',
        bgLight: '#f5f3ff',
        borderAccent: '#8b5cf6',
        recommendedPct: { protein: 26, fat: 22, carbs: 64, fiber: 22 },
      },
    ];

    const overridesList = Object.entries(beneficiaryOverrides).map(([siteId, data]) => ({
      siteId,
      condition: data.condition as 'libur' | 'penyesuaian',
      effectiveCount: data.effectiveCount,
      reason: data.reason,
    }));

    const newRecord: DailyMenuRecord = {
      date: menuDate,
      menuNumber: 1,
      title: namaMenu,
      uraianPekerjaan: uraianKegiatan,
      menuPhotoUrl: menuPhotoUrl || '',
      status: 'published' as const,
      publishedAt: `${menuDate} • 08:30 WIB`,
      components,
      nutritionCards: generatedNutritionCards,
      photos: [
        {
          step: 'Persiapan',
          title: 'Sortasi Bahan Baku Higienis',
          description: 'Pembersihan dan sortasi bahan baku makanan di dapur SPPG Wonodri 3.',
          imageUrl: prepPhotoUrl || '',
          timeEstimate: '04:00 - 05:30 WIB',
        },
        {
          step: 'Pengolahan',
          title: 'Pemasakan Suhu Terukur (>85°C)',
          description: 'Pengolahan makanan hangat menggunakan kuali stainless steel berstandar BGN.',
          imageUrl: cookPhotoUrl || '',
          timeEstimate: '05:30 - 07:15 WIB',
        },
        {
          step: 'Pengemasan',
          title: 'Food Plating & Segel Thermal Box',
          description: 'Pengecekan porsi gramasi dan segel kotak makanan hangat siap kirim.',
          imageUrl: packPhotoUrl || '',
          timeEstimate: '07:15 - 08:30 WIB',
        },
      ].filter((p) => p.imageUrl),
      overrides: overridesList,
    };

    try {
      const existing = localStorage.getItem('sppg_synced_menus');
      let list: DailyMenuRecord[] = existing ? JSON.parse(existing) : [];
      // Simpan pembaruan atau tambah baru
      list = [newRecord, ...list.filter((item: { date: string }) => item.date !== menuDate)];
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem('sppg_synced_menus', JSON.stringify(list));
      setSavedMenuList(list);
      localStorage.removeItem('sppg_admin_draft_v2');
    } catch {
      // fallback
    }

    setPublishSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert(`BERHASIL DISIMPAN!\n\nLaporan menu tanggal ${menuDate} ("${namaMenu}") telah berhasil disimpan dan terbit di arsip.`);
    setTimeout(() => setPublishSuccess(false), 8000);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0d1b2e] pb-16">
      {/* Header Sticky */}
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
                  Admin Panel SPPG Wonodri 3
                </span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                  <CloudUpload className="w-3 h-3" /> Auto-Save GDrive & Edit Arsip
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              title="Cetak Laporan Langsung"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors hidden sm:inline"
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
        {/* Toggle Mode: Input Baru vs Kelola / Edit Arsip Lama */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl max-w-sm mx-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'input'
                ? 'bg-white text-[#1759ab] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-blue-600" />
            <span>Form Input / Edit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              loadSavedMenus();
              setActiveTab('list');
            }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-[#1759ab] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit className="w-3.5 h-3.5 text-amber-600" />
            <span>Kelola Arsip ({savedMenuList.length})</span>
          </button>
        </div>

        {/* Notifikasi Sedang Mengedit Arsip Tertentu */}
        {editingAlert && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-between">
            <span>{editingAlert}</span>
            <button
              type="button"
              onClick={handleResetForm}
              className="text-xs text-blue-700 underline font-extrabold cursor-pointer ml-2"
            >
              Reset ke Form Kosong
            </button>
          </div>
        )}

        {/* ===================== TAB 1: FORM INPUT / EDIT MENU ===================== */}
        {activeTab === 'input' && (
          <form onSubmit={handlePublish} className="space-y-6">
            {publishSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Arsip menu untuk tanggal {menuDate} berhasil diperbarui & tersimpan!</span>
              </div>
            )}

            {/* ===================== ALUR 1: MENU ===================== */}
            <div className="app-card rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    1. Menu Makanan & Tanggal Arsip
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Form</span>
                  </button>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Alur 1</span>
                </div>
              </div>

              {/* Tanggal Layanan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanggal Layanan (Bisa Hari Ini, Kemarin, atau Tanggal Lampau):</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <input
                    type="date"
                    value={menuDate}
                    onChange={(e) => setMenuDate(e.target.value)}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:ring-2 focus:ring-blue-600"
                    required
                  />
                  <span className="text-[11px] text-slate-500">
                    *Mengedit tanggal yang sudah ada akan otomatis memperbarui arsip tanggal tersebut.
                  </span>
                </div>
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

            {/* ===================== ALUR 2: AKG ===================== */}
            <div className="app-card rounded-2xl p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                      2. Angka Kandungan Gizi (AKG) — Cukup Isi 2 Kelompok
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      Otomatis mengisi Busui, Bumil, dan Balita di laporan akhir.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">Alur 2</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PORSI BESAR */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white">
                        1. PORSI BESAR
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 block mt-1">
                        SD 4-6 / SMP / SMK / GURU
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-right">
                      Auto-Copy ke:<br />Busui & Bumil
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-0.5">Energi (Kkal)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={akgBesar.energyKcal}
                        onChange={(e) => handleAkgBesarChange('energyKcal', e.target.value)}
                        placeholder="Contoh: 746.15"
                        className="w-full px-2.5 py-2 border border-amber-300 rounded-lg bg-white font-black text-amber-950 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Protein (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgBesar.proteinG}
                          onChange={(e) => handleAkgBesarChange('proteinG', e.target.value)}
                          placeholder="Contoh: 24.08"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Lemak (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgBesar.fatG}
                          onChange={(e) => handleAkgBesarChange('fatG', e.target.value)}
                          placeholder="Contoh: 24.32"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Karbo (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgBesar.carbsG}
                          onChange={(e) => handleAkgBesarChange('carbsG', e.target.value)}
                          placeholder="Contoh: 109.13"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Serat (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgBesar.fiberG}
                          onChange={(e) => handleAkgBesarChange('fiberG', e.target.value)}
                          placeholder="Contoh: 3.31"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PORSI KECIL */}
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                        2. PORSI KECIL
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 block mt-1">
                        PAUD / TK / SD 1-3
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-right">
                      Auto-Copy ke:<br />Balita 6-60 Bln
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-amber-900 block mb-0.5">Energi (Kkal)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={akgKecil.energyKcal}
                        onChange={(e) => handleAkgKecilChange('energyKcal', e.target.value)}
                        placeholder="Contoh: 656.90"
                        className="w-full px-2.5 py-2 border border-amber-300 rounded-lg bg-white font-black text-amber-950 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Protein (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgKecil.proteinG}
                          onChange={(e) => handleAkgKecilChange('proteinG', e.target.value)}
                          placeholder="Contoh: 21.98"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Lemak (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgKecil.fatG}
                          onChange={(e) => handleAkgKecilChange('fatG', e.target.value)}
                          placeholder="Contoh: 23.90"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Karbo (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgKecil.carbsG}
                          onChange={(e) => handleAkgKecilChange('carbsG', e.target.value)}
                          placeholder="Contoh: 89.86"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Serat (g)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={akgKecil.fiberG}
                          onChange={(e) => handleAkgKecilChange('fiberG', e.target.value)}
                          placeholder="Contoh: 3.26"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================== ALUR 3: DOKUMENTASI ===================== */}
            <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                    3. Dokumentasi Dapur (3 Tahap)
                  </h2>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Alur 3</span>
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

            {/* ===================== ALUR 4: ALOKASI ===================== */}
            <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                      4. Alokasi Penerima Manfaat (12 Sekolah + 1 Posyandu)
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      Total Master: 1.554 Porsi. Atur sekolah libur khusus tanggal ini jika ada.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">Alur 4</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Lembaga Sekolah / Posyandu</th>
                        <th className="py-2.5 px-3 w-24">Tipe</th>
                        <th className="py-2.5 px-3 w-28 text-right">Master Kuota</th>
                        <th className="py-2.5 px-3 w-32 text-center">Status Hari Ini</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {INITIAL_BENEFICIARIES.map((site) => {
                        const isOverridden = beneficiaryOverrides[site.id]?.condition === 'libur';
                        return (
                          <tr key={site.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-extrabold text-slate-900">{site.name}</td>
                            <td className="py-2 px-3 text-slate-500">{site.type}</td>
                            <td className="py-2 px-3 text-right font-black text-slate-900">{site.masterCount}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const current = beneficiaryOverrides[site.id];
                                  if (current?.condition === 'libur') {
                                    const updated = { ...beneficiaryOverrides };
                                    delete updated[site.id];
                                    setBeneficiaryOverrides(updated);
                                  } else {
                                    setBeneficiaryOverrides({
                                      ...beneficiaryOverrides,
                                      [site.id]: { condition: 'libur', effectiveCount: 0, reason: 'Libur Sekolah' },
                                    });
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                                  isOverridden
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {isOverridden ? 'Libur (0 Porsi)' : 'Aktif Distribusi'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ===================== ALUR 5: URAIAN KEGIATAN ===================== */}
            <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                      5. Uraian Kegiatan Operasional Dapur & Distribusi
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      Log urutan tahapan kerja persiapan, masak, packing, dan keberangkatan armada.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">Alur 5</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan / Log Uraian Kegiatan:
                </label>
                <textarea
                  rows={5}
                  value={uraianKegiatan}
                  onChange={(e) => setUraianKegiatan(e.target.value)}
                  placeholder="Tuliskan uraian tahapan kegiatan operasional..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Cetak Laporan Lengkap</span>
                </button>

                <button
                  type="submit"
                  disabled={menuPhotoUploading || prepUploading || cookUploading || packUploading}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Rilis Laporan Harian</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===================== TAB 2: PANEL KELOLA & EDIT ARSIP ===================== */}
        {activeTab === 'list' && (
          <div className="app-card rounded-2xl p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Daftar Arsip Operasional Tersimpan
                </h2>
                <span className="text-xs text-slate-500">
                  Klik tombol <strong>Edit</strong> untuk mengubah data menu, foto, atau AKG tanggal tertentu.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveTab('input');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                + Input Menu Baru
              </button>
            </div>

            {savedMenuList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                Belum ada arsip yang tersimpan. Silakan isi form di tab &quot;Form Input / Edit&quot;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedMenuList.map((menu) => (
                  <div key={menu.date} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-900">
                          {menu.date}
                        </span>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {menu.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Karbo: {menu.components?.karbohidrat || '-'} • Hewani: {menu.components?.laukHewani || '-'} • Sayur: {menu.components?.sayur || '-'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleLoadMenuToEdit(menu)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Arsip Ini</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenu(menu.date)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Hapus Arsip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
