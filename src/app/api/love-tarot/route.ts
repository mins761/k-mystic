import { NextResponse } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODELS = ['openrouter/free']

type LoveMode = 'reading' | 'zodiac' | 'saju'
type Lang = 'en' | 'es' | 'ja' | 'zh-TW'

type BasePayload = {
  lang?: string
  language?: string
}

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
        model: pickOpenRouterModel(),
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

function getLang(payload: BasePayload): Lang {
  if (payload.lang === 'es' || payload.lang === 'ja' || payload.lang === 'zh-TW') return payload.lang
  if (payload.language === 'Spanish') return 'es'
  if (payload.language === 'Japanese') return 'ja'
  if (payload.language === 'Traditional Chinese') return 'zh-TW'
  return 'en'
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

function loveFallback(payload: { card1?: string; card2?: string; card3?: string } & BasePayload) {
  const card1 = payload.card1 || 'The Lovers'
  const card2 = payload.card2 || 'The Star'
  const card3 = payload.card3 || 'The Sun'
  const fallback = {
    en: {
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
    },
    es: {
      overall:
        'La energía del amor hoy es suave pero honesta. Tu corazón necesita claridad, no apariencias, y las cartas favorecen una conversación sencilla, valiente y real.',
      card1_reading: `${card1} muestra que la situación actual depende de una elección sincera. Observa dónde tu corazón ya conoce la verdad antes de que tu mente intente justificarla.`,
      card2_reading: `${card2} sugiere que la otra persona guarda esperanza, curiosidad o deseo de ser comprendida. Sus sentimientos pueden ser discretos, pero no están vacíos.`,
      card3_reading: `${card3} señala calidez y una dirección más clara. El futuro mejora cuando el afecto se une a la paciencia y a acciones concretas.`,
      combined_message:
        'Estas cartas te piden abrir el corazón sin abandonar tus necesidades. El amor crece mejor cuando ambas personas se sienten seguras para hablar con precisión.',
      lucky_day: 'Viernes',
      affirmation: 'Merezco un amor honesto, cálido y mutuo.',
      summary: 'Una apertura sincera es posible. Actúa con calidez, conserva tus límites y deja que los hechos revelen lo que las palabras no prometen.',
    },
    ja: {
      overall:
        '今日の恋愛エネルギーは優しく、同時にとても正直です。心は飾り立てた言葉よりも明確さを求めていて、カードは素直で勇気ある会話を後押ししています。',
      card1_reading: `${card1}は、現在の状況が心を開く選択によって動いていることを示します。頭で説明しようとする前に、あなたの心がすでに知っている本音に気づいてください。`,
      card2_reading: `${card2}は、相手の中に希望や好奇心、理解されたい気持ちがあることを示します。その感情は静かでも、空っぽではありません。`,
      card3_reading: `${card3}は、温かさとより明確な流れを示します。これからの関係は、愛情に忍耐と現実的な行動が加わるほど良くなります。`,
      combined_message:
        '3枚のカードは、あなたに心を柔らかくしながらも自分の大切な望みを守るよう伝えています。安心して具体的に話せる時、愛は育ちます。',
      lucky_day: '金曜日',
      affirmation: '私は誠実で温かく、互いに向き合える愛にふさわしい。',
      summary: '誠実な始まりが近づいています。温かく接しながら自分の軸を保ち、言葉より行動が示す真実を見てください。',
    },
    'zh-TW': {
      overall:
        '今天的愛情能量溫柔卻誠實。你的心需要清楚的回應，而不是表面的姿態；牌面支持一場簡單、勇敢且真實的對話。',
      card1_reading: `${card1}顯示目前的狀況取決於你是否願意敞開。請留意，在理智開始解釋之前，你的心其實已經知道答案。`,
      card2_reading: `${card2}暗示對方心中仍有希望、好奇，或渴望被理解的感受。對方的情緒也許安靜，但並不是空白。`,
      card3_reading: `${card3}指向溫暖與更清楚的方向。當感情搭配耐心與具體行動時，未來會更穩定明亮。`,
      combined_message:
        '這三張牌提醒你放柔防備，同時尊重自己的需求。當兩個人都能安心說出具體感受，愛就會更自然地成長。',
      lucky_day: '星期五',
      affirmation: '我值得擁有誠實、溫暖且彼此回應的愛。',
      summary: '真誠的開口正在靠近。帶著溫柔前進，也保留自己的標準，讓行動說明言語無法保證的事。',
    },
  }
  return fallback[getLang(payload)]
}

function zodiacFallback(payload: { mySign?: string; partnerSign?: string } & BasePayload) {
  const score = compatibilityScore(`${payload.mySign}-${payload.partnerSign}`)
  const names = `${payload.mySign || 'you'} / ${payload.partnerSign || 'partner'}`
  const fallback = {
    en: {
      description: `${names} create a bond that improves through honest timing and emotional patience.`,
      advice: 'Name what you need early, then give the connection enough room to answer through consistent behavior.',
    },
    es: {
      description: `${names} forman un vínculo que mejora con honestidad, buen ritmo y paciencia emocional.`,
      advice: 'Di lo que necesitas desde el principio y deja que la conexión responda con acciones constantes.',
    },
    ja: {
      description: `${names}の相性は、正直なタイミングと感情面の忍耐によって深まります。`,
      advice: '必要なことは早めに伝え、その後は相手の行動が安定して続くかを見守ってください。',
    },
    'zh-TW': {
      description: `${names}的連結會因誠實的時機與情感上的耐心而變得更好。`,
      advice: '先清楚說出你的需求，再給這段關係一些空間，看它是否能用穩定行動回應你。',
    },
  }
  return { score, ...fallback[getLang(payload)] }
}

function sajuFallback(payload: { myYear?: number; partnerYear?: number } & BasePayload) {
  const score = compatibilityScore(`${payload.myYear}-${payload.partnerYear}`)
  const fallback = {
    en: {
      description:
        'Your birth patterns suggest a relationship that benefits from balancing instinct with practical care. The connection can deepen when both people respect each other’s rhythm.',
      strength: 'Mutual growth through patience, loyalty, and grounded communication.',
      challenge: 'Avoid assuming silence means certainty. Ask direct questions with kindness.',
      advice: 'Build trust through small repeated promises rather than one dramatic declaration.',
    },
    es: {
      description:
        'Sus fechas de nacimiento sugieren una relación que mejora cuando la intuición se equilibra con cuidado práctico. La conexión se profundiza si ambos respetan el ritmo del otro.',
      strength: 'Crecimiento mutuo mediante paciencia, lealtad y comunicación concreta.',
      challenge: 'No confundas el silencio con certeza. Haz preguntas directas con amabilidad.',
      advice: 'Construyan confianza con promesas pequeñas y repetidas, no con una sola declaración intensa.',
    },
    ja: {
      description:
        '二人の生年月日の流れは、直感と現実的な思いやりのバランスで育つ関係を示しています。互いのペースを尊重するほど絆は深まります。',
      strength: '忍耐、誠実さ、地に足のついた会話による相互成長。',
      challenge: '沈黙を確信と決めつけないこと。優しさを保ちながら率直に尋ねてください。',
      advice: '大きな一度の言葉より、小さな約束を何度も守ることで信頼を育てましょう。',
    },
    'zh-TW': {
      description:
        '你們的出生能量顯示，這段關係適合在直覺與實際照顧之間取得平衡。當雙方尊重彼此節奏時，連結會更深。',
      strength: '透過耐心、忠誠與踏實溝通一起成長。',
      challenge: '不要把沉默誤以為確定。請用溫柔但直接的方式提問。',
      advice: '用一次次小而穩定的承諾建立信任，而不是依靠單次強烈表白。',
    },
  }
  return { score, ...fallback[getLang(payload)] }
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

function pickOpenRouterModel() {
  const models = (process.env.OPENROUTER_MODELS || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean)
  const list = models.length ? models : DEFAULT_MODELS
  return list[Math.floor(Math.random() * list.length)]
}
