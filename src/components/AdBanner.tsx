export default function AdBanner() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

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

  return (
    <aside
      className="mx-auto flex min-h-24 max-w-5xl items-center justify-center border-y border-white/10 bg-white/[0.03] px-6 py-6 text-center text-xs uppercase tracking-[0.32em] text-mystic-light/38"
      aria-label="Advertisement"
    >
      Sponsored space
    </aside>
  )
}
