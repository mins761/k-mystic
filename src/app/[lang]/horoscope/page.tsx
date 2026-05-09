import HoroscopeCard from '@/components/HoroscopeCard'
import { zodiacSigns } from '@/lib/i18n'
import type { LanguageCode } from '@/types'

export const metadata = {
  title: 'Daily Horoscope',
  description: 'Daily zodiac readings for every sign.',
}

export default function HoroscopePage({ params }: { params: { lang: LanguageCode } }) {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">Horoscope</p>
      <h1 className="mt-4 font-display text-6xl text-white">Choose your sign</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {zodiacSigns.map((sign) => (
          <HoroscopeCard key={sign} lang={params.lang} sign={sign} />
        ))}
      </div>
    </main>
  )
}
