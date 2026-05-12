import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/serverSupabase'
import type { LanguageCode } from '@/types'

const languages = new Set<LanguageCode>(['en', 'es', 'ja', 'zh-TW'])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang')
  const cards = searchParams
    .get('cards')
    ?.split(',')
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0 && value <= 77)

  if (!lang || !languages.has(lang as LanguageCode) || !cards?.length) {
    return NextResponse.json({ readings: [] }, { status: 400 })
  }

  const supabase = createServerSupabase()
  if (!supabase) return NextResponse.json({ readings: [] })

  const { data, error } = await supabase
    .from('fortunes')
    .select('*')
    .eq('type', 'tarot')
    .eq('lang', lang)
    .is('fortune_date', null)
    .in('card_number', Array.from(new Set(cards)))

  if (error) {
    return NextResponse.json({ readings: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({ readings: data ?? [] })
}
