import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/serverSupabase'
import { isLanguage } from '@/lib/i18n'
import { getClientIp, getVercelGeo, hashVisitIp } from '@/lib/visitAnalytics'

type VisitPayload = {
  path?: string
  lang?: string
}

export async function POST(request: Request) {
  const supabase = createServerSupabase()
  if (!supabase) return NextResponse.json({ ok: true })

  try {
    const payload = (await request.json()) as VisitPayload
    const path = sanitizePath(payload.path)
    if (!path || path.startsWith('/admin') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true })
    }

    const requestHeaders = headers()
    const lang = payload.lang && isLanguage(payload.lang) ? payload.lang : inferLang(path)

    const today = new Date().toISOString().slice(0, 10)
    const geo = getVercelGeo(requestHeaders)

    const visit = {
      path,
      lang,
      referrer: truncate(requestHeaders.get('referer'), 500),
      user_agent: truncate(requestHeaders.get('user-agent'), 500),
      country: truncate(geo.country, 80),
      region: truncate(geo.region, 120),
      city: truncate(geo.city, 120),
      ip_hash: hashVisitIp(getClientIp(requestHeaders), today),
    }

    const result = await supabase.from('site_visits').insert(visit)
    if (result.error) {
      await supabase.from('site_visits').insert({
        path: visit.path,
        lang: visit.lang,
        referrer: visit.referrer,
        user_agent: visit.user_agent,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

function sanitizePath(value: unknown) {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!path.startsWith('/')) return null
  return path.slice(0, 300)
}

function inferLang(path: string) {
  const candidate = path.split('/').filter(Boolean)[0]
  return candidate && isLanguage(candidate) ? candidate : null
}

function truncate(value: string | null, length: number) {
  return value ? value.slice(0, length) : null
}
