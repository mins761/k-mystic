import FullDeckTarot from '@/components/FullDeckTarot'
import { unstable_noStore as noStore } from 'next/cache'
import type { LanguageCode } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Full Deck Tarot',
  description: 'Choose a tarot spread using the full 78-card K-Mystic deck.',
}

export default function TarotPage({ params }: { params: { lang: LanguageCode } }) {
  noStore()
  return <FullDeckTarot lang={params.lang} />
}
