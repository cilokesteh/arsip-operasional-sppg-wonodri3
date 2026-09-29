import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arsip Operasional SPPG Wonodri 3 | Menu MBG, AKG & Penerima Manfaat',
  description:
    'Portal transparansi operasional resmi SPPG Wonodri 3: arsip harian menu Makan Bergizi Gratis (MBG), angka kandungan gizi (AKG), dokumentasi dapur, dan data penerima manfaat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
