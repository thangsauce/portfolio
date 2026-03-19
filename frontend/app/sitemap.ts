import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://thangle.me',
            lastModified: '2026-03-16',
            changeFrequency: 'monthly',
            priority: 1,
        },
    ];
}
