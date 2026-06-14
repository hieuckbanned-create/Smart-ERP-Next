import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3457';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/register', '/privacy', '/terms'],
        disallow: [
          '/admin/',
          '/dashboard/',
          '/accounting/',
          '/orders/',
          '/customers/',
          '/products/',
          '/inventory/',
          '/settings/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
