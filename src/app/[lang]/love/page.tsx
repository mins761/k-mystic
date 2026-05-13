'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { languages, zodiacSigns } from '@/lib/i18n'
import { fullTarotCards, tarotBacks, tarotCardImage } from '@/lib/tarotAssets'
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

const loveCopy: Record<
  LanguageCode,
  {
    eyebrow: string
    title: string
    subtitle: string
    positions: string[]
    reveal: string
    loading: string
    tryAgain: string
    overall: string
    combined: string
    luckyDay: string
    share: string
    zodiac: string
    saju: string
    mySign: string
    partnerSign: string
    checkCompatibility: string
    myBirth: string
    partnerBirth: string
    analyzeSaju: string
    year: string
    month: string
    day: string
    strength: string
    challenge: string
    advice: string
  }
> = {
  en: {
    eyebrow: 'Love Tarot',
    title: 'Korean Love Tarot',
    subtitle: 'Reveal the secrets of your heart',
    positions,
    reveal: 'Reveal Your Love Reading',
    loading: 'Reading your heart...',
    tryAgain: 'Try Again',
    overall: 'Overall Love Energy',
    combined: 'Combined Message',
    luckyDay: 'Lucky day',
    share: 'Share Your Reading',
    zodiac: 'Zodiac Compatibility',
    saju: 'Saju Compatibility',
    mySign: 'My Sign',
    partnerSign: 'Partner Sign',
    checkCompatibility: 'Check Compatibility',
    myBirth: 'My Birth Date',
    partnerBirth: 'Partner Birth Date',
    analyzeSaju: 'Analyze Saju Match',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    strength: 'Strength',
    challenge: 'Challenge',
    advice: 'Advice',
  },
  es: {
    eyebrow: 'Tarot del amor',
    title: 'Tarot coreano del amor',
    subtitle: 'Revela los secretos de tu corazón',
    positions: ['Situación actual', 'Sentimientos de la otra persona', 'Dirección futura'],
    reveal: 'Revelar mi lectura de amor',
    loading: 'Leyendo tu corazón...',
    tryAgain: 'Intentar de nuevo',
    overall: 'Energía amorosa general',
    combined: 'Mensaje combinado',
    luckyDay: 'Día de suerte',
    share: 'Compartir lectura',
    zodiac: 'Compatibilidad zodiacal',
    saju: 'Compatibilidad Saju',
    mySign: 'Mi signo',
    partnerSign: 'Signo de la otra persona',
    checkCompatibility: 'Comprobar compatibilidad',
    myBirth: 'Mi fecha de nacimiento',
    partnerBirth: 'Fecha de nacimiento de la otra persona',
    analyzeSaju: 'Analizar compatibilidad Saju',
    year: 'Ano',
    month: 'Mes',
    day: 'Dia',
    strength: 'Fortaleza',
    challenge: 'Desafío',
    advice: 'Consejo',
  },
  ja: {
    eyebrow: '恋愛タロット',
    title: '韓国式恋愛タロット',
    subtitle: 'あなたの心の秘密を明らかにします',
    positions: ['現在の状況', '相手の気持ち', 'これからの流れ'],
    reveal: '恋愛リーディングを開く',
    loading: '心を読み解いています...',
    tryAgain: 'もう一度',
    overall: '今日の恋愛エネルギー',
    combined: '総合メッセージ',
    luckyDay: '恋のラッキーデー',
    share: 'リーディングを共有',
    zodiac: '星座の相性',
    saju: '四柱推命の相性',
    mySign: '自分の星座',
    partnerSign: '相手の星座',
    checkCompatibility: '相性を見る',
    myBirth: '自分の生年月日',
    partnerBirth: '相手の生年月日',
    analyzeSaju: '四柱相性を分析',
    year: '年',
    month: '月',
    day: '日',
    strength: '強み',
    challenge: '課題',
    advice: '助言',
  },
  'zh-TW': {
    eyebrow: '愛情塔羅',
    title: '韓式愛情塔羅',
    subtitle: '揭開你內心的秘密',
    positions: ['目前狀況', '對方心意', '未來走向'],
    reveal: '揭曉我的愛情解讀',
    loading: '正在解讀你的心...',
    tryAgain: '再試一次',
    overall: '今日愛情能量',
    combined: '綜合訊息',
    luckyDay: '愛情幸運日',
    share: '分享解讀',
    zodiac: '星座合盤',
    saju: '四柱愛情合盤',
    mySign: '我的星座',
    partnerSign: '對方星座',
    checkCompatibility: '查看契合度',
    myBirth: '我的生日',
    partnerBirth: '對方生日',
    analyzeSaju: '分析四柱合盤',
    year: '年',
    month: '月',
    day: '日',
    strength: '優勢',
    challenge: '課題',
    advice: '建議',
  },
}

