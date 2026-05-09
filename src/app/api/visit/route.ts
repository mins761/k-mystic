import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/serverSupabase'
import { isLanguage } from '@/lib/i18n'

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

    await supabase.from('site_visits').insert({
      path,
      lang,
      referrer: truncate(requestHeaders.get('referer'), 500),
      user_agent: truncate(requestHeaders.get('user-agent'), 500),
    })

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
