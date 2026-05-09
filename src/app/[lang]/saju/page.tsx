'use client'

import { FormEvent, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import ElementChart from '@/components/ElementChart'
import SajuTable from '@/components/SajuTable'
import { languages } from '@/lib/i18n'
import type { LanguageCode, SajuResult } from '@/types'

const birthHours = [
  ['자', '子 23:00-01:00'],
  ['축', '丑 01:00-03:00'],
  ['인', '寅 03:00-05:00'],
  ['묘', '卯 05:00-07:00'],
  ['진', '辰 07:00-09:00'],
  ['사', '巳 09:00-11:00'],
  ['오', '午 11:00-13:00'],
  ['미', '未 13:00-15:00'],
  ['신', '申 15:00-17:00'],
  ['유', '酉 17:00-19:00'],
  ['술', '戌 19:00-21:00'],
  ['해', '亥 21:00-23:00'],
]

const sajuCopy: Record<
  LanguageCode,
  {
    eyebrow: string
    title: string
    subtitle: string
    name: string
    optional: string
    gender: string
    female: string
    male: string
    nonbinary: string
    unspecified: string
    birthYear: string
    birthMonth: string
    birthDay: string
    birthHour: string
    unknown: string
    loading: string
    reveal: string
    fourPillars: string
    fiveElements: string
    personality: string
    destiny: string
    thisYear: string
    love: string
    career: string
    health: string
    luckyColor: string
    luckyNumber: string
    luckyDirection: string
  }
> = {
  en: {
    eyebrow: 'Korean Saju',
    title: 'Korean Four Pillars Reading',
    subtitle: 'Discover your destiny through ancient Korean astrology',
    name: 'Name',
    optional: 'Optional',
    gender: 'Gender',
    female: 'Female',
    male: 'Male',
    nonbinary: 'Non-binary',
    unspecified: 'Prefer not to say',
    birthYear: 'Birth Year',
    birthMonth: 'Birth Month',
    birthDay: 'Birth Day',
    birthHour: 'Birth Hour',
    unknown: 'Unknown',
    loading: 'Reading the pillars...',
    reveal: 'Reveal My Saju',
    fourPillars: 'Four Pillars',
    fiveElements: 'Five Elements',
    personality: 'Innate Personality',
    destiny: 'Destiny Themes',
    thisYear: "This Year's Fortune",
    love: 'Love Fortune',
    career: 'Career & Wealth',
    health: 'Health Guidance',
    luckyColor: 'Lucky Color',
    luckyNumber: 'Lucky Number',
    luckyDirection: 'Lucky Direction',
  },
  es: {
    eyebrow: 'Saju coreano',
    title: 'Lectura coreana de los Cuatro Pilares',
    subtitle: 'Descubre tu destino con la antigua astrologia coreana',
    name: 'Nombre',
    optional: 'Opcional',
    gender: 'Genero',
    female: 'Femenino',
    male: 'Masculino',
    nonbinary: 'No binario',
    unspecified: 'Prefiero no decirlo',
    birthYear: 'Ano de nacimiento',
    birthMonth: 'Mes de nacimiento',
    birthDay: 'Dia de nacimiento',
    birthHour: 'Hora de nacimiento',
    unknown: 'Desconocida',
    loading: 'Leyendo tus pilares...',
    reveal: 'Revelar mi Saju',
    fourPillars: 'Cuatro Pilares',
    fiveElements: 'Cinco Elementos',
    personality: 'Personalidad innata',
    destiny: 'Temas del destino',
    thisYear: 'Fortuna de este ano',
    love: 'Fortuna amorosa',
    career: 'Carrera y riqueza',
    health: 'Guia de salud',
    luckyColor: 'Color de suerte',
    luckyNumber: 'Numero de suerte',
    luckyDirection: 'Direccion de suerte',
  },
  ja: {
    eyebrow: '韓国式四柱',
    title: '韓国式四柱推命リーディング',
    subtitle: '古代韓国占星術であなたの運命を読み解きます',
    name: '名前',
    optional: '任意',
    gender: '性別',
    female: '女性',
    male: '男性',
    nonbinary: 'ノンバイナリー',
    unspecified: '回答しない',
    birthYear: '生年',
    birthMonth: '生月',
    birthDay: '生日',
    birthHour: '出生時間',
    unknown: '不明',
    loading: '四柱を読み解いています...',
    reveal: '四柱を開く',
    fourPillars: '四柱八字',
    fiveElements: '五行分析',
    personality: '生まれ持った性質',
    destiny: '運命のテーマ',
    thisYear: '今年の運勢',
    love: '恋愛運',
    career: '仕事と財運',
    health: '健康の導き',
    luckyColor: 'ラッキーカラー',
    luckyNumber: 'ラッキーナンバー',
    luckyDirection: '吉方位',
  },
  'zh-TW': {
    eyebrow: '韓國四柱',
    title: '韓國四柱八字解讀',
    subtitle: '透過古老韓國命理探索你的命運',
    name: '姓名',
    optional: '選填',
    gender: '性別',
    female: '女性',
    male: '男性',
    nonbinary: '非二元',
    unspecified: '不透露',
    birthYear: '出生年份',
    birthMonth: '出生月份',
    birthDay: '出生日期',
    birthHour: '出生時辰',
    unknown: '未知',
    loading: '正在解讀四柱...',
    reveal: '揭曉我的四柱',
    fourPillars: '四柱八字',
    fiveElements: '五行分析',
    personality: '天生性格',
    destiny: '命運主題',
    thisYear: '今年運勢',
    love: '愛情運',
    career: '事業與財運',
    health: '健康指引',
    luckyColor: '幸運色',
    luckyNumber: '幸運數字',
    luckyDirection: '幸運方位',
  },
}

export default function SajuPage({ params }: { params: { lang: LanguageCode } }) {
  const copy = sajuCopy[params.lang]
  const [birthDate, setBirthDate] = useState({ year: '', month: '', day: '' })
  const [result, setResult] = useState<SajuResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setBirthDate({
      year: searchParams.get('year') || '',
      month: searchParams.get('month') || '',
      day: searchParams.get('day') || '',
    })
  }, [])

  async function submitReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') || ''),
      year: Number(form.get('year')),
      month: Number(form.get('month')),
      day: Number(form.get('day')),
      hour: String(form.get('hour') || ''),
      gender: String(form.get('gender') || 'unspecified'),
      language: languages[params.lang]?.name ?? 'English',
      lang: params.lang,
    }

    try {
      const response = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Reading failed.')
      setResult(data as SajuResult)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Reading failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="relative overflow-hidden px-5 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.22),transparent_28%),radial-gradient(circle_at_78%_28%,rgba(34,197,94,0.14),transparent_24%),linear-gradient(135deg,#0A0A1A,#181034_46%,#090917)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-mystic-gold">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-display text-6xl leading-none text-white md:text-7xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-mystic-light/72">
              {copy.subtitle}
            </p>
          </div>
          <form
            onSubmit={submitReading}
            className="rounded-lg border border-mystic-gold/30 bg-mystic-dark/70 p-5 shadow-gold backdrop-blur"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.name}>
                <input name="name" placeholder={copy.optional} className="input" />
              </Field>
              <Field label={copy.gender}>
                <select name="gender" className="input" defaultValue="unspecified">
                  <option value="female">{copy.female}</option>
                  <option value="male">{copy.male}</option>
                  <option value="nonbinary">{copy.nonbinary}</option>
                  <option value="unspecified">{copy.unspecified}</option>
                </select>
              </Field>
              <Field label={copy.birthYear}>
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  required
                  placeholder="1994"
                  className="input"
                  value={birthDate.year}
                  onChange={(event) => setBirthDate((current) => ({ ...current, year: event.target.value }))}
                />
              </Field>
              <Field label={copy.birthMonth}>
                <input
                  name="month"
                  type="number"
                  min="1"
                  max="12"
                  required
                  placeholder="7"
                  className="input"
                  value={birthDate.month}
                  onChange={(event) => setBirthDate((current) => ({ ...current, month: event.target.value }))}
                />
              </Field>
              <Field label={copy.birthDay}>
                <input
                  name="day"
                  type="number"
                  min="1"
                  max="31"
                  required
                  placeholder="21"
                  className="input"
                  value={birthDate.day}
                  onChange={(event) => setBirthDate((current) => ({ ...current, day: event.target.value }))}
                />
              </Field>
              <Field label={copy.birthHour}>
                <select name="hour" className="input" defaultValue="">
                  <option value="">{copy.unknown}</option>
                  {birthHours.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-mystic-gold px-6 py-3 font-semibold text-mystic-dark transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? copy.loading : copy.reveal}
            </button>
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          </form>
        </div>
      </section>

      {loading ? <SajuLoading copy={copy} /> : null}

      {result ? (
        <section className="saju-result mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">{copy.fourPillars}</p>
              <div className="mt-6">
                <SajuTable pillars={result.pillars} />
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">{copy.fiveElements}</p>
              <div className="mt-6">
                <ElementChart elements={result.elements} />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-x-9 gap-y-10 md:grid-cols-2">
            <ReadingBlock title={copy.personality} body={result.personality} />
            <ReadingBlock title={copy.destiny} body={result.destiny} />
            <ReadingBlock title={copy.thisYear} body={result.this_year} />
            <ReadingBlock title={copy.love} body={result.love} />
            <ReadingBlock title={copy.career} body={result.career} />
            <ReadingBlock title={copy.health} body={result.health} />
          </div>

          <div className="mt-12 grid gap-5 border-t border-mystic-gold/30 pt-8 sm:grid-cols-3">
            <Lucky label={copy.luckyColor} value={result.lucky_color} />
            <Lucky label={copy.luckyNumber} value={String(result.lucky_number)} />
            <Lucky label={copy.luckyDirection} value={result.lucky_direction} />
          </div>
        </section>
      ) : null}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          padding: 0.78rem 0.9rem;
          color: #fff;
          outline: none;
        }

        .input:focus {
          border-color: rgba(245, 158, 11, 0.75);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
        }

        .input option {
          background: #0a0a1a;
          color: #e2e8f0;
        }

        .saju-result {
          animation: result-fade 0.8s ease both;
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

function SajuLoading({ copy }: { copy: (typeof sajuCopy)[LanguageCode] }) {
  const pillars = [copy.birthYear, copy.birthMonth, copy.birthDay, copy.birthHour]
  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']

  return (
    <section className="mx-auto max-w-7xl px-5 py-14" aria-live="polite">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">{copy.fourPillars}</p>
          <div className="mt-6 overflow-hidden rounded-lg border border-mystic-gold/35 bg-mystic-dark/72 shadow-gold">
            <div className="grid grid-cols-4">
              {pillars.map((pillar, index) => (
                <div key={pillar} className="min-h-44 border-r border-mystic-gold/20 p-4 text-center last:border-r-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-mystic-light/45">{pillar}</p>
                  <div className="mx-auto mt-5 h-12 w-12 rounded-full border border-mystic-gold/30 skeleton-pulse" />
                  <div className="mx-auto mt-4 h-16 w-9 rounded-full bg-white/8 skeleton-rise" style={{ animationDelay: `${index * 0.18}s` }} />
                  <div className="mx-auto mt-4 h-6 w-20 rounded-full bg-mystic-gold/18 skeleton-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">{copy.fiveElements}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
            <div className="saju-orbit mx-auto">
              <span>{copy.loading}</span>
            </div>
            <div className="space-y-4">
              {elements.map((element, index) => (
                <div key={element}>
                  <div className="mb-2 flex justify-between text-sm text-mystic-light/72">
                    <span>{element}</span>
                    <span>{20 + index * 7}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="element-fill h-full rounded-full bg-mystic-gold" style={{ animationDelay: `${index * 0.16}s` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[copy.personality, copy.destiny, copy.thisYear, copy.love].map((title, index) => (
          <article key={title} className="border-t border-white/12 pt-5">
            <h2 className="font-display text-3xl text-white">{title}</h2>
            <div className="mt-4 space-y-3">
              <div className="h-3 w-full rounded-full bg-white/10 skeleton-pulse" style={{ animationDelay: `${index * 0.1}s` }} />
              <div className="h-3 w-5/6 rounded-full bg-white/10 skeleton-pulse" style={{ animationDelay: `${index * 0.1 + 0.08}s` }} />
              <div className="h-3 w-2/3 rounded-full bg-white/10 skeleton-pulse" style={{ animationDelay: `${index * 0.1 + 0.16}s` }} />
            </div>
          </article>
        ))}
      </div>

      <style jsx>{`
        .saju-orbit {
          position: relative;
          display: grid;
          width: 220px;
          height: 220px;
          place-items: center;
          border-radius: 999px;
          background:
            radial-gradient(circle, #0a0a1a 0 36%, transparent 37%),
            conic-gradient(
              from 0deg,
              rgba(34, 197, 94, 0.9),
              rgba(239, 68, 68, 0.88),
              rgba(245, 196, 81, 0.95),
              rgba(248, 250, 252, 0.86),
              rgba(56, 189, 248, 0.9),
              rgba(34, 197, 94, 0.9)
            );
          box-shadow: 0 0 44px rgba(245, 158, 11, 0.2);
          animation: saju-spin 5.2s linear infinite;
        }

        .saju-orbit span {
          max-width: 120px;
          text-align: center;
          font-family: var(--font-display);
          color: #f5c451;
          animation: saju-counter-spin 5.2s linear infinite;
        }

        .skeleton-pulse {
          animation: skeleton-pulse 1.3s ease-in-out infinite;
        }

        .skeleton-rise {
          animation: skeleton-rise 1.6s ease-in-out infinite;
        }

        .element-fill {
          width: 100%;
          transform-origin: left;
          animation: element-fill 1.5s ease both infinite alternate;
        }

        @keyframes saju-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes saju-counter-spin {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes skeleton-pulse {
          0%,
          100% {
            opacity: 0.34;
          }
          50% {
            opacity: 0.82;
          }
        }

        @keyframes skeleton-rise {
          0%,
          100% {
            opacity: 0.25;
            transform: translateY(6px) scaleY(0.82);
          }
          50% {
            opacity: 0.72;
            transform: translateY(0) scaleY(1);
          }
        }

        @keyframes element-fill {
          from {
            transform: scaleX(0.18);
          }
          to {
            transform: scaleX(0.92);
          }
        }
      `}</style>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-mystic-light/52">{label}</span>
      {children}
    </label>
  )
}

function ReadingBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="border-t border-white/12 pt-5">
      <h2 className="font-display text-3xl text-white">{title}</h2>
      <p className="mt-3 leading-8 text-mystic-light/72">{body}</p>
    </article>
  )
}

function Lucky({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-mystic-light/45">{label}</p>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
    </div>
  )
}
