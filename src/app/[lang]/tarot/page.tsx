import FullDeckTarot from '@/components/FullDeckTarot'
import type { LanguageCode } from '@/types'

export const metadata = {
  title: 'Full Deck Tarot',
  description: 'Choose a tarot spread using the full 78-card K-Mystic deck.',
}

export default function TarotPage({ params }: { params: { lang: LanguageCode } }) {
  return <FullDeckTarot lang={params.lang} />
}
