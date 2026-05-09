import Link from 'next/link'
import { dictionary } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header({ lang }: { lang: LanguageCode }) {
  const t = dictionary[lang]

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-mystic-dark/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href={`/${lang}`} className="group">
          <span className="block font-display text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-mystic-gold via-mystic-pink to-mystic-glow">
            K-Mystic
          </span>
          <span className="text-xs text-mystic-light/62">{t.tagline}</span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-mystic-light/78">
          {[
            [t.tarot, 'tarot'],
            [t.horoscope, 'horoscope'],
            [t.saju, 'saju'],
            [t.love, 'love'],
            [t.compatibility, 'compatibility'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={`/${lang}/${href}`}
              className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-mystic-gold"
            >
              {label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher lang={lang} />
      </div>
    </header>
  )
}
