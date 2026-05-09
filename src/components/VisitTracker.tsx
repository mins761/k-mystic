'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function VisitTracker({ lang }: { lang?: string }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    const key = `k-mystic-visit:${pathname}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')

    const payload = JSON.stringify({ path: pathname, lang })
    const url = '/api/visit'

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }))
      return
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(key)
    })
  }, [lang, pathname])

  return null
}
