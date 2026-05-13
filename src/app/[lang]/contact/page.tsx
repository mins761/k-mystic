export const metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-6xl text-white">Contact</h1>
      <p className="mt-6 text-lg leading-8 text-mystic-light/74">
        For partnerships, content questions, or privacy requests, email hello@k-mystic.vercel.app.
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">General Questions</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            Send questions about tarot, Saju, horoscope content, language support, or site features to
            hello@k-mystic.vercel.app.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Privacy Requests</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            If you want to request deletion of submitted reading data or subscriber information, include the email
            address or details needed to identify the record.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Corrections</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            If you notice a broken page, unclear reading, translation issue, or accessibility problem, let us know the
            page URL and what happened so we can review it.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Response Time</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            We review messages as soon as possible. K-Mystic does not provide emergency support, crisis counseling, or
            professional medical, legal, or financial services.
          </p>
        </section>
      </div>
    </main>
  )
}
