import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://k-mystic.vercel.app'),
  title: {
    default: 'K-Mystic',
    template: '%s | K-Mystic',
  },
  description: 'Daily Korean tarot, horoscope, and compatibility readings in multiple languages.',
  openGraph: {
    title: 'K-Mystic',
    description: 'Daily Korean tarot and horoscope readings.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

  return (
    <html lang="en">
      <head>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${display.variable} ${body.variable} font-body antialiased`}>{children}</body>
    </html>
  )
}
