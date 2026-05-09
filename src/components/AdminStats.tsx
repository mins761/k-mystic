'use client'

import { FormEvent, useState } from 'react'

type CountItem = {
  label: string
  count: number
}

type Stats = {
  total: number
  today: number
  sevenDays: number
  pageViews: CountItem[]
  languageViews: CountItem[]
  generatedAt: string
}

export default function AdminStats() {
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadStats(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to load stats.')
        setStats(null)
        return
      }

      setStats(data as Stats)
    } catch {
      setError('Unable to load stats.')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-mystic-dark px-5 py-12 text-mystic-light">
      <section className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.35em] text-mystic-gold">K-Mystic Admin</p>
        <h1 className="mt-4 font-display text-5xl text-white">Visitor Counter</h1>

        <form onSubmit={loadStats} className="mt-8 flex max-w-lg gap-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Admin password"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-white outline-none focus:border-mystic-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-mystic-gold px-6 py-3 font-semibold text-mystic-dark transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Loading' : 'View'}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        {stats ? (
          <div className="mt-10 space-y-10">
            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Total Visits" value={stats.total} />
              <Metric label="Today" value={stats.today} />
              <Metric label="Last 7 Days" value={stats.sevenDays} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <Breakdown title="Page Views" items={stats.pageViews} />
              <Breakdown title="Language Views" items={stats.languageViews} />
            </div>

            <p className="text-xs text-mystic-light/40">
              Updated {new Date(stats.generatedAt).toLocaleString()}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-mystic-gold/40 pt-5">
      <p className="text-xs uppercase tracking-[0.25em] text-mystic-light/45">{label}</p>
      <p className="mt-3 font-display text-5xl text-white">{value.toLocaleString()}</p>
    </div>
  )
}

function Breakdown({ title, items }: { title: string; items: CountItem[] }) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <section className="border-t border-white/15 pt-5">
      <h2 className="font-display text-3xl text-white">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-mystic-light/75">{item.label}</span>
                <span className="font-semibold text-mystic-gold">{item.count.toLocaleString()}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-mystic-gold"
                  style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-mystic-light/55">No visits recorded yet.</p>
        )}
      </div>
    </section>
  )
}
