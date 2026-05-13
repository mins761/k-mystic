'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'
import { fullTarotCards, tarotBacks, tarotCardImage } from '@/lib/tarotAssets'
import { getTarotCardMeta, getTarotReadingBody } from '@/lib/tarotMeanings'
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
  const [choicePool, setChoicePool] = useState<number[]>([])
  const [drawnCards, setDrawnCards] = useState<number[]>([])
  const [revealedCards, setRevealedCards] = useState<number[]>([])
  const [readings, setReadings] = useState<Record<number, Fortune>>({})
  const [loading, setLoading] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const spread = spreadOptions.find((option) => option.key === spreadKey) ?? spreadOptions[1]
  const allRevealed = drawnCards.length > 0 && drawnCards.every((cardNumber) => revealedCards.includes(cardNumber))
  const choicesNeeded = spread.positions.length
  const choicesRemaining = Math.max(choicesNeeded - drawnCards.length, 0)

  const combinedMessage = useMemo(() => {
    if (!allRevealed) return ''
    const names = drawnCards.map((number) => fullTarotCards[number]?.name).filter(Boolean)
    if (names.length === 1) return `${names[0]} is the center of this reading. Let its message guide your next honest step.`
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} form the pattern of this reading. Read them as one path: what begins as energy becomes choice, and choice becomes direction.`
  }, [allRevealed, drawnCards])

  function prepareChoices(nextSpread = spread) {
    const poolSize = getChoicePoolSize(nextSpread)
    const selected = shuffle(fullTarotCards.map((card) => card.number)).slice(0, poolSize)
    setShuffling(true)
    setChoicePool([])
    setDrawnCards([])
    setRevealedCards([])
    setReadings({})

    window.setTimeout(() => {
      setChoicePool(selected)
      setShuffling(false)
    }, 900)
  }

  async function chooseFromPool(cardNumber: number) {
    if (loading || shuffling || drawnCards.includes(cardNumber) || drawnCards.length >= choicesNeeded) return

    const selected = [...drawnCards, cardNumber]
    setDrawnCards(selected)
    setRevealedCards(selected)

    if (selected.length !== choicesNeeded) return

    setLoading(true)
    const loaded = await loadReadings(selected, lang)
    setReadings(loaded)
    setLoading(false)
  }

  function changeSpread(key: SpreadKey) {
    setSpreadKey(key)
    setChoicePool([])
    setDrawnCards([])
    setRevealedCards([])
    setReadings({})
    setShuffling(false)
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
              onClick={() => prepareChoices()}
              disabled={loading || shuffling}
              className="w-fit rounded-full bg-mystic-gold px-7 py-3 font-semibold text-mystic-dark transition hover:bg-amber-300"
            >
              {shuffling ? 'Shuffling...' : `Shuffle for ${spread.label}`}
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
        {shuffling ? (
          <ShuffleStage />
        ) : choicePool.length && drawnCards.length < choicesNeeded ? (
          <section>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-mystic-gold">{spread.label} Choice</p>
                <h2 className="mt-2 font-display text-4xl text-white">
                  Choose {choicesRemaining} {choicesRemaining === 1 ? 'card' : 'cards'}
                </h2>
                <p className="mt-3 max-w-2xl leading-7 text-mystic-light/64">
                  The cards have been shuffled. Pick the cards that call to you; your selection order becomes the spread.
                </p>
              </div>
              <button
                type="button"
                onClick={() => prepareChoices()}
                className="rounded-full border border-white/18 px-5 py-3 font-semibold text-white transition hover:border-mystic-gold hover:text-mystic-gold"
              >
                Shuffle Again
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-5 lg:grid-cols-10">
              {choicePool.map((cardNumber, index) => (
                <PoolCard
                  key={cardNumber}
                  cardNumber={cardNumber}
                  name={fullTarotCards[cardNumber]?.name ?? 'Selected Card'}
                  index={index}
                  selectedIndex={drawnCards.indexOf(cardNumber)}
                  disabled={loading}
                  onChoose={() => chooseFromPool(cardNumber)}
                />
              ))}
            </div>
          </section>
        ) : drawnCards.length ? (
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
                    const meta = getTarotCardMeta(cardNumber)
                    return (
                      <article key={cardNumber} className="border-t border-white/15 pt-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-mystic-gold">{spread.positions[index]}</p>
                        <h3 className="mt-2 font-display text-3xl text-white">{card.name}</h3>
                        <p className="mt-4 leading-8 text-mystic-light/74">{reading.body}</p>
                        <p className="mt-4 font-semibold leading-7 text-mystic-gold">
                          So your next step: {meta.action}.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2 text-sm">
                          <Badge label="Number" value={String(meta.tarotNumber)} />
                          <Badge label="Color" value={meta.luckyColor} />
                          <Badge label="Match" value={meta.compatibility} />
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
  const meta = getTarotCardMeta(cardNumber)
  const opener = fallbackOpeners[card.number % fallbackOpeners.length]
  const action = fallbackActions[(card.number + 2) % fallbackActions.length]
  return {
    type: 'tarot',
    lang,
    title: `${card.name} Tarot Reading`,
    body: `${getTarotReadingBody(cardNumber, opener)} ${action.charAt(0).toUpperCase() + action.slice(1)} as the spread unfolds.`,
    card_name: card.name,
    card_number: card.number,
    lucky_number: meta.tarotNumber,
    lucky_color: meta.luckyColor,
    compatibility: meta.compatibility,
  }
}

function getChoicePoolSize(spread: SpreadOption) {
  if (spread.positions.length === 1) return 5
  if (spread.positions.length <= 5) return 10
  return 15
}

function ShuffleStage() {
  return (
    <div className="grid min-h-[360px] place-items-center border-y border-white/10 text-center">
      <div>
        <div className="shuffle-deck mx-auto h-[190px] w-[138px]">
          {Array.from({ length: 7 }).map((_, index) => (
            <span key={index} style={{ '--shuffle-index': index } as CSSProperties}>
              <Image src={tarotBacks.moon} alt="" fill sizes="138px" className="object-cover" draggable={false} />
            </span>
          ))}
        </div>
        <p className="mt-8 font-display text-4xl text-white">Shuffling the deck...</p>
        <p className="mt-3 text-mystic-light/64">Let the cards settle before you choose.</p>
      </div>
      <style jsx>{`
        .shuffle-deck {
          position: relative;
          perspective: 900px;
        }

        .shuffle-deck span {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border: 1px solid rgba(245, 196, 81, 0.72);
          border-radius: 0.75rem;
          background: #070716;
          box-shadow: 0 0 30px rgba(245, 196, 81, 0.26);
          animation: shuffle-card 0.9s cubic-bezier(0.22, 0.68, 0.22, 1) infinite;
          animation-delay: calc(var(--shuffle-index) * 70ms);
        }

        @keyframes shuffle-card {
          0%,
          100% {
            transform: translateX(0) rotateZ(0deg) rotateY(0deg);
            z-index: 7;
          }
          35% {
            transform: translateX(calc((var(--shuffle-index) - 3) * 14px)) rotateZ(calc((var(--shuffle-index) - 3) * 4deg))
              rotateY(18deg);
            z-index: var(--shuffle-index);
          }
          70% {
            transform: translateX(calc((3 - var(--shuffle-index)) * 10px)) rotateZ(calc((3 - var(--shuffle-index)) * 3deg))
              rotateY(-16deg);
            z-index: calc(7 - var(--shuffle-index));
          }
        }
      `}</style>
    </div>
  )
}

function PoolCard({
  cardNumber,
  name,
  index,
  selectedIndex,
  disabled,
  onChoose,
}: {
  cardNumber: number
  name: string
  index: number
  selectedIndex: number
  disabled: boolean
  onChoose: () => void
}) {
  const selected = selectedIndex >= 0

  return (
    <button
      type="button"
      onClick={selected ? undefined : onChoose}
      disabled={disabled || selected}
      aria-pressed={selected}
      aria-label={selected ? `Selected ${name}` : `Choose hidden card ${index + 1}`}
      className={`pool-card group mx-auto w-[112px] bg-transparent p-0 text-center ${
        selected ? 'is-selected cursor-default' : 'cursor-pointer'
      }`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span className="pool-card-frame relative block aspect-[10/17] rounded-xl">
        <span className="pool-card-face pool-card-back absolute inset-0 overflow-hidden rounded-xl border border-mystic-gold/70 bg-mystic-dark shadow-[0_0_28px_rgba(245,196,81,0.2)]">
          <Image src={tarotBacks.moon} alt="" fill sizes="112px" className="object-cover" draggable={false} />
        </span>
        <span className="pool-card-face pool-card-front absolute inset-0 overflow-hidden rounded-xl border border-mystic-gold bg-mystic-dark shadow-gold">
          <Image
            src={tarotCardImage(cardNumber, name)}
            alt={selected ? name : ''}
            fill
            sizes="112px"
            className="object-cover"
            draggable={false}
          />
        </span>
        {selected ? (
          <span className="pool-selected-aura pointer-events-none absolute -inset-2 rounded-2xl border border-mystic-gold/50" />
        ) : null}
      </span>
      <span className="mt-3 block min-h-6 text-xs uppercase tracking-[0.18em] text-mystic-light/62">
        {selected ? (
          <span>
            Chosen
            <span className="sr-only">: {name}</span>
          </span>
        ) : (
          'Choose'
        )}
      </span>
      <style jsx>{`
        .pool-card {
          opacity: 0;
          transform: translateY(18px) rotate(var(--pool-rotate, 0deg));
          animation: pool-card-in 0.48s ease forwards;
          transition:
            filter 0.3s ease,
            transform 0.3s ease,
            opacity 0.3s ease;
        }

        .pool-card:nth-child(3n + 1) {
          --pool-rotate: -2deg;
        }

        .pool-card:nth-child(3n + 2) {
          --pool-rotate: 1deg;
        }

        .pool-card:nth-child(3n) {
          --pool-rotate: 2deg;
        }

        .pool-card:hover,
        .pool-card:focus-visible {
          filter: drop-shadow(0 0 24px rgba(245, 196, 81, 0.56));
          transform: translateY(-8px) rotate(var(--pool-rotate));
          outline: none;
        }

        .pool-card.is-selected {
          opacity: 1;
          filter: drop-shadow(0 0 22px rgba(245, 196, 81, 0.5));
        }

        .pool-card.is-selected:hover,
        .pool-card.is-selected:focus-visible {
          transform: translateY(0) rotate(var(--pool-rotate));
          filter: drop-shadow(0 0 22px rgba(245, 196, 81, 0.5));
        }

        .pool-card-frame {
          transform-style: preserve-3d;
          transition: transform 0.72s cubic-bezier(0.2, 0.72, 0.18, 1);
        }

        .pool-card.is-selected .pool-card-frame {
          transform: rotateY(180deg);
        }

        .pool-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .pool-card-front {
          transform: rotateY(180deg);
        }

        .pool-selected-aura {
          animation: pool-selected-aura 1.9s ease-in-out infinite;
          box-shadow:
            0 0 22px rgba(245, 196, 81, 0.45),
            0 0 48px rgba(245, 196, 81, 0.24);
        }

        @keyframes pool-card-in {
          to {
            opacity: 1;
            transform: translateY(0) rotate(var(--pool-rotate));
          }
        }

        @keyframes pool-selected-aura {
          0%,
          100% {
            opacity: 0.68;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </button>
  )
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
        aria-label={revealed ? `${position}: ${name}` : `Reveal ${position}`}
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
              alt={revealed ? name : ''}
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
