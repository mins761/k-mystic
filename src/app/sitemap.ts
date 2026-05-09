import type { MetadataRoute } from 'next'
import { languageCodes, zodiacSigns } from '@/lib/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://k-mystic.vercel.app'
  const staticPages = ['', '/tarot', '/horoscope', '/compatibility', '/about', '/privacy', '/contact']

  return languageCodes.flatMap((lang) => [
    ...staticPages.map((path) => ({
      url: `${base}/${lang}${path}`,
      lastModified: new Date(),
    })),
    ...zodiacSigns.map((sign) => ({
      url: `${base}/${lang}/horoscope/${sign}`,
      lastModified: new Date(),
    })),
  ])
}
