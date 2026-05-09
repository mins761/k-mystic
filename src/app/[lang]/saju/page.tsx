'use client'

import { FormEvent, useState } from 'react'
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

export default function SajuPage({ params }: { params: { lang: LanguageCode } }) {
  const [result, setResult] = useState<SajuResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
            <p className="text-sm uppercase tracking-[0.32em] text-mystic-gold">Korean Saju</p>
            <h1 className="mt-5 max-w-3xl font-display text-6xl leading-none text-white md:text-7xl">
              Korean Four Pillars Reading
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-mystic-light/72">
              Discover your destiny through ancient Korean astrology
            </p>
          </div>
          <form
            onSubmit={submitReading}
            className="rounded-lg border border-mystic-gold/30 bg-mystic-dark/70 p-5 shadow-gold backdrop-blur"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input name="name" placeholder="Optional" className="input" />
              </Field>
              <Field label="Gender">
                <select name="gender" className="input" defaultValue="unspecified">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="nonbinary">Non-binary</option>
                  <option value="unspecified">Prefer not to say</option>
                </select>
              </Field>
              <Field label="Birth Year">
                <input name="year" type="number" min="1900" max="2100" required placeholder="1994" className="input" />
              </Field>
              <Field label="Birth Month">
                <input name="month" type="number" min="1" max="12" required placeholder="7" className="input" />
              </Field>
              <Field label="Birth Day">
                <input name="day" type="number" min="1" max="31" required placeholder="21" className="input" />
              </Field>
              <Field label="Birth Hour">
                <select name="hour" className="input" defaultValue="">
                  <option value="">Unknown</option>
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
              {loading ? 'Reading the pillars...' : 'Reveal My Saju'}
            </button>
            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
          </form>
        </div>
      </section>

      {result ? (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">Four Pillars</p>
              <div className="mt-6">
                <SajuTable pillars={result.pillars} />
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-mystic-gold">Five Elements</p>
              <div className="mt-6">
                <ElementChart elements={result.elements} />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-x-9 gap-y-10 md:grid-cols-2">
            <ReadingBlock title="Innate Personality" body={result.personality} />
            <ReadingBlock title="Destiny Themes" body={result.destiny} />
            <ReadingBlock title="This Year's Fortune" body={result.this_year} />
            <ReadingBlock title="Love Fortune" body={result.love} />
            <ReadingBlock title="Career & Wealth" body={result.career} />
            <ReadingBlock title="Health Guidance" body={result.health} />
          </div>

          <div className="mt-12 grid gap-5 border-t border-mystic-gold/30 pt-8 sm:grid-cols-3">
            <Lucky label="Lucky Color" value={result.lucky_color} />
            <Lucky label="Lucky Number" value={String(result.lucky_number)} />
            <Lucky label="Lucky Direction" value={result.lucky_direction} />
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
      `}</style>
    </main>
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
