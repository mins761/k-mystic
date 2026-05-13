import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SajuPillar, SajuResult } from '@/types'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'https://ollama.com/api/chat'
const DEFAULT_MODELS = [
  'openai/gpt-oss-20b:free',
  'openai/gpt-oss-120b:free',
  'z-ai/glm-4.5-air:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'openrouter/free',
]
const DEFAULT_OLLAMA_MODELS = ['gemma4:31b-cloud', 'gpt-oss:20b']
const DEPRECATED_MODELS = new Set([
  'qwen/qwen-2.5-72b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
])

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
  const prompt = cleanSajuPrompt(payload)
  const ollamaKey = getOllamaKey()
  if (ollamaKey) {
    const ollamaResult = await generateWithOllama(prompt, ollamaKey)
    if (ollamaResult) return normalizeResult(ollamaResult, fallback)
  }

  const openRouterKey = getOpenRouterKey()
  if (!openRouterKey) return fallback

  const openRouterResult = await generateWithOpenRouter(prompt, openRouterKey)
  return openRouterResult ? normalizeResult(openRouterResult, fallback) : fallback
}

async function generateWithOllama(prompt: string, key: string): Promise<Partial<SajuResult> | null> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: pickOllamaModel(),
        messages: [
          {
            role: 'system',
            content: 'You are a Korean Four Pillars reader. Return valid JSON only. Do not include markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
        stream: false,
        format: 'json',
        options: {
          temperature: 0.82,
          num_predict: 1400,
        },
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const content = data?.message?.content
    if (typeof content !== 'string') return null
    return extractJson(content)
  } catch {
    return null
  }
}

async function generateWithOpenRouter(prompt: string, key: string): Promise<Partial<SajuResult> | null> {
  const models = pickOpenRouterModels()

  for (const model of models) {
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
          model,
          provider: {
            sort: 'throughput',
          },
          transforms: ['middle-out'],
          messages: [
            {
              role: 'system',
              content:
                'You are a careful Korean Four Pillars (Saju) reader. Return one valid JSON object only. Do not include markdown fences, prefaces, or warnings.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.72,
          max_tokens: 2200,
        }),
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        console.warn(`OpenRouter Saju request failed for ${model}: ${response.status} ${detail.slice(0, 240)}`)
        continue
      }

      const data = await response.json()
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') {
        console.warn(`OpenRouter Saju response was empty for ${model}`)
        continue
      }

      const parsed = extractJson(content)
      if (Object.keys(parsed).length) return parsed
      console.warn(`OpenRouter Saju response did not contain usable JSON for ${model}: ${content.slice(0, 240)}`)
    } catch (error) {
      console.warn(`OpenRouter Saju request errored for ${model}:`, error)
    }
  }

  return null
}

