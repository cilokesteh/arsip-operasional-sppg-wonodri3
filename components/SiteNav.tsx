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
