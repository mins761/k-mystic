export const fullTarotCards = [
  { number: 0, name: 'The Fool' },
  { number: 1, name: 'The Magician' },
  { number: 2, name: 'The High Priestess' },
  { number: 3, name: 'The Empress' },
  { number: 4, name: 'The Emperor' },
  { number: 5, name: 'The Hierophant' },
  { number: 6, name: 'The Lovers' },
  { number: 7, name: 'The Chariot' },
  { number: 8, name: 'Strength' },
  { number: 9, name: 'The Hermit' },
  { number: 10, name: 'Wheel of Fortune' },
  { number: 11, name: 'Justice' },
  { number: 12, name: 'The Hanged Man' },
  { number: 13, name: 'Death' },
  { number: 14, name: 'Temperance' },
  { number: 15, name: 'The Devil' },
  { number: 16, name: 'The Tower' },
  { number: 17, name: 'The Star' },
  { number: 18, name: 'The Moon' },
  { number: 19, name: 'The Sun' },
  { number: 20, name: 'Judgement' },
  { number: 21, name: 'The World' },
  { number: 22, name: 'Ace of Wands' },
  { number: 23, name: 'Two of Wands' },
  { number: 24, name: 'Three of Wands' },
  { number: 25, name: 'Four of Wands' },
  { number: 26, name: 'Five of Wands' },
  { number: 27, name: 'Six of Wands' },
  { number: 28, name: 'Seven of Wands' },
  { number: 29, name: 'Eight of Wands' },
  { number: 30, name: 'Nine of Wands' },
  { number: 31, name: 'Ten of Wands' },
  { number: 32, name: 'Page of Wands' },
  { number: 33, name: 'Knight of Wands' },
  { number: 34, name: 'Queen of Wands' },
  { number: 35, name: 'King of Wands' },
  { number: 36, name: 'Ace of Cups' },
  { number: 37, name: 'Two of Cups' },
  { number: 38, name: 'Three of Cups' },
  { number: 39, name: 'Four of Cups' },
  { number: 40, name: 'Five of Cups' },
  { number: 41, name: 'Six of Cups' },
  { number: 42, name: 'Seven of Cups' },
  { number: 43, name: 'Eight of Cups' },
  { number: 44, name: 'Nine of Cups' },
  { number: 45, name: 'Ten of Cups' },
  { number: 46, name: 'Page of Cups' },
  { number: 47, name: 'Knight of Cups' },
  { number: 48, name: 'Queen of Cups' },
  { number: 49, name: 'King of Cups' },
  { number: 50, name: 'Ace of Swords' },
  { number: 51, name: 'Two of Swords' },
  { number: 52, name: 'Three of Swords' },
  { number: 53, name: 'Four of Swords' },
  { number: 54, name: 'Five of Swords' },
  { number: 55, name: 'Six of Swords' },
  { number: 56, name: 'Seven of Swords' },
  { number: 57, name: 'Eight of Swords' },
  { number: 58, name: 'Nine of Swords' },
  { number: 59, name: 'Ten of Swords' },
  { number: 60, name: 'Page of Swords' },
  { number: 61, name: 'Knight of Swords' },
  { number: 62, name: 'Queen of Swords' },
  { number: 63, name: 'King of Swords' },
  { number: 64, name: 'Ace of Pentacles' },
  { number: 65, name: 'Two of Pentacles' },
  { number: 66, name: 'Three of Pentacles' },
  { number: 67, name: 'Four of Pentacles' },
  { number: 68, name: 'Five of Pentacles' },
  { number: 69, name: 'Six of Pentacles' },
  { number: 70, name: 'Seven of Pentacles' },
  { number: 71, name: 'Eight of Pentacles' },
  { number: 72, name: 'Nine of Pentacles' },
  { number: 73, name: 'Ten of Pentacles' },
  { number: 74, name: 'Page of Pentacles' },
  { number: 75, name: 'Knight of Pentacles' },
  { number: 76, name: 'Queen of Pentacles' },
  { number: 77, name: 'King of Pentacles' },
] as const

const tarotSlugs = fullTarotCards.map((card) => slugCard(card.name))

export function getDeckPath() {
  // 클라이언트 브라우저 환경에서 ?deck=deck0 또는 ?deck=deck1 쿼리 감지 시 강제 적용 (디버그 모드)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const forcedDeck = params.get('deck')
    if (forcedDeck === 'deck0' || forcedDeck === 'deck1') {
      return `/images/tarot/${forcedDeck}`
    }
  }

  const epoch = new Date('2026-01-05T00:00:00Z').getTime() // A Monday in 2026
  const now = Date.now()
  const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000
  const elapsedWeeks = Math.floor((now - epoch) / millisecondsInWeek)
  
  // NOTE: deck1 리소스의 이미지 매핑 오류 및 뒷면 해골 버그가 있으므로
  // 안정적인 카드 덱을 위해 항상 'deck0'을 사용하도록 임시 고정합니다.
  const deckIndex = 'deck0'
  return `/images/tarot/${deckIndex}`
}

export const tarotBacks = {
  get classic() {
    return `${getDeckPath()}/backs/classic-back.png`
  },
  get gold() {
    return `${getDeckPath()}/backs/gold-back.png`
  },
  get moon() {
    return `${getDeckPath()}/backs/moon-back.png`
  },
}

export const specialTarotCards = [
  {
    name: 'The Golden Sun',
    get front() { return `${getDeckPath()}/special/the-golden-sun.png` },
    get back() { return tarotBacks.gold },
  },
  {
    name: 'The Treasure',
    get front() { return `${getDeckPath()}/special/the-treasure.png` },
    get back() { return tarotBacks.gold },
  },
  {
    name: 'The Fortune',
    get front() { return `${getDeckPath()}/special/the-fortune.png` },
    get back() { return tarotBacks.gold },
  },
  {
    name: 'The Divine Light',
    get front() { return `${getDeckPath()}/special/the-divine-light.png` },
    get back() { return tarotBacks.gold },
  },
]

export function tarotCardImage(number: number, name?: string) {
  const slug = tarotSlugs[number] ?? slugCard(name || `card-${number}`)
  return `${getDeckPath()}/cards/${String(number).padStart(2, '0')}-${slug}.png`
}

function slugCard(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

