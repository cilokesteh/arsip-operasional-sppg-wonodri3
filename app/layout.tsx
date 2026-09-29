import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-lexend',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Arsip Operasional • SPPG Wonodri 3 Kota Semarang',
  description:
    'Portal transparansi operasional resmi SPPG Wonodri 3: arsip harian menu Makan Bergizi Gratis (MBG), angka kandungan gizi (AKG), dokumentasi dapur, dan data penerima manfaat.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${lexend.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen bg-slate-50 text-[#0d1b2e] antialiased selection:bg-[#1759ab] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
