import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/serverSupabase'
import { normalizeReferrer } from '@/lib/visitAnalytics'

type StatsRequest = {
  password?: string
}

type VisitRow = {
  path: string | null
  lang: string | null
  country: string | null
  referrer: string | null
  ip_hash: string | null
  created_at: string
}

export async function POST(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!configuredPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD is not configured.' }, { status: 500 })
  }

  const payload = (await request.json().catch(() => ({}))) as StatsRequest
  if (payload.password !== configuredPassword) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase server key is not configured.' }, { status: 500 })
  }

  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [totalResult, todayResult, sevenDayResult, extendedRowsResult] = await Promise.all([
    supabase.from('site_visits').select('id', { count: 'exact', head: true }),
    supabase
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('site_visits')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('site_visits')
      .select('path, lang, country, referrer, ip_hash, created_at')
      .order('created_at', { ascending: false })
      .limit(10000),
  ])

  const rowsResult = extendedRowsResult.error
    ? await supabase
        .from('site_visits')
        .select('path, lang, referrer, created_at')
        .order('created_at', { ascending: false })
        .limit(10000)
    : extendedRowsResult

  const firstError = totalResult.error || todayResult.error || sevenDayResult.error || rowsResult.error
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 })
  }

  const rows = (rowsResult.data ?? []) as VisitRow[]
  const pageViews = topCounts(rows.map((row) => row.path || '/'))
  const languageViews = topCounts(rows.map((row) => row.lang || 'unknown'))
  const todayRows = rows.filter((row) => new Date(row.created_at) >= todayStart)
  const uniqueToday = new Set(todayRows.map((row) => row.ip_hash).filter(Boolean)).size
  const countryViews = topCounts(rows.map((row) => row.country || 'unknown'))
  const referrerViews = topCounts(rows.map((row) => normalizeReferrer(row.referrer)))

  return NextResponse.json({
    total: totalResult.count ?? 0,
    today: todayResult.count ?? 0,
    sevenDays: sevenDayResult.count ?? 0,
    uniqueToday,
    pageViews,
    languageViews,
    countryViews,
    referrerViews,
    generatedAt: now.toISOString(),
  })
}

function topCounts(values: string[]) {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 20)
}
