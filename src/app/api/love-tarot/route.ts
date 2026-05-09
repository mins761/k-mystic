import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
]

type LoveMode = 'reading' | 'zodiac' | 'saju'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const mode = (payload.mode || 'reading') as LoveMode

    if (mode === 'zodiac') {
      const result = await generateJson(zodiacPrompt(payload), zodiacFallback(payload))
      return NextResponse.json(result)
    }

    if (mode === 'saju') {
      const result = await generateJson(sajuCompatibilityPrompt(payload), sajuFallback(payload))
      return NextResponse.json(result)
    }

    const result = await generateJson(loveTarotPrompt(payload), loveFallback(payload))
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Love reading failed.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

async function generateJson<T extends object>(prompt: string, fallback: T): Promise<T> {
  const key = getOpenRouterKey()
  if (!key) return fallback

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
          { role: 'system', content: 'Return valid JSON only. Do not include markdown.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.86,
        max_tokens: 1100,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) return fallback
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') return fallback
    return { ...fallback, ...JSON.parse(content) }
  } catch {
    return fallback
  }
}

function loveTarotPrompt(payload: { card1?: string; card2?: string; card3?: string; language?: string }) {
  const card1 = payload.card1 || 'The Lovers'
  const card2 = payload.card2 || 'The Star'
  const card3 = payload.card3 || 'The Sun'
  const language = payload.language || 'English'

  return `
You are a romantic tarot reader specializing in love readings.

Three cards were drawn:
- Card 1 (Current Situation): ${card1}
- Card 2 (Partner's Feelings): ${card2}
- Card 3 (Future Direction): ${card3}

Provide a detailed love reading in ${language}.

Writing style:
- Deeply romantic and empathetic
- Specific and insightful
- Hopeful yet honest
- Speak directly as "you"

Include:
1. Overall love energy today
2. Card 1 interpretation (current situation)
3. Card 2 interpretation (partner's feelings)
4. Card 3 interpretation (future direction)
5. Combined message and advice
6. Lucky day for love this week
7. Love affirmation

Return JSON only:
{
  "overall": "...",
  "card1_reading": "...",
  "card2_reading": "...",
  "card3_reading": "...",
  "combined_message": "...",
  "lucky_day": "Friday",
  "affirmation": "...",
  "summary": "... (50 words)"
}
`.trim()
}

function zodiacPrompt(payload: { mySign?: string; partnerSign?: string; language?: string }) {
  return `
You are a warm astrologer specializing in romantic compatibility.
Analyze compatibility between ${payload.mySign || 'aries'} and ${payload.partnerSign || 'libra'} in ${payload.language || 'English'}.

Return JSON only:
{
  "score": 82,
  "description": "...",
  "advice": "..."
}
`.trim()
}

function sajuCompatibilityPrompt(payload: {
  myYear?: number
  myMonth?: number
  myDay?: number
  partnerYear?: number
  partnerMonth?: number
  partnerDay?: number
  language?: string
}) {
  return `
You are a Korean saju compatibility reader.
Compare these two birth dates:
- Me: ${payload.myYear}-${payload.myMonth}-${payload.myDay}
- Partner: ${payload.partnerYear}-${payload.partnerMonth}-${payload.partnerDay}

Give a romantic saju compatibility analysis in ${payload.language || 'English'}.

Return JSON only:
{
  "score": 78,
  "description": "...",
  "strength": "...",
  "challenge": "...",
  "advice": "..."
}
`.trim()
}

function loveFallback(payload: { card1?: string; card2?: string; card3?: string }) {
  const card1 = payload.card1 || 'The Lovers'
  const card2 = payload.card2 || 'The Star'
  const card3 = payload.card3 || 'The Sun'
  return {
    overall:
      'Love energy today is tender but honest. Your heart is asking for clarity, not performance, and the cards favor a conversation that feels simple, brave, and real.',
    card1_reading: `${card1} shows that the current situation is shaped by a choice of openness. Notice where your heart already knows the truth before your mind tries to explain it away.`,
    card2_reading: `${card2} suggests the other person carries hope, curiosity, or a wish to be understood. Their feelings may be quiet, but they are not empty.`,
    card3_reading: `${card3} points toward warmth and clearer direction. The future improves when affection is paired with patience and grounded action.`,
    combined_message:
      'Together, these cards ask you to soften your guard while still respecting your needs. Love grows best when both people feel safe enough to be specific.',
    lucky_day: 'Friday',
    affirmation: 'I am worthy of love that feels honest, warm, and mutual.',
    summary: 'A sincere opening is possible. Lead with warmth, keep your standards, and let actions reveal what words cannot fully promise.',
  }
}

function zodiacFallback(payload: { mySign?: string; partnerSign?: string }) {
  const score = compatibilityScore(`${payload.mySign}-${payload.partnerSign}`)
  return {
    score,
    description: `${payload.mySign || 'Your sign'} and ${payload.partnerSign || 'their sign'} create a bond that improves through honest timing and emotional patience.`,
    advice: 'Name what you need early, then give the connection enough room to answer through consistent behavior.',
  }
}

function sajuFallback(payload: { myYear?: number; partnerYear?: number }) {
  const score = compatibilityScore(`${payload.myYear}-${payload.partnerYear}`)
  return {
    score,
    description:
      'Your birth patterns suggest a relationship that benefits from balancing instinct with practical care. The connection can deepen when both people respect each other’s rhythm.',
    strength: 'Mutual growth through patience, loyalty, and grounded communication.',
    challenge: 'Avoid assuming silence means certainty. Ask direct questions with kindness.',
    advice: 'Build trust through small repeated promises rather than one dramatic declaration.',
  }
}

function compatibilityScore(seed: string) {
  const total = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return 58 + (total % 39)
}

function getOpenRouterKey() {
  const raw = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEYS || ''
  return raw
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)[0]
}
