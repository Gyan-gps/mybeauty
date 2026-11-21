import type { Metadata } from 'next';
import { SALON_NAME } from './config';

const image = { url: '/og', width: 1200, height: 630, alt: `${SALON_NAME} — hair, beard and skin care` };

// Shared social-preview defaults. A page that sets `openGraph` replaces the layout's
// object entirely, so every page builds from this instead of a partial override.
export const baseOpenGraph = {
  type: 'website',
  locale: 'en_IN',
  siteName: SALON_NAME,
  images: [image]
} satisfies Metadata['openGraph'];

/** Title, description, canonical URL and social previews for one public page. */
export function pageMeta(title: string, description: string, path: string): Metadata {
  const fullTitle = path === '/' ? title : `${title} | ${SALON_NAME}`;
  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { ...baseOpenGraph, title: fullTitle, description, url: path },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image.url] }
  };
}
