import Link from 'next/link'
import Image from 'next/image'
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
      <section className="relative min-h-[calc(100svh-92px)] overflow-hidden px-5 py-12 md:py-24 flex items-center">
        {/* Deep starry background with dynamic aurora gradients */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(107,33,168,0.22),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(245,158,11,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark via-transparent to-mystic-dark/90" />
        <StarryBackground />
        
        <div className="relative z-10 mx-auto w-full max-w-7xl grid lg:grid-cols-[1.15fr_0.85fr] gap-16 items-center">
          {/* Left Content Column (With rising entry animation) */}
          <div className="flex flex-col justify-center animate-[choice-rise_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-mystic-gold/60" />
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-mystic-gold/90">
                {new Date().toLocaleDateString(lang, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </p>
            </div>
            
            <h1 className="mt-6 font-display text-7xl font-extrabold leading-[1.05] text-white md:text-8xl tracking-tight drop-shadow-[0_0_35px_rgba(245,158,11,0.18)]">
              K-Mystic
            </h1>
            
            <p className="mt-6 max-w-xl font-display text-2xl md:text-3.5xl font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-slate-100 leading-tight">
              {t.daily}
            </p>
            
            <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-slate-300/85 font-light tracking-wide">
              {t.intro}
            </p>
            
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={`/${lang}/tarot`}
                className="group relative rounded-full bg-gradient-to-r from-amber-400 via-mystic-gold to-amber-500 px-8 py-3.5 font-bold text-mystic-dark transition-all duration-300 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:scale-[1.03] active:scale-[0.98]"
              >
                <span className="relative z-10">{t.tarot}</span>
                <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <Link
                href={`/${lang}/horoscope`}
                className="rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-8 py-3.5 font-bold text-slate-100 transition-all duration-300 hover:border-mystic-gold/80 hover:text-amber-300 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.06)] hover:scale-[1.03] active:scale-[0.98]"
              >
                {t.exploreSigns}
              </Link>
            </div>
          </div>

          {/* Right Visual Column (Floating Traditional Tarot Card Asset with Aura Glow) */}
          <div className="relative flex justify-center lg:justify-end animate-[choice-rise_1s_cubic-bezier(0.16,1,0.3,1)_both_0.15s]">
            {/* Pulsing Aura Light in the background of the card */}
            <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_65%)] blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute -inset-12 bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-[310px] md:max-w-[340px] aspect-[1000/1745] overflow-hidden rounded-2xl border border-mystic-gold/50 shadow-[0_0_50px_rgba(245,158,11,0.25),0_0_100px_rgba(139,92,246,0.15)] group transition-all duration-500 hover:border-mystic-gold hover:shadow-[0_0_70px_rgba(245,158,11,0.45)] animate-float">
              <Image
                src="/images/korean_tarot_hero.png"
                alt="K-Mystic Traditional Korean Tarot Card"
                fill
                priority
                sizes="(max-w-7xl) 100vw, 340px"
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.05]"
              />
              {/* Gold Filigree Double Border Overlay inside the card container */}
              <div className="absolute inset-2.5 rounded-xl border border-mystic-gold/25 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-mystic-dark/50 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute -inset-px rounded-2xl border border-white/10 pointer-events-none" />
            </div>
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
