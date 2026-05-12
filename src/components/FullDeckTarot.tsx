'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { zodiacSigns } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { fullTarotCards, tarotBacks, tarotCardImage } from '@/lib/tarotAssets'
import type { Fortune, LanguageCode } from '@/types'

type SpreadKey = 'single' | 'three' | 'five' | 'ten'

type SpreadOption = {
  key: SpreadKey
  label: string
  subtitle: string
  positions: string[]
}

const spreadOptions: SpreadOption[] = [
  {
    key: 'single',
    label: '1 Card',
    subtitle: 'A clear message for the present moment',
    positions: ['Core Message'],
  },
  {
    key: 'three',
    label: '3 Cards',
    subtitle: 'Past, present, and future movement',
    positions: ['Past Influence', 'Present Energy', 'Future Direction'],
  },
  {
    key: 'five',
    label: '5 Cards',
    subtitle: 'A practical map of the situation',
    positions: ['Situation', 'Obstacle', 'Advice', 'Hidden Influence', 'Outcome'],
  },
  {
    key: 'ten',
    label: '10 Cards',
    subtitle: 'A deeper Celtic Cross style reading',
    positions: [
      'Present',
      'Challenge',
      'Foundation',
      'Recent Past',
      'Possible Future',
      'Near Future',
      'Your Power',
      'Outer Influence',
      'Hope or Fear',
      'Outcome',
    ],
  },
]

const fallbackOpeners = [
  'arrives like a quiet signal beneath the noise',
  'marks a threshold where instinct becomes choice',
  'points to the pattern you have been circling',
  'asks you to notice what is gaining strength',
  'opens a narrow but honest path forward',
  'turns your attention toward the truth behind the mood',
]

const fallbackActions = [
  'name the feeling before you act on it',
  'choose the response that gives you more dignity',
  'protect your energy while the situation becomes clearer',
  'let one practical step matter more than a perfect answer',
  'trust the sign that repeats, then move with restraint',
  'release the story that keeps pulling you backward',
]

