import { supabase } from '@/lib/supabase'
import { tarotCards, zodiacSigns } from '@/lib/i18n'
import type { Fortune, LanguageCode, ZodiacSign } from '@/types'

const sampleBodies: Record<LanguageCode, string> = {
  en: 'A quiet chance arrives through a conversation you nearly overlook. Move with patience today and let one clear choice matter more than many small signals. Love softens when you speak plainly, while work rewards steady attention.',
  es: 'Una oportunidad tranquila llega mediante una conversación que casi pasas por alto. Avanza con paciencia y deja que una decisión clara pese más que muchas señales pequeñas. El amor se suaviza con honestidad y el trabajo premia la constancia.',
  ja: '見過ごしそうな会話の中に静かな好機があります。今日は焦らず、一つの明確な選択を大切にしてください。愛は素直な言葉で整い、仕事は丁寧さに応えます。',
  'zh-TW': '一段差點被忽略的對話裡藏著安靜的機會。今天請耐心前進，讓一個清楚的選擇勝過許多細碎訊號。感情因坦率而柔和，工作因穩定而有回報。',
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export async function getDailyTarot(lang: LanguageCode): Promise<Fortune> {
  const today = todayIso()

  if (supabase) {
    const { data } = await supabase
      .from('fortunes')
      .select('*')
      .eq('fortune_date', today)
      .eq('lang', lang)
      .eq('type', 'tarot')
      .limit(1)
      .maybeSingle()

    if (data) return data as Fortune
  }

  const card = tarotCards[new Date().getDate() % tarotCards.length]
  return {
    type: 'tarot',
    lang,
    title: `${card.name} opens the day`,
    body: sampleBodies[lang],
    card_name: card.name,
    card_number: card.number,
    lucky_number: (new Date().getDate() % 9) + 1,
    lucky_color: 'gold',
    compatibility: 'leo',
    affirmation: 'I trust the sign that arrives softly and choose the path with courage.',
    mantra: null,
    best_time: null,
    fortune_date: today,
  }
}

export async function getHoroscope(lang: LanguageCode, sign: ZodiacSign): Promise<Fortune> {
  const today = todayIso()

  if (supabase) {
    const { data } = await supabase
      .from('fortunes')
      .select('*')
      .eq('fortune_date', today)
      .eq('lang', lang)
      .eq('type', 'horoscope')
      .eq('sign', sign)
      .limit(1)
      .maybeSingle()

    if (data) return data as Fortune
  }

  const index = zodiacSigns.indexOf(sign)
  return {
    type: 'horoscope',
    sign,
    lang,
    title: `${titleCase(sign)}: a steady light`,
    body: sampleBodies[lang],
    lucky_number: ((index + new Date().getDate()) % 9) + 1,
    lucky_color: ['purple', 'gold', 'silver', 'rose'][index % 4],
    compatibility: zodiacSigns[(index + 4) % zodiacSigns.length],
    affirmation: 'I move with patience, clarity, and a heart open to the day.',
    mantra: 'I choose the hour that strengthens my spirit.',
    best_time: ['morning', 'afternoon', 'evening'][index % 3],
    fortune_date: today,
  }
}

export function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
