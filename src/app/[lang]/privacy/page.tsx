export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-6xl text-white">Privacy Policy</h1>
      <p className="mt-6 text-lg leading-8 text-mystic-light/74">
        We collect only the information needed to provide readings, subscriptions, analytics, and advertising. You may
        contact us to request deletion of subscriber data.
      </p>
      <div className="mt-10 space-y-8">
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Information You Provide</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            When you use a reading tool, you may enter birth date, birth hour, gender, name, email address, or selected
            tarot cards. This information is used to generate the requested reading and improve the site experience.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Analytics And Advertising</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            We may collect basic visit information such as page path, language, browser, referrer, and approximate
            timing. If advertising is enabled, third-party partners may use cookies or similar technologies to show and
            measure ads according to their own policies.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Data Retention</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            Reading data may be stored to support service quality and troubleshooting. We avoid collecting sensitive
            information that is not needed for the reading. You can request deletion by emailing
            hello@k-mystic.vercel.app.
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">Important Note</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            K-Mystic provides entertainment and reflective spiritual content. Readings should not be used as a substitute
            for professional medical, legal, financial, or mental health advice.
          </p>
        </section>
      </div>
    </main>
  )
}
