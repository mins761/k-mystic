'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { zodiacSigns } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { fullTarotCards, tarotBacks, tarotCardImage } from '@/lib/tarotAssets'
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

type DayPeriod = 'am' | 'pm'

const periodCopy: Record<
  DayPeriod,
  {
    eyebrow: string
    emptyTitle: string
    emptyBody: string
    titleSuffix: string
  }
> = {
  am: {
    eyebrow: 'Morning Tarot',
    emptyTitle: 'Choose one card for this morning',
    emptyBody:
      'Three cards are waiting face down. Let your attention settle, choose one, and your morning reading will open from that card.',
    titleSuffix: 'guides the morning',
  },
  pm: {
    eyebrow: 'Afternoon Tarot',
    emptyTitle: 'Choose one card for this afternoon',
    emptyBody:
      'Three cards are waiting face down. Let your attention settle, choose one, and your afternoon reading will open from that card.',
    titleSuffix: 'guides the afternoon',
  },
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
  const [spread, setSpread] = useState<number[]>([])
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [revealedCards, setRevealedCards] = useState<number[]>([])
  const [dayPeriod, setDayPeriod] = useState<DayPeriod | null>(null)

  useEffect(() => {
    let active = true

    syncChoice()
    const timer = window.setInterval(syncChoice, 60 * 1000)

    async function loadTarot(cardNumber: number) {
      if (supabase) {
        const { data } = await supabase
          .from('fortunes')
          .select('*')
          .eq('type', 'tarot')
          .eq('card_number', cardNumber)
          .eq('lang', lang)
          .is('fortune_date', null)
          .limit(1)
          .maybeSingle()

        if (active && data) {
          setTarot(data as Fortune)
          return
        }
      }

      if (active) setTarot(fallbackTarot(lang, cardNumber))
    }

    function syncChoice() {
      const period = getDayPeriod()
      const dailyChoice = getDailyChoice(period)

      setDayPeriod(period)
      setSpread(dailyChoice.spread)
      setSelectedCard(dailyChoice.selectedCard)
      setRevealedCards(dailyChoice.selectedCard !== null ? [dailyChoice.selectedCard] : [])
      if (dailyChoice.selectedCard !== null) {
        loadTarot(dailyChoice.selectedCard)
      } else {
        setTarot(null)
      }
    }

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [lang])

  async function chooseCard(cardNumber: number) {
    if (selectedCard !== null) return

    const period = dayPeriod ?? getDayPeriod()
    const choice = getDailyChoice(period)
    const nextChoice = { ...choice, selectedCard: cardNumber }
    saveDailyChoice(nextChoice)
    setDayPeriod(period)
    setSelectedCard(cardNumber)
    setTarot(null)
    setRevealedCards([cardNumber])

    if (supabase) {
      const { data } = await supabase
        .from('fortunes')
        .select('*')
        .eq('type', 'tarot')
        .eq('card_number', cardNumber)
        .eq('lang', lang)
        .is('fortune_date', null)
        .limit(1)
        .maybeSingle()

      if (data) {
        setTarot(data as Fortune)
        return
      }
    }

    setTarot(fallbackTarot(lang, cardNumber))
  }

  const reading = selectedCard !== null ? tarot ?? fallbackTarot(lang, selectedCard) : null
  const copy = dayPeriod ? periodCopy[dayPeriod] : null
  const readingTitle =
    reading && copy ? `${reading.card_name || reading.title} ${copy.titleSuffix}` : reading?.title

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{copy?.eyebrow ?? todayTarot}</p>
            <h2 className="mt-3 font-display text-5xl text-white">
              {reading ? readingTitle : copy?.emptyTitle ?? 'Choose one card for today'}
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-mystic-light/74">
              {reading
                ? reading.body
                : copy?.emptyBody ??
                  'Three cards are waiting face down. Let your attention settle, choose one, and your daily reading will open from that card.'}
            </p>
            {reading ? (
              <Link href={`/${lang}/tarot`} className="mt-7 inline-flex text-mystic-gold hover:text-amber-200">
                {readFull}
              </Link>
            ) : null}
          </div>
          <div className="daily-arc mx-auto flex min-h-[300px] w-full max-w-[520px] flex-wrap items-end justify-center gap-4 sm:flex-nowrap sm:gap-0">
            {spread.map((cardNumber, index) => {
              const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
              const isSelected = selectedCard === cardNumber
              const isRevealed = revealedCards.includes(cardNumber) || isSelected
              return (
                <ChoiceTarotCard
                  key={cardNumber}
                  cardNumber={cardNumber}
                  name={card.name}
                  revealed={isRevealed}
                  selected={isSelected}
                  disabled={selectedCard !== null && !isSelected}
                  index={index}
                  total={spread.length}
                  onChoose={() => chooseCard(cardNumber)}
                />
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{lucky}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Signal label="Number" value={reading ? String(reading.lucky_number ?? 7) : '-'} />
            <Signal label="Color" value={reading?.lucky_color ?? '-'} />
            <Signal label="Match" value={reading?.compatibility ?? '-'} />
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

type DailyChoice = {
  date: string
  period: DayPeriod
  spread: number[]
  selectedCard: number | null
}

function getDailyChoice(period: DayPeriod): DailyChoice {
  const today = localDateKey()
  const storageKey = dailyChoiceStorageKey(today, period)

  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DailyChoice> & { cardNumber?: number }
      const selectedCard = typeof parsed.selectedCard === 'number' ? parsed.selectedCard : parsed.cardNumber
      if (
        parsed.date === today &&
        parsed.period === period &&
        Array.isArray(parsed.spread) &&
        parsed.spread.length === 3 &&
        parsed.spread.every(isValidCardNumber) &&
        (selectedCard === null || selectedCard === undefined || isValidCardNumber(selectedCard))
      ) {
        return { date: today, period, spread: parsed.spread, selectedCard: selectedCard ?? null }
      }
    }
  } catch {
    window.localStorage.removeItem(storageKey)
  }

  const choice = { date: today, period, spread: drawSpread(), selectedCard: null }
  saveDailyChoice(choice)
  return choice
}

function saveDailyChoice(choice: DailyChoice) {
  window.localStorage.setItem(dailyChoiceStorageKey(choice.date, choice.period), JSON.stringify(choice))
}

function drawSpread() {
  return [...fullTarotCards]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((card) => card.number)
}

function isValidCardNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value < fullTarotCards.length
}

function localDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDayPeriod(): DayPeriod {
  return new Date().getHours() < 12 ? 'am' : 'pm'
}

function dailyChoiceStorageKey(date: string, period: DayPeriod) {
  return `k-mystic-daily-tarot-v2-${date}-${period}`
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

function ChoiceTarotCard({
  cardNumber,
  name,
  revealed,
  selected,
  disabled,
  index,
  total,
  onChoose,
}: {
  cardNumber: number
  name: string
  revealed: boolean
  selected: boolean
  disabled: boolean
  index: number
  total: number
  onChoose: () => void
}) {
  const center = (total - 1) / 2
  const offset = index - center
  const arcStyle = {
    '--arc-x': `${offset * -20}px`,
    '--arc-y': `${Math.abs(offset) * 22}px`,
    '--arc-rotate': `${offset * 9}deg`,
    '--arc-z': selected ? 30 : 10 - Math.abs(offset),
    animationDelay: `${index * 0.08}s`,
  } as CSSProperties

  return (
    <button
      type="button"
      onClick={onChoose}
      aria-disabled={disabled}
      aria-pressed={selected}
      aria-label={`Choose ${name}`}
      className={`daily-arc-card group bg-transparent p-0 text-center ${
        disabled ? 'cursor-default opacity-80' : 'cursor-pointer'
      }`}
      style={arcStyle}
    >
      <span className="relative block aspect-[10/17] w-full animate-[choice-rise_0.55s_ease_both]">
        <span
          className={`choice-card absolute inset-0 rounded-xl ${revealed ? 'is-revealed' : ''} ${
            selected ? 'is-selected' : ''
          }`}
        >
          <span className="choice-face choice-back absolute inset-0 overflow-hidden rounded-xl border border-mystic-gold/70 bg-mystic-dark">
            <Image src={tarotBacks.moon} alt="" fill sizes="132px" className="object-cover" draggable={false} />
          </span>
          <span className="choice-face choice-front absolute inset-0 overflow-hidden rounded-xl border border-mystic-gold bg-mystic-dark">
            <Image
              src={tarotCardImage(cardNumber, name)}
              alt={name}
              fill
              sizes="132px"
              className="object-cover"
              draggable={false}
            />
          </span>
        </span>
        {selected ? (
          <>
            <span className="selected-aura pointer-events-none absolute -inset-3 rounded-2xl border border-mystic-gold/60" />
            <span className="selected-glint pointer-events-none absolute inset-0 rounded-xl" />
          </>
        ) : null}
      </span>
      <span className="mt-3 block min-h-10 text-sm text-mystic-light/72">{revealed ? name : 'Choose'}</span>
      <style jsx>{`
        .daily-arc-card {
          position: relative;
          z-index: var(--arc-z);
          width: 118px;
          margin-inline: -8px;
          perspective: 1000px;
          transform: translate(var(--arc-x), var(--arc-y)) rotate(var(--arc-rotate));
          transform-origin: 50% 120%;
          transition:
            transform 0.35s ease,
            filter 0.35s ease;
        }

        .daily-arc-card:hover,
        .daily-arc-card:focus-visible {
          transform: translate(var(--arc-x), calc(var(--arc-y) - 14px)) rotate(var(--arc-rotate));
          filter: drop-shadow(0 0 22px rgba(245, 196, 81, 0.55));
          outline: none;
        }

        .choice-card {
          transform-style: preserve-3d;
          transform: rotateY(180deg);
          transition: transform 0.72s cubic-bezier(0.2, 0.72, 0.18, 1);
        }

        .choice-card.is-revealed {
          transform: rotateY(0deg);
        }

        .choice-card.is-selected {
          transform: rotateY(0deg);
        }

        .choice-card.is-selected {
          animation: selected-card-glow 1.9s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(245, 196, 81, 0.9));
        }

        .choice-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .choice-back {
          transform: rotateY(180deg);
        }

        .selected-aura {
          animation: selected-aura-pulse 1.9s ease-in-out infinite;
          box-shadow:
            0 0 24px rgba(245, 196, 81, 0.55),
            0 0 58px rgba(245, 196, 81, 0.36);
        }

        .selected-glint {
          overflow: hidden;
        }

        .selected-glint::after {
          content: '';
          position: absolute;
          inset: -40%;
          background: linear-gradient(
            115deg,
            transparent 38%,
            rgba(255, 244, 184, 0.72) 48%,
            transparent 58%
          );
          transform: translateX(-70%) rotate(8deg);
          animation: selected-glint-sweep 2.4s ease-in-out infinite;
        }

        @keyframes choice-rise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes selected-card-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 24px rgba(245, 196, 81, 0.74));
          }
          50% {
            filter: drop-shadow(0 0 42px rgba(255, 220, 122, 1));
          }
        }

        @keyframes selected-aura-pulse {
          0%,
          100% {
            opacity: 0.72;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        @keyframes selected-glint-sweep {
          0%,
          35% {
            transform: translateX(-75%) rotate(8deg);
            opacity: 0;
          }
          48% {
            opacity: 0.75;
          }
          70%,
          100% {
            transform: translateX(75%) rotate(8deg);
            opacity: 0;
          }
        }

        @media (min-width: 640px) {
          .daily-arc-card {
            width: 132px;
            margin-inline: -10px;
          }
        }

        @media (max-width: 639px) {
          .daily-arc-card {
            --arc-x: 0px !important;
            --arc-y: 0px !important;
            --arc-rotate: 0deg !important;
            margin: 0;
          }
        }
      `}</style>
    </button>
  )
}
