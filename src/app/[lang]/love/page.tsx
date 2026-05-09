'use client'

import Image from 'next/image'
import { FormEvent, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { languages, tarotCards, zodiacSigns } from '@/lib/i18n'
import { tarotBacks, tarotCardImage } from '@/lib/tarotAssets'
import type { LanguageCode } from '@/types'

type LoveReading = {
  overall: string
  card1_reading: string
  card2_reading: string
  card3_reading: string
  combined_message: string
  lucky_day: string
  affirmation: string
  summary: string
}

type CompatibilityResult = {
  score: number
  description: string
  advice?: string
  strength?: string
  challenge?: string
}

const positions = ['Current Situation', "Partner's Feelings", 'Future Direction']
const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-pink-300'

export default function LovePage({ params }: { params: { lang: LanguageCode } }) {
  const [cards, setCards] = useState(() => drawLoveCards())
  const [revealed, setRevealed] = useState(0)
  const [reading, setReading] = useState<LoveReading | null>(null)
  const [loading, setLoading] = useState(false)
  const [zodiacResult, setZodiacResult] = useState<CompatibilityResult | null>(null)
  const [sajuResult, setSajuResult] = useState<CompatibilityResult | null>(null)

  const hearts = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        left: `${(index * 37 + 11) % 100}%`,
        delay: `${(index % 9) * 0.35}s`,
        duration: `${5 + (index % 5) * 0.7}s`,
      })),
    [],
  )

  async function revealReading() {
    setLoading(true)
    setReading(null)
    setRevealed(0)
    cards.forEach((_, index) => {
      window.setTimeout(() => setRevealed(index + 1), index * 500)
    })

    const response = await fetch('/api/love-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'reading',
        card1: cards[0].name,
        card2: cards[1].name,
        card3: cards[2].name,
        language: languages[params.lang].name,
      }),
    })
    const data = await response.json()
    window.setTimeout(() => {
      setReading(data as LoveReading)
      setLoading(false)
    }, 1700)
  }

  function tryAgain() {
    setCards(drawLoveCards())
    setRevealed(0)
    setReading(null)
  }

  async function checkZodiac(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/love-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'zodiac',
        mySign: form.get('mySign'),
        partnerSign: form.get('partnerSign'),
        language: languages[params.lang].name,
      }),
    })
    setZodiacResult((await response.json()) as CompatibilityResult)
  }

  async function checkSaju(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/love-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'saju',
        myYear: Number(form.get('myYear')),
        myMonth: Number(form.get('myMonth')),
        myDay: Number(form.get('myDay')),
        partnerYear: Number(form.get('partnerYear')),
        partnerMonth: Number(form.get('partnerMonth')),
        partnerDay: Number(form.get('partnerDay')),
        language: languages[params.lang].name,
      }),
    })
    setSajuResult((await response.json()) as CompatibilityResult)
  }

  return (
    <main className="overflow-hidden">
      <section className="love-hero relative px-5 py-20">
        {hearts.map((heart, index) => (
          <span
            key={index}
            className="heart-particle"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
            }}
          >
            {'\u2665'}
          </span>
        ))}
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.32em] text-pink-100/80">Love Tarot</p>
          <h1 className="mt-5 font-display text-6xl leading-none text-white md:text-8xl">Korean Love Tarot</h1>
          <p className="mt-5 max-w-xl text-2xl text-pink-50/82">Reveal the secrets of your heart</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-7 md:grid-cols-3">
          {cards.map((card, index) => (
            <LoveCard key={`${card.number}-${index}`} card={card} position={positions[index]} revealed={revealed > index} />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={revealReading}
            disabled={loading}
            className="rounded-full bg-pink-400 px-7 py-3 font-semibold text-mystic-dark transition hover:bg-pink-300 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? 'Reading your heart...' : 'Reveal Your Love Reading'}
          </button>
          <button
            onClick={tryAgain}
            className="rounded-full border border-white/18 px-7 py-3 font-semibold text-white transition hover:border-pink-300 hover:text-pink-200"
          >
            Try Again
          </button>
        </div>

        {reading ? (
          <section className="reading-result mt-16">
            <div className="grid gap-6 md:grid-cols-2">
              <ReadingBlock title="Overall Love Energy" body={reading.overall} delay="0s" />
              <ReadingBlock title={positions[0]} body={reading.card1_reading} delay="0.12s" />
              <ReadingBlock title={positions[1]} body={reading.card2_reading} delay="0.24s" />
              <ReadingBlock title={positions[2]} body={reading.card3_reading} delay="0.36s" />
            </div>
            <div className="mt-8 border-t border-pink-300/30 pt-7">
              <span className="rounded-full bg-mystic-gold px-4 py-2 text-sm font-semibold text-mystic-dark">
                Lucky day: {reading.lucky_day}
              </span>
              <h2 className="mt-6 font-display text-4xl text-white">Combined Message</h2>
              <p className="mt-4 max-w-3xl leading-8 text-mystic-light/76">{reading.combined_message}</p>
              <p className="mt-5 font-display text-2xl italic text-pink-200">&quot;{reading.affirmation}&quot;</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(reading.summary)}
                  className="rounded-full bg-white px-5 py-3 font-semibold text-mystic-dark"
                >
                  Share Your Reading
                </button>
                <button
                  type="button"
                  onClick={tryAgain}
                  className="rounded-full border border-white/18 px-5 py-3 font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <CompatibilityPanel title="Zodiac Compatibility" onSubmit={checkZodiac}>
            <SelectSign name="mySign" label="My Sign" />
            <SelectSign name="partnerSign" label="Partner Sign" />
            <button className="rounded-full bg-mystic-gold px-5 py-3 font-semibold text-mystic-dark" type="submit">
              Check Compatibility
            </button>
            {zodiacResult ? <CompatibilityResultView result={zodiacResult} /> : null}
          </CompatibilityPanel>

          <CompatibilityPanel title="Saju Compatibility" onSubmit={checkSaju}>
            <BirthInputs prefix="my" label="My Birth Date" />
            <BirthInputs prefix="partner" label="Partner Birth Date" />
            <button className="rounded-full bg-pink-400 px-5 py-3 font-semibold text-mystic-dark" type="submit">
              Analyze Saju Match
            </button>
            {sajuResult ? <CompatibilityResultView result={sajuResult} /> : null}
          </CompatibilityPanel>
        </div>
      </section>

      <style jsx>{`
        .love-hero {
          min-height: 440px;
          display: grid;
          align-items: end;
          background:
            radial-gradient(circle at 16% 20%, rgba(255, 255, 255, 0.18), transparent 24%),
            linear-gradient(135deg, #ec4899, #6b21a8 48%, #0a0a1a);
        }

        .heart-particle {
          position: absolute;
          bottom: -30px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 1.1rem;
          animation: heart-float 6s ease-in infinite;
        }

        .reading-result {
          animation: result-fade 0.8s ease both;
        }

        @keyframes heart-float {
          0% {
            transform: translateY(0) scale(0.7) rotate(0deg);
            opacity: 0;
          }
          18% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-520px) scale(1.4) rotate(18deg);
            opacity: 0;
          }
        }

        @keyframes result-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  )
}

function drawLoveCards() {
  return [...tarotCards].sort(() => Math.random() - 0.5).slice(0, 3)
}

function LoveCard({
  card,
  position,
  revealed,
}: {
  card: (typeof tarotCards)[number]
  position: string
  revealed: boolean
}) {
  return (
    <div className="text-center">
      <div className="mx-auto h-[300px] w-[180px] [perspective:1000px]">
        <div
          className={`relative h-full w-full transition duration-700 [transform-style:preserve-3d] ${
            revealed ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-pink-200/70 bg-mystic-dark shadow-[0_0_32px_rgba(236,72,153,0.32)] [backface-visibility:hidden]">
            <Image src={tarotBacks.classic} alt="" fill sizes="180px" className="object-cover" draggable={false} />
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-mystic-gold/70 bg-mystic-dark shadow-gold [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Image
              src={tarotCardImage(card.number, card.name)}
              alt={card.name}
              fill
              sizes="180px"
              className="object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
      <p className="mt-5 font-display text-2xl text-white">{position}</p>
    </div>
  )
}

function ReadingBlock({ title, body, delay }: { title: string; body: string; delay: string }) {
  return (
    <article className="fade-block border-t border-pink-300/25 pt-5" style={{ animationDelay: delay }}>
      <h2 className="font-display text-3xl text-white">{title}</h2>
      <p className="mt-3 leading-8 text-mystic-light/74">{body}</p>
      <style jsx>{`
        .fade-block {
          animation: block-fade 0.65s ease both;
        }
        @keyframes block-fade {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </article>
  )
}

function CompatibilityPanel({
  title,
  onSubmit,
  children,
}: {
  title: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-white/10 bg-mystic-dark/52 p-5">
      <h2 className="font-display text-4xl text-white">{title}</h2>
      <div className="mt-6 grid gap-4">{children}</div>
    </form>
  )
}

function SelectSign({ name, label }: { name: string; label: string }) {
  return (
    <label>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mystic-light/52">{label}</span>
      <select name={name} className={fieldClass} defaultValue={zodiacSigns[0]}>
        {zodiacSigns.map((sign) => (
          <option key={sign} value={sign}>
            {sign}
          </option>
        ))}
      </select>
    </label>
  )
}

function BirthInputs({ prefix, label }: { prefix: string; label: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-mystic-light/52">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        <input name={`${prefix}Year`} type="number" min="1900" max="2100" required placeholder="Year" className={fieldClass} />
        <input name={`${prefix}Month`} type="number" min="1" max="12" required placeholder="Month" className={fieldClass} />
        <input name={`${prefix}Day`} type="number" min="1" max="31" required placeholder="Day" className={fieldClass} />
      </div>
    </fieldset>
  )
}

function CompatibilityResultView({ result }: { result: CompatibilityResult }) {
  return (
    <div className="border-t border-white/10 pt-5">
      <div className="font-display text-5xl text-mystic-gold">{result.score}%</div>
      <p className="mt-3 leading-7 text-mystic-light/74">{result.description}</p>
      {result.strength ? <p className="mt-3 text-sm text-pink-200">Strength: {result.strength}</p> : null}
      {result.challenge ? <p className="mt-2 text-sm text-mystic-light/66">Challenge: {result.challenge}</p> : null}
      {result.advice ? <p className="mt-2 text-sm text-mystic-gold">Advice: {result.advice}</p> : null}
    </div>
  )
}