export default function FullDeckTarot({ lang }: { lang: LanguageCode }) {
  const [spreadKey, setSpreadKey] = useState<SpreadKey>('three')
  const [drawnCards, setDrawnCards] = useState<number[]>([])
  const [revealedCards, setRevealedCards] = useState<number[]>([])
  const [readings, setReadings] = useState<Record<number, Fortune>>({})
  const [loading, setLoading] = useState(false)
  const spread = spreadOptions.find((option) => option.key === spreadKey) ?? spreadOptions[1]
  const allRevealed = drawnCards.length > 0 && drawnCards.every((cardNumber) => revealedCards.includes(cardNumber))

  const combinedMessage = useMemo(() => {
    if (!allRevealed) return ''
    const names = drawnCards.map((number) => fullTarotCards[number]?.name).filter(Boolean)
    if (names.length === 1) return `${names[0]} is the center of this reading. Let its message guide your next honest step.`
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} form the pattern of this reading. Read them as one path: what begins as energy becomes choice, and choice becomes direction.`
  }, [allRevealed, drawnCards])

  async function drawSpread(nextSpread = spread) {
    const selected = shuffle(fullTarotCards.map((card) => card.number)).slice(0, nextSpread.positions.length)
    setDrawnCards(selected)
    setRevealedCards([])
    setReadings({})
    setLoading(true)

    const loaded = await loadReadings(selected, lang)
    setReadings(loaded)
    setLoading(false)
  }

  function changeSpread(key: SpreadKey) {
    const nextSpread = spreadOptions.find((option) => option.key === key) ?? spreadOptions[1]
    setSpreadKey(key)
    setDrawnCards([])
    setRevealedCards([])
    setReadings({})
    void drawSpread(nextSpread)
  }

  function revealCard(cardNumber: number) {
    setRevealedCards((current) => (current.includes(cardNumber) ? current : [...current, cardNumber]))
  }

  function revealAll() {
    drawnCards.forEach((cardNumber, index) => {
      window.setTimeout(() => revealCard(cardNumber), index * 180)
    })
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-5 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,196,81,0.16),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(147,51,234,0.2),transparent_24%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.35em] text-mystic-gold">Full Deck Tarot</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-display text-6xl leading-none text-white md:text-8xl">78-Card Tarot Reading</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-mystic-light/74">
                Choose a spread, draw from the full deck, then reveal each card at your own pace. The saved card
                meanings open as the spread unfolds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => drawSpread()}
              className="w-fit rounded-full bg-mystic-gold px-7 py-3 font-semibold text-mystic-dark transition hover:bg-amber-300"
            >
              Draw Full Deck Reading
            </button>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {spreadOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => changeSpread(option.key)}
                className={`rounded-lg border px-4 py-4 text-left transition ${
                  spreadKey === option.key
                    ? 'border-mystic-gold bg-mystic-gold/12 text-white'
                    : 'border-white/10 bg-white/[0.04] text-mystic-light/72 hover:border-mystic-gold/60'
                }`}
              >
                <span className="font-display text-2xl">{option.label}</span>
                <span className="mt-1 block text-sm leading-6">{option.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        {drawnCards.length ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-mystic-gold">{spread.label} Spread</p>
                <h2 className="mt-2 font-display text-4xl text-white">{spread.subtitle}</h2>
              </div>
              <button
                type="button"
                onClick={revealAll}
                disabled={loading || allRevealed}
                className="rounded-full border border-white/18 px-5 py-3 font-semibold text-white transition hover:border-mystic-gold hover:text-mystic-gold disabled:cursor-default disabled:opacity-50"
              >
                Reveal All
              </button>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-5">
              {drawnCards.map((cardNumber, index) => {
                const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
                return (
                  <SpreadCard
                    key={`${cardNumber}-${index}`}
                    cardNumber={cardNumber}
                    name={card.name}
                    position={spread.positions[index]}
                    revealed={revealedCards.includes(cardNumber)}
                    disabled={loading}
                    onReveal={() => revealCard(cardNumber)}
                  />
                )
              })}
            </div>

            {loading ? (
              <div className="mt-12 border-y border-mystic-gold/25 py-8 text-center">
                <p className="font-display text-3xl text-white">Gathering the card meanings...</p>
                <p className="mt-3 text-mystic-light/62">The spread is ready. Tap each card when you feel drawn.</p>
              </div>
            ) : null}

            {allRevealed ? (
              <section className="mt-14">
                <div className="border-y border-mystic-gold/25 py-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">Combined Message</p>
                  <p className="mt-4 max-w-4xl text-lg leading-8 text-mystic-light/78">{combinedMessage}</p>
                </div>
                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                  {drawnCards.map((cardNumber, index) => {
                    const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
                    const reading = readings[cardNumber] ?? fallbackReading(cardNumber, lang)
                    return (
                      <article key={cardNumber} className="border-t border-white/15 pt-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-mystic-gold">{spread.positions[index]}</p>
                        <h3 className="mt-2 font-display text-3xl text-white">{card.name}</h3>
                        <p className="mt-4 leading-8 text-mystic-light/74">{reading.body}</p>
                        <div className="mt-5 flex flex-wrap gap-2 text-sm">
                          <Badge label="Number" value={String(reading.lucky_number ?? 7)} />
                          <Badge label="Color" value={reading.lucky_color ?? 'gold'} />
                          <Badge label="Match" value={reading.compatibility ?? 'leo'} />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <div className="grid min-h-[360px] place-items-center border-y border-white/10 text-center">
            <div>
              <p className="font-display text-4xl text-white">Choose a spread and draw the cards.</p>
              <p className="mt-3 text-mystic-light/64">The full 78-card deck is waiting.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

async function loadReadings(cardNumbers: number[], lang: LanguageCode) {
  const fallback = Object.fromEntries(cardNumbers.map((number) => [number, fallbackReading(number, lang)]))

  try {
    const params = new URLSearchParams({
      lang,
      cards: cardNumbers.join(','),
    })
    const response = await fetch(`/api/tarot-readings?${params.toString()}`)
    if (response.ok) {
      const payload = (await response.json()) as { readings?: Fortune[] }
      if (payload.readings?.length) {
        return {
          ...fallback,
          ...Object.fromEntries(payload.readings.map((fortune) => [fortune.card_number ?? 0, fortune])),
        }
      }
    }
  } catch {
    // Fall back to the browser Supabase client below when the API is unavailable.
  }

  if (!supabase) return fallback

  const { data } = await supabase
    .from('fortunes')
    .select('*')
    .eq('type', 'tarot')
    .eq('lang', lang)
    .is('fortune_date', null)
    .in('card_number', cardNumbers)

  if (!data?.length) return fallback

  return {
    ...fallback,
    ...Object.fromEntries((data as Fortune[]).map((fortune) => [fortune.card_number ?? 0, fortune])),
  }
}

function fallbackReading(cardNumber: number, lang: LanguageCode): Fortune {
  const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
  const opener = fallbackOpeners[card.number % fallbackOpeners.length]
  const action = fallbackActions[(card.number + 2) % fallbackActions.length]
  const suit = card.name.includes(' of ') ? card.name.split(' of ')[1] : 'Major Arcana'
  return {
    type: 'tarot',
    lang,
    title: `${card.name} Tarot Reading`,
    body: `${card.name} ${opener}. In the ${suit} current, this card highlights the place where your attention, timing, and desire are no longer moving at the same speed. ${action.charAt(0).toUpperCase() + action.slice(1)}. The message is not to force certainty, but to read the small pressure in the moment and let it show you the next honest direction.`,
    card_name: card.name,
    card_number: card.number,
    lucky_number: (card.number % 9) + 1,
    lucky_color: ['gold', 'purple', 'silver', 'rose', 'emerald', 'deep blue'][card.number % 6],
    compatibility: zodiacSigns[card.number % zodiacSigns.length],
  }
}

function SpreadCard({
  cardNumber,
  name,
  position,
  revealed,
  disabled,
  onReveal,
}: {
  cardNumber: number
  name: string
  position: string
  revealed: boolean
  disabled: boolean
  onReveal: () => void
}) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={revealed ? undefined : onReveal}
        disabled={disabled}
        aria-pressed={revealed}
        aria-label={`Reveal ${position}: ${name}`}
        className={`full-spread-card group mx-auto block w-[168px] bg-transparent p-0 [perspective:1000px] disabled:cursor-default ${
          revealed ? 'is-revealed cursor-default' : ''
        }`}
      >
        <span
          className={`full-card-frame relative block aspect-[10/17] rounded-xl transition duration-700 [transform-style:preserve-3d] ${
            revealed ? 'is-revealed' : 'group-hover:-translate-y-2'
          }`}
        >
          <span className="full-card-aura pointer-events-none absolute -inset-3 rounded-2xl border border-mystic-gold/60 opacity-0" />
          <span className="full-card-face full-card-back absolute inset-0 overflow-hidden rounded-xl border-2 border-mystic-gold/70 bg-mystic-dark shadow-[0_0_28px_rgba(245,196,81,0.28)] [backface-visibility:hidden]">
            <Image src={tarotBacks.moon} alt="" fill sizes="168px" className="object-cover" draggable={false} />
          </span>
          <span className="full-card-face full-card-front absolute inset-0 overflow-hidden rounded-xl border-2 border-mystic-gold bg-mystic-dark shadow-gold [backface-visibility:hidden]">
            <Image
              src={tarotCardImage(cardNumber, name)}
              alt={name}
              fill
              sizes="168px"
              className="object-cover"
              draggable={false}
            />
            <span className="full-card-glint pointer-events-none absolute inset-0 rounded-xl" />
          </span>
        </span>
      </button>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-mystic-gold">{position}</p>
      <p className="mt-2 min-h-7 font-display text-2xl text-white">{revealed ? name : 'Hidden Card'}</p>
      <style jsx>{`
        .full-spread-card {
          transition:
            filter 0.35s ease,
            transform 0.35s ease;
        }

        .full-spread-card:hover,
        .full-spread-card:focus-visible {
          filter: drop-shadow(0 0 24px rgba(245, 196, 81, 0.58));
          outline: none;
        }

        .full-spread-card:hover .full-card-frame,
        .full-spread-card:focus-visible .full-card-frame {
          transform: translateY(-8px);
        }

        .full-spread-card.is-revealed .full-card-frame,
        .full-spread-card.is-revealed:hover .full-card-frame,
        .full-spread-card.is-revealed:focus-visible .full-card-frame {
          transform: translateY(-4px);
          animation: full-card-glow 1.9s ease-in-out infinite;
        }

        .full-card-face {
          transition: transform 0.72s cubic-bezier(0.2, 0.72, 0.18, 1);
        }

        .full-card-front {
          transform: rotateY(-180deg);
        }

        .full-spread-card.is-revealed .full-card-back {
          transform: rotateY(180deg);
        }

        .full-spread-card.is-revealed .full-card-front {
          transform: rotateY(0deg);
        }

        .full-spread-card:hover .full-card-aura,
        .full-spread-card:focus-visible .full-card-aura,
        .full-spread-card.is-revealed .full-card-aura {
          opacity: 1;
          animation: full-card-aura-pulse 1.9s ease-in-out infinite;
          box-shadow:
            0 0 24px rgba(245, 196, 81, 0.55),
            0 0 58px rgba(245, 196, 81, 0.34);
        }

        .full-card-glint {
          overflow: hidden;
        }

        .full-card-glint::after {
          content: '';
          position: absolute;
          inset: -40%;
          background: linear-gradient(
            115deg,
            transparent 38%,
            rgba(255, 244, 184, 0.72) 48%,
            transparent 58%
          );
          transform: translateX(-78%) rotate(8deg);
          opacity: 0;
        }

        .full-spread-card:hover .full-card-glint::after,
        .full-spread-card:focus-visible .full-card-glint::after,
        .full-spread-card.is-revealed .full-card-glint::after {
          animation: full-card-glint-sweep 2.4s ease-in-out infinite;
        }

        @keyframes full-card-glow {
          0%,
          100% {
            filter: drop-shadow(0 0 24px rgba(245, 196, 81, 0.74));
          }
          50% {
            filter: drop-shadow(0 0 42px rgba(255, 220, 122, 1));
          }
        }

        @keyframes full-card-aura-pulse {
          0%,
          100% {
            transform: scale(0.98);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @keyframes full-card-glint-sweep {
          0%,
          35% {
            transform: translateX(-78%) rotate(8deg);
            opacity: 0;
          }
          48% {
            opacity: 0.75;
          }
          70%,
          100% {
            transform: translateX(78%) rotate(8deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-mystic-light/70">
      {label}: <span className="text-mystic-gold">{value}</span>
    </span>
  )
}

function shuffle<T>(items: T[]) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
