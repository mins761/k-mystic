import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/serverSupabase'
import { buildVisitStats, VisitAnalyticsRow } from '@/lib/visitAnalytics'

type StatsRequest = {
  password?: string
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

  const rows = (rowsResult.data ?? []) as VisitAnalyticsRow[]
  const visitStats = buildVisitStats(rows, todayStart, !extendedRowsResult.error)

  return NextResponse.json({
    total: totalResult.count ?? 0,
    today: todayResult.count ?? 0,
    sevenDays: sevenDayResult.count ?? 0,
    ...visitStats,
    generatedAt: now.toISOString(),
  })
}
