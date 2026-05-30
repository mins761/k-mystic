'use client'

import { useEffect, useState } from 'react'

interface AdBannerProps {
  adSlot?: string
  adFormat?: string
  responsive?: string
  style?: React.CSSProperties
}

export default function AdBanner({
  adSlot = 'default',
  adFormat = 'auto',
  responsive = 'true',
  style = { display: 'block', width: '100%' },
}: AdBannerProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded && publisherId) {
      try {
        const adsbygoogle = (window as any).adsbygoogle || []
        adsbygoogle.push({})
      } catch (err) {
        console.error('AdSense push error:', err)
      }
    }
  }, [isLoaded, publisherId])

  if (!publisherId) {
    return (
      <aside className="mx-auto max-w-5xl border-y border-mystic-gold/20 px-6 py-8">
        <p className="text-xs uppercase tracking-[0.28em] text-mystic-gold">K-Mystic Guide</p>
        <h2 className="mt-3 font-display text-3xl text-white">Read with intention, not fear.</h2>
        <p className="mt-3 max-w-3xl leading-7 text-mystic-light/70">
          Tarot, horoscope, and Saju readings work best as reflective tools. Use each message to notice patterns,
          choose one practical next step, and return later when the day has changed.
        </p>
      </aside>
    )
  }

  if (!isLoaded) {
    return (
      <aside
        className="mx-auto flex min-h-24 max-w-5xl items-center justify-center border-y border-white/10 bg-white/[0.03] px-6 py-6 text-center text-xs uppercase tracking-[0.32em] text-mystic-light/38"
        aria-label="Advertisement"
      >
        Loading Advertisement...
      </aside>
    )
  }

  return (
    <aside className="mx-auto my-6 flex justify-center overflow-hidden" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive}
      />
    </aside>
  )
}
