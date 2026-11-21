import type { MetadataRoute } from 'next';
import { SALON_NAME } from '@/lib/config';
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: SALON_NAME,
    short_name: SALON_NAME,
    description: 'Your salon, a tap away. Book hair, beard and skin care.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#101210',
    theme_color: '#101210',
    lang: 'en',
    icons: [{ src: '/api/icon?size=192', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: '/api/icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'any' }, {
      src: '/api/icon?size=512&maskable=1',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }]
  };
}
