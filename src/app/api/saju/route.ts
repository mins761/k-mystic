import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SajuPillar, SajuResult } from '@/types'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
]

const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const stemElements = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'] as const
const branchElements = [
  'Water',
  'Earth',
  'Wood',
  'Wood',
  'Earth',
  'Fire',
  'Fire',
  'Earth',
  'Metal',
  'Metal',
  'Earth',
  'Water',
] as const

type Lang = 'en' | 'es' | 'ja' | 'zh-TW'

type SajuPayload = {
  name?: string
  year: number
  month: number
  day: number
  hour?: string
  gender: string
  language: string
  lang?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SajuPayload
    validatePayload(payload)

    const fallback = calculateSaju(payload)
    const result = await generateReading(payload, fallback)
    await saveReading(payload, result)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate saju reading.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

function validatePayload(payload: SajuPayload) {
  if (!payload.year || !payload.month || !payload.day) {
    throw new Error('Birth year, month, and day are required.')
  }
  if (payload.year < 1900 || payload.year > 2100) throw new Error('Birth year is out of range.')
  if (payload.month < 1 || payload.month > 12) throw new Error('Birth month is out of range.')
  if (payload.day < 1 || payload.day > 31) throw new Error('Birth day is out of range.')
}

async function generateReading(payload: SajuPayload, fallback: SajuResult): Promise<SajuResult> {
  const key = getOpenRouterKey()
  if (!key) return fallback

  const prompt = sajuPrompt(payload)

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'https://k-mystic.vercel.app',
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'K-Mystic',
      },
      body: JSON.stringify({
        model: MODELS[Math.floor(Math.random() * MODELS.length)],
        messages: [
          {
            role: 'system',
            content: 'You are a Korean Four Pillars reader. Return valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.82,
        max_tokens: 1400,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) return fallback

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') return fallback
    return normalizeResult(JSON.parse(content), fallback)
  } catch {
    return fallback
  }
}

function sajuPrompt({ year, month, day, hour, gender, language }: SajuPayload) {
  return `
You are a master Korean Four Pillars (사주팔자) reader
with 30 years of experience.

Analyze the Four Pillars for:
- Birth year: ${year}
- Birth month: ${month}
- Birth day: ${day}
- Birth hour: ${hour || 'unknown'}
- Gender: ${gender}

Calculate:
1. 천간 (Heavenly Stems): 갑을병정무기경신임계
2. 지지 (Earthly Branches): 자축인묘진사오미신유술해
3. 오행 (Five Elements) balance

Provide detailed reading in ${language}:
- Innate personality and talents
- Life destiny and major themes
- This year's fortune (2026)
- Love and relationships
- Career and wealth
- Health guidance
- Lucky elements (color, number, direction)

Writing style:
- Ancient wisdom meets modern insight
- Warm, encouraging, specific
- 400-500 words total

Return JSON only:
{
  "pillars": {
    "year": {"stem": "갑", "branch": "자", "element": "Wood"},
    "month": {"stem": "을", "branch": "축", "element": "Earth"},
    "day": {"stem": "병", "branch": "인", "element": "Fire"},
    "hour": {"stem": "정", "branch": "묘", "element": "Wood"}
  },
  "elements": {
    "wood": 30,
    "fire": 25,
    "earth": 20,
    "metal": 15,
    "water": 10
  },
  "personality": "...",
  "destiny": "...",
  "this_year": "...",
  "love": "...",
  "career": "...",
  "health": "...",
  "lucky_color": "...",
  "lucky_number": 7,
  "lucky_direction": "South"
}
`.trim()
}

function calculateSaju(payload: SajuPayload): SajuResult {
  const yearIndex = positiveMod(payload.year - 4, 60)
  const monthIndex = positiveMod(payload.year * 12 + payload.month + 14, 60)
  const dayIndex = positiveMod(payload.year * 365 + payload.month * 31 + payload.day + 22, 60)
  const hourBranchIndex = Math.max(0, branches.indexOf(payload.hour || '')) || 0
  const hourIndex = positiveMod(dayIndex * 2 + hourBranchIndex, 60)

  const pillars = {
    year: makePillar(yearIndex),
    month: makePillar(monthIndex),
    day: makePillar(dayIndex),
    hour: makePillar(hourIndex),
  }
  const elements = elementBalance(pillars)
  const dominant = dominantElement(elements)
  const text = localizedSajuText(payload, dominant)

  return {
    pillars,
    elements,
    personality: text.personality,
    destiny: text.destiny,
    this_year: text.this_year,
    love: text.love,
    career: text.career,
    health: text.health,
    lucky_color: text.lucky_color,
    lucky_number: (payload.day % 9) + 1,
    lucky_direction: text.lucky_direction,
  }
}

function getLang(payload: SajuPayload): Lang {
  if (payload.lang === 'es' || payload.lang === 'ja' || payload.lang === 'zh-TW') return payload.lang
  if (payload.language === 'Spanish') return 'es'
  if (payload.language === 'Japanese') return 'ja'
  if (payload.language === 'Traditional Chinese') return 'zh-TW'
  return 'en'
}

function localizedSajuText(payload: SajuPayload, dominant: string) {
  const lang = getLang(payload)
  const color = elementColor(dominant, lang)
  const direction = elementDirection(dominant, lang)
  const element = elementName(dominant, lang)
  const texts = {
    en: {
      personality: `Your chart carries a strong ${element} signature, giving your nature a distinct rhythm of instinct, timing, and inner resolve. You are at your best when you trust repeated patterns instead of forcing sudden answers.`,
      destiny:
        'Your life path favors steady refinement. The pillars suggest that meaningful opportunities arrive when discipline, intuition, and practical choices are allowed to support one another.',
      this_year:
        'In 2026, your fortune asks for cleaner priorities and fewer scattered promises. Choose the commitments that strengthen your future and release obligations that drain your focus.',
      love:
        'In relationships, warmth grows through consistency. Honest words, thoughtful timing, and small acts of loyalty will matter more than dramatic gestures.',
      career:
        'Career and wealth energy improves when you build repeatable systems. This is a favorable chart for patient planning, skill-building, and financial decisions made with a calm mind.',
      health:
        'Your body responds well to regular rest, simple food, and balanced movement. Guard your energy during stressful seasons and listen early when fatigue appears.',
      lucky_color: color,
      lucky_direction: direction,
    },
    es: {
      personality: `Tu carta muestra una fuerte influencia de ${element}, dando a tu naturaleza un ritmo claro de instinto, oportunidad y voluntad interior. Brillas mas cuando observas los patrones repetidos antes de forzar respuestas rapidas.`,
      destiny:
        'Tu camino vital favorece el refinamiento constante. Los pilares indican que las oportunidades importantes llegan cuando disciplina, intuicion y decisiones practicas trabajan juntas.',
      this_year:
        'En 2026, tu fortuna pide prioridades mas limpias y menos promesas dispersas. Elige compromisos que fortalezcan tu futuro y suelta lo que agota tu enfoque.',
      love:
        'En el amor, la calidez crece mediante constancia. Las palabras honestas, el buen momento y los pequenos actos de lealtad pesaran mas que los gestos dramaticos.',
      career:
        'La energia profesional y economica mejora cuando construyes sistemas repetibles. Es una carta favorable para planificar con paciencia, desarrollar habilidades y decidir con calma.',
      health:
        'Tu cuerpo responde bien al descanso regular, comida simple y movimiento equilibrado. Protege tu energia en epocas de estres y escucha temprano las senales de cansancio.',
      lucky_color: color,
      lucky_direction: direction,
    },
    ja: {
      personality: `あなたの命式には${element}の気が強く流れ、直感、間合い、内なる粘り強さに独特のリズムを与えています。急いで答えを出すより、繰り返し現れる流れを信じるほど本来の力が開きます。`,
      destiny:
        'あなたの人生は、少しずつ磨き上げることで運が育つ型です。規律、直感、現実的な選択が互いを支えた時、大切な機会が静かに近づきます。',
      this_year:
        '2026年は、優先順位を整え、散らばった約束を減らすことが開運の鍵です。未来を強くする約束を選び、集中力を奪う負担は手放しましょう。',
      love:
        '恋愛では、派手な言葉よりも継続した温かさが信頼を育てます。正直な会話、思いやりのあるタイミング、小さな誠実さが関係を深めます。',
      career:
        '仕事と財運は、再現できる仕組みを作るほど安定します。落ち着いた計画、技術の積み上げ、慎重な金銭判断に追い風があります。',
      health:
        '体は規則的な休息、素朴な食事、無理のない運動に良く反応します。忙しい時期ほど気力を守り、疲れのサインを早めに受け止めてください。',
      lucky_color: color,
      lucky_direction: direction,
    },
    'zh-TW': {
      personality: `你的命盤帶有強烈的${element}氣息，讓你的本性具有直覺、時機感與內在韌性。當你相信反覆出現的徵兆，而不是急著尋找答案時，力量會更穩定地展開。`,
      destiny:
        '你的人生道路偏向穩定打磨。四柱顯示，當紀律、直覺與務實選擇彼此配合時，重要機會會以安靜卻明確的方式靠近。',
      this_year:
        '2026年，你的運勢提醒你整理優先順序，減少分散的承諾。選擇能強化未來的責任，放下消耗專注力的牽絆。',
      love:
        '感情中，溫暖會透過穩定累積。真誠的話語、合適的時機，以及小小但持續的忠誠，比戲劇化表現更能打動人心。',
      career:
        '事業與財運會在你建立可重複的系統時提升。這是適合耐心規劃、累積技能，並以冷靜心態做財務決定的命盤。',
      health:
        '你的身體適合規律休息、簡單飲食與平衡活動。壓力高時要守住元氣，疲倦一出現就及早調整。',
      lucky_color: color,
      lucky_direction: direction,
    },
  }
  return texts[lang]
}

function elementName(dominant: string, lang: Lang) {
  const names = {
    en: { Wood: 'Wood', Fire: 'Fire', Earth: 'Earth', Metal: 'Metal', Water: 'Water' },
    es: { Wood: 'Madera', Fire: 'Fuego', Earth: 'Tierra', Metal: 'Metal', Water: 'Agua' },
    ja: { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' },
    'zh-TW': { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' },
  } as const
  return names[lang][dominant as keyof (typeof names)['en']] ?? names[lang].Water
}

function elementColor(dominant: string, lang: Lang) {
  const colors = {
    en: {
      Wood: 'forest green',
      Fire: 'crimson',
      Earth: 'golden yellow',
      Metal: 'pearl white',
      Water: 'deep blue',
    },
    es: {
      Wood: 'verde bosque',
      Fire: 'carmesi',
      Earth: 'amarillo dorado',
      Metal: 'blanco perla',
      Water: 'azul profundo',
    },
    ja: {
      Wood: '森の緑',
      Fire: '深紅',
      Earth: '黄金色',
      Metal: '真珠の白',
      Water: '深い青',
    },
    'zh-TW': {
      Wood: '森林綠',
      Fire: '深紅色',
      Earth: '金黃色',
      Metal: '珍珠白',
      Water: '深藍色',
    },
  } as const
  return colors[lang][dominant as keyof (typeof colors)['en']] ?? colors[lang].Water
}

function elementDirection(dominant: string, lang: Lang) {
  const directions = {
    en: { Wood: 'East', Fire: 'South', Earth: 'Center', Metal: 'West', Water: 'North' },
    es: { Wood: 'Este', Fire: 'Sur', Earth: 'Centro', Metal: 'Oeste', Water: 'Norte' },
    ja: { Wood: '東', Fire: '南', Earth: '中央', Metal: '西', Water: '北' },
    'zh-TW': { Wood: '東方', Fire: '南方', Earth: '中央', Metal: '西方', Water: '北方' },
  } as const
  return directions[lang][dominant as keyof (typeof directions)['en']] ?? directions[lang].Water
}

function makePillar(index: number): SajuPillar {
  const stemIndex = positiveMod(index, 10)
  const branchIndex = positiveMod(index, 12)
  return {
    stem: stems[stemIndex],
    branch: branches[branchIndex],
    element: stemElements[stemIndex] || branchElements[branchIndex],
  }
}

function elementBalance(pillars: SajuResult['pillars']): SajuResult['elements'] {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  Object.values(pillars).forEach((pillar) => {
    counts[pillar.element.toLowerCase() as keyof typeof counts] += 2
    const branchIndex = branches.indexOf(pillar.branch)
    counts[branchElements[branchIndex].toLowerCase() as keyof typeof counts] += 1
  })
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)
  return {
    wood: Math.round((counts.wood / total) * 100),
    fire: Math.round((counts.fire / total) * 100),
    earth: Math.round((counts.earth / total) * 100),
    metal: Math.round((counts.metal / total) * 100),
    water: Math.round((counts.water / total) * 100),
  }
}

function dominantElement(elements: SajuResult['elements']) {
  const entries = Object.entries(elements) as Array<[keyof SajuResult['elements'], number]>
  const [key] = entries.sort((a, b) => b[1] - a[1])[0]
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function normalizeResult(raw: Partial<SajuResult>, fallback: SajuResult): SajuResult {
  return {
    pillars: raw.pillars ?? fallback.pillars,
    elements: normalizeElements(raw.elements, fallback.elements),
    personality: textOr(raw.personality, fallback.personality),
    destiny: textOr(raw.destiny, fallback.destiny),
    this_year: textOr(raw.this_year, fallback.this_year),
    love: textOr(raw.love, fallback.love),
    career: textOr(raw.career, fallback.career),
    health: textOr(raw.health, fallback.health),
    lucky_color: textOr(raw.lucky_color, fallback.lucky_color),
    lucky_number: typeof raw.lucky_number === 'number' ? raw.lucky_number : fallback.lucky_number,
    lucky_direction: textOr(raw.lucky_direction, fallback.lucky_direction),
  }
}

function normalizeElements(
  raw: Partial<SajuResult['elements']> | undefined,
  fallback: SajuResult['elements'],
): SajuResult['elements'] {
  if (!raw) return fallback
  return {
    wood: clampPercent(raw.wood, fallback.wood),
    fire: clampPercent(raw.fire, fallback.fire),
    earth: clampPercent(raw.earth, fallback.earth),
    metal: clampPercent(raw.metal, fallback.metal),
    water: clampPercent(raw.water, fallback.water),
  }
}

function clampPercent(value: unknown, fallback: number) {
  return typeof value === 'number' ? Math.max(0, Math.min(100, Math.round(value))) : fallback
}

function textOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function positiveMod(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor
}

function getOpenRouterKey() {
  const raw = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEYS || ''
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)[0]
}

async function saveReading(payload: SajuPayload, result: SajuResult) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
  if (!url || !key) return

  const supabase = createClient(url, key)
  await supabase.from('saju_readings').insert({
    birth_year: payload.year,
    birth_month: payload.month,
    birth_day: payload.day,
    birth_hour: payload.hour || null,
    gender: payload.gender,
    lang: payload.lang || payload.language,
    result,
  })
}
