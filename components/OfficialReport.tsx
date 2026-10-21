'use client';

import React from 'react';
import Image from 'next/image';
import { BeneficiarySite, DailyMenuRecord, STANDARD_AKG_REFERENCE } from '@/lib/data';
import { formatTanggalIndo } from '@/lib/dateUtils';

type ReportBeneficiary = BeneficiarySite & {
  reason?: string;
  condition?: 'libur' | 'penyesuaian';
};

/**
 * Komponen "Dokumen Resmi" — format KOP surat operasional BGN.
 * Dipakai untuk:
 *   1. Pratinjau tab "Dokumen Resmi" di Portal
 *   2. Output cetak / simpan-as-PDF (mode A4, class .report-sheet)
 * Format dokumen sengaja dibuat formal & monoton (bukan visual dashboard).
 */
export default function OfficialReport({
  menu,
  beneficiaries,
  totalMaster,
}: {
  menu: DailyMenuRecord;
  beneficiaries: ReportBeneficiary[];
  totalMaster: number;
}) {
  const nutrition = menu.nutritionCards || STANDARD_AKG_REFERENCE;

  return (
    <article className="report-sheet bg-white rounded-2xl border border-slate-300 shadow-sm p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-7">
      {/* KOP RESMI LAPORAN */}
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
            <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
              Laporan Operasional Resmi
            </div>
            <div className="text-[11px] sm:text-xs">
              Tanggal: <strong className="text-slate-900">{formatTanggalIndo(menu.date)}</strong>
            </div>
            <div className="text-[11px] sm:text-xs">
              Alokasi: <strong className="text-slate-900">{totalMaster} Porsi (100%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 1. MENU */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            1. Menu Makanan & Komposisi Porsi
          </h2>
          <span className="text-[10px] text-slate-500 font-semibold">Menu #{menu.menuNumber || 1}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
          <div className="w-full sm:w-64 md:w-72 shrink-0">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={menu.menuPhotoUrl || '/gallery-1.jpg'}
                alt={menu.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                Sajian {formatTanggalIndo(menu.date)}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col justify-between space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Nama Menu:</span>
              <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 leading-snug">{menu.title}</h3>
            </div>

            {/* Mobile Komponen Card */}
            <div className="grid grid-cols-1 sm:hidden gap-1.5 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-600">Karbohidrat:</span>
                <span className="font-extrabold text-slate-900 text-right">{menu.components.karbohidrat}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-600">Lauk Hewani:</span>
                <span className="font-extrabold text-slate-900 text-right">{menu.components.laukHewani}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-600">Lauk Nabati:</span>
                <span className="font-extrabold text-slate-900 text-right">{menu.components.laukNabati}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-600">Sayuran:</span>
                <span className="font-extrabold text-slate-900 text-right">{menu.components.sayur}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-600">Buah Segar:</span>
                <span className="font-extrabold text-slate-900 text-right">{menu.components.buah}</span>
              </div>
            </div>

            {/* Desktop Table Komponen */}
            <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3 w-1/3">Komponen Bahan</th>
                    <th className="py-2 px-3">Uraian Masakan</th>
                    <th className="py-2 px-3 w-28 text-center">Fungsi Gizi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-700">1. Karbohidrat</td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium">{menu.components.karbohidrat}</td>
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Sumber Energi</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-700">2. Lauk Hewani</td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium">{menu.components.laukHewani}</td>
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Protein Hewani</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-700">3. Lauk Nabati</td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium">{menu.components.laukNabati}</td>
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Protein Nabati</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-700">4. Sayuran</td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium">{menu.components.sayur}</td>
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Serat & Vitamin</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-bold text-slate-700">5. Buah Segar</td>
                    <td className="py-1.5 px-3 text-slate-900 font-medium">{menu.components.buah}</td>
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-500">Mikronutrien</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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

        <div className="grid grid-cols-1 gap-2.5 sm:hidden">
          {nutrition.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-blue-900 block">Porsi {item.groupName}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">{item.targetCategory}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-orange-950 block tabular-nums">
                    {item.energyKcal.toFixed(1)} <span className="text-[10px] text-orange-700 font-bold">Kkal</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1 border-t border-slate-200/80">
                <div className="p-1 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px]">Protein</span>
                  <span className="font-extrabold text-slate-900">{item.proteinG.toFixed(1)}g</span>
                </div>
                <div className="p-1 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px]">Lemak</span>
                  <span className="font-extrabold text-slate-900">{item.fatG.toFixed(1)}g</span>
                </div>
                <div className="p-1 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px]">Karbo</span>
                  <span className="font-extrabold text-slate-900">{item.carbsG.toFixed(1)}g</span>
                </div>
                <div className="p-1 rounded bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[9px]">Serat</span>
                  <span className="font-extrabold text-slate-900">{item.fiberG.toFixed(1)}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-black text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Kelompok</th>
                <th className="py-2.5 px-3">Sasaran Penerima</th>
                <th className="py-2.5 px-3 text-right">Energi</th>
                <th className="py-2.5 px-3 text-right">Protein</th>
                <th className="py-2.5 px-3 text-right">Lemak</th>
                <th className="py-2.5 px-3 text-right">Karbohidrat</th>
                <th className="py-2.5 px-3 text-right">Serat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {nutrition.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-extrabold text-blue-900 bg-slate-50/50">{item.groupName}</td>
                  <td className="py-2 px-3 text-slate-700 font-medium">{item.targetCategory}</td>
                  <td className="py-2 px-3 text-right font-black text-slate-900 tabular-nums">
                    {item.energyKcal.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">Kkal</span>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">{item.proteinG.toFixed(1)} g</td>
                  <td className="py-2 px-3 text-right tabular-nums">{item.fatG.toFixed(1)} g</td>
                  <td className="py-2 px-3 text-right tabular-nums">{item.carbsG.toFixed(1)} g</td>
                  <td className="py-2 px-3 text-right tabular-nums">{item.fiberG.toFixed(1)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. DOKUMENTASI */}
      <section className="space-y-2">
        <div className="border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            3. Dokumentasi Alur Dapur & Distribusi ({menu.photos.length} Tahap)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {menu.photos.map((p, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <div className="relative h-36 sm:h-32 w-full bg-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-black uppercase">
                  {p.step}
                </div>
              </div>
              <div className="p-2.5 space-y-0.5">
                <span className="font-extrabold text-xs text-slate-900 block truncate">{p.title}</span>
                <span className="text-[10px] text-slate-500 block leading-tight">{p.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ALOKASI */}
      <section className="space-y-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            4. Alokasi Penerima Manfaat ({totalMaster} Porsi)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-1.5 sm:hidden text-xs">
          {beneficiaries.map((site, index) => {
            const isLibur = site.masterCount === 0;
            return (
              <div
                key={site.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isLibur ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className={`font-extrabold block truncate text-xs ${isLibur ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {index + 1}. {site.name}
                  </span>
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    Kategori {site.type} {isLibur && `• ${site.reason || 'Libur'}`}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-black text-xs block tabular-nums ${isLibur ? 'text-amber-800' : 'text-blue-900'}`}>
                    {site.masterCount} Porsi
                  </span>
                  <span className={`text-[9px] font-bold ${isLibur ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {isLibur ? 'Libur (Off)' : 'Tersalurkan'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:block border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold text-[10px] uppercase">
              <tr>
                <th className="py-2 px-3 w-10">No</th>
                <th className="py-2 px-3">Nama Lembaga Sekolah / Posyandu</th>
                <th className="py-2 px-3 w-28">Kategori</th>
                <th className="py-2 px-3 w-32 text-right">Alokasi Porsi</th>
                <th className="py-2 px-3 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {beneficiaries.map((site, index) => {
                const isLibur = site.masterCount === 0;
                return (
                  <tr key={site.id} className={`hover:bg-slate-50 ${isLibur ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-1.5 px-3 text-slate-400 font-semibold">{index + 1}</td>
                    <td className="py-1.5 px-3 font-extrabold text-slate-900">
                      <span className={isLibur ? 'line-through text-slate-500' : ''}>{site.name}</span>
                      {isLibur && (
                        <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                          {site.reason || 'Libur Sekolah'}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {site.type}
                      </span>
                    </td>
                    <td className={`py-1.5 px-3 text-right font-black tabular-nums ${isLibur ? 'text-amber-800 font-mono' : 'text-slate-900'}`}>
                      {site.masterCount}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      {isLibur ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Libur (0 Porsi)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700">Tersalurkan</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900 text-xs">
              <tr>
                <td colSpan={3} className="py-2.5 px-3">
                  TOTAL AKUMULASI DISTRIBUSI HARIAN
                </td>
                <td className="py-2.5 px-3 text-right text-sm font-black text-blue-900 tabular-nums">{totalMaster} Porsi</td>
                <td className="py-2.5 px-3 text-center text-emerald-800 font-extrabold text-[10px]">100% LENGKAP</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 5. URAIAN KEGIATAN */}
      <section className="space-y-2">
        <div className="border-b border-slate-200 pb-1.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            5. Uraian Kegiatan Operasional Dapur & Distribusi
          </h2>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
          {menu.uraianPekerjaan ||
            `Uraian Kegiatan\n\n1. Sterilisasi Area Dapur dan Penerapan Higienitas Operasional\n   Melaksanakan sterilisasi area dapur serta memastikan penerapan standar kebersihan dan higienitas selama proses operasional berlangsung.\n\n2. Sortasi dan Pemeriksaan Bahan Baku Segar\n   Melakukan sortasi dan pemeriksaan kualitas bahan baku segar, meliputi sayuran, lauk hewani, dan lauk nabati sebelum proses pengolahan.\n\n3. Proses Pengolahan Masakan\n   Melaksanakan proses pengolahan makanan dengan memastikan suhu masakan terukur dan mencapai suhu di atas 85°C.\n\n4. Food Plating Sesuai Standar Gramasi\n   Melakukan penataan dan pembagian makanan (food plating) sesuai dengan standar gramasi dan ketentuan gizi yang telah ditetapkan oleh BGN.\n\n5. Penyegelan dan Serah Terima Distribusi\n   Melakukan penyegelan wadah/box serta proses serah terima makanan kepada armada distribusi untuk selanjutnya didistribusikan ke penerima manfaat.\n\nKesimpulan:\nSecara keseluruhan, kegiatan operasional SPPG Wonodri 3 berjalan dengan lancar dan sesuai dengan tahapan operasional yang telah ditetapkan.`}
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
