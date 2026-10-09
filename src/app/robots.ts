import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/checkout',
          '/checkout/*',
          '/order/*',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://apexfitness.com/sitemap.xml',
  };
}

