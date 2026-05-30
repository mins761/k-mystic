import { isLanguage } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  const titles: Record<LanguageCode, string> = {
    en: 'Privacy Policy',
    es: 'Política de Privacidad',
    ja: '個人情報保護方針',
    'zh-TW': '隱私權政策',
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
    title: 'Privacy Policy',
    intro: 'We collect only the information needed to provide readings, analytics, and advertising. You may contact us to request deletion of subscriber data.',
    sec1Title: 'Information You Provide',
    sec1Desc: 'When you use a reading tool, you may enter birth date, birth hour, gender, name, email address, or selected tarot cards. This information is used to generate the requested reading and improve the site experience.',
    sec2Title: 'Analytics And Advertising',
    sec2Desc: 'We use Google AdSense to serve ads on our site. Google and third-party partners use cookies to serve personalized ads based on your visits to this website and other websites on the internet. You may opt out of personalized advertising by visiting Google Ad Settings (https://www.google.com/settings/ads) or www.aboutads.info.',
    sec3Title: 'Data Retention',
    sec3Desc: 'Reading data may be stored to support service quality and troubleshooting. We avoid collecting sensitive information that is not needed for the reading. You can request deletion by emailing hello@k-mystic.vercel.app.',
    sec4Title: 'Important Note',
    sec4Desc: 'K-Mystic provides entertainment and reflective spiritual content. Readings should not be used as a substitute for professional medical, legal, financial, or mental health advice.',
  },
  es: {
    title: 'Política de Privacidad',
    intro: 'Solo recopilamos la información necesaria para proporcionar lecturas, análisis y publicidad. Puede ponerse en contacto con nosotros para solicitar la eliminación de los datos de los suscriptores.',
    sec1Title: 'Información que Proporciona',
    sec1Desc: 'Al usar una herramienta de lectura, puede ingresar la fecha de nacimiento, la hora de nacimiento, el género, el nombre, la dirección de correo electrónico o las cartas del tarot seleccionadas. Esta información se utiliza para generar la lectura solicitada y mejorar la experiencia del sitio.',
    sec2Title: 'Análisis y Publicidad',
    sec2Desc: 'Utilizamos Google AdSense para mostrar anuncios en nuestro sitio. Google y sus socios externos utilizan cookies para mostrar anuncios personalizados basados en sus visitas a este y otros sitios web en internet. Puede inhabilitar los anuncios personalizados visitando la Configuración de anuncios de Google (https://www.google.com/settings/ads) o www.aboutads.info.',
    sec3Title: 'Retención de Datos',
    sec3Desc: 'Los datos de la lectura pueden almacenarse para respaldar la calidad del servicio y la resolución de problemas. Evitamos recopilar información confidencial que no sea necesaria para la lectura. Puede solicitar la eliminación enviando un correo electrónico a hello@k-mystic.vercel.app.',
    sec4Title: 'Nota Importante',
    sec4Desc: 'K-Mystic proporciona entretenimiento y contenido espiritual reflexivo. Las lecturas no deben utilizarse como sustituto de un asesoramiento médico, legal, financiero o de salud mental profesional.',
  },
  ja: {
    title: '個人情報保護方針',
    intro: '当サイトでは、占い結果の提供、アクセス解析、広告配信に必要な情報のみを収集します。購読者データの削除を要求するには、当社に連絡してください。',
    sec1Title: '提供される情報',
    sec1Desc: '占いツールを使用する際、生年月日、出生時間、性別、名前、メールアドレス、選択されたタロットカードを入力することがあります。この情報は、占い結果の生成およびサイト体験の向上のみに使用されます。',
    sec2Title: 'アクセス解析と広告配信',
    sec2Desc: '当サイトはGoogle AdSenseを使用して広告を掲載しています。Googleおよびサードパーティパートナーは、クッキー（Cookie）を使用して、ユーザーが当サイトや他のウェブサイトにアクセスした情報に基づき、パーソナライズ広告を配信します。ユーザーはGoogleの広告設定（https://www.google.com/settings/ads）または www.aboutads.info にアクセスして、パーソナライズ広告を無効にできます。',
    sec3Title: 'データ保持',
    sec3Desc: 'サービスの品質向上とトラブルシューティングのために、占いデータが保存される場合があります。当サイトでは、占いに必要のない機密情報の収集を避けています。削除の依頼は hello@k-mystic.vercel.app までメールでご連絡ください。',
    sec4Title: '重要な注意点',
    sec4Desc: 'K-Mysticはエンターテインメントと内省を目的としたスピリチュアルなコンテンツを提供しています。占い結果は、専門的な医学、法律、財務、またはメンタルヘルスに関するアドバイスの代わりとして使用しないでください。',
  },
  'zh-TW': {
    title: '隱私權政策',
    intro: '我們僅收集提供占卜、數據分析和廣告所需的必要資訊。您可以與我們聯繫以請求刪除訂閱者資料。',
    sec1Title: '您提供的資訊',
    sec1Desc: '當您使用占卜工具時，可能會輸入出生日期、出生時間、性別、姓名、電子郵件地址或選擇的塔羅牌。這些資訊僅用於生成您請求的占卜結果並改善網站體驗。',
    sec2Title: '數據分析與廣告',
    sec2Desc: '我們使用 Google AdSense 在我們的網站上投放廣告。Google 和第三方合作夥伴使用 Cookie，根據您訪問此網站及網際網路其他網站的記錄來投放個人化廣告。您可以透過訪問 Google 廣告設定（https://www.google.com/settings/ads）或 www.aboutads.info 來停用個人化廣告。',
    sec3Title: '資料保留',
    sec3Desc: '占卜數據可能會被存儲以維持服務品質與故障排除。我們避免收集占卜不需要的敏感資訊。您可以發送電子郵件至 hello@k-mystic.vercel.app 請求刪除資料。',
    sec4Title: '重要聲明',
    sec4Desc: 'K-Mystic 提供娛樂與反思性靈性內容。占卜解讀不應替代專業的醫療、法律、財務或心理諮商建議。',
  },
}

export default function PrivacyPage({ params }: { params: { lang: string } }) {
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
