import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/services', '/about', '/contact', '/book', '/privacy'].map(path => ({ url: `${siteUrl}${path}`, changeFrequency: 'weekly', priority: path === '/' ? 1 : .7 }));
}
