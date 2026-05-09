import { zodiacSigns, zodiacSymbols } from '@/lib/i18n'
import { titleCase } from '@/lib/fortune'

export const metadata = {
  title: 'Compatibility',
  description: 'Zodiac compatibility pairings from K-Mystic.',
}

export default function CompatibilityPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16">
      <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">Compatibility</p>
      <h1 className="mt-4 max-w-3xl font-display text-6xl text-white">Find a sign that steadies your day</h1>
      <div className="mt-12 grid gap-x-8 gap-y-5 md:grid-cols-2">
        {zodiacSigns.map((sign, index) => {
          const match = zodiacSigns[(index + 4) % zodiacSigns.length]
          return (
            <div key={sign} className="flex items-center justify-between border-t border-white/12 py-5">
              <span className="font-display text-2xl text-white">
                {zodiacSymbols[sign]} {titleCase(sign)}
              </span>
              <span className="text-mystic-gold">
                {zodiacSymbols[match]} {titleCase(match)}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