export default function LovePage({ params }: { params: { lang: LanguageCode } }) {
  const copy = loveCopy[params.lang]
  const [cards, setCards] = useState(() => drawLoveCards())
  const [revealedCards, setRevealedCards] = useState([false, false, false])
  const [reading, setReading] = useState<LoveReading | null>(null)
  const [loading, setLoading] = useState(false)
  const [zodiacResult, setZodiacResult] = useState<CompatibilityResult | null>(null)
  const [sajuResult, setSajuResult] = useState<CompatibilityResult | null>(null)
  const allCardsRevealed = revealedCards.every(Boolean)

  const hearts = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        left: `${(index * 37 + 11) % 100}%`,
        delay: `${(index % 9) * 0.35}s`,
        duration: `${5 + (index % 5) * 0.7}s`,
      })),
    [],
  )

  useEffect(() => {
    if (!allCardsRevealed || reading || loading) return
    void loadLoveReading()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCardsRevealed])

  async function loadLoveReading() {
    setLoading(true)
    setReading(null)

    const response = await fetch('/api/love-tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'reading',
        card1: cards[0].name,
        card2: cards[1].name,
        card3: cards[2].name,
        language: languages[params.lang].name,
        lang: params.lang,
      }),
    })
    const data = await response.json()
    window.setTimeout(() => {
      setReading(data as LoveReading)
      setLoading(false)
    }, 500)
  }

  function revealReading() {
    if (loading) return
    setReading(null)
    cards.forEach((_, index) => {
      window.setTimeout(() => {
        setRevealedCards((current) => current.map((value, itemIndex) => (itemIndex === index ? true : value)))
      }, index * 500)
    })
  }

  function revealCard(index: number) {
    if (loading || revealedCards[index]) return
    setReading(null)
    setRevealedCards((current) => current.map((value, itemIndex) => (itemIndex === index ? true : value)))
  }

  function tryAgain() {
    setCards(drawLoveCards())
    setRevealedCards([false, false, false])
    setReading(null)
    setLoading(false)
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
        lang: params.lang,
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
        lang: params.lang,
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
          <p className="text-sm uppercase tracking-[0.32em] text-pink-100/80">{copy.eyebrow}</p>
          <h1 className="mt-5 font-display text-6xl leading-none text-white md:text-8xl">{copy.title}</h1>
          <p className="mt-5 max-w-xl text-2xl text-pink-50/82">{copy.subtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-7 md:grid-cols-3">
          {cards.map((card, index) => (
            <LoveCard
              key={`${card.number}-${index}`}
              card={card}
              position={copy.positions[index]}
              revealed={revealedCards[index]}
              disabled={loading}
              onReveal={() => revealCard(index)}
            />
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={revealReading}
            disabled={loading}
            className="rounded-full bg-pink-400 px-7 py-3 font-semibold text-mystic-dark transition hover:bg-pink-300 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? copy.loading : copy.reveal}
          </button>
          <button
            onClick={tryAgain}
            disabled={loading}
            className="rounded-full border border-white/18 px-7 py-3 font-semibold text-white transition hover:border-pink-300 hover:text-pink-200"
          >
            {copy.tryAgain}
          </button>
        </div>

        {loading && !reading ? <LoveReadingLoader label={copy.loading} cards={cards.map((card) => card.name)} /> : null}

        {reading ? (
          <section className="reading-result mt-16">
            <div className="grid gap-6 md:grid-cols-2">
              <ReadingBlock title={copy.overall} body={reading.overall} delay="0s" />
              <ReadingBlock title={copy.positions[0]} body={reading.card1_reading} delay="0.12s" />
              <ReadingBlock title={copy.positions[1]} body={reading.card2_reading} delay="0.24s" />
              <ReadingBlock title={copy.positions[2]} body={reading.card3_reading} delay="0.36s" />
            </div>
            <div className="mt-8 border-t border-pink-300/30 pt-7">
              <span className="rounded-full bg-mystic-gold px-4 py-2 text-sm font-semibold text-mystic-dark">
                {copy.luckyDay}: {reading.lucky_day}
              </span>
              <h2 className="mt-6 font-display text-4xl text-white">{copy.combined}</h2>
              <p className="mt-4 max-w-3xl leading-8 text-mystic-light/76">{reading.combined_message}</p>
              <p className="mt-5 font-display text-2xl italic text-pink-200">&quot;{reading.affirmation}&quot;</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(reading.summary)}
                  className="rounded-full bg-white px-5 py-3 font-semibold text-mystic-dark"
                >
                  {copy.share}
                </button>
                <button
                  type="button"
                  onClick={tryAgain}
                  className="rounded-full border border-white/18 px-5 py-3 font-semibold text-white"
                >
                  {copy.tryAgain}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <CompatibilityPanel title={copy.zodiac} onSubmit={checkZodiac}>
            <SelectSign name="mySign" label={copy.mySign} />
            <SelectSign name="partnerSign" label={copy.partnerSign} />
            <button className="rounded-full bg-mystic-gold px-5 py-3 font-semibold text-mystic-dark" type="submit">
              {copy.checkCompatibility}
            </button>
            {zodiacResult ? <CompatibilityResultView result={zodiacResult} copy={copy} /> : null}
          </CompatibilityPanel>

          <CompatibilityPanel title={copy.saju} onSubmit={checkSaju}>
            <BirthInputs prefix="my" label={copy.myBirth} copy={copy} />
            <BirthInputs prefix="partner" label={copy.partnerBirth} copy={copy} />
            <button className="rounded-full bg-pink-400 px-5 py-3 font-semibold text-mystic-dark" type="submit">
              {copy.analyzeSaju}
            </button>
            {sajuResult ? <CompatibilityResultView result={sajuResult} copy={copy} /> : null}
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

        :global(.love-loader) {
          position: relative;
          margin: 3.5rem auto 0;
          max-width: 760px;
          overflow: hidden;
          border-top: 1px solid rgba(244, 114, 182, 0.28);
          border-bottom: 1px solid rgba(244, 114, 182, 0.18);
          padding: 2rem 1rem;
          text-align: center;
          animation: result-fade 0.7s ease both;
        }

        :global(.love-loader-orbit) {
          position: relative;
          margin: 0 auto 1.25rem;
          width: 116px;
          height: 116px;
          border-radius: 999px;
          border: 1px solid rgba(244, 114, 182, 0.34);
          box-shadow:
            0 0 42px rgba(236, 72, 153, 0.34),
            inset 0 0 28px rgba(245, 158, 11, 0.16);
          animation: love-pulse 1.8s ease-in-out infinite;
        }

        :global(.love-loader-orbit::before),
        :global(.love-loader-orbit::after) {
          content: '';
          position: absolute;
          inset: 16px;
          border-radius: inherit;
          border: 1px dashed rgba(245, 196, 81, 0.5);
          animation: love-spin 5.5s linear infinite;
        }

        :global(.love-loader-orbit::after) {
          inset: 34px;
          border-color: rgba(244, 114, 182, 0.62);
          animation-duration: 3.5s;
          animation-direction: reverse;
        }

        :global(.love-loader-heart) {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: #f9a8d4;
          font-size: 2rem;
          text-shadow: 0 0 20px rgba(244, 114, 182, 0.8);
          animation: love-heart 1.35s ease-in-out infinite;
        }

        :global(.love-loader-title) {
          font-family: var(--font-display);
          font-size: 2rem;
          color: #fff;
        }

        :global(.love-loader-text) {
          margin-top: 0.75rem;
          color: rgba(226, 232, 240, 0.72);
          line-height: 1.8;
        }

        :global(.love-loader-cards) {
          margin-top: 1.25rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
        }

        :global(.love-loader-cards span) {
          border-radius: 999px;
          border: 1px solid rgba(244, 114, 182, 0.26);
          padding: 0.45rem 0.8rem;
          color: rgba(253, 242, 248, 0.78);
          background: rgba(255, 255, 255, 0.045);
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

        @keyframes love-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes love-pulse {
          0%,
          100% {
            transform: scale(0.96);
            opacity: 0.78;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }

        @keyframes love-heart {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.92);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.12);
          }
        }
      `}</style>
    </main>
  )
}

function LoveReadingLoader({ label, cards }: { label: string; cards: string[] }) {
  return (
    <div className="love-loader" aria-live="polite">
      <div className="love-loader-orbit" aria-hidden>
        <span className="love-loader-heart">{'\u2665'}</span>
      </div>
      <h2 className="love-loader-title">{label}</h2>
      <p className="love-loader-text">
        The cards are settling into their pattern while the reading gathers the current situation, the hidden feeling,
        and the next movement of love.
      </p>
      <div className="love-loader-cards">
        {cards.map((card) => (
          <span key={card}>{card}</span>
        ))}
      </div>
    </div>
  )
}

function drawLoveCards() {
  return [...fullTarotCards].sort(() => Math.random() - 0.5).slice(0, 3)
}

function LoveCard({
  card,
  position,
  revealed,
  disabled,
  onReveal,
}: {
  card: (typeof fullTarotCards)[number]
  position: string
  revealed: boolean
  disabled: boolean
  onReveal: () => void
}) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onReveal}
        disabled={disabled || revealed}
        aria-pressed={revealed}
        aria-label={`Reveal ${position}: ${card.name}`}
        className="mx-auto block h-[300px] w-[180px] cursor-pointer bg-transparent p-0 [perspective:1000px] disabled:cursor-default"
      >
        <div
          className={`relative h-full w-full transition duration-700 [transform-style:preserve-3d] ${
            revealed ? '[transform:rotateY(180deg)]' : ''
          } ${disabled ? 'opacity-80' : 'hover:-translate-y-2 hover:drop-shadow-[0_0_22px_rgba(244,114,182,0.5)]'}`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-pink-200/70 bg-mystic-dark shadow-[0_0_32px_rgba(236,72,153,0.32)] [backface-visibility:hidden]">
            <Image src={tarotBacks.moon} alt="" fill sizes="180px" className="object-cover" draggable={false} />
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
      </button>
      <p className="mt-5 font-display text-2xl text-white">{position}</p>
      <p className="mt-2 text-sm text-pink-100/55">{revealed ? card.name : 'Tap to reveal'}</p>
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

function BirthInputs({ prefix, label, copy }: { prefix: string; label: string; copy: (typeof loveCopy)[LanguageCode] }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-mystic-light/52">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        <input name={`${prefix}Year`} type="number" min="1900" max="2100" required placeholder={copy.year} className={fieldClass} />
        <input name={`${prefix}Month`} type="number" min="1" max="12" required placeholder={copy.month} className={fieldClass} />
        <input name={`${prefix}Day`} type="number" min="1" max="31" required placeholder={copy.day} className={fieldClass} />
      </div>
    </fieldset>
  )
}

function CompatibilityResultView({
  result,
  copy,
}: {
  result: CompatibilityResult
  copy: (typeof loveCopy)[LanguageCode]
}) {
  return (
    <div className="border-t border-white/10 pt-5">
      <div className="font-display text-5xl text-mystic-gold">{result.score}%</div>
      <p className="mt-3 leading-7 text-mystic-light/74">{result.description}</p>
      {result.strength ? <p className="mt-3 text-sm text-pink-200">{copy.strength}: {result.strength}</p> : null}
      {result.challenge ? <p className="mt-2 text-sm text-mystic-light/66">{copy.challenge}: {result.challenge}</p> : null}
      {result.advice ? <p className="mt-2 text-sm text-mystic-gold">{copy.advice}: {result.advice}</p> : null}
    </div>
  )
}