function sajuPrompt({ year, month, day, hour, gender, language }: SajuPayload) {
  return `
You are a master Korean Four Pillars (?ъ＜?붿옄) reader
with 30 years of experience.

Analyze the Four Pillars for:
- Birth year: ${year}
- Birth month: ${month}
- Birth day: ${day}
- Birth hour: ${hour || 'unknown'}
- Gender: ${gender}

Calculate:
1. 泥쒓컙 (Heavenly Stems): 媛묒쓣蹂묒젙臾닿린寃쎌떊?꾧퀎
2. 吏吏 (Earthly Branches): ?먯텞?몃쵖吏꾩궗?ㅻ??좎쑀?좏빐
3. ?ㅽ뻾 (Five Elements) balance

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
    "year": {"stem": "媛?, "branch": "??, "element": "Wood"},
    "month": {"stem": "??, "branch": "異?, "element": "Earth"},
    "day": {"stem": "蹂?, "branch": "??, "element": "Fire"},
    "hour": {"stem": "??, "branch": "臾?, "element": "Wood"}
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

function cleanSajuPrompt({ year, month, day, hour, gender, language }: SajuPayload) {
  const hourText = hour ? `${hour} branch time` : 'unknown birth hour'

  return `
Create a Korean Four Pillars of Destiny (Saju / 사주팔자) reading for a consumer astrology website.

Birth data:
- Year: ${year}
- Month: ${month}
- Day: ${day}
- Birth hour: ${hourText}
- Gender: ${gender || 'unspecified'}
- Output language: ${language}

Interpretation requirements:
- Calculate or infer four pillars using Heavenly Stems and Earthly Branches.
- Use romanized stem names only: Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui.
- Use branch animal names only: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.
- Use Five Elements only: Wood, Fire, Earth, Metal, Water.
- Make the reading feel personal to the exact birth date and hour. Mention seasonal tone, dominant element, weaker element, and how the year/day pillars shape behavior.
- For the yearly section, treat 2026 as Bing-Wu, the Fire Horse year. Do not call 2026 a Monkey, Metal Monkey, or any other year.
- Keep the tone warm, useful, grounded, and non-fatalistic. Do not make medical, legal, or financial guarantees.
- Do not say you are unable to calculate. If the birth hour is unknown, explain the hour pillar as an estimated tendency.
- Avoid generic stock phrases. Every section should contain concrete guidance.
- Avoid mojibake, broken characters, markdown fences, comments, and text outside JSON.

Length requirements:
- personality: 90-130 words
- destiny: 90-130 words
- this_year: 80-120 words, focused on 2026
- love: 70-110 words
- career: 80-120 words
- health: 60-90 words, framed as wellness guidance, not diagnosis

Return exactly one valid JSON object with this schema:
{
  "pillars": {
    "year": {"stem": "Jia", "branch": "Rat", "element": "Wood"},
    "month": {"stem": "Yi", "branch": "Ox", "element": "Earth"},
    "day": {"stem": "Bing", "branch": "Tiger", "element": "Fire"},
    "hour": {"stem": "Ding", "branch": "Rabbit", "element": "Wood"}
  },
  "elements": {
    "wood": 30,
    "fire": 25,
    "earth": 20,
    "metal": 15,
    "water": 10
  },
  "personality": "90-130 words",
  "destiny": "90-130 words",
  "this_year": "80-120 words",
  "love": "70-110 words",
  "career": "80-120 words",
  "health": "60-90 words",
  "lucky_color": "specific color",
  "lucky_number": 7,
  "lucky_direction": "East"
}
`.trim()
}

function legacySajuPrompt({ year, month, day, hour, gender, language }: SajuPayload) {
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

function legacyCleanSajuPrompt({ year, month, day, hour, gender, language }: SajuPayload) {
  return `
You are a master Korean Four Pillars (Saju) reader with 30 years of experience.

Analyze the Four Pillars for:
- Birth year: ${year}
- Birth month: ${month}
- Birth day: ${day}
- Birth hour: ${hour || 'unknown'}
- Gender: ${gender}

Calculate:
1. Heavenly Stems using romanized names: Jia, Yi, Bing, Ding, Wu, Ji, Geng, Xin, Ren, Gui
2. Earthly Branches using animal names: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig
3. Five Elements balance: Wood, Fire, Earth, Metal, Water

Provide a specific reading in ${language}. Do not reuse generic stock sentences.
Use the exact birth date and hour to make the interpretation feel personal.
Avoid mojibake, broken characters, markdown fences, and commentary outside JSON.

Return JSON only:
{
  "pillars": {
    "year": {"stem": "Jia", "branch": "Rat", "element": "Wood"},
    "month": {"stem": "Yi", "branch": "Ox", "element": "Earth"},
    "day": {"stem": "Bing", "branch": "Tiger", "element": "Fire"},
    "hour": {"stem": "Ding", "branch": "Rabbit", "element": "Wood"}
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
  const text = personalizedSajuText(payload, dominant, pillars, elements)

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

function personalizedSajuText(
  payload: SajuPayload,
  dominant: string,
  pillars: SajuResult['pillars'],
  elements: SajuResult['elements'],
) {
  const lang = getLang(payload)
  const color = elementColor(dominant, lang)
  const direction = elementDirection(dominant, lang)
  const element = elementName(dominant, lang)
  const seed = positiveMod(payload.year * 13 + payload.month * 31 + payload.day * 17 + hourSeed(payload.hour), 97)
  const season = seasonName(payload.month, lang)
  const dayTone = toneName(seed, lang)
  const focus = focusName(seed + payload.day, lang)
  const relation = relationName(seed + payload.month, lang)
  const work = workName(seed + payload.year, lang)
  const health = healthName(seed + hourSeed(payload.hour), lang)
  const weakElement = weakestElement(elements)
  const weak = elementName(weakElement, lang)
  const yearElement = pillars.year.element
  const dayElement = pillars.day.element

  const texts = {
    en: {
      personality: `Born in the ${season} rhythm, your chart carries a strong ${element} signature with a ${dayTone} temperament. The year pillar leans toward ${yearElement}, shaping how you meet the outside world, while the day pillar leans toward ${dayElement}, showing how you make decisions when pressure rises. You are at your best when you balance ${element} momentum with the quieter ${weak} current.`,
      destiny: `Your destiny theme centers on ${focus}. This chart does not ask you to chase every open door; it favors choices that repeat, mature, and become reliable over time. When discipline and intuition move together, opportunities arrive through people who recognize your consistency.`,
      this_year: `In 2026, your luck improves when you simplify priorities and make one promise at a time. The ${dominant} influence supports visible progress, but the weaker ${weak} current asks you to leave room for rest, review, and careful timing before major commitments.`,
      love: `In love, your strongest pattern is ${relation}. You respond well to sincerity that is proven through behavior, not only words. Relationships become smoother when you state what you need early and avoid testing someone through silence.`,
      career: `Career and wealth are guided by ${work}. Build repeatable systems, document what works, and avoid scattering your effort across too many unfinished plans. Money luck strengthens through practical skill, patient negotiation, and steady visibility.`,
      health: `Your body asks for ${health}. The chart is sensitive to imbalance between effort and recovery, so protect sleep, hydration, and regular movement. When stress rises, reduce stimulation before adding more obligations.`,
      lucky_color: color,
      lucky_direction: direction,
    },
    es: {
      personality: `Nacido bajo el ritmo de ${season}, tu carta muestra una fuerte influencia de ${element} con un temperamento ${dayTone}. El pilar anual se inclina hacia ${yearElement}, marcando como encuentras el mundo exterior, mientras que el pilar del dia se inclina hacia ${dayElement}, revelando como decides bajo presion. Tu fuerza crece cuando equilibras el impulso de ${element} con la corriente mas silenciosa de ${weak}.`,
      destiny: `Tu tema de destino gira alrededor de ${focus}. Esta carta no te pide seguir cada puerta abierta; favorece elecciones que se repiten, maduran y se vuelven confiables. Cuando disciplina e intuicion avanzan juntas, las oportunidades llegan por personas que reconocen tu constancia.`,
      this_year: `En 2026, tu suerte mejora al simplificar prioridades y hacer una promesa a la vez. La influencia de ${dominant} apoya progreso visible, pero el elemento mas debil, ${weak}, pide descanso, revision y buen momento antes de compromisos grandes.`,
      love: `En el amor, tu patron principal es ${relation}. Respondes mejor a una sinceridad demostrada con actos, no solo palabras. Las relaciones fluyen cuando expresas tus necesidades temprano y evitas probar al otro con silencio.`,
      career: `Carrera y riqueza se guian por ${work}. Crea sistemas repetibles, registra lo que funciona y evita dispersar tu energia en demasiados planes incompletos. La suerte economica crece con habilidad practica, negociacion paciente y presencia constante.`,
      health: `Tu cuerpo pide ${health}. La carta es sensible al desequilibrio entre esfuerzo y recuperacion, asi que protege descanso, hidratacion y movimiento regular. Cuando suba el estres, reduce estimulos antes de asumir mas obligaciones.`,
      lucky_color: color,
      lucky_direction: direction,
    },
    ja: {
      personality: `${season}のリズムに生まれたあなたの命式には、${element}の気が強く、${dayTone}な気質が表れています。年柱は${yearElement}に傾き、外の世界との向き合い方を示し、日柱は${dayElement}に傾いて迷った時の決断の癖を映します。${element}の勢いに、弱まりやすい${weak}の静けさを足すほど本来の力が安定します。`,
      destiny: `運命のテーマは${focus}です。すべての扉を急いで選ぶより、繰り返し育てられる選択を大切にする命式です。規律と直感が同じ方向を向く時、あなたの誠実さを見ていた人から機会が届きます。`,
      this_year: `2026年は、優先順位を絞り、一度に一つの約束を守るほど運が整います。${dominant}の気は目に見える前進を助けますが、弱い${weak}の気は休息、見直し、慎重な時機を求めています。`,
      love: `恋愛では${relation}が大きな鍵です。言葉だけでなく、行動で示される誠実さに心が開きます。必要なことを早めに伝え、沈黙で相手を試さないほど関係は柔らかくなります。`,
      career: `仕事と金運は${work}によって伸びます。再現できる仕組みを作り、うまくいく手順を残し、未完の計画を増やしすぎないこと。実務力、落ち着いた交渉、継続的な存在感が財運を強めます。`,
      health: `体は${health}を求めています。努力と回復の差が開くと乱れやすい命式なので、睡眠、水分、軽い運動を守ってください。ストレスが強い時は予定を足す前に刺激を減らすことが大切です。`,
      lucky_color: color,
      lucky_direction: direction,
    },
    'zh-TW': {
      personality: `出生在${season}節奏中的你，命盤帶有強烈的${element}氣息，並呈現${dayTone}的性情。年柱偏向${yearElement}，顯示你面對外界的方式；日柱偏向${dayElement}，反映你在壓力下的決策習慣。當${element}的推動力能與較弱的${weak}之氣平衡時，你會更穩。`,
      destiny: `你的命運主題圍繞著${focus}。這不是追逐每一扇門的命盤，而是適合把能反覆累積的選擇慢慢養大。當紀律與直覺走向同一邊，機會會從看見你穩定性的人身上出現。`,
      this_year: `2026年，你的運勢會在簡化優先順序、一次守好一個承諾時變強。${dominant}之氣支持看得見的進展，但較弱的${weak}提醒你在重大決定前保留休息、檢視與等待時機的空間。`,
      love: `感情中的關鍵模式是${relation}。你更容易被用行動證明的真誠打動，而不是只聽漂亮的話。越早說清需要，越少用沉默試探對方，關係就越柔和。`,
      career: `事業與財運受到${work}引導。建立可重複的系統，記錄有效的方法，避免把能量分散在太多未完成的計畫上。實務能力、耐心協商與穩定曝光會帶來財運。`,
      health: `身體需要${health}。此命盤對努力與恢復的失衡較敏感，因此要守住睡眠、補水與規律活動。壓力升高時，先減少刺激，再考慮增加責任。`,
      lucky_color: color,
      lucky_direction: direction,
    },
  }

  return texts[lang]
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

function extractJson(text: string): Partial<SajuResult> {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')

  const direct = parseJsonObject(cleaned)
  if (direct) return direct

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    const extracted = cleaned.slice(start, end + 1)
    const parsed = parseJsonObject(extracted) ?? parseJsonObject(escapeControlCharacters(extracted))
    if (parsed) return parsed
  }

  return {}
}

function parseJsonObject(text: string) {
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') return parsed as Partial<SajuResult>
  } catch {
    return null
  }
  return null
}

function escapeControlCharacters(text: string) {
  let inString = false
  let escaped = false
  let result = ''

  for (const char of text) {
    if (escaped) {
      result += char
      escaped = false
      continue
    }

    if (char === '\\') {
      result += char
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      result += char
      continue
    }

    if (inString && (char === '\n' || char === '\r' || char === '\t')) {
      result += ' '
      continue
    }

    result += char
  }

  return result
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

function hourSeed(hour: string | undefined) {
  return hour ? Array.from(hour).reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0
}

function weakestElement(elements: SajuResult['elements']) {
  const entries = Object.entries(elements) as Array<[keyof SajuResult['elements'], number]>
  const [key] = entries.sort((a, b) => a[1] - b[1])[0]
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function pickLocalized<T extends string>(items: Record<Lang, T[]>, index: number, lang: Lang) {
  const list = items[lang]
  return list[positiveMod(index, list.length)]
}

function seasonName(month: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['early spring', 'deep spring', 'first summer', 'high summer', 'late summer', 'autumn', 'late autumn', 'winter'],
      es: ['inicio de primavera', 'primavera profunda', 'primer verano', 'pleno verano', 'final de verano', 'otono', 'otono tardio', 'invierno'],
      ja: ['初春', '春の深まり', '初夏', '盛夏', '晩夏', '秋', '晩秋', '冬'],
      'zh-TW': ['初春', '深春', '初夏', '盛夏', '夏末', '秋季', '深秋', '冬季'],
    },
    Math.max(0, Math.min(11, month - 1)),
    lang,
  )
}

function toneName(seed: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['focused', 'sensitive', 'resilient', 'observant', 'decisive', 'adaptive'],
      es: ['concentrado', 'sensible', 'resiliente', 'observador', 'decidido', 'adaptable'],
      ja: ['集中力のある', '感受性の高い', '粘り強い', '観察力のある', '決断力のある', '適応力のある'],
      'zh-TW': ['專注', '敏銳', '有韌性', '善於觀察', '果斷', '適應力強'],
    },
    seed,
    lang,
  )
}

