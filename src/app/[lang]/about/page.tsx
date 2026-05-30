import { isLanguage } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  const titles: Record<LanguageCode, string> = {
    en: 'About K-Mystic',
    es: 'Acerca de K-Mystic',
    ja: 'K-Mystic について',
    'zh-TW': '關於 K-Mystic',
  }
  return {
    title: titles[lang],
  }
}

const translations: Record<LanguageCode, {
  title: string
  intro: string
  sec1Title: string
  sec1Desc: string
  sec2Title: string
  sec2Desc: string
  sec3Title: string
  sec3Desc: string
  sec4Title: string
  sec4Desc: string
}> = {
  en: {
    title: 'About K-Mystic',
    intro: 'K-Mystic blends Korean mystic mood, tarot symbolism, and zodiac storytelling into daily readings for a global audience.',
    sec1Title: 'What We Offer',
    sec1Desc: 'The site includes daily tarot, full-deck tarot spreads, zodiac guidance, Korean Saju readings, compatibility tools, and love tarot. Each feature is designed as a reflective experience that helps visitors slow down, name what they are feeling, and choose a practical next step.',
    sec2Title: 'Our Approach',
    sec2Desc: 'K-Mystic treats divination as symbolic guidance, not certainty. Readings are written to be warm, grounded, and useful, with clear reminders that spiritual content should not replace professional medical, legal, or financial advice.',
    sec3Title: 'Languages',
    sec3Desc: 'The experience supports English, Spanish, Japanese, and Traditional Chinese pages so more visitors can use the readings in a language that feels natural to them.',
    sec4Title: 'Contact',
    sec4Desc: 'For content questions, privacy requests, partnerships, or technical issues, contact us at hello@k-mystic.vercel.app.',
  },
  es: {
    title: 'Acerca de K-Mystic',
    intro: 'K-Mystic combina la atmósfera mística coreana, el simbolismo del tarot y la narración del zodíaco en lecturas diarias para una audiencia global.',
    sec1Title: 'Lo que Ofrecemos',
    sec1Desc: 'El sitio incluye tarot diario, tiradas de tarot de baraja completa, guía del zodíaco, lecturas de Saju coreano, herramientas de compatibilidad y tarot del amor. Cada función está diseñada como una experiencia reflexiva que ayuda a los visitantes a calmarse, identificar lo que sienten y elegir un paso práctico.',
    sec2Title: 'Nuestro Enfoque',
    sec2Desc: 'K-Mystic trata la adivinación como una guía simbólica, no como una certeza. Las lecturas están escritas para ser cálidas, fundamentadas y útiles, con recordatorios claros de que el contenido espiritual no debe reemplazar el consejo médico, legal o financiero profesional.',
    sec3Title: 'Idiomas',
    sec3Desc: 'La experiencia es compatible con páginas en inglés, español, japonés y chino tradicional para que más visitantes puedan usar las lecturas en el idioma que les resulte natural.',
    sec4Title: 'Contacto',
    sec4Desc: 'Para preguntas sobre contenido, solicitudes de privacidad, asociaciones o problemas técnicos, contáctenos en hello@k-mystic.vercel.app.',
  },
  ja: {
    title: 'K-Mystic について',
    intro: 'K-Mysticは、韓国の神秘的な雰囲気、タロットの象徴性、そして星座のストーリーテリングを融合させ、世界中の人々に毎日の占いをお届けします。',
    sec1Title: '提供するサービス',
    sec1Desc: '当サイトでは、毎日のタロット占い、フルデッキスプレッド、星座占い、韓国の四柱推命（Saju）、相性診断、恋愛タロットなどを提供しています。それぞれの機能は、利用者が心を落ち着かせ、自分の感情を見つめ直し、実用的な次の一歩を踏み出すのを手助けする内省ツールとして設計されています。',
    sec2Title: 'アプローチ',
    sec2Desc: 'K-Mysticは占いを絶対的な未来予測ではなく、象徴的な指針として扱います。占いの結果は、温かく、現実的で、役立つものとなるよう執筆されています。また、スピリチュアルなコンテンツは専門的な医療、法律、財務上のアドバイスに代わるものではないという明確なリマインダーも含めています。',
    sec3Title: '対応言語',
    sec3Desc: '英語、スペイン語、日本語、繁體中文（台湾）に対応しており、多くの訪問者が自分にとって自然に感じられる言語で占いを利用できるようになっています。',
    sec4Title: 'お問い合わせ',
    sec4Desc: 'コンテンツに関する質問、プライバシーに関するリクエスト、提携、または技術的な問題については、 hello@k-mystic.vercel.app までご連絡ください。',
  },
  'zh-TW': {
    title: '關於 K-Mystic',
    intro: 'K-Mystic 將韓式神秘學氛圍、塔羅象徵意義與星座故事融入每日占卜中，為全球讀者提供指引。',
    sec1Title: '我們提供的內容',
    sec1Desc: '本網站提供每日塔羅、完整牌組塔羅解讀、星座指引、韓式四柱命理（Saju）、速配工具以及愛情塔羅。每個功能都旨在為讀者提供反思體驗，幫助其慢下腳步、理清感受，並做出務實的下一步選擇。',
    sec2Title: '我們的理念',
    sec2Desc: 'K-Mystic 將占卜視為象徵性的指引，而非絕對的定論。所有的解讀內容溫和、務實且有益，並明確提示讀者，靈性內容不應取代專業的醫療、法律或財務建議。',
    sec3Title: '支援語言',
    sec3Desc: '我們的服務支援英文、西班牙文、日文和繁體中文，讓更多讀者可以使用自己最熟悉的語言閱讀占卜內容。',
    sec4Title: '聯絡我們',
    sec4Desc: '如有內容疑問、隱私權要求、合作洽談或技術問題，請透過電子郵件與我們聯絡：hello@k-mystic.vercel.app。',
  },
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  if (!isLanguage(params.lang)) notFound()
  const lang = params.lang as LanguageCode
  const t = translations[lang]

  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-6xl text-white">{t.title}</h1>
      <p className="mt-6 text-lg leading-8 text-mystic-light/74">
        {t.intro}
      </p>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">{t.sec1Title}</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            {t.sec1Desc}
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">{t.sec2Title}</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            {t.sec2Desc}
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">{t.sec3Title}</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            {t.sec3Desc}
          </p>
        </section>
        <section className="border-t border-white/12 pt-5">
          <h2 className="font-display text-3xl text-white">{t.sec4Title}</h2>
          <p className="mt-3 leading-8 text-mystic-light/72">
            {t.sec4Desc}
          </p>
        </section>
      </div>
    </main>
  )
}
