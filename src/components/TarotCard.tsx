'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { tarotBacks, tarotCardImage } from '@/lib/tarotAssets'

type TarotCardProps = {
  number: number
  name: string
  description: string
  back?: 'classic' | 'gold'
}

export default function TarotCard({ number, name, description, back = 'classic' }: TarotCardProps) {
  const [flipped, setFlipped] = useState(false)
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        left: `${(index * 31 + 9) % 100}%`,
        top: `${(index * 47 + 15) % 100}%`,
        delay: `${(index % 8) * 0.2}s`,
        duration: `${3.8 + (index % 5) * 0.45}s`,
      })),
    [],
  )

  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      className="tarot-shell group"
      aria-pressed={flipped}
      aria-label={`Reveal ${name} tarot card`}
    >
      <span className="ambient" aria-hidden>
        {particles.map((particle, index) => (
          <span
            key={index}
            className="ambient-particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </span>

      <span className={`tarot-card ${flipped ? 'is-flipped' : ''}`}>
        <span className="card-face card-back" aria-hidden>
          <Image src={tarotBacks[back]} alt="" fill sizes="200px" className="card-image" draggable={false} />
        </span>
        <span className="card-face card-front">
          <Image src={tarotCardImage(number, name)} alt={name} fill sizes="200px" className="card-image" draggable={false} />
          <span className="sr-only">{description}</span>
        </span>
      </span>

      <style jsx>{`
        .tarot-shell {
          position: relative;
          display: block;
          width: 200px;
          height: 340px;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          perspective: 1200px;
          animation: tarot-rise 0.7s ease both;
        }

        .tarot-card {
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          transform-style: preserve-3d;
          transition:
            transform 0.8s cubic-bezier(0.2, 0.72, 0.18, 1),
            filter 0.35s ease;
          box-shadow:
            0 0 22px rgba(245, 158, 11, 0.36),
            0 20px 60px rgba(7, 7, 20, 0.58);
        }

        .tarot-shell:hover .tarot-card {
          filter: drop-shadow(0 0 26px rgba(245, 158, 11, 0.6));
          transform: translateY(-10px);
        }

        .tarot-shell:hover .tarot-card.is-flipped {
          transform: translateY(-10px) rotateY(180deg);
        }

        .tarot-card.is-flipped {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border: 2px solid #f5c451;
          border-radius: 0.75rem;
          background: #080817;
          backface-visibility: hidden;
        }

        .card-front {
          transform: rotateY(180deg);
        }

        .card-image {
          object-fit: cover;
          user-select: none;
        }

        .ambient {
          position: absolute;
          inset: -45px;
          pointer-events: none;
        }

        .ambient-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: rgba(245, 196, 81, 0.88);
          box-shadow: 0 0 10px rgba(245, 196, 81, 0.82);
          opacity: 0.5;
          animation: particle-float 4s ease-in-out infinite;
        }

        .tarot-shell:hover .ambient-particle {
          opacity: 0.9;
          animation-name: particle-spark;
        }

        @keyframes tarot-rise {
          from {
            opacity: 0;
            transform: translateY(34px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes particle-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(0.75);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(9px, -18px, 0) scale(1.2);
            opacity: 0.75;
          }
        }

        @keyframes particle-spark {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(14px, -26px, 0) scale(1.85);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  )
}