function focusName(seed: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['turning skill into trust', 'learning when to lead and when to wait', 'building a life that can hold your ambition', 'choosing alliances with clearer boundaries', 'turning old pressure into useful discipline', 'making your private insight visible'],
      es: ['convertir habilidad en confianza', 'aprender cuando liderar y cuando esperar', 'construir una vida que sostenga tu ambicion', 'elegir alianzas con limites claros', 'transformar presion antigua en disciplina util', 'hacer visible tu intuicion privada'],
      ja: ['技術を信頼に変えること', '導く時と待つ時を学ぶこと', '志を支えられる生活を作ること', '境界線の明確な縁を選ぶこと', '古い重圧を役立つ規律に変えること', '内側の洞察を形にすること'],
      'zh-TW': ['把能力轉化為信任', '學會何時帶領、何時等待', '建立能承載野心的生活', '選擇邊界清楚的合作關係', '把舊壓力轉為有用的紀律', '讓私下的洞察被看見'],
    },
    seed,
    lang,
  )
}

function relationName(seed: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['slow trust', 'clear reassurance', 'shared routines', 'honest repair', 'emotional steadiness', 'patient conversation'],
      es: ['confianza lenta', 'seguridad clara', 'rutinas compartidas', 'reparacion honesta', 'estabilidad emocional', 'conversacion paciente'],
      ja: ['ゆっくり育つ信頼', 'はっきりした安心感', '共有できる習慣', '誠実な修復', '感情の安定', '忍耐強い対話'],
      'zh-TW': ['慢慢建立的信任', '清楚的安全感', '共同的日常', '誠實修復', '情緒穩定', '耐心溝通'],
    },
    seed,
    lang,
  )
}

