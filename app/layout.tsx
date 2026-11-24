import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const lexend = localFont({
  src: './fonts/lexend-latin.woff2',
  variable: '--font-lexend',
  display: 'swap',
  weight: '400 800',
});

const sourceSans = localFont({
  src: './fonts/source-sans-3-latin.woff2',
  variable: '--font-source-sans',
  display: 'swap',
  weight: '400 700',
});

export const metadata: Metadata = {
  title: 'Arsip Operasional • SPPG Wonodri 3 Kota Semarang',
  description:
    'Portal transparansi operasional resmi SPPG Wonodri 3: arsip harian menu Makan Bergizi Gratis (MBG), angka kandungan gizi (AKG), dokumentasi dapur, dan data penerima manfaat.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${lexend.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased selection:bg-gold selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
