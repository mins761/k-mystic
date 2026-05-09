import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import { headers } from 'next/headers'
import AdBanner from '@/components/AdBanner'
import HoroscopeCard from '@/components/HoroscopeCard'
import RandomTarotReading from '@/components/RandomTarotReading'
import StarryBackground from '@/components/StarryBackground'
import { dictionary, isLanguage, zodiacSigns } from '@/lib/i18n'
import type { LanguageCode } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  return {
    title: dictionary[lang].daily,
    description: dictionary[lang].intro,
  }
}

export default async function HomePage({ params }: { params: { lang: LanguageCode } }) {
  noStore()
  headers()
  const lang = params.lang
  const t = dictionary[lang]

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

      <RandomTarotReading
        lang={lang}
        todayTarot={t.todayTarot}
        readFull={t.readFull}
        lucky={t.lucky}
        newsletter={t.newsletter}
        subscribe={t.subscribe}
      />

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

      <section className="relative overflow-hidden px-5 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,rgba(34,197,94,0.16),transparent_28%),radial-gradient(circle_at_78%_36%,rgba(245,158,11,0.18),transparent_24%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 border-y border-mystic-gold/25 py-12 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-mystic-gold">Korean Saju</p>
            <h2 className="mt-3 font-display text-5xl text-white">Discover Your Korean Destiny</h2>
            <p className="mt-4 max-w-xl leading-8 text-mystic-light/70">
              Enter your birth date and open a Four Pillars reading shaped by Korean astrology.
            </p>
          </div>
          <form action={`/${lang}/saju`} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input
              name="year"
              type="number"
              min="1900"
              max="2100"
              placeholder="Year"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-mystic-gold"
            />
            <input
              name="month"
              type="number"
              min="1"
              max="12"
              placeholder="Month"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-mystic-gold"
            />
            <input
              name="day"
              type="number"
              min="1"
              max="31"
              placeholder="Day"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-mystic-gold"
            />
            <button className="rounded-full bg-mystic-gold px-5 py-3 font-semibold text-mystic-dark" type="submit">
              Get Free Reading
            </button>
          </form>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/24 via-mystic-purple/22 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 border-y border-pink-300/25 py-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-pink-200">Love Tarot</p>
            <h2 className="mt-3 font-display text-5xl text-white">Find Your Love Fortune</h2>
            <p className="mt-4 max-w-xl leading-8 text-mystic-light/70">
              Draw three cards for your heart, their feelings, and the direction love wants to take.
            </p>
          </div>
          <Link
            href={`/${lang}/love`}
            className="w-fit rounded-full bg-pink-400 px-7 py-3 font-semibold text-mystic-dark transition hover:bg-pink-300"
          >
            Start Love Reading
          </Link>
        </div>
      </section>

      <div className="py-12">
        <AdBanner />
      </div>

    </main>
  )
}
