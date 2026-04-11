import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.booppa.io'
const API_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.booppa.io'

// Static pages with their priorities
const STATIC_ROUTES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { url: '/',                        priority: 1.0, changeFrequency: 'weekly' },
  { url: '/vendors',                 priority: 0.9, changeFrequency: 'daily' },
  { url: '/pricing',                 priority: 0.9, changeFrequency: 'weekly' },
  { url: '/tender-check',            priority: 0.9, changeFrequency: 'daily' },
  { url: '/opportunities',           priority: 0.9, changeFrequency: 'daily' },
  { url: '/rankings',                priority: 0.8, changeFrequency: 'weekly' },
  { url: '/compare',                 priority: 0.8, changeFrequency: 'weekly' },
  { url: '/vendor-proof',            priority: 0.8, changeFrequency: 'monthly' },
  { url: '/notarization',            priority: 0.8, changeFrequency: 'monthly' },
  { url: '/compliance-notarization', priority: 0.8, changeFrequency: 'monthly' },
  { url: '/pdpa',                    priority: 0.8, changeFrequency: 'monthly' },
  { url: '/rfp-acceleration',        priority: 0.8, changeFrequency: 'monthly' },
  { url: '/enterprise',              priority: 0.7, changeFrequency: 'monthly' },
  { url: '/insight-dome',            priority: 0.7, changeFrequency: 'weekly' },
  { url: '/resources',               priority: 0.7, changeFrequency: 'weekly' },
  { url: '/faq',                     priority: 0.6, changeFrequency: 'monthly' },
  { url: '/book-demo',               priority: 0.6, changeFrequency: 'monthly' },
  { url: '/compliance',              priority: 0.6, changeFrequency: 'monthly' },
  { url: '/supply-chain',            priority: 0.6, changeFrequency: 'monthly' },
  { url: '/pdpa',                    priority: 0.6, changeFrequency: 'monthly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ url, priority, changeFrequency }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // Dynamic entries from backend: industry SEO pages + vendor profiles
  try {
    const res = await fetch(`${API_URL}/api/v1/seo/sitemap`, {
      next: { revalidate: 86400 }, // revalidate once per day
    })
    if (res.ok) {
      const dynamic: { url: string; priority?: number; changefreq?: string }[] = await res.json()
      for (const item of dynamic) {
        entries.push({
          url: `${BASE_URL}${item.url}`,
          lastModified: new Date(),
          changeFrequency: (item.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) ?? 'weekly',
          priority: item.priority ?? 0.6,
        })
      }
    }
  } catch {
    // Non-fatal: static entries still returned
  }

  return entries
}
