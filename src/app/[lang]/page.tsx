import Link from 'next/link'
import AdBanner from '@/components/AdBanner'
import HoroscopeCard from '@/components/HoroscopeCard'
import StarryBackground from '@/components/StarryBackground'
import TarotCard from '@/components/TarotCard'
import { dictionary, isLanguage, zodiacSigns } from '@/lib/i18n'
import { getDailyTarot } from '@/lib/fortune'
import type { LanguageCode } from '@/types'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  return {
    title: dictionary[lang].daily,
    description: dictionary[lang].intro,
  }
}

export default async function HomePage({ params }: { params: { lang: LanguageCode } }) {
  const lang = params.lang
  const t = dictionary[lang]
  const tarot = await getDailyTarot(lang)

  return (
    <main>
      <section className="relative min-h-[calc(100svh-92px)] overflow-hidden px-5 py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920)' }}
        />
        <StarryBackground />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-end pt-16">
          <p className="text-sm uppercase tracking-[0.38em] text-mystic-gold">{new Date().toLocaleDateString()}</p>
          <h1 className="mt-5 max-w-3xl font-display text-6xl font-semibold leading-none text-white md:text-8xl">
            K-Mystic
          </h1>
          <p className="mt-5 max-w-xl text-2xl font-light text-mystic-light md:text-3xl">{t.daily}</p>
          <p className="mt-4 max-w-xl leading-7 text-mystic-light/72">{t.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/${lang}/tarot`}
              className="rounded-full bg-mystic-gold px-6 py-3 font-semibold text-mystic-dark transition hover:scale-[1.02] hover:bg-amber-300"
            >
              {t.tarot}
            </Link>
            <Link
              href={`/${lang}/horoscope`}
              className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-mystic-gold hover:text-mystic-gold"
            >
              {t.exploreSigns}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="flex justify-center md:justify-start">
          <TarotCard
            number={tarot.card_number ?? 0}
            name={tarot.card_name ?? 'The Fool'}
            description={tarot.body.slice(0, 112)}
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{t.todayTarot}</p>
          <h2 className="mt-3 font-display text-5xl text-white">{tarot.title}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-mystic-light/74">{tarot.body}</p>
          <Link href={`/${lang}/tarot`} className="mt-7 inline-flex text-mystic-gold hover:text-amber-200">
            {t.readFull}
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{t.zodiac}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {zodiacSigns.map((sign) => (
              <HoroscopeCard key={sign} lang={lang} sign={sign} />
            ))}
          </div>
        </div>
      </section>

      <div className="py-12">
        <AdBanner />
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">{t.lucky}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <Signal label="Number" value={String(tarot.lucky_number ?? 7)} />
            <Signal label="Color" value={tarot.lucky_color ?? 'Gold'} />
            <Signal label="Match" value={tarot.compatibility ?? 'Leo'} />
          </div>
        </div>
        <form className="self-end border-l border-mystic-gold/30 pl-6">
          <h2 className="font-display text-3xl text-white">{t.newsletter}</h2>
          <div className="mt-5 flex gap-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-mystic-gold"
            />
            <button className="rounded-full bg-mystic-gold px-5 py-3 font-semibold text-mystic-dark" type="submit">
              {t.subscribe}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p className="text-xs uppercase tracking-[0.25em] text-mystic-light/45">{label}</p>
      <p className="mt-3 font-display text-3xl text-white">{value}</p>
    </div>
  )
}
