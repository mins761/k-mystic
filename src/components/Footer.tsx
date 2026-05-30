import Link from 'next/link'
import type { LanguageCode } from '@/types'

export default function Footer({ lang }: { lang: LanguageCode }) {
  return (
    <footer className="border-t border-white/10 bg-mystic-dark px-5 py-10 text-sm text-mystic-light/60">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <p>K-Mystic © {new Date().getFullYear()}</p>
        <div className="flex gap-5">
          <Link href={`/${lang}/about`} className="hover:text-mystic-gold">
            About
          </Link>
          <Link href={`/${lang}/terms`} className="hover:text-mystic-gold">
            Terms
          </Link>
          <Link href={`/${lang}/privacy`} className="hover:text-mystic-gold">
            Privacy
          </Link>
          <Link href={`/${lang}/contact`} className="hover:text-mystic-gold">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
