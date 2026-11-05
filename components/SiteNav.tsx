'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Archive, Users, Boxes, FileSpreadsheet, Lock } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  /** Path lain yang dianggap bagian dari menu ini (alias halaman). */
  alsoMatches?: string[];
  /** Halaman internal di balik PIN operator — ditandai gembok agar pengunjung
      publik tidak mengira ini konten transparansi yang bisa langsung dibuka. */
  locked?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Portal', icon: LayoutDashboard },
  { href: '/arsip', label: 'Arsip', icon: Archive },
  { href: '/absensi', label: 'Absensi', icon: Users, alsoMatches: ['/absen'], locked: true },
  { href: '/stok', label: 'Stok', icon: Boxes, alsoMatches: ['/stock'], locked: true },
  { href: '/admin', label: 'Operator', icon: FileSpreadsheet, locked: true },
];

/**
 * Footer resmi bersama untuk halaman publik (Portal & Arsip).
 * Memakai warna ink sebagai penutup halaman agar identitas portal
 * terasa utuh: header terang, isi di atas paper, footer ink.
 */
export function SiteFooter() {
  return (
    <footer className="no-print bg-ink text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-heading font-bold text-[15px] leading-tight">SPPG Wonodri 3</p>
            <p className="text-sm text-white/70 mt-1 leading-relaxed">
              Portal transparansi operasional Dapur Makan Bergizi Gratis (MBG) —
              Wonodri, Semarang Selatan, Kota Semarang.
            </p>
          </div>
          <nav aria-label="Jelajahi portal">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Jelajahi</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white/85 hover:text-white">
                  Portal — laporan harian
                </Link>
              </li>
              <li>
                <Link href="/arsip" className="text-white/85 hover:text-white">
                  Arsip operasional
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Area operator">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">Area Operator</p>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_ITEMS.filter((i) => i.locked).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-white/85 hover:text-white"
                  >
                    {item.label}
                    <Lock className="w-3 h-3 opacity-60" aria-hidden="true" />
                    <span className="sr-only">(khusus operator, perlu PIN)</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/15 mt-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-white/60">
          <span>© 2026 SPPG Wonodri 3, Kota Semarang</span>
          <span>Badan Gizi Nasional, Republik Indonesia</span>
        </div>
      </div>
    </footer>
  );
}

function useIsActive() {
  const pathname = usePathname() || '/';
  return (item: NavItem) => {
    const paths = [item.href, ...(item.alsoMatches || [])];
    return paths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')));
  };
}

/** Navigasi utama untuk layar lebar, diletakkan di dalam header. */
export function TopNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Menu utama" className="no-print hidden md:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            aria-label={item.locked ? `${item.label} (khusus operator, perlu PIN)` : undefined}
            title={item.locked ? 'Khusus operator (perlu PIN)' : undefined}
            className={`inline-flex items-center gap-2 px-3 min-h-10 rounded-lg text-sm transition-colors ${
              active
                ? 'bg-ink text-white font-semibold'
                : 'text-slate-700 hover:bg-ink/5 hover:text-ink font-medium'
            }`}
          >
            <item.icon className="w-4 h-4" aria-hidden="true" />
            {item.label}
            {item.locked && <Lock className="w-3 h-3 opacity-60" aria-hidden="true" />}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Tab navigasi di dasar layar untuk HP. Pasang class `has-bottom-tabs`
 * pada pembungkus halaman supaya konten tidak tertutup.
 */
export function BottomTabs() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Menu utama"
      className="no-print md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={item.locked ? `${item.label} (khusus operator, perlu PIN)` : undefined}
                title={item.locked ? 'Khusus operator (perlu PIN)' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-14 border-t-2 -mt-px text-xs ${
                  active
                    ? 'border-gold text-ink font-semibold'
                    : 'border-transparent text-slate-600 font-medium'
                }`}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                <span className="inline-flex items-center gap-1">
                  {item.label}
                  {item.locked && <Lock className="w-3 h-3 opacity-60" aria-hidden="true" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
