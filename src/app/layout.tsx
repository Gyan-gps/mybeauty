import type { Metadata, Viewport } from 'next';
import { Chrome, Footer } from '@/components/Chrome';
import { SALON_NAME, siteUrl } from '@/lib/config';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SALON_NAME} — Your time to feel good`, template: `%s | ${SALON_NAME}` },
  description: 'Thoughtful hair, beard and skin care. Discover your next look and book your salon appointment in a few easy steps.',
  applicationName: SALON_NAME,
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: SALON_NAME },
  icons: { icon: '/api/icon?size=192', apple: '/api/icon?size=192' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: SALON_NAME,
    title: `${SALON_NAME} — Your time to feel good`,
    description: 'Hair, grooming and a little time for yourself.',
    images: [{ url: '/og', width: 1200, height: 630 }]
  }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#101210', viewportFit: 'cover' };
export default function Layout({ children }: {
  children: React.ReactNode;
}) {
  return <html lang="en">
    <body>
      <Chrome />
      <main id="main">
        {children}
      </main>
      <Footer />
    </body>
  </html>;
}
