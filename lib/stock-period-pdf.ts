import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { zipSync } from 'fflate';
import type { DailyStockReport } from './stock-period-report';
import { formatTanggalIndo } from './dateUtils';

const safe = (value: string): string => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
const fmtQty = (qty: number): string => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(qty);
function imageDataUrl(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:image/png;base64,${btoa(binary)}`;
}

export async function createDailyStockPdf(report: DailyStockReport, logo: Uint8Array): Promise<Uint8Array> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: false });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 34;
  doc.addImage(imageDataUrl(logo), 'PNG', margin, 31, 43, 43);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BADAN GIZI NASIONAL', pageWidth / 2 + 18, 39, { align: 'center' });
  doc.setFontSize(12);
  doc.text('SATUAN PELAYANAN PROGRAM GIZI (SPPG) WONODRI 3', pageWidth / 2 + 18, 55, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan, Kota Semarang, Jawa Tengah', pageWidth / 2 + 18, 69, { align: 'center' });
  doc.text('Pagu Layanan: 1.553 Porsi / Hari | Kode Satpel: SPPG-SMG-003', pageWidth / 2 + 18, 81, { align: 'center' });
  doc.setLineWidth(1.6);
  doc.line(margin, 92, pageWidth - margin, 92);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BERITA ACARA PENGELUARAN & PEMAKAIAN BAHAN MASAK', pageWidth / 2, 112, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Nomor: ${report.number}`, pageWidth / 2, 127, { align: 'center' });
  doc.text(`Tanggal Pengolahan Masak: ${safe(formatTanggalIndo(report.date))}`, pageWidth / 2, 141, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  const introduction = `Pada tanggal ${safe(formatTanggalIndo(report.date))}, telah dikeluarkan dan digunakan bahan baku dari gudang penyimpanan untuk pengolahan masak Program Makan Bergizi Gratis (MBG) sebanyak 1.553 porsi dengan pasokan dari Yayasan Berkat Makmur Sentosa. Rincian kuantitas fisik sebagai berikut:`;
  const lines = doc.splitTextToSize(introduction, pageWidth - margin * 2);
  doc.text(lines, margin, 156);
  const tableTop = 165 + (lines.length - 1) * 9;
  autoTable(doc, {
    startY: tableTop,
    margin: { left: margin, right: margin, bottom: 135 },
    head: [['NO', 'GOLONGAN', 'NAMA BAHAN MAKANAN', 'JUMLAH MASAK', 'SATUAN', 'LOKASI SIMPAN']],
    body: report.rows.map((row, index) => [String(index + 1), safe(row.category), safe(row.name), fmtQty(row.qty), safe(row.uom), safe(row.location)]),
    foot: [['', '', 'TOTAL PER SATUAN', report.totals.map(({ qty, uom }) => `${fmtQty(qty)} ${safe(uom)}`).join(' · '), '', '']],
    showFoot: 'lastPage',
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 6.5, cellPadding: 2.5, overflow: 'linebreak', lineColor: [120, 120, 120], lineWidth: 0.35, textColor: [10, 10, 10] },
    headStyles: { fillColor: [235, 239, 244], textColor: [10, 10, 10], fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [235, 239, 244], textColor: [10, 10, 10], fontStyle: 'bold' },
    rowPageBreak: 'avoid',
  });
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? tableTop;
  const context = report.context.length > 0 ? report.context.join(' | ') : '';
  const contextLines = context ? doc.splitTextToSize(safe(context), pageWidth - margin * 2) : [];
  let signY = Math.max(finalY + 35 + contextLines.length * 8, 660);
  if (contextLines.length > 0) {
    doc.setFontSize(6);
    doc.text(contextLines, margin, finalY + 12);
  }
  const pageHeight = doc.internal.pageSize.getHeight();
  if (signY > pageHeight - 106) {
    doc.addPage('a4', 'portrait');
    signY = 72;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setDrawColor(175, 175, 175);
  doc.line(margin, signY - 13, pageWidth - margin, signY - 13);
  const signers = [
    ['Petugas Logistik / Timbangan,', 'Nur Khafidin', 'Staf Logistik SPPG'],
    ['Ahli Gizi Penanggung Jawab,', 'Sintia Mariam, A.Md.Gz', 'Ahli Gizi SPPG'],
    ['Petugas Akuntansi / Keuangan,', 'Salsabiila Zainima, S.Ak', 'Akuntan SPPG'],
    ['Mengetahui / Mengesahkan,', 'Dicky Yusuf Mulyadi, S.M.', 'Kepala SPPG Wonodri 3'],
  ];
  const colWidth = (pageWidth - margin * 2) / signers.length;
  for (const [index, signer] of signers.entries()) {
    const x = margin + colWidth * (index + 0.5);
    doc.text(safe(signer[0]), x, signY, { align: 'center', maxWidth: colWidth - 4 });
    doc.text(safe(signer[1]), x, signY + 49, { align: 'center', maxWidth: colWidth - 4 });
    doc.setFontSize(5.5);
    doc.text(safe(signer[2]), x, signY + 59, { align: 'center', maxWidth: colWidth - 4 });
    doc.setFontSize(6.2);
  }
  return new Uint8Array(doc.output('arraybuffer'));
}

export async function createStockPeriodZip(reports: readonly DailyStockReport[], logo: Uint8Array): Promise<Uint8Array> {
  if (reports.length === 0) throw new Error('Periode kosong tidak menghasilkan arsip ZIP.');
  const files: Record<string, Uint8Array> = {};
  for (const report of reports) files[`BA-BOM-${report.date}.pdf`] = await createDailyStockPdf(report, logo);
  return zipSync(files, { level: 6 });
}
