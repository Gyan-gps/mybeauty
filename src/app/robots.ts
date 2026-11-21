import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/config';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/profile', '/api/'] },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
