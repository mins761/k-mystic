import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import VisitTracker from '@/components/VisitTracker'
import { isLanguage, languages } from '@/lib/i18n'
import type { LanguageCode } from '@/types'

export function generateStaticParams() {
  return Object.keys(languages).map((lang) => ({ lang }))
}

export default function LangLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { lang: string } }>) {
  if (!isLanguage(params.lang)) notFound()
  const lang = params.lang as LanguageCode

  return (
    <div className="min-h-screen bg-mystic-dark text-mystic-light">
      <Header lang={lang} />
      <VisitTracker lang={lang} />
      {children}
      <Footer lang={lang} />
    </div>
  )
}
