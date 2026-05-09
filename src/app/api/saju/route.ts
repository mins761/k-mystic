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

  return {
    pillars,
    elements,
    personality: `Your chart carries a strong ${dominant} signature, giving your nature a distinct rhythm of instinct, timing, and inner resolve. You are at your best when you trust repeated patterns instead of forcing sudden answers.`,
    destiny: 'Your life path favors steady refinement. The pillars suggest that meaningful opportunities arrive when discipline, intuition, and practical choices are allowed to support one another.',
    this_year: 'In 2026, your fortune asks for cleaner priorities and fewer scattered promises. Choose the commitments that strengthen your future and release obligations that drain your focus.',
    love: 'In relationships, warmth grows through consistency. Honest words, thoughtful timing, and small acts of loyalty will matter more than dramatic gestures.',
    career: 'Career and wealth energy improves when you build repeatable systems. This is a favorable chart for patient planning, skill-building, and financial decisions made with a calm mind.',
    health: 'Your body responds well to regular rest, simple food, and balanced movement. Guard your energy during stressful seasons and listen early when fatigue appears.',
    lucky_color: dominant === 'Wood' ? 'forest green' : dominant === 'Fire' ? 'crimson' : dominant === 'Earth' ? 'golden yellow' : dominant === 'Metal' ? 'pearl white' : 'deep blue',
    lucky_number: (payload.day % 9) + 1,
    lucky_direction: dominant === 'Wood' ? 'East' : dominant === 'Fire' ? 'South' : dominant === 'Metal' ? 'West' : dominant === 'Water' ? 'North' : 'Center',
  }
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
