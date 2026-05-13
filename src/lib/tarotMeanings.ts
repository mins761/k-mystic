import { fullTarotCards } from '@/lib/tarotAssets'
import type { ZodiacSign } from '@/types'

type TarotElement = 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit'

type MinorSuit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles'

type CardMeta = {
  tarotNumber: number
  element: TarotElement
  luckyColor: string
  compatibility: ZodiacSign
  theme: string
  action: string
  promo: string
}

const rankNumbers: Record<string, number> = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Page: 11,
  Knight: 12,
  Queen: 13,
  King: 14,
}

const suitElements: Record<MinorSuit, TarotElement> = {
  Wands: 'Fire',
  Cups: 'Water',
  Swords: 'Air',
  Pentacles: 'Earth',
}

const elementSigns: Record<TarotElement, ZodiacSign[]> = {
  Fire: ['aries', 'leo', 'sagittarius'],
  Water: ['cancer', 'scorpio', 'pisces'],
  Air: ['gemini', 'libra', 'aquarius'],
  Earth: ['taurus', 'virgo', 'capricorn'],
  Spirit: ['aquarius', 'pisces', 'sagittarius'],
}

const elementColors: Record<TarotElement, string[]> = {
  Fire: ['warm gold', 'crimson', 'amber'],
  Water: ['sea blue', 'silver', 'pearl'],
  Air: ['sky blue', 'white', 'pale yellow'],
  Earth: ['emerald', 'moss green', 'copper'],
  Spirit: ['violet', 'moon silver', 'deep indigo'],
}

const suitThemes: Record<MinorSuit, string> = {
  Wands: 'creative fire, courage, and the will to begin',
  Cups: 'feeling, connection, and the truth moving under the surface',
  Swords: 'thought, language, and the clarity that cuts through confusion',
  Pentacles: 'practical beginnings, resources, body, and real-world timing',
}

const rankThemes: Record<string, string> = {
  Ace: 'a seed moment where a new path can take form',
  Two: 'a choice point that asks for balance before motion',
  Three: 'early growth that becomes stronger through support',
  Four: 'structure, pause, and the need to protect what is stable',
  Five: 'friction that reveals what must be adjusted',
  Six: 'repair, recognition, and a kinder exchange of energy',
  Seven: 'discernment, testing, and the courage to hold your ground',
  Eight: 'movement, practice, and the momentum created by repetition',
  Nine: 'resilience, completion, and the last honest effort before release',
  Ten: 'a turning point where fulfillment or pressure reaches its limit',
  Page: 'curiosity, study, and the first message of a new lesson',
  Knight: 'pursuit, speed, and the direction your desire is taking',
  Queen: 'inner authority, care, and the mature use of that suit energy',
  King: 'mastery, responsibility, and the outer expression of power',
}

const suitActions: Record<MinorSuit, string> = {
  Wands: 'choose one brave action and give it your full attention',
  Cups: 'name the feeling before you answer it',
  Swords: 'write the clearest sentence you can about the situation',
  Pentacles: 'take one practical step that your future self can stand on',
}

