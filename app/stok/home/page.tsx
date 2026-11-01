'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  ArrowRight,
  CircleCheck,
  ClipboardCheck,
  FileText,
  ChevronDown,
  MessageCircle,
  Warehouse,
  ArrowUpRight,
  Send,
} from 'lucide-react';

export default function StokKitaHomePage() {
  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  // Form State
  const [namaUsaha, setNamaUsaha] = useState('');
  const [alamatKota, setAlamatKota] = useState('Semarang');
  const [namaOwner, setNamaOwner] = useState('');
  const [nomorWa, setNomorWa] = useState('');
  const [email, setEmail] = useState('');
  const [pilihanPaket, setPilihanPaket] = useState('pro');
  const [catatan, setCatatan] = useState('');

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSendWa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaUsaha.trim() || !nomorWa.trim() || !namaOwner.trim()) {
      alert('Mohon lengkapi Nama Usaha, Nama Pemilik, dan Nomor WhatsApp Anda.');
      return;
    }

    const paketLabel =
      pilihanPaket === 'trial'
        ? 'Free Trial (7 Hari)'
        : pilihanPaket === 'starter'
        ? 'Starter Outlet (Rp 49.000/bln)'
        : 'Pro Resto & Dapur SPPG (Rp 99.000/bln)';

    const text = `Halo Admin StokKita, saya ingin mendaftar & aktivasi akun dapur:\n\n• Nama Usaha / Dapur: ${namaUsaha}\n• Alamat / Kota: ${alamatKota || '-'}\n• Nama Pemilik: ${namaOwner}\n• Nomor WhatsApp: ${nomorWa}\n• Email: ${email || '-'}\n• Pilihan Paket: ${paketLabel}\n• Catatan: ${catatan || '-'}\n\nMohon dibantu proses aktivasinya. Terima kasih!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/6282143643035?text=${encoded}`, '_blank');
  };

  const faqs = [
    {
      q: 'Apa itu StokKita dan untuk siapa platform ini cocok?',
      a: 'StokKita adalah sistem manajemen inventaris dan rantai pasok bahan baku modern berbasis cloud yang dirancang khusus untuk operasional F&B seperti Central Kitchen SPPG (Program MBG), Restoran, Cafe, Bakery, Katering, dan UMKM Kuliner. StokKita membantu Anda melacak pasokan supplier, pemakaian harian dapur, stok opname fisik, hingga mendeteksi kebocoran modal secara presisi.',
    },
    {
      q: 'Apakah saya perlu mengunduh aplikasi di App Store atau Play Store?',
      a: 'Tidak perlu. StokKita adalah Progressive Web App (PWA) yang dapat diakses langsung melalui peramban (Chrome, Safari, Edge) di HP Android, iPhone, tablet, maupun laptop/PC tanpa instalasi tambahan dan hemat kuota.',
    },
    {
      q: 'Bagaimana cara kerja Free Trial 7 Hari?',
      a: 'Anda mendapatkan akses penuh ke seluruh fitur (Pencatatan Masuk/Keluar, Stok Opname, Ekspor Excel, dan Cetak PDF Berita Acara) selama 7 hari tanpa biaya dan tanpa perlu kartu kredit. Akun langsung aktif setelah verifikasi via WhatsApp.',
    },
    {
      q: 'Bagaimana fitur Stock Opname di StokKita membantu mencegah selisih stok?',
      a: 'StokKita menyediakan alur opname terstruktur di mana petugas memasukkan angka timbangan fisik riil. Sistem secara otomatis menghitung selisih matematis (variance +/-), mengkalkulasi nilai nominal rupiah kerugian, dan membukukan berita acara resmi ber-KOP usaha.',
    },
    {
      q: 'Apakah data stok dan resep dapur saya aman dan terpisah dari resto lain?',
      a: 'Ya, 100% aman. Setiap tenant / akun dapur memiliki ruang basis data terisolasi dengan enkripsi cloud modern. Data stok, harga modal dari supplier, dan resep dapur Anda bersifat rahasia dan hanya dapat diakses oleh tim Anda.',
    },
    {
      q: 'Apakah staf dapur bisa dibuatkan akun terpisah dengan hak akses terbatas?',
      a: 'Tentu. Anda dapat mengatur role pengguna: Owner/Pimpinan (Akses Penuh + Finansial), Ahli Gizi/Chef (Potong Bahan Masak & Resep), dan Staf Logistik (Penerimaan Bahan Timbangan & Opname Fisik).',
    },
    {
      q: 'Bagaimana jika saya butuh bantuan setup atau kustomisasi khusus (misal Dapur SPPG BGN)?',
      a: 'Tim teknis kami siap mendampingi migrasi data bahan baku awal, penyusunan master SKU, hingga integrasi SOP khusus (seperti formula gramasi 1.553 porsi SPPG Badan Gizi Nasional). Hubungi tim via WhatsApp.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-amber-500 selection:text-zinc-950">
      {/* ============ NAVIGATION HEADER ============ */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <Link href="/stok/home" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white leading-none">
                  Stok<span className="text-amber-400">Kita</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wider">
                  Manajemen Stok & Inventaris
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
              <a href="#fitur" className="hover:text-amber-400 transition-colors">
                Fitur Utama
              </a>
              <a href="#preview" className="hover:text-amber-400 transition-colors">
                Live Inventory
              </a>
              <a href="#harga" className="hover:text-amber-400 transition-colors">
                Paket Langganan
              </a>
              <a href="#faq" className="hover:text-amber-400 transition-colors">
                Tanya Jawab
              </a>
              <Link href="/stok" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-400">
                <Warehouse className="w-3.5 h-3.5" />
                <span>Buka Aplikasi SPPG</span>
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/stok"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              >
                Masuk App
              </Link>
              <a
                href="#daftar"
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                Coba Gratis
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden text-center">
        {/* Radiant Glow Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 sm:w-150 h-64 sm:h-72 bg-amber-500/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-60 sm:w-72 h-60 sm:h-72 bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-4 sm:space-y-6">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide shadow-xs">
            <span>🚀</span>
            <span>Trial 7 Hari Penuh • Tanpa Kartu Kredit</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Kelola Stok Bahan Baku Usaha Kuliner{' '}
            <span className="bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
              Lebih Presisi &amp; Terkontrol
            </span>
          </h1>

          {/* Description */}
          <p className="text-zinc-400 text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Platform inventaris cerdas untuk Central Kitchen SPPG, Restoran, Cafe, Katering, dan UMKM Kuliner. Catat mutasi bahan harian, deteksi selisih fisik otomatis, dan cegah kebocoran modal dapur Anda.
          </p>

          {/* CTAs */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-2">
            <a
              href="#daftar"
              className="inline-flex items-center justify-center h-11 sm:h-12 px-7 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-base shadow-xl shadow-amber-500/25 rounded-xl transition-all"
            >
              <span>Mulai Coba Gratis 7 Hari</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="#harga"
              className="inline-flex items-center justify-center h-11 sm:h-12 px-6 border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs sm:text-base rounded-xl transition-colors"
            >
              Lihat Pilihan Paket
            </a>
          </div>

          <p className="text-xs text-zinc-400 pt-1">
            Sudah terdaftar sebagai pengguna?{' '}
            <Link
              href="/stok"
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400 transition-colors inline-flex items-center gap-1"
            >
              Buka aplikasi stok di sini →
            </Link>
          </p>

          {/* Feature Badges Pills */}
          <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-zinc-400 px-2">
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>1 Dapur / Outlet Fokus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Multi-User Akun Staf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Laporan PDF Resmi BGN</span>
            </div>
          </div>
        </div>

        {/* ============ LIVE DASHBOARD INTERACTIVE PREVIEW ============ */}
        <div id="preview" className="relative mt-10 sm:mt-16 max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
            {/* Mock Browser Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-zinc-500 font-mono text-[11px] ml-2 hidden sm:inline">
                  stokkita.app/dashboard • Live Inventory
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sistem Aktif
              </span>
            </div>

            {/* 4 Metrics Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left mb-4">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 sm:p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Bahan Baku</span>
                <strong className="text-lg sm:text-2xl font-black text-white">128 Item</strong>
                <span className="text-[10px] text-zinc-500 block mt-0.5">32 Bahan Utama SPPG</span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 sm:p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Penerimaan Masuk</span>
                <strong className="text-lg sm:text-2xl font-black text-emerald-400">Rp 4.250.000</strong>
                <span className="text-[10px] text-emerald-500 block mt-0.5">+150 kg Daging Ayam</span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 sm:p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pemakaian Dapur</span>
                <strong className="text-lg sm:text-2xl font-black text-blue-400">34 Mutasi</strong>
                <span className="text-[10px] text-blue-500 block mt-0.5">1.553 Porsi MBG Harian</span>
              </div>
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 sm:p-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Akurasi Opname</span>
                <strong className="text-lg sm:text-2xl font-black text-amber-400">99.4%</strong>
                <span className="text-[10px] text-amber-500 block mt-0.5">Selisih Fisik Minimum</span>
              </div>
            </div>

            {/* Mini Table Preview */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden text-left text-xs">
              <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  Katalog Stok Real-time (Cuplikan Dapur)
                </span>
                <Link
                  href="/stok"
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                >
                  Buka Full Aplikasi <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-900/80 text-[10px] uppercase font-black tracking-wider text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Bahan Makanan</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                      <th className="py-2.5 px-3 text-center">Ketahanan</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-[11px]">
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-2 px-3 font-bold text-white">Beras Premium Mentik Wangi</td>
                      <td className="py-2 px-3 text-zinc-400">Gudang Kering</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">650 kg</td>
                      <td className="py-2 px-3 text-center font-mono">5.2 Hari</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          AMAN
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-2 px-3 font-bold text-white">Daging Ayam Broiler Bersih</td>
                      <td className="py-2 px-3 text-zinc-400">Chiller (2°C)</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400 font-bold">145 kg</td>
                      <td className="py-2 px-3 text-center font-mono">1.2 Hari</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          MENIPIS
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-2 px-3 font-bold text-white">Daging Sapi Gandik Segar</td>
                      <td className="py-2 px-3 text-zinc-400">Deep Freezer</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-400 font-bold">35 kg</td>
                      <td className="py-2 px-3 text-center font-mono">0.6 Hari</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          KRITIS
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-900/40">
                      <td className="py-2 px-3 font-bold text-white">Telur Ayam Ras Grade A</td>
                      <td className="py-2 px-3 text-zinc-400">Chiller Telur</td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400 font-bold">1.850 butir</td>
                      <td className="py-2 px-3 text-center font-mono">1.1 Hari</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          MENIPIS
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FITUR UTAMA SECTION ============ */}
      <section id="fitur" className="py-16 sm:py-24 border-t border-zinc-900 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
              FITUR LENGKAP &amp; TERINTEGRASI
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Didesain Khusus untuk Alur Kerja Nyata Dapur Usaha
            </h3>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Semua alat yang dibutuhkan oleh pemilik usaha dan staf dapur untuk menjaga ketersediaan bahan tanpa ribet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Warehouse className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white">Pencatatan Mutasi Masuk &amp; Keluar</h4>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Catat pasokan bahan baku dari supplier beserta harga modal, serta pemakaian harian dapur atau operasional masak harian secara otomatis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white">Stock Opname &amp; Hitung Fisik</h4>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Cek fisik berkala tanpa repot. Sistem mendeteksi selisih otomatis, kalkulasi selisih nominal, dan penyesuaian saldo gudang instan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-amber-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-white">Cetak Dokumen PDF Resmi</h4>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Cetak laporan stock opname dan mutasi transaksi dengan format kop usaha rapi, siap untuk arsip fisik dan tanda tangan checker penanggung jawab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PILIHAN PAKET BERLANGGANAN ============ */}
      <section id="harga" className="py-16 sm:py-24 border-t border-zinc-900 bg-zinc-950/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
              PILIHAN PAKET BERLANGGANAN
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Investasi Terjangkau untuk 1 Outlet / Dapur Usaha
            </h3>
            <p className="text-zinc-400 text-xs sm:text-base leading-relaxed">
              Mulai dengan Free Trial 7 Hari atau pilih paket bulanan yang sesuai dengan kebutuhan tim dapur Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {/* Card 1: Free Trial */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider">
                  UJI COBA 7 HARI
                </div>
                <h4 className="text-xl font-black text-white">Free Trial</h4>
                <p className="text-zinc-400 text-xs">Coba langsung fitur di dapur Anda tanpa biaya.</p>
                <div className="pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">Rp 0</span>
                  <span className="text-zinc-400 text-xs"> / 7 hari</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1 Dapur / Outlet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Akses Penuh Semua Fitur</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Maksimal 2 Pengguna</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Simpan Draf Stock Opname</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ekspor Excel (.xls) &amp; Cetak PDF</span>
                  </li>
                </ul>
              </div>
              <a
                href="#daftar"
                onClick={() => setPilihanPaket('trial')}
                className="w-full text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
              >
                Coba Trial 7 Hari via WA
              </a>
            </div>

            {/* Card 2: Starter */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                  STARTER HEMAT
                </div>
                <h4 className="text-xl font-black text-white">Starter Outlet</h4>
                <p className="text-zinc-400 text-xs">Cocok untuk warung makan, cafe kecil, atau cloud kitchen.</p>
                <div className="pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">Rp 49.000</span>
                  <span className="text-zinc-400 text-xs"> / bulan</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>1 Dapur / Outlet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Maksimal 2 Pengguna (Owner + Staf)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Pencatatan Masuk &amp; Keluar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Stock Opname Langsung Selesai</span>
                  </li>
                </ul>
              </div>
              <a
                href="#daftar"
                onClick={() => setPilihanPaket('starter')}
                className="w-full text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
              >
                Pilih Paket Starter
              </a>
            </div>

            {/* Card 3: Pro Resto (Highlight) */}
            <div className="bg-linear-to-b from-amber-500/10 via-zinc-900 to-zinc-900 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-amber-500/10 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                PALING POPULER • REKOMENDASI
              </div>
              <div className="space-y-4 pt-2">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                  PRO RESTORAN &amp; SPPG
                </div>
                <h4 className="text-xl font-black text-white">Pro Restoran</h4>
                <p className="text-zinc-400 text-xs">Solusi terlengkap untuk resto ramai, cafe, &amp; central kitchen katering.</p>
                <div className="pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400">Rp 99.000</span>
                  <span className="text-zinc-400 text-xs"> / bulan</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-200 pt-2 border-t border-zinc-800/80">
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1 Dapur / Outlet Penuh</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Hingga 10 Staf &amp; Hak Akses Terpisah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Simpan Draf Stock Opname (Lanjut Kapan Saja)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ekspor Excel (.xls) &amp; Laporan PDF Resmi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Peringatan Notifikasi Stok Kritis</span>
                  </li>
                </ul>
              </div>
              <a
                href="#daftar"
                onClick={() => setPilihanPaket('pro')}
                className="w-full text-center py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all"
              >
                Pilih Paket Pro Resto
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TANYA JAWAB (FAQ) ============ */}
      <section id="faq" className="py-16 sm:py-24 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-10 sm:mb-14">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
              Pusat Bantuan &amp; Edukasi
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pertanyaan yang Sering Ditanyakan (FAQ)
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Temukan jawaban seputar cara penggunaan, keamanan data, sistem paket, dan implementasi StokKita di resto atau dapur Anda.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx + 1;
              return (
                <div
                  key={idx}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx + 1)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-amber-400 cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <span>{f.q}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-center space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white">Masih punya pertanyaan lain?</h4>
            <p className="text-xs text-zinc-400">
              Konsultasikan langsung kebutuhan rantai pasok dapur Anda dengan tim kami via WhatsApp.
            </p>
            <a
              href="https://wa.me/6282143643035?text=Halo%20Admin%20StokKita,%20saya%20ingin%20tanya-tanya%20seputar%20fitur%20aplikasi%20StokKita"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat Tim Kami via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ LEAD REGISTRATION FORM VIA WHATSAPP ============ */}
      <section id="daftar" className="py-16 sm:py-24 border-t border-zinc-900 bg-zinc-950/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Aktivasi Cepat via WhatsApp
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Daftarkan Usaha Kuliner &amp; Dapur Anda
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Lengkapi data di bawah ini untuk langsung terhubung ke WhatsApp Admin StokKita dan mengaktifkan akun dapur Anda secara instan.
              </p>
            </div>

            <form onSubmit={handleSendWa} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Nama Usaha / Dapur / Resto *</label>
                  <input
                    type="text"
                    required
                    value={namaUsaha}
                    onChange={(e) => setNamaUsaha(e.target.value)}
                    placeholder="Cth: Dapur SPPG Wonodri / Kedai Barokah"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Kota / Lokasi Dapur</label>
                  <input
                    type="text"
                    value={alamatKota}
                    onChange={(e) => setAlamatKota(e.target.value)}
                    placeholder="Cth: Semarang Selatan"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Nama Lengkap Pemilik / PIC *</label>
                  <input
                    type="text"
                    required
                    value={namaOwner}
                    onChange={(e) => setNamaOwner(e.target.value)}
                    placeholder="Cth: Dicky Yusuf / Arief Rahman"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    value={nomorWa}
                    onChange={(e) => setNomorWa(e.target.value)}
                    placeholder="Cth: 082143643035"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Alamat Email (Opsional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-300 block mb-1.5">Pilihan Paket Layanan</label>
                  <select
                    value={pilihanPaket}
                    onChange={(e) => setPilihanPaket(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="trial">Free Trial 7 Hari (Gratis Rp 0)</option>
                    <option value="starter">Starter Outlet (Rp 49.000/bln)</option>
                    <option value="pro">Pro Restoran &amp; Central Kitchen (Rp 99.000/bln)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-300 block mb-1.5">Catatan / Kebutuhan Khusus (Opsional)</label>
                <textarea
                  rows={2}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Cth: Butuh pengaturan bahan baku katering 1.500 porsi harian..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Daftar &amp; Kirim via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <span className="font-black text-white text-base">
                  Stok<span className="text-amber-400">Kita</span>
                </span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Platform SaaS inventaris &amp; manajemen rantai pasok bahan baku modern untuk Restoran, Cafe, UMKM Kuliner, dan Dapur Usaha di Indonesia.
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                🍽️ Solusi Rantai Pasok F&amp;B Terpercaya
              </span>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-white mb-3">FITUR UNGGULAN</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Master Bahan Baku &amp; Gudang</li>
                <li>Catat Mutasi Masuk &amp; Keluar</li>
                <li>Stock Opname Fisik &amp; Draf</li>
                <li>Ekspor Excel (.xls) &amp; Cetak PDF</li>
                <li>Manajemen Multi-Role Tim Staf</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-white mb-3">PAKET LAYANAN</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Free Trial (7 Hari)</li>
                <li>Starter Outlet (Rp 49rb)</li>
                <li>Pro Resto (Rp 99rb)</li>
                <li>Custom Enterprise / SPPG</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-bold tracking-wider text-white mb-3">BANTUAN &amp; KONTAK</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Tanya Jawab (FAQ)</li>
                <li>WhatsApp: +62 821-4364-3035</li>
                <li>Layanan: 08:00 - 22:00 WIB</li>
                <li>Keamanan Data Cloud Terenkripsi</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-600">
            <p>© 2026 StokKita App. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-4">
              <Link href="/stok" className="hover:text-amber-400">
                Masuk ke Aplikasi Dapur
              </Link>
              <span>•</span>
              <a href="#daftar" className="hover:text-amber-400">
                Daftar Usaha Baru
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
