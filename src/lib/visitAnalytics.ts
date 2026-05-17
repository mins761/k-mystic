import { createHash } from 'crypto'

type HeaderReader = {
  get(name: string): string | null | undefined
}

const INTERNAL_HOSTS = new Set(['k-mystic.vercel.app'])

export type VisitAnalyticsRow = {
  path: string | null
  lang: string | null
  country?: string | null
  referrer?: string | null
  ip_hash?: string | null
  created_at: string
}

export function getClientIp(headers: HeaderReader) {
  const forwardedFor = firstHeaderValue(headers.get('x-forwarded-for'))
  if (forwardedFor) return forwardedFor

  return (
    cleanHeaderValue(headers.get('x-real-ip')) ||
    cleanHeaderValue(headers.get('cf-connecting-ip')) ||
    cleanHeaderValue(headers.get('x-vercel-forwarded-for')) ||
    null
  )
}

export function hashVisitIp(ip: string | null, day: string) {
  if (!ip) return null

  const salt = process.env.VISIT_HASH_SALT || process.env.ADMIN_PASSWORD || 'k-mystic'
  return createHash('sha256').update(`${day}:${salt}:${ip}`).digest('hex')
}

export function normalizeReferrer(referrer: string | null) {
  if (!referrer) return 'direct'

  try {
    const url = new URL(referrer)
    return isInternalHost(url.hostname) ? 'internal' : url.hostname
  } catch {
    return 'unknown'
  }
}

export function buildVisitStats(
  rows: VisitAnalyticsRow[],
  todayStart: Date,
  trackingSchemaReady: boolean,
) {
  const pageViews = topCounts(rows.map((row) => row.path || '/'))
  const languageViews = topCounts(rows.map((row) => row.lang || 'unknown'))
  const referrerViews = topCounts(rows.map((row) => normalizeReferrer(row.referrer || null)))

  if (!trackingSchemaReady) {
    return {
      uniqueToday: null,
      pageViews,
      languageViews,
      countryViews: [],
      referrerViews,
      trackingSchemaReady,
    }
  }

  const todayRows = rows.filter((row) => new Date(row.created_at) >= todayStart)

  return {
    uniqueToday: new Set(todayRows.map((row) => row.ip_hash).filter(Boolean)).size,
    pageViews,
    languageViews,
    countryViews: topCounts(rows.map((row) => row.country || 'unknown')),
    referrerViews,
    trackingSchemaReady,
  }
}

export function getVercelGeo(headers: HeaderReader) {
  return {
    country: cleanHeaderValue(headers.get('x-vercel-ip-country')),
    region: decodeHeaderValue(headers.get('x-vercel-ip-country-region')),
    city: decodeHeaderValue(headers.get('x-vercel-ip-city')),
  }
}

function firstHeaderValue(value: string | null | undefined) {
  const first = value?.split(',')[0]
  return cleanHeaderValue(first)
}

function cleanHeaderValue(value: string | null | undefined) {
  const cleaned = value?.trim()
  return cleaned || null
}

function decodeHeaderValue(value: string | null | undefined) {
  const cleaned = cleanHeaderValue(value)
  if (!cleaned) return null

  try {
    return decodeURIComponent(cleaned)
  } catch {
    return cleaned
  }
}

function isInternalHost(hostname: string) {
  return INTERNAL_HOSTS.has(hostname) || /^k-mystic-[a-z0-9-]+\.vercel\.app$/.test(hostname)
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 20)
}
