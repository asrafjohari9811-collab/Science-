import type { Metadata, Viewport } from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import { ServiceWorker } from '@/components/ServiceWorker';

const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Science Quest – Year 2', template: '%s · Science Quest' },
  description: 'Explore. Learn. Discover. Interactive KSSR Year 2 Science for Malaysian pupils.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#2574eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
