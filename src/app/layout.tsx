import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from '../providers/LenisProvider';
import GSAPProvider from '../providers/GSAPProvider';

export const metadata: Metadata = {
  title: 'Ferdy Agustian | AI Enthusiast & Developer',
  description: 'Portfolio of Ferdy Agustian, CS Undergraduate Student and AI Enthusiast.',
  icons: {
    icon: '/favicon.ico',
  },
};

import { Sixtyfour, Pixelify_Sans, VT323 } from 'next/font/google';

const sixtyfour = Sixtyfour({
  subsets: ['latin'],
  variable: '--font-sixtyfour',
  display: 'swap',
});

const pixelify = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixelify',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
  display: 'swap',
});

import PixelCursor from '../components/ui/PixelCursor';
import Navbar from '../components/layout/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }} className={`${sixtyfour.variable} ${pixelify.variable} ${vt323.variable}`}>
      <body>
        <div className="scanlines"></div>
        <PixelCursor />
        <Navbar />
        <LenisProvider>
          <GSAPProvider>
            {children}
          </GSAPProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
