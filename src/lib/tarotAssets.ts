import { tarotCards } from '@/lib/i18n'

const majorSlugs = tarotCards.map((card) => slugCard(card.name))

export const tarotBacks = {
  classic: '/images/tarot/backs/classic-back.png',
  gold: '/images/tarot/backs/gold-back.png',
}

export const specialTarotCards = [
  {
    name: 'The Golden Sun',
    front: '/images/tarot/special/the-golden-sun.png',
    back: tarotBacks.gold,
  },
  {
    name: 'The Treasure',
    front: '/images/tarot/special/the-treasure.png',
    back: tarotBacks.gold,
  },
  {
    name: 'The Fortune',
    front: '/images/tarot/special/the-fortune.png',
    back: tarotBacks.gold,
  },
  {
    name: 'The Divine Light',
    front: '/images/tarot/special/the-divine-light.png',
    back: tarotBacks.gold,
  },
]

export function tarotCardImage(number: number, name?: string) {
  const slug = majorSlugs[number] ?? slugCard(name || `card-${number}`)
  return `/images/tarot/cards/${String(number).padStart(2, '0')}-${slug}.png`
}

function slugCard(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
