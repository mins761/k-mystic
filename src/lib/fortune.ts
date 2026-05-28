import { supabase } from '@/lib/supabase'
import { zodiacSigns } from '@/lib/i18n'
import { fullTarotCards } from '@/lib/tarotAssets'
import { getTarotCardMeta, getTarotReadingBody } from '@/lib/tarotMeanings'
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

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function getDailyTarot(lang: LanguageCode): Promise<Fortune> {
  const today = todayIso()
  const cardNumber = Math.floor(Math.random() * fullTarotCards.length)

  if (supabase) {
    const { data } = await supabase
      .from('fortunes')
      .select('*')
      .eq('lang', lang)
      .eq('type', 'tarot')
      .eq('card_number', cardNumber)
      .limit(1)
      .maybeSingle()

    if (data) return data as Fortune
  }

  const card = fullTarotCards[cardNumber]
  const meta = getTarotCardMeta(cardNumber)
  return {
    type: 'tarot',
    lang,
    title: `${card.name} opens the day`,
    body: getTarotReadingBody(cardNumber, sampleBodies[lang]),
    card_name: card.name,
    card_number: card.number,
    lucky_number: meta.tarotNumber,
    lucky_color: meta.luckyColor,
    compatibility: meta.compatibility,
    affirmation: 'I trust the sign that arrives softly and choose the path with courage.',
    mantra: `So your next step: ${meta.action}.`,
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
      .limit(20)

    if (data?.length) return randomItem(data) as Fortune
  }

  const index = zodiacSigns.indexOf(sign)
  return {
    type: 'horoscope',
    sign,
    lang,
    title: `${titleCase(sign)}: a steady light`,
    body: sampleBodies[lang],
    lucky_number: randomNumber(1, 9),
    lucky_color: randomItem(['purple', 'gold', 'silver', 'rose', 'emerald', 'deep blue']),
    compatibility: randomItem(zodiacSigns.filter((item) => item !== sign)),
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

export type ReadingSection = {
  title: string
  body: string
}

export function splitReadingSections(body: string): ReadingSection[] {
  const labels = [
    'Overall Energy', 'Today\'s Overall Energy', 'Love & Relationships', 'Career & Finance', 'Career & Ambition', 'Money & Abundance', 'Health & Vitality', 'Spiritual Growth', 'Spiritual Insight', 'Warning & Advice', 'Today\'s Affirmation', 'Today\'s Mantra', 'Affirmation', 'Mantra', 'Best time of day', 'Lucky number', 'Lucky color', 'Compatible zodiac',
    '全体エネルギー', '総合エネルギー', '今日の全体エネルギー', '今日の総合エネルギー', '全体のエネルギー', '恋愛と人間関係', '恋愛＆人間関係', 'キャリアと財務', 'キャリア＆財務', '仕事と財政', 'キャリアと野心', 'お金と豊かさ', '健康と活力', '精神的成長', '精神的洞察', '警告とアドバイス', '警告＆アドバイス', '今日のアファメーション', '今日のマントラ', 'アファメーション', 'マントラ',
    'Energía General', 'Energía general', 'Amor y relaciones', 'Amor y Relaciones', 'Carrera y finanzas', 'Carrera y Finanzas', 'Trabajo y finanzas', 'Trabajo y Finanzas', 'Crecimiento espiritual', 'Crecimiento Espiritual', 'Advertencia y consejo', 'Advertencia y Consejo', 'Afirmación de hoy', 'Afirmación', 'Salud y vitalidad', 'Dinero y abundancia',
    '整體能量', '今日整體能量', '整體運勢', '愛情與人際關係', '愛情與關係', '愛情與人際', '事業與財務', '工作與財務', '事業與野心', '金錢與豐盛', '健康與活力', '心靈成長', '精神成長', '心靈洞察', '警告與建議', '今日肯定句', '今日真言', '肯定句', '真言',
    '整体能量', '今日整体能量', '爱情与人际关系', '爱情与关系', '事业与财务', '工作与财务', '事业 with 野心', '金钱与丰盛', '健康与活力', '心灵成长', '精神成长', '心灵洞察', '警告与建议', '今日肯定句', '今日真言', '肯定句', '真言'
  ]

  const escapedLabels = labels.map(l => l.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')
  const labelRegexStr = `(?:^|\\s|\\n)(?:\\d+\\.\\s*)?(?:[\\u{1F300}-\\u{1FAFF}]\\s*)?\\*?\\*?(${escapedLabels})\\*?\\*?\\s*(?::|：|-|\\n|$)`
  const labelRegex = new RegExp(labelRegexStr, 'gu')

  const matches: { index: number; length: number; title: string }[] = []

  let match: RegExpExecArray | null
  const bracketRegex = /【([^】]+)】/gu
  while ((match = bracketRegex.exec(body)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
      title: match[1].trim(),
    })
  }

  const mdRegex = /(?:^|\n)##+\s*(.+?)(?:\n|$)/gu
  while ((match = mdRegex.exec(body)) !== null) {
    if (!matches.some(m => Math.abs(m.index - (match?.index ?? 0)) < 5)) {
      matches.push({
        index: match.index,
        length: match[0].length,
        title: match[1].trim(),
      })
    }
  }

  labelRegex.lastIndex = 0
  while ((match = labelRegex.exec(body)) !== null) {
    const matchIndex = match.index
    const matchLength = match[0].length
    const title = match[1].trim()

    if (!matches.some(m => matchIndex >= m.index && matchIndex < m.index + m.length)) {
      matches.push({
        index: matchIndex,
        length: matchLength,
        title: title,
      })
    }
  }

  matches.sort((a, b) => a.index - b.index)

  if (matches.length === 0) {
    return [{ title: '', body: body.trim() }]
  }

  const sections: ReadingSection[] = []
  const firstIndex = matches[0].index
  const intro = body.slice(0, firstIndex).trim()
  if (intro) {
    sections.push({ title: '', body: intro })
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    const next = matches[i + 1]
    const contentStart = current.index + current.length
    const contentEnd = next ? next.index : body.length
    const sectionBody = body.slice(contentStart, contentEnd).trim()

    sections.push({
      title: current.title,
      body: sectionBody,
    })
  }

  return sections
}

