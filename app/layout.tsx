import type { Metadata, Viewport } from 'next';
import { Newsreader, Inter } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Coy — Quiet Discovery',
  description: 'Find out if your crush likes you back. If they don’t, nobody ever knows.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FAF8F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-bg-primary text-ink-primary font-sans antialiased selection:bg-accent/10 selection:text-ink-primary">
        {children}
      </body>
    </html>
  );
}
