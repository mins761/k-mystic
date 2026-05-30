import { isLanguage } from '@/lib/i18n'
import type { LanguageCode } from '@/types'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = isLanguage(params.lang) ? params.lang : 'en'
  const titles: Record<LanguageCode, string> = {
    en: 'Contact',
    es: 'Contacto',
    ja: 'お問い合わせ',
    'zh-TW': '聯絡我們',
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
    title: 'Contact',
    intro: 'For partnerships, content questions, or privacy requests, email hello@k-mystic.vercel.app.',
    sec1Title: 'General Questions',
    sec1Desc: 'Send questions about tarot, Saju, horoscope content, language support, or site features to hello@k-mystic.vercel.app.',
    sec2Title: 'Privacy Requests',
    sec2Desc: 'If you want to request deletion of submitted reading data or subscriber information, include the email address or details needed to identify the record.',
    sec3Title: 'Corrections',
    sec3Desc: 'If you notice a broken page, unclear reading, translation issue, or accessibility problem, let us know the page URL and what happened so we can review it.',
    sec4Title: 'Response Time',
    sec4Desc: 'We review messages as soon as possible. K-Mystic does not provide emergency support, crisis counseling, or professional medical, legal, or financial services.',
  },
  es: {
    title: 'Contacto',
    intro: 'Para asociaciones, preguntas sobre contenido o solicitudes de privacidad, envíe un correo electrónico a hello@k-mystic.vercel.app.',
    sec1Title: 'Preguntas Generales',
    sec1Desc: 'Envíe preguntas sobre contenido de tarot, Saju, horóscopo, soporte de idiomas o características del sitio a hello@k-mystic.vercel.app.',
    sec2Title: 'Solicitudes de Privacidad',
    sec2Desc: 'Si desea solicitar la eliminación de los datos de lectura enviados o la información del suscriptor, incluya la dirección de correo electrónico o los detalles necesarios para identificar el registro.',
    sec3Title: 'Correcciones',
    sec3Desc: 'Si detecta una página rota, una lectura poco clara, un problema de traducción o un problema de accesibilidad, indíquenos la URL de la página y lo sucedido para que podamos revisarlo.',
    sec4Title: 'Tiempo de Respuesta',
    sec4Desc: 'Revisamos los mensajes lo antes posible. K-Mystic no brinda apoyo de emergencia, asesoramiento en crisis ni servicios médicos, legales o financieros profesionales.',
  },
  ja: {
    title: 'お問い合わせ',
    intro: '提携、コンテンツに関するご質問、またはプライバシーに関するリクエストについては、 hello@k-mystic.vercel.app までメールでお問い合わせください。',
    sec1Title: '一般的なご質問',
    sec1Desc: 'タロット、四柱推命、星占いのコンテンツ、言語サポート、またはサイト機能に関するご質問は、 hello@k-mystic.vercel.app までお送りください。',
    sec2Title: 'プライバシーに関するリクエスト',
    sec2Desc: '送信された占いデータや購読者情報の削除をリクエストする場合は、対象の記録を特定するために必要なメールアドレスや詳細情報を含めてください。',
    sec3Title: '修正・報告',
    sec3Desc: 'リンク切れのページ、不鮮明な占い結果、翻訳の問題、またはアクセシビリティの問題に気づいた場合は、調査いたしますので、対象ページのURLと状況をお知らせください。',
    sec4Title: '返信時間',
    sec4Desc: 'メッセージはできるだけ早く確認いたします。K-Mysticは、緊急サポート、危機カウンセリング、または専門的な医療、法律、財務サービスは提供していません。',
  },
  'zh-TW': {
    title: '聯絡我們',
    intro: '如有合作洽談、內容疑問或隱私權要求，請發送電子郵件至 hello@k-mystic.vercel.app。',
    sec1Title: '一般性問題',
    sec1Desc: '有關塔羅、四柱、星座內容、語言支援或網站功能的疑問，請發送至 hello@k-mystic.vercel.app。',
    sec2Title: '隱私權要求',
    sec2Desc: '如果您希望要求刪除已提交的占卜數據或訂閱者資訊，請提供識別該記錄所需的電子郵件地址或詳細資訊。',
    sec3Title: '內容修正',
    sec3Desc: '如果您發現失效頁面、不清晰的解讀、翻譯錯誤或無障礙存取問題，請告訴我們該頁面的網址及具體狀況，以便我們進行修復。',
    sec4Title: '回覆時間',
    sec4Desc: '我們會盡快審閱您的郵件。請注意，K-Mystic 不提供緊急支援、危機諮商，亦不提供專業的醫療、法律或財務服務。',
  },
}

export default function ContactPage({ params }: { params: { lang: string } }) {
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
