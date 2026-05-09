import Link from 'next/link'
import { zodiacBg } from '@/lib/images'
import { zodiacSymbols } from '@/lib/i18n'
import { titleCase } from '@/lib/fortune'
import type { LanguageCode, ZodiacSign } from '@/types'

export default function HoroscopeCard({ lang, sign }: { lang: LanguageCode; sign: ZodiacSign }) {
  return (
    <Link
      href={`/${lang}/horoscope/${sign}`}
      className="group relative isolate min-h-36 overflow-hidden rounded-lg border border-white/10 p-4 transition duration-300 hover:-translate-y-1 hover:border-mystic-gold/60 hover:shadow-glow"
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-45 transition duration-300 group-hover:scale-105 group-hover:opacity-65"
        style={{ backgroundImage: `url(${zodiacBg[sign]})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-mystic-dark via-mystic-dark/72 to-mystic-dark/20" />
      <span className="text-4xl text-mystic-gold">{zodiacSymbols[sign]}</span>
      <h3 className="mt-6 font-display text-xl text-white">{titleCase(sign)}</h3>
    </Link>
  )
}
