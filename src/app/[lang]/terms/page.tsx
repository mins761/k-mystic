import { isLanguage } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  const titles: Record<LanguageCode, string> = {
    en: 'Terms of Service',
    es: 'Términos de Servicio',
    ja: '利用規約',
    'zh-TW': '服務條款',
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
    title: 'Terms of Service',
    intro: 'Please read these terms carefully before using K-Mystic. By using our website, you agree to comply with and be bound by these terms.',
    sec1Title: 'Intellectual Property',
    sec1Desc: 'All content, tarot card designs, translations, Saju interpretation texts, and assets on K-Mystic are owned by us or licensed to us. You may not copy, redistribute, or use our material for commercial purposes without prior permission.',
    sec2Title: 'Disclaimer of Warranties',
    sec2Desc: 'K-Mystic provides entertainment and reflective spiritual content. Readings, horoscopes, and Saju analysis are generated automatically and should be used with personal discretion. We do not guarantee accuracy or suitability, and our content is not a substitute for professional legal, medical, or financial advice.',
    sec3Title: 'User Responsibilities',
    sec3Desc: 'You agree to use the site only for lawful purposes. You must not attempt to disrupt or bypass any security features or extract site data using scrapers or automated bots.',
    sec4Title: 'Changes to Terms',
    sec4Desc: 'We reserve the right to modify these terms at any time. Your continued use of the site after changes are posted constitutes acceptance of the new terms. If you have questions, contact hello@k-mystic.vercel.app.',
  },
  es: {
    title: 'Términos de Servicio',
    intro: 'Lea estos términos detenidamente antes de utilizar K-Mystic. Al utilizar nuestro sitio web, acepta cumplir y estar sujeto a estos términos.',
    sec1Title: 'Propiedad Intelectual',
    sec1Desc: 'Todo el contenido, los diseños de las cartas del tarot, las traducciones, los textos de interpretación de Saju y los activos en K-Mystic son de nuestra propiedad o están bajo nuestra licencia. No puede copiar, redistribuir ni utilizar nuestro material con fines comerciales sin permiso previo.',
    sec2Title: 'Descargo de Responsabilidad',
    sec2Desc: 'K-Mystic ofrece entretenimiento y contenido espiritual reflexivo. Las lecturas, los horóscopos y el análisis de Saju se generan automáticamente y deben utilizarse con discreción personal. No garantizamos la exactitud o la idoneidad, y nuestro contenido no sustituye el asesoramiento legal, médico o financiero profesional.',
    sec3Title: 'Responsabilidades del Usuario',
    sec3Desc: 'Acepta utilizar el sitio únicamente para fines lícitos. No debe intentar alterar o eludir ninguna función de seguridad ni extraer datos del sitio utilizando extractores o bots automatizados.',
    sec4Title: 'Cambios en los Términos',
    sec4Desc: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuo del sitio después de la publicación de los cambios constituye la aceptación de los nuevos términos. Si tiene preguntas, contáctenos en hello@k-mystic.vercel.app.',
  },
  ja: {
    title: '利用規約',
    intro: 'K-Mysticをご利用になる前に、本規約をよくお読みください。当ウェブサイトを利用することにより、本規約を遵守し、これに拘束されることに同意したものとみなされます。',
    sec1Title: '知的財産権',
    sec1Desc: 'K-Mystic上のすべてのコンテンツ、タロットカードのデザイン、翻訳、四柱推命の解釈テキスト、およびアセットは、当社が所有しているか、当社にライセンスされています。事前の許可なく、商用目的で素材を複製、再配布、または使用することはできません。',
    sec2Title: '免責事項',
    sec2Desc: 'K-Mysticは、エンターテインメントと内省を目的としたスピリチュアルなコンテンツを提供しています。タロット占い、星座占い、および四柱推命の分析は自動的に生成されるものであり、個人の裁量でご利用ください。正確性や適合性を保証するものではなく、当社のコンテンツは専門的な法律、医学、または財務上のアドバイスに代わるものではありません。',
    sec3Title: '利用者の責任',
    sec3Desc: 'お客様は、合法的な目的にのみサイトを利用することに同意します。セキュリティ機能を妨害または回避しようとしたり、スクレイパーや自動ボットを使用してサイトのデータを抽出したりしてはなりません。',
    sec4Title: '規約の変更',
    sec4Desc: '当社は、いつでも本規約を変更する権利を留保します。変更が掲載された後も引き続きサイトを利用した場合、新しい規約に同意したものとみなされます。ご質問がある場合は、 hello@k-mystic.vercel.app までご連絡ください。',
  },
  'zh-TW': {
    title: '服務條款',
    intro: '在使用 K-Mystic 之前，請仔細閱讀這些條款。使用本網站即表示您同意遵守並受這些條款的約束。',
    sec1Title: '智慧財產權',
    sec1Desc: 'K-Mystic 上的所有內容、塔羅牌設計、翻譯、四柱命理解讀文本及素材均歸我們所有或已獲得授權。未經事先許可，您不得將我們的材料複製、重新分發或用於商業用途。',
    sec2Title: '免責聲明',
    sec2Desc: 'K-Mystic 提供娛樂與反思性靈性內容。占卜解讀、星座和四柱分析均為自動生成，讀者應自行斟酌使用。我們不保證其準確性或適用性，且我們的內容不可替代專業的法律、醫療或財務建議。',
    sec3Title: '使用者責任',
    sec3Desc: '您同意僅出於合法目的使用本網站。您不得嘗試破壞或規避任何安全功能，或使用爬蟲及自動機器人提取網站數據。',
    sec4Title: '條款修改',
    sec4Desc: '我們保留隨時修改這些條款的權利。在發布修改後，您繼續使用本網站即表示接受新條款。如有任何疑問，請聯絡 hello@k-mystic.vercel.app。',
  },
}

export default function TermsPage({ params }: { params: { lang: string } }) {
  if (!isLanguage(params.lang)) notFound()
  const lang = params.lang as LanguageCode
  const t = translations[lang]

  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="font-display text-6xl text-white">{t.title}</h1>
      <p className="mt-6 text-lg leading-8 text-mystic-light/74">
        {t.intro}
      </p>
      <div className="mt-10 space-y-8">
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
