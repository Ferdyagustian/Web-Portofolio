import type { Metadata } from 'next';
import './globals.css';
import LenisProvider from '../providers/LenisProvider';
import GSAPProvider from '../providers/GSAPProvider';

export const metadata: Metadata = {
  title: 'Ferdy Agustian | AI Enthusiast & Full-Stack Developer Portfolio',
  description: 'Portfolio of Ferdy Agustian Prasetyo — CS Undergraduate, AI Enthusiast, and Full-Stack Developer. Skilled in React, Next.js, Three.js, Python, and Machine Learning.',
  keywords: ['Ferdy Agustian', 'portfolio', 'AI enthusiast', 'full-stack developer', 'React', 'Next.js', 'Three.js', 'machine learning', 'web developer Indonesia', 'Universitas Gunadarma'],
  authors: [{ name: 'Ferdy Agustian Prasetyo' }],
  creator: 'Ferdy Agustian Prasetyo',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Ferdy Agustian | AI Enthusiast & Full-Stack Developer',
    description: 'Explore the interactive pixel-art portfolio of Ferdy Agustian — featuring AI projects, web development work, and a 3D immersive experience built with Three.js.',
    url: 'https://slowwalkferdy.vercel.app',
    siteName: 'Ferdy Agustian Portfolio',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferdy Agustian | AI Enthusiast & Developer',
    description: 'Interactive pixel-art portfolio — AI, Web Dev, and Three.js.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
import TimeThemeProvider from '../providers/TimeThemeProvider';
import AudioProvider from '../providers/AudioProvider';
import SettingsMenu from '../components/ui/SettingsMenu';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" style={{ scrollBehavior: 'smooth' }} className={`${sixtyfour.variable} ${pixelify.variable} ${vt323.variable}`}>
      <body>
        <TimeThemeProvider>
          <AudioProvider>
            <div className="scanlines"></div>
            <PixelCursor />
            <Navbar />
            <LenisProvider>
              <GSAPProvider>
                {children}
              </GSAPProvider>
            </LenisProvider>
            <SettingsMenu />
          </AudioProvider>
        </TimeThemeProvider>
      </body>
    </html>
  );
}
