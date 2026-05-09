import TarotCard from '@/components/TarotCard'
import { getDailyTarot } from '@/lib/fortune'
import type { LanguageCode } from '@/types'

export const metadata = {
  title: 'Daily Tarot',
  description: 'A daily tarot reading from K-Mystic.',
}

export default async function TarotPage({ params }: { params: { lang: LanguageCode } }) {
  const tarot = await getDailyTarot(params.lang)

  return (
    <main className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
      <TarotCard
        number={tarot.card_number ?? 0}
        name={tarot.card_name ?? 'The Fool'}
        description={tarot.body.slice(0, 120)}
      />
      <article>
        <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">Daily Tarot</p>
        <h1 className="mt-4 font-display text-6xl text-white">{tarot.title}</h1>
        <p className="mt-6 text-lg leading-9 text-mystic-light/76">{tarot.body}</p>
        <dl className="mt-10 grid gap-5 sm:grid-cols-3">
          <Metric label="Lucky Number" value={String(tarot.lucky_number ?? 7)} />
          <Metric label="Lucky Color" value={tarot.lucky_color ?? 'Gold'} />
          <Metric label="Compatibility" value={tarot.compatibility ?? 'Leo'} />
        </dl>
      </article>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <dt className="text-xs uppercase tracking-[0.22em] text-mystic-light/45">{label}</dt>
      <dd className="mt-3 font-display text-2xl text-white">{value}</dd>
    </div>
  )
}
