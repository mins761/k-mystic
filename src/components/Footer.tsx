import Link from 'next/link'
import type { LanguageCode } from '@/types'

export default function Footer({ lang }: { lang: LanguageCode }) {
  return (
    <footer className="border-t border-[#C89D3C]/15 bg-[#050510] px-5 py-8 text-xs font-light tracking-widest text-[#C89D3C]/60 uppercase">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <p>K-Mystic © {new Date().getFullYear()} • Royal Korean Tarot</p>
        <div className="flex gap-6 font-semibold">
          <Link href={`/${lang}/about`} className="hover:text-[#ffd670] transition-colors">
            About
          </Link>
          <Link href={`/${lang}/terms`} className="hover:text-[#ffd670] transition-colors">
            Terms
          </Link>
          <Link href={`/${lang}/privacy`} className="hover:text-[#ffd670] transition-colors">
            Privacy
          </Link>
          <Link href={`/${lang}/contact`} className="hover:text-[#ffd670] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
