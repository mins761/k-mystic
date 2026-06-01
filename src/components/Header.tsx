import Link from 'next/link'
import { dictionary } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header({ lang }: { lang: LanguageCode }) {
  const t = dictionary[lang]

  return (
    <header className="sticky top-0 z-50 border-b border-[#C89D3C]/20 bg-mystic-dark/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link href={`/${lang}`} className="group flex flex-col items-start leading-none">
          <span className="font-display text-xl font-bold tracking-[0.15em] text-gold-gradient uppercase drop-shadow-[0_0_8px_rgba(200,157,60,0.25)]">
            K-Mystic
          </span>
          <span className="mt-1 text-[0.62rem] font-semibold tracking-[0.25em] text-[#C89D3C]/80 uppercase">
            Royal Korean Tarot
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-2 text-sm">
          {[
            [t.tarot || 'Tarot', 'tarot'],
            [t.saju || 'Saju', 'saju'],
            [t.compatibility || 'Compatibility', 'compatibility'],
            ['Daily Fortune', ''],
            ['Zodiac', 'horoscope'],
            ['About', 'about'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={`/${lang}/${href}`}
              className="px-3.5 py-1.5 font-display text-[0.7rem] font-bold tracking-[0.2em] text-slate-300 uppercase transition hover:text-[#e2c974]"
            >
              {label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher lang={lang} />
          <Link
            href={`/${lang}/tarot`}
            className="rounded-sm bg-gradient-to-r from-amber-400 via-mystic-gold to-amber-500 px-5 py-2 text-[0.68rem] font-bold tracking-[0.15em] text-mystic-dark transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-[1.02]"
          >
            START READING
          </Link>
        </div>
      </div>
    </header>
  )
}
