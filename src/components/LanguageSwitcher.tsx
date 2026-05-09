'use client'

import { usePathname, useRouter } from 'next/navigation'
import { languages, languageCodes } from '@/lib/i18n'
import type { LanguageCode } from '@/types'

export default function LanguageSwitcher({ lang }: { lang: LanguageCode }) {
  const pathname = usePathname()
  const router = useRouter()

  function switchLanguage(nextLang: LanguageCode) {
    const segments = pathname.split('/').filter(Boolean)
    if (languageCodes.includes(segments[0] as LanguageCode)) {
      segments[0] = nextLang
    } else {
      segments.unshift(nextLang)
    }
    router.push(`/${segments.join('/')}`)
  }

  return (
    <label className="flex items-center gap-2 text-sm text-mystic-light/80">
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(event) => switchLanguage(event.target.value as LanguageCode)}
        className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-mystic-light outline-none backdrop-blur transition hover:border-mystic-gold/50"
      >
        {languageCodes.map((code) => (
          <option key={code} value={code} className="bg-mystic-dark text-mystic-light">
            {languages[code].flag} {languages[code].name}
          </option>
        ))}
      </select>
    </label>
  )
}
