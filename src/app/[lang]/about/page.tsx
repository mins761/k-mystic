export const metadata = { title: 'About K-Mystic' }

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-6xl text-white">About K-Mystic</h1>
      <p className="mt-6 text-lg leading-8 text-mystic-light/74">
        K-Mystic blends Korean mystic mood, tarot symbolism, and zodiac storytelling into daily readings for a global
        audience.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">What We Offer</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            The site includes daily tarot, full-deck tarot spreads, zodiac guidance, Korean Saju readings, compatibility
            tools, and love tarot. Each feature is designed as a reflective experience that helps visitors slow down,
            name what they are feeling, and choose a practical next step.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Our Approach</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            K-Mystic treats divination as symbolic guidance, not certainty. Readings are written to be warm, grounded,
            and useful, with clear reminders that spiritual content should not replace professional medical, legal, or
            financial advice.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Languages</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            The experience supports English, Spanish, Japanese, and Traditional Chinese pages so more visitors can use
            the readings in a language that feels natural to them.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Contact</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            For content questions, privacy requests, partnerships, or technical issues, contact us at
            hello@k-mystic.vercel.app.
          </p>
        </section>
      </div>
    </main>
  )
}
