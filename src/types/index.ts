export type LanguageCode = 'en' | 'es' | 'ja' | 'zh-TW'

export type FortuneType = 'tarot' | 'horoscope'

export type Fortune = {
  id?: string
  type: FortuneType
  sign?: string | null
  lang: LanguageCode
  title: string
  body: string
  card_name?: string | null
  card_number?: number | null
  lucky_number?: number | null
  lucky_color?: string | null
  compatibility?: string | null
  affirmation?: string | null
  mantra?: string | null
  best_time?: string | null
  fortune_date?: string
  created_at?: string
}

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'
