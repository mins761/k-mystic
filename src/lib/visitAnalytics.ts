import { createHash } from 'crypto'

type HeaderReader = {
  get(name: string): string | null | undefined
}

const INTERNAL_HOSTS = new Set(['k-mystic.vercel.app'])

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
    return INTERNAL_HOSTS.has(url.hostname) ? 'internal' : url.hostname
  } catch {
    return 'unknown'
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
