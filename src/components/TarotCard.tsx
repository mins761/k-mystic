'use client'

import Image from 'next/image'
import { useState } from 'react'
import { tarotImages } from '@/lib/images'

type TarotCardProps = {
  number: number
  name: string
  description: string
}

export default function TarotCard({ number, name, description }: TarotCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="group relative h-[430px] w-full max-w-[280px] [perspective:1200px]"
      aria-pressed={flipped}
    >
      <span className="sr-only">Flip tarot card</span>
      <span
        className={`absolute inset-0 rounded-[18px] transition duration-700 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <span className="absolute inset-0 overflow-hidden rounded-[18px] border border-mystic-gold/70 bg-mystic-card shadow-gold [backface-visibility:hidden]">
          <span className="absolute inset-4 rounded-[14px] border border-mystic-gold/30 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.18),transparent_34%),linear-gradient(135deg,rgba(107,33,168,0.85),rgba(10,10,26,0.96))]" />
          <span className="absolute inset-0 grid place-items-center font-display text-6xl text-mystic-gold">✦</span>
          <span className="absolute bottom-8 left-0 right-0 text-center text-sm uppercase tracking-[0.28em] text-mystic-light/70">
            Reveal
          </span>
        </span>
        <span className="absolute inset-0 overflow-hidden rounded-[18px] border border-mystic-gold/80 bg-mystic-card shadow-gold [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image src={tarotImages[number]} alt={name} fill sizes="280px" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-mystic-dark via-mystic-dark/20 to-transparent" />
          <span className="absolute bottom-0 left-0 right-0 p-5 text-left">
            <span className="text-xs uppercase tracking-[0.25em] text-mystic-gold">No. {number}</span>
            <span className="mt-1 block font-display text-2xl text-white">{name}</span>
            <span className="mt-2 block text-sm leading-6 text-mystic-light/76">{description}</span>
          </span>
        </span>
      </span>
    </button>
  )
}
