import React from 'react';

/**
 * Fase 3 — komponen bersama untuk seluruh aplikasi.
 *
 * Tujuannya satu: Portal, Arsip, Absensi, Stok, dan Operator memakai
 * judul, statistik, dan empty state yang sama, supaya tampilannya terasa
 * satu produk, bukan lima halaman yang kebetulan mirip.
 *
 * Komponen ini hanya mengatur tampilan. Tidak ada logika data, tidak ada
 * perubahan pada dokumen cetak (SPJ / Berita Acara tetap seperti semula).
 */

type PageHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Aksi utama atau ringkasan angka di sisi kanan (desktop). */
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2 max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        <div className="gold-rule" aria-hidden="true" />
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

type StatProps = {
  label: string;
  value: React.ReactNode;
  unit?: string;
};

/** Satu angka statistik polos, dengan pemisah tipis antar angka. */
export function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="px-4 first:pl-0 last:pr-0 min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="stat-value text-xl mt-0.5">
        {value}
        {unit && <span className="ml-1.5 text-sm font-semibold text-slate-500">{unit}</span>}
      </dd>
    </div>
  );
}

export function StatRow({ children }: { children: React.ReactNode }) {
  return <dl className="flex divide-x divide-line shrink-0">{children}</dl>;
}

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

/** Keadaan kosong yang tenang: judul, satu kalimat, satu aksi. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface p-8 sm:p-12 text-center">
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      {description && <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

/** Judul seksi di dalam halaman, lebih kecil dari judul halaman. */
export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-1">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{description}</p>}
    </div>
  );
}
