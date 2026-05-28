import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdBanner from '@/components/AdBanner'
import HoroscopeCard from '@/components/HoroscopeCard'
import ReadingSections from '@/components/ReadingSections'
import { getHoroscope, titleCase } from '@/lib/fortune'
import { zodiacBg } from '@/lib/images'
import { zodiacSigns, zodiacSymbols } from '@/lib/i18n'
import type { LanguageCode, ZodiacSign } from '@/types'

export function generateStaticParams() {
  return zodiacSigns.flatMap((sign) => ['en', 'es', 'ja', 'zh-TW'].map((lang) => ({ lang, sign })))
}

export async function generateMetadata({ params }: { params: { sign: string } }) {
  return {
    title: `${titleCase(params.sign)} Horoscope`,
    description: `Daily horoscope for ${titleCase(params.sign)}.`,
  }
}

export default async function SignPage({ params }: { params: { lang: LanguageCode; sign: string } }) {
  if (!zodiacSigns.includes(params.sign as ZodiacSign)) notFound()
  const sign = params.sign as ZodiacSign
  const fortune = await getHoroscope(params.lang, sign)
  const related = zodiacSigns.filter((item) => item !== sign).slice(0, 3)

  return (
    <main>
      <section className="relative overflow-hidden px-5 py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${zodiacBg[sign]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mystic-dark via-mystic-dark/82 to-mystic-dark/30" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-7xl text-mystic-gold">{zodiacSymbols[sign]}</p>
          <h1 className="mt-5 font-display text-7xl text-white">{titleCase(sign)}</h1>
          <p className="mt-3 text-mystic-light/65">{new Date().toLocaleDateString()}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14">
        <article className="max-w-3xl">
          <h2 className="font-display text-4xl text-white">{fortune.title}</h2>
          <ReadingSections body={fortune.body} borderColor="border-mystic-purple/20" />
        </article>
        <dl className="mt-10 grid gap-5 sm:grid-cols-3">
          <Fact label="Lucky Number" value={String(fortune.lucky_number ?? 3)} />
          <Fact label="Lucky Color" value={fortune.lucky_color ?? 'Purple'} />
          <Fact label="Compatibility" value={fortune.compatibility ?? 'Scorpio'} />
        </dl>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-4">
          {['Love', 'Career', 'Money', 'Health'].map((category) => (
            <div key={category} className="border-t border-mystic-gold/30 pt-4">
              <h3 className="font-display text-2xl text-white">{category}</h3>
              <p className="mt-3 leading-7 text-mystic-light/68">
                Let the day unfold with one clear intention and one honest conversation.
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="py-12">
        <AdBanner />
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <h2 className="font-display text-4xl text-white">Related signs</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {related.map((item) => (
            <HoroscopeCard key={item} lang={params.lang} sign={item} />
          ))}
        </div>
        <Link className="mt-8 inline-flex text-mystic-gold" href={`/${params.lang}/horoscope`}>
          All signs
        </Link>
      </section>
    </main>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <dt className="text-xs uppercase tracking-[0.22em] text-mystic-light/45">{label}</dt>
      <dd className="mt-3 font-display text-2xl text-white">{value}</dd>
    </div>
  )
}
