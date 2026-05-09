'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import TarotCard from '@/components/TarotCard'
import { zodiacSigns } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { fullTarotCards } from '@/lib/tarotAssets'
import type { Fortune, LanguageCode } from '@/types'

type RandomTarotReadingProps = {
  lang: LanguageCode
  todayTarot: string
  readFull: string
  lucky: string
  newsletter: string
  subscribe: string
}

const fallbackBodies: Record<LanguageCode, string> = {
  en: 'A quiet sign rises from the day and asks you to choose with courage. Trust the first honest feeling that appears, then let patience shape your next step.',
  es: 'Una señal tranquila aparece hoy y te pide elegir con valentía. Confía en la primera sensación honesta y deja que la paciencia guíe tu siguiente paso.',
  ja: '今日の静かなサインは、勇気を持って選ぶよう促しています。最初に浮かぶ正直な感覚を信じ、次の一歩を丁寧に整えてください。',
  'zh-TW': '今天有一道安靜的訊號浮現，提醒你勇敢選擇。相信最先出現的真實感受，讓耐心帶你走向下一步。',
}

export default function RandomTarotReading({
  lang,
  todayTarot,
  readFull,
  lucky,
  newsletter,
  subscribe,
}: RandomTarotReadingProps) {
  const [tarot, setTarot] = useState<Fortune | null>(null)

  useEffect(() => {
    let active = true

    async function loadTarot() {
      const randomCardNumber = getDailyCardNumber()

      if (supabase) {
        const { data } = await supabase
          .from('fortunes')
          .select('*')
          .eq('type', 'tarot')
          .eq('card_number', randomCardNumber)
          .eq('lang', lang)
          .limit(1)
          .maybeSingle()

        if (active && data) {
          setTarot(data as Fortune)
          return
        }
      }

      if (active) setTarot(fallbackTarot(lang, randomCardNumber))
    }

    loadTarot()
    return () => {
      active = false
    }
  }, [lang])

  const reading = tarot ?? fallbackTarot(lang, 0)

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <TarotCard
            number={reading.card_number ?? 0}
            name={reading.card_name ?? 'The Fool'}
            description={reading.body.slice(0, 112)}
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{todayTarot}</p>
          <h2 className="mt-3 font-display text-5xl text-white">{reading.title}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-mystic-light/74">{reading.body}</p>
          <Link href={`/${lang}/tarot`} className="mt-7 inline-flex text-mystic-gold hover:text-amber-200">
            {readFull}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{lucky}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Signal label="Number" value={String(reading.lucky_number ?? 7)} />
            <Signal label="Color" value={reading.lucky_color ?? 'Gold'} />
            <Signal label="Match" value={reading.compatibility ?? 'Leo'} />
          </div>
        </div>
        <form className="self-end border-l border-mystic-gold/30 pl-6">
          <h2 className="font-display text-3xl text-white">{newsletter}</h2>
          <div className="mt-5 flex gap-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-mystic-gold"
            />
            <button className="rounded-full bg-mystic-gold px-5 py-3 font-semibold text-mystic-dark" type="submit">
              {subscribe}
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

function getDailyCardNumber() {
  const today = localDateKey()
  const storageKey = 'k-mystic-daily-tarot'

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored) as { date?: string; cardNumber?: number }
      if (
        parsed.date === today &&
        typeof parsed.cardNumber === 'number' &&
        parsed.cardNumber >= 0 &&
        parsed.cardNumber < fullTarotCards.length
      ) {
        return parsed.cardNumber
      }
    }
  } catch {
    window.localStorage.removeItem(storageKey)
  }

  const cardNumber = Math.floor(Math.random() * fullTarotCards.length)
  window.localStorage.setItem(storageKey, JSON.stringify({ date: today, cardNumber }))
  return cardNumber
}

function localDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fallbackTarot(lang: LanguageCode, cardNumber: number): Fortune {
  const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
  return {
    type: 'tarot',
    lang,
    title: `${card.name} opens the day`,
    body: fallbackBodies[lang],
    card_name: card.name,
    card_number: card.number,
    lucky_number: Math.floor(Math.random() * 9) + 1,
    lucky_color: ['gold', 'purple', 'silver', 'rose', 'emerald', 'deep blue'][Math.floor(Math.random() * 6)],
    compatibility: zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)],
  }
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p className="text-xs uppercase tracking-[0.25em] text-mystic-light/45">{label}</p>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
    </div>
  )
}
