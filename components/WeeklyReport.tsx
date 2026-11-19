'use client';

import React from 'react';
import Image from 'next/image';
import { BeneficiarySite, DailyMenuRecord, STANDARD_AKG_REFERENCE } from '@/lib/data';
import { formatTanggalIndo } from '@/lib/dateUtils';

type ReportBeneficiary = BeneficiarySite & {
  reason?: string;
  condition?: 'libur' | 'penyesuaian';
};

type WeeklyDay = {
  date: string;
  menu?: DailyMenuRecord;
  beneficiaries: ReportBeneficiary[];
  totalMaster: number;
};

/**
 * Laporan Mingguan MBG — rekap 7 hari dalam satu dokumen A4.
 * Dipakai lewat tab "Dokumen Resmi" portal (pilih rentang minggu → "Cetak Rekap").
 *
 * Berbeda dengan OfficialReport (satu tanggal, KOP + BA + 5 tahap foto),
 * dokumen ini ringkas: tabel per-hari (tanggal, menu, komposisi 5 pilar, porsi)
 * + tabel AKG standar + akumulasi porsi + pengesahan 3 pihak.
 */
export default function WeeklyReport({
  days,
  rangeStart,
  rangeEnd,
}: {
  days: WeeklyDay[];
  rangeStart: string;
  rangeEnd: string;
}) {
  const published = days.filter((d) => d.menu);
  const totalPorsi = days.reduce((acc, d) => acc + (d.totalMaster || 0), 0);
  const nutrition = STANDARD_AKG_REFERENCE;

  return (
    <article className="report-sheet bg-white rounded-2xl border border-slate-300 shadow-sm p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-7">
      {/* KOP */}
      <div className="border-b-2 border-slate-800 pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <Image
              src="/logo.png"
              alt="Logo BGN"
              width={48}
              height={48}
              className="object-contain shrink-0 mt-0.5 w-10 h-10 sm:w-14 sm:h-14"
              priority
            />
            <div className="space-y-0.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Badan Gizi Nasional (BGN) Republik Indonesia
              </span>
              <h1 className="text-sm sm:text-lg md:text-xl font-black uppercase text-slate-900 tracking-tight leading-snug">
                SPPG Wonodri 3 Kota Semarang
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-tight">
                Jl. Erlangga Raya No 38, Kel. Pleburan, Kec. Semarang Selatan
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                Program Makan Bergizi Gratis (MBG) • Semarang Selatan
              </p>
            </div>
          </div>

          <div className="bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg sm:text-right border sm:border-0 border-slate-200 text-xs text-slate-600 shrink-0 space-y-1">
            <div className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
              Laporan Mingguan
            </div>
            <div className="text-[11px] sm:text-xs">
              Periode: <strong className="text-slate-900">{formatTanggalIndo(rangeStart)} s/d {formatTanggalIndo(rangeEnd)}</strong>
            </div>
            <div className="text-[11px] sm:text-xs">
              Hari Terlaporkan: <strong className="text-slate-900">{published.length} dari {days.length} hari</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 1. REKAP HARIAN */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            1. Rekap Menu Harian & Komposisi Porsi
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold">Akumulasi {totalPorsi} Porsi</span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold text-[10px] uppercase">
              <tr>
                <th className="py-2 px-2 w-8 text-center">No</th>
                <th className="py-2 px-2 w-24">Tanggal</th>
                <th className="py-2 px-2">Menu</th>
                <th className="py-2 px-2">Komposisi 5 Pilar</th>
                <th className="py-2 px-2 w-16 text-right">Porsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((day, index) => {
                const m = day.menu;
                return (
                  <tr key={day.date} className="align-top">
                    <td className="py-1.5 px-2 text-slate-400 font-semibold text-center">{index + 1}</td>
                    <td className="py-1.5 px-2 font-bold text-slate-800 whitespace-nowrap">
                      {formatTanggalIndo(day.date)}
                    </td>
                    <td className="py-1.5 px-2">
                      {m ? (
                        <>
                          <span className="font-extrabold text-slate-900 block leading-snug">{m.title}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-semibold">
                            Menu #{m.menuNumber || index + 1}
                          </span>
                        </>
                      ) : (
                        <span className="text-amber-700 font-bold text-[10px]">BELUM DILAPORKAN</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-slate-600 leading-snug">
                      {m ? (
                        <span className="text-[10px]">
                          Karbohidrat: <b className="text-slate-900">{m.components.karbohidrat}</b>
                          {' · '}Lauk Hewani: <b className="text-slate-900">{m.components.laukHewani}</b>
                          {' · '}Lauk Nabati: <b className="text-slate-900">{m.components.laukNabati}</b>
                          {' · '}Sayur: <b className="text-slate-900">{m.components.sayur}</b>
                          {' · '}Buah: <b className="text-slate-900">{m.components.buah}</b>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right font-black text-blue-900 tabular-nums">
                      {day.totalMaster || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
              <tr>
                <td colSpan={4} className="py-2 px-2">TOTAL AKUMULASI DISTRIBUSI MINGGUAN</td>
                <td className="py-2 px-2 text-right text-sm text-blue-900 tabular-nums">{totalPorsi} Porsi</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 2. AKG */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            2. Angka Kandungan Gizi (AKG) 5 Kelompok
          </h2>
          <span className="text-[10px] text-slate-500">Standar BGN</span>
        </div>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black text-[10px] uppercase">
              <tr>
                <th className="py-2 px-2">Kelompok</th>
                <th className="py-2 px-2">Sasaran Penerima</th>
                <th className="py-2 px-2 text-right">Energi</th>
                <th className="py-2 px-2 text-right">Protein</th>
                <th className="py-2 px-2 text-right">Lemak</th>
                <th className="py-2 px-2 text-right">Karbo</th>
                <th className="py-2 px-2 text-right">Serat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nutrition.map((item, i) => (
                <tr key={i}>
                  <td className="py-1.5 px-2 font-extrabold text-blue-900 bg-slate-50/50">{item.groupName}</td>
                  <td className="py-1.5 px-2 text-slate-700 font-medium">{item.targetCategory}</td>
                  <td className="py-1.5 px-2 text-right font-black tabular-nums">
                    {item.energyKcal.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">Kkal</span>
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{item.proteinG.toFixed(1)} g</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{item.fatG.toFixed(1)} g</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{item.carbsG.toFixed(1)} g</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{item.fiberG.toFixed(1)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* TANDA TANGAN */}
      <div className="pt-6 sm:pt-8 border-t border-slate-200 space-y-6 text-center text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-4 sm:gap-12">
          <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
            <p className="font-bold text-slate-500 text-[11px] sm:text-xs uppercase tracking-wider">Penanggung Jawab Gizi</p>
            <div className="h-12 sm:h-16" />
            <p className="font-black text-slate-900 underline text-xs sm:text-sm">Sintia Mariam, A.Md.Gz</p>
            <p className="text-[10px] text-slate-500 font-medium">Ahli Gizi SPPG Wonodri 3</p>
          </div>
          <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200">
            <p className="font-bold text-slate-500 text-[11px] sm:text-xs uppercase tracking-wider">Penanggung Jawab Ops</p>
            <div className="h-12 sm:h-16" />
            <p className="font-black text-slate-900 underline text-xs sm:text-sm">Hakim</p>
            <p className="text-[10px] text-slate-500 font-medium">Aslap SPPG Wonodri 3</p>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <div className="p-3 sm:p-0 rounded-lg bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-200 max-w-sm w-full text-center">
            <p className="font-bold text-slate-500 text-[11px] sm:text-xs uppercase tracking-wider">Penanggung Jawab SPPG</p>
            <div className="h-12 sm:h-16" />
            <p className="font-black text-slate-900 underline text-xs sm:text-sm">Dicky Yusuf Mulyadi, S.M</p>
            <p className="text-[10px] text-slate-500 font-medium">Ka. SPPG Wonodri 3 Kota Semarang</p>
          </div>
        </div>
      </div>
    </article>
  );
}