function workName(seed: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['system building', 'specialist skill', 'quiet leadership', 'measured risk', 'long-range planning', 'collaborative strategy'],
      es: ['construccion de sistemas', 'habilidad especializada', 'liderazgo discreto', 'riesgo medido', 'planificacion a largo plazo', 'estrategia colaborativa'],
      ja: ['仕組み作り', '専門性', '静かなリーダーシップ', '慎重な挑戦', '長期計画', '協力的な戦略'],
      'zh-TW': ['系統建立', '專業能力', '安靜的領導力', '有分寸的冒險', '長期規劃', '合作策略'],
    },
    seed,
    lang,
  )
}

function healthName(seed: number, lang: Lang) {
  return pickLocalized(
    {
      en: ['steady recovery and warmer routines', 'lighter evenings and deeper sleep', 'balanced meals and gentle movement', 'less overthinking before rest', 'regular hydration and shoulder release', 'more sunlight and quieter mornings'],
      es: ['recuperacion constante y rutinas mas calidas', 'noches mas ligeras y sueno profundo', 'comidas equilibradas y movimiento suave', 'menos pensamiento excesivo antes de descansar', 'hidratacion regular y relajar hombros', 'mas luz solar y mananas tranquilas'],
      ja: ['安定した回復と温かな習慣', '軽い夜と深い睡眠', '整った食事と穏やかな運動', '休む前に考えすぎないこと', 'こまめな水分と肩の緊張を抜くこと', '日光と静かな朝'],
      'zh-TW': ['穩定恢復與溫和作息', '較輕盈的夜晚與深睡', '均衡飲食與柔和活動', '休息前少一點過度思考', '規律補水與放鬆肩頸', '更多陽光與安靜早晨'],
    },
    seed,
    lang,
  )
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

function getOllamaKey() {
  const raw = process.env.OLLAMA_API_KEYS || process.env.OLLAMA_API_KEY || ''
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)[0]
}

function pickOllamaModel() {
  const customModels = (process.env.OLLAMA_MODELS || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)
  const list = customModels.length ? customModels : DEFAULT_OLLAMA_MODELS
  return list[Math.floor(Math.random() * list.length)]
}

function pickOpenRouterModels() {
  const customModels = (process.env.OPENROUTER_MODELS || '')
    .split(',')
    .map((model) => model.trim())
    .filter((model) => model && !DEPRECATED_MODELS.has(model))
  return [...customModels, ...DEFAULT_MODELS.filter((model) => !customModels.includes(model))]
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
