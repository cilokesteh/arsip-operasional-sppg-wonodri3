'use client';

import { useState } from 'react';
import { Download, FileDown, Printer } from 'lucide-react';
import Image from 'next/image';
import type { DailyStockReport } from '@/lib/stock-period-report';
import { createDailyStockPdf, createStockPeriodZip } from '@/lib/stock-period-pdf';
import { formatTanggalIndo } from '@/lib/dateUtils';

interface Props {
  reports: readonly DailyStockReport[];
  title: string;
  onPrint: () => void;
  direction?: 'IN' | 'OUT';
}
function formatQuantity(value: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}
function saveBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}
async function loadLogo(): Promise<Uint8Array> {
  const response = await fetch('/logo.png');
  if (!response.ok) throw new Error('Logo BGN tidak berhasil dimuat.');
  return new Uint8Array(await response.arrayBuffer());
}

export default function DailyStockPeriodReport({ reports, title, onPrint, direction = 'OUT' }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generate = async (report: DailyStockReport) => {
    setBusy(true);
    setError('');
    try {
      const logo = await loadLogo();
      saveBlob(new Blob([new Uint8Array(await createDailyStockPdf(report, logo, direction)).buffer as ArrayBuffer], { type: 'application/pdf' }), `${direction === 'IN' ? 'BA-BM' : 'BA-BOM'}-${report.date}.pdf`);
    } catch {
      setError('PDF gagal dibuat. Coba ulangi setelah koneksi normal.');
    } finally {
      setBusy(false);
    }
  };
  const generateZip = async () => {
    setBusy(true);
    setError('');
    try {
      const logo = await loadLogo();
      saveBlob(new Blob([new Uint8Array(await createStockPeriodZip(reports, logo, direction)).buffer as ArrayBuffer], { type: 'application/zip' }), `${title.toLowerCase()}-${reports[0].date}-${reports.at(-1)?.date}.zip`);
    } catch {
      setError('ZIP PDF harian gagal dibuat. Coba ulangi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="period-report" aria-label={direction === 'IN' ? 'Dokumen penerimaan bahan per tanggal' : 'Dokumen keluar masak per tanggal'}>
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm">
        <p className="font-bold text-blue-950">{reports.length} PDF · {reports.length} tanggal · satu lembar A4 per tanggal</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || reports.length === 0} onClick={() => void generateZip()} className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
            <Download className="h-4 w-4" /> Download ZIP ({reports.length} PDF)
          </button>
          <button type="button" disabled={busy || reports.length === 0} onClick={onPrint} className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-900 disabled:opacity-50">
            <Printer className="h-4 w-4" /> Cetak Semua
          </button>
        </div>
        {busy && <p role="status" className="w-full text-xs text-blue-800">Menyiapkan dokumen…</p>}
        {error && <p role="alert" className="w-full text-xs font-bold text-red-700">{error}</p>}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500">{direction === 'IN' ? 'Tidak ada catatan penerimaan bahan pada periode ini.' : 'Tidak ada catatan pengeluaran masak pada periode ini.'}</div>
      ) : reports.map((report) => (
        <article key={report.date} className="report-sheet daily-outgoing-sheet mx-auto my-5 max-w-3xl rounded-xl border border-slate-300 bg-white p-5 font-serif text-xs text-slate-950 shadow-md print:my-0 print:max-w-none print:rounded-none print:shadow-none">
          <header className="flex items-center justify-center gap-3 border-b-2 border-slate-950 pb-2 text-center">
            <Image src="/logo.png" alt="Logo BGN" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
            <div>
              <p className="text-[11px] font-bold tracking-widest">BADAN GIZI NASIONAL</p>
              <h2 className="text-sm font-black">SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3</h2>
              <p className="text-[10px] text-slate-700">Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah</p>
              <p className="font-mono text-[9px] text-slate-600">{direction === 'IN' ? `Master layanan: ${formatQuantity(report.portions)} Porsi / Hari · Kode Satpel: SPPG-SMG-003` : `Realisasi Produksi: ${formatQuantity(report.portions)} Porsi · Kode Satpel: SPPG-SMG-003`}</p>
            </div>
          </header>
          <header className="space-y-1 py-3 text-center">
            <h3 className="text-sm font-black underline">{direction === 'IN' ? 'BERITA ACARA PENERIMAAN FISIK BAHAN BAKU MASUK' : 'BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK'}</h3>
            <p className="font-mono text-[10px]">Nomor: {report.number}</p>
            <p className="font-bold">{direction === 'IN' ? 'Tanggal Penerimaan' : 'Tanggal Pengolahan Masak'}: {formatTanggalIndo(report.date)}</p>
          </header>
          <p className="mb-3 leading-relaxed">{direction === 'IN'
            ? `Pada tanggal ${formatTanggalIndo(report.date)}, telah diterima dan diverifikasi kuantitas timbangan fisik bahan baku di fasilitas Central Kitchen SPPG Wonodri 3 dari mitra resmi Yayasan Berkat Makmur Sentosa dengan rincian sebagai berikut:`
            : `Pada tanggal ${formatTanggalIndo(report.date)}, telah dikeluarkan dan digunakan bahan baku dari gudang penyimpanan untuk pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak ${formatQuantity(report.portions)} porsi dengan pasokan dari Yayasan Berkat Makmur Sentosa. Rincian kuantitas fisik sebagai berikut:`}</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[9px]">
              <thead><tr className="bg-slate-100">
                {['NO', 'GOLONGAN', 'NAMA BAHAN MAKANAN', direction === 'IN' ? 'JUMLAH MASUK' : 'JUMLAH MASAK', 'SATUAN', 'LOKASI SIMPAN'].map((heading) => <th key={heading} className="border border-slate-500 p-1 text-left">{heading}</th>)}
              </tr></thead>
              <tbody>{report.rows.map((row, index) => <tr key={`${row.name}-${row.uom}`}>
                <td className="border border-slate-400 p-1 text-center">{index + 1}</td><td className="border border-slate-400 p-1">{row.category}</td>
                <td className="border border-slate-400 p-1 font-bold">{row.name}</td><td className="border border-slate-400 p-1 text-right font-bold">{formatQuantity(row.qty)}</td>
                <td className="border border-slate-400 p-1 text-center">{row.uom}</td><td className="border border-slate-400 p-1">{row.location}</td>
              </tr>)}</tbody>
              <tfoot><tr className="bg-slate-100 font-bold"><td colSpan={3} className="border border-slate-500 p-1 text-right">TOTAL PER SATUAN</td><td colSpan={3} className="border border-slate-500 p-1">{report.totals.map(({ uom, qty }) => `${formatQuantity(qty)} ${uom}`).join(' · ')}</td></tr></tfoot>
            </table>
          </div>
          {report.context.length > 0 && <aside className="mt-2 text-[9px] text-slate-700">{report.context.map((text) => <p key={text}>{text}</p>)}</aside>}
          <footer className="mt-5 border-t border-slate-300 pt-3">
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {[
                ['Petugas Timbangan / Security,', 'Security Andrie', 'Security SPPG'],
                ['Ahli Gizi Penanggung Jawab,', 'Sintia Mariam, A.Md.Gz', 'Ahli Gizi SPPG'],
                ['Petugas Akuntansi / Keuangan,', 'Salsabiila Zainima, S.Ak', 'Akuntan SPPG'],
                ['Mengetahui / Mengesahkan,', 'Dicky Yusuf Mulyadi, S.M.', 'Kepala SPPG Wonodri 3'],
              ].map(([role, name, title]) => <div key={name} className="flex min-h-[78px] flex-col justify-between gap-8"><p>{role}</p><div><p className="font-bold underline">{name}</p><p>{title}</p></div></div>)}
            </div>
            <button type="button" disabled={busy || reports.length === 0} onClick={() => void generate(report)} className="no-print mt-3 flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1.5 text-[10px] font-bold text-blue-800 disabled:opacity-50">
              <FileDown className="h-3.5 w-3.5" /> Download PDF {formatTanggalIndo(report.date)}
            </button>
          </footer>
        </article>
      ))}
    </section>
  );
}