const majorMeta: Record<string, CardMeta> = {
  'The Fool': makeMajor(0, 'Air', 'aquarius', 'fresh trust before the road is fully visible', 'take one light step without trying to solve the whole journey'),
  'The Magician': makeMajor(1, 'Air', 'gemini', 'focused will turning scattered tools into action', 'use what is already in your hands before searching for more'),
  'The High Priestess': makeMajor(2, 'Water', 'cancer', 'quiet intuition and the knowledge that arrives before proof', 'pause long enough to hear the first honest answer inside you'),
  'The Empress': makeMajor(3, 'Earth', 'taurus', 'growth, care, and the body asking to be included', 'nourish the thing you want to see become real'),
  'The Emperor': makeMajor(4, 'Fire', 'aries', 'structure, protection, and decisive leadership', 'make the boundary clear and then act from it'),
  'The Hierophant': makeMajor(5, 'Earth', 'taurus', 'tradition, teaching, and the wisdom of a tested path', 'ask what principle you are willing to stand by today'),
  'The Lovers': makeMajor(6, 'Air', 'gemini', 'choice, attraction, and alignment between heart and word', 'choose the option that lets your values breathe'),
  'The Chariot': makeMajor(7, 'Water', 'cancer', 'direction, self-command, and emotional momentum', 'hold the reins steady instead of chasing every impulse'),
  Strength: makeMajor(8, 'Fire', 'leo', 'soft courage, patience, and power guided by tenderness', 'respond gently without giving away your strength'),
  'The Hermit': makeMajor(9, 'Earth', 'virgo', 'solitude, refinement, and the lamp of inner guidance', 'step back and let the noise thin out before deciding'),
  'Wheel of Fortune': makeMajor(10, 'Fire', 'sagittarius', 'a turning cycle and the luck hidden inside movement', 'notice what is changing and move with the opening'),
  Justice: makeMajor(11, 'Air', 'libra', 'fairness, consequence, and the clean weight of truth', 'bring the facts back to the center of the conversation'),
  'The Hanged Man': makeMajor(12, 'Water', 'pisces', 'surrender, reversal, and the wisdom of a new angle', 'stop pushing and look at the question from the other side'),
  Death: makeMajor(13, 'Water', 'scorpio', 'ending, release, and the life that begins after clearing', 'let one finished thing be truly finished'),
  Temperance: makeMajor(14, 'Fire', 'sagittarius', 'emotional regulation, blending, and the art of right measure', 'slow the reaction down until balance can return'),
  'The Devil': makeMajor(15, 'Earth', 'capricorn', 'attachment, appetite, and the pattern that asks to be named', 'notice what has more power over you than it deserves'),
  'The Tower': makeMajor(16, 'Fire', 'aries', 'sudden truth breaking an unstable structure open', 'protect what is real and stop defending what is already cracking'),
  'The Star': makeMajor(17, 'Air', 'aquarius', 'hope, renewal, and a cleaner breath after difficulty', 'let one small act of faith restore your direction'),
  'The Moon': makeMajor(18, 'Water', 'pisces', 'dream, uncertainty, and the emotional fog around perception', 'move slowly until fear and intuition become easier to tell apart'),
  'The Sun': makeMajor(19, 'Fire', 'leo', 'clarity, joy, and the confidence that warms others too', 'let the simple truth be visible without shrinking it'),
  Judgement: makeMajor(20, 'Water', 'scorpio', 'awakening, reckoning, and the call to rise differently', 'answer the part of you that already knows it is time'),
  'The World': makeMajor(21, 'Earth', 'capricorn', 'completion, integration, and the dignity of a full cycle', 'close the loop before starting another one'),
}

export function getTarotCardMeta(cardNumber: number): CardMeta {
  const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
  const minor = parseMinor(card.name)

  if (!minor) return majorMeta[card.name] ?? majorMeta['The Fool']

  const element = suitElements[minor.suit]
  const signs = elementSigns[element]
  const colors = elementColors[element]
  const sign = signs[(minor.number - 1) % signs.length]
  const color = colors[(minor.number - 1) % colors.length]

  return {
    tarotNumber: minor.number,
    element,
    luckyColor: color,
    compatibility: sign,
    theme: `${minor.rank} of ${minor.suit} carries ${rankThemes[minor.rank]} through ${suitThemes[minor.suit]}.`,
    action: suitActions[minor.suit],
    promo: 'Check the pace of your heart today, then choose the card that answers it.',
  }
}

export function getTarotReadingBody(cardNumber: number, opener: string) {
  const card = fullTarotCards[cardNumber] ?? fullTarotCards[0]
  const meta = getTarotCardMeta(cardNumber)
  return `${card.name} ${opener}. ${meta.theme} Rather than forcing a final answer, let this card show where your attention is asking to become more honest.`
}

function parseMinor(name: string) {
  const [rank, suit] = name.split(' of ') as [string, MinorSuit | undefined]
  if (!suit || !(rank in rankNumbers) || !(suit in suitElements)) return null
  return { rank, suit, number: rankNumbers[rank] }
}

function makeMajor(
  tarotNumber: number,
  element: TarotElement,
  compatibility: ZodiacSign,
  theme: string,
  action: string,
): CardMeta {
  const colors = elementColors[element]
  return {
    tarotNumber,
    element,
    luckyColor: colors[Math.abs(tarotNumber) % colors.length],
    compatibility,
    theme: `This Major Arcana card speaks of ${theme}.`,
    action,
    promo: 'Check the pace of your heart today, then choose the card that answers it.',
  }
}
