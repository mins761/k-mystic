'use client'

import { useMemo, useState } from 'react'

type TarotCardProps = {
  number: number
  name: string
  description: string
}

const romanNumerals = [
  '0',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
]

export default function TarotCard({ number, name, description }: TarotCardProps) {
  const [flipped, setFlipped] = useState(false)
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        left: `${(index * 29 + 7) % 100}%`,
        top: `${(index * 43 + 13) % 100}%`,
        delay: `${(index % 10) * 0.18}s`,
        duration: `${3.6 + (index % 6) * 0.45}s`,
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
          <span className="constellation" />
          <span className="back-orbit" />
          <span className="back-logo">K-Mystic</span>
        </span>

        <span className="card-face card-front">
          <span className="inner-border" />
          <span className="corner corner-tl" />
          <span className="corner corner-tr" />
          <span className="corner corner-bl" />
          <span className="corner corner-br" />
          <span className="roman">{romanNumerals[number] ?? String(number)}</span>
          <span className="symbol-wrap" aria-hidden>
            <CardSymbol name={name} />
          </span>
          <span className="card-name">{name}</span>
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
          filter: drop-shadow(0 0 24px rgba(245, 158, 11, 0.58));
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
          display: block;
          overflow: hidden;
          border: 2px solid #f5c451;
          border-radius: 0.75rem;
          background:
            radial-gradient(circle at 50% 24%, rgba(236, 72, 153, 0.25), transparent 30%),
            linear-gradient(155deg, #6b21a8 0%, #241348 42%, #080817 100%);
          backface-visibility: hidden;
        }

        .card-face::before,
        .card-face::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }

        .card-front::before {
          inset: -45%;
          background: conic-gradient(
            from 120deg,
            transparent,
            rgba(245, 196, 81, 0.16),
            transparent,
            rgba(139, 92, 246, 0.18),
            transparent
          );
          animation: aura-spin 14s linear infinite;
        }

        .card-front::after {
          inset: 0;
          background-image:
            radial-gradient(circle, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px),
            radial-gradient(circle, rgba(245, 196, 81, 0.6) 0 1px, transparent 1.5px);
          background-position:
            24px 52px,
            92px 18px;
          background-size:
            72px 96px,
            120px 130px;
          opacity: 0.34;
        }

        .card-back {
          transform: rotateY(180deg);
          background:
            radial-gradient(circle at 50% 48%, rgba(245, 196, 81, 0.2), transparent 24%),
            linear-gradient(145deg, #0b1029, #34145e 48%, #090917);
        }

        .constellation {
          position: absolute;
          inset: 14px;
          border: 1px dashed rgba(245, 196, 81, 0.55);
          border-radius: 0.55rem;
          background-image:
            radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.8px),
            radial-gradient(circle, rgba(245, 196, 81, 0.78) 0 1px, transparent 1.8px),
            linear-gradient(34deg, transparent 47%, rgba(245, 196, 81, 0.22) 48% 49%, transparent 50%);
          background-size:
            42px 58px,
            86px 74px,
            100% 100%;
          animation: constellation-drift 9s ease-in-out infinite;
        }

        .back-orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 118px;
          height: 118px;
          border: 1px solid rgba(245, 196, 81, 0.52);
          border-radius: 999px;
          transform: translate(-50%, -50%);
          animation: world-rotate 10s linear infinite;
        }

        .back-orbit::before,
        .back-orbit::after {
          content: '';
          position: absolute;
          inset: 18px;
          border: 1px dashed rgba(226, 232, 240, 0.34);
          border-radius: 999px;
        }

        .back-orbit::after {
          inset: -10px 32px;
        }

        .back-logo {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          color: #f5c451;
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-align: center;
          text-shadow: 0 0 18px rgba(245, 196, 81, 0.48);
        }

        .inner-border {
          position: absolute;
          inset: 12px;
          z-index: 2;
          border: 1px dashed rgba(245, 196, 81, 0.72);
          border-radius: 0.55rem;
        }

        .roman {
          position: absolute;
          left: 0;
          right: 0;
          top: 25px;
          z-index: 3;
          color: #f5c451;
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-align: center;
          text-shadow: 0 0 12px rgba(245, 196, 81, 0.42);
        }

        .symbol-wrap {
          position: absolute;
          left: 50%;
          top: 48%;
          z-index: 3;
          width: 126px;
          height: 126px;
          color: #f5c451;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 0 14px rgba(245, 196, 81, 0.38));
        }

        .card-name {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 28px;
          z-index: 3;
          color: #f5c451;
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.28rem;
          font-weight: 700;
          line-height: 1.05;
          text-align: center;
          text-shadow: 0 0 14px rgba(245, 196, 81, 0.38);
        }

        .corner {
          position: absolute;
          z-index: 3;
          width: 32px;
          height: 32px;
          border-color: rgba(245, 196, 81, 0.78);
        }

        .corner::after {
          content: '';
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgba(245, 196, 81, 0.78);
          box-shadow: 0 0 10px rgba(245, 196, 81, 0.65);
        }

        .corner-tl {
          left: 18px;
          top: 18px;
          border-left: 1px solid;
          border-top: 1px solid;
        }

        .corner-tr {
          right: 18px;
          top: 18px;
          border-right: 1px solid;
          border-top: 1px solid;
        }

        .corner-bl {
          left: 18px;
          bottom: 18px;
          border-left: 1px solid;
          border-bottom: 1px solid;
        }

        .corner-br {
          right: 18px;
          bottom: 18px;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }

        .corner-tl::after {
          left: 9px;
          top: 9px;
        }

        .corner-tr::after {
          right: 9px;
          top: 9px;
        }

        .corner-bl::after {
          left: 9px;
          bottom: 9px;
        }

        .corner-br::after {
          right: 9px;
          bottom: 9px;
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

        @keyframes aura-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes constellation-drift {
          0%,
          100% {
            background-position:
              0 0,
              0 0,
              0 0;
          }
          50% {
            background-position:
              16px -20px,
              -18px 14px,
              0 0;
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

        @keyframes world-rotate {
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </button>
  )
}

function CardSymbol({ name }: { name: string }) {
  const normalized = name.toLowerCase()

  if (normalized.includes('fool')) return <ButterflySymbol />
  if (normalized.includes('magician')) return <MagicianSymbol />
  if (normalized.includes('high priestess')) return <PriestessSymbol />
  if (normalized.includes('sun')) return <SunSymbol />
  if (normalized.includes('moon')) return <MoonSymbol />
  if (normalized.includes('star')) return <StarSymbol />
  if (normalized.includes('world')) return <WorldSymbol />
  return <ParticleSymbol />
}

function ButterflySymbol() {
  return (
    <svg className="symbol-svg butterfly" viewBox="0 0 120 120" role="img" aria-label="Butterfly">
      <path className="wing left" d="M58 60C28 20 8 26 14 58c4 25 26 30 44 2Z" />
      <path className="wing right" d="M62 60c30-40 50-34 44-2-4 25-26 30-44 2Z" />
      <path d="M60 39c7 11 7 32 0 44-7-12-7-33 0-44Z" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
        .wing {
          transform-origin: 60px 60px;
          animation: wing-flutter 1.4s ease-in-out infinite;
        }
        .right {
          animation-delay: 0.08s;
        }
        @keyframes wing-flutter {
          0%,
          100% {
            transform: scaleX(1);
            opacity: 0.72;
          }
          50% {
            transform: scaleX(0.72);
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  )
}

function MagicianSymbol() {
  return (
    <svg className="symbol-svg magician" viewBox="0 0 120 120" role="img" aria-label="Rotating star">
      <path d="M60 12l11 33 35 1-28 20 10 34-28-20-28 20 10-34-28-20 35-1Z" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="3" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          animation: star-rotate 5s linear infinite;
        }
        @keyframes star-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </svg>
  )
}

function PriestessSymbol() {
  return (
    <svg className="symbol-svg priestess" viewBox="0 0 120 120" role="img" aria-label="Moon">
      <path d="M78 16A46 46 0 1 0 78 104 36 36 0 1 1 78 16Z" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="2" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          animation: moon-fade 3.4s ease-in-out infinite;
        }
        @keyframes moon-fade {
          0%,
          100% {
            opacity: 0.48;
            filter: drop-shadow(0 0 6px currentColor);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 22px currentColor);
          }
        }
      `}</style>
    </svg>
  )
}

function SunSymbol() {
  return (
    <svg className="symbol-svg sun" viewBox="0 0 120 120" role="img" aria-label="Sun">
      <circle cx="60" cy="60" r="24" />
      {Array.from({ length: 12 }).map((_, index) => (
        <line
          key={index}
          x1="60"
          y1="10"
          x2="60"
          y2="28"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="5"
          transform={`rotate(${index * 30} 60 60)`}
        />
      ))}
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          animation: sun-pulse 2.4s ease-in-out infinite;
        }
        @keyframes sun-pulse {
          0%,
          100% {
            filter: drop-shadow(0 0 8px currentColor);
            transform: scale(0.96);
          }
          50% {
            filter: drop-shadow(0 0 28px currentColor);
            transform: scale(1.07);
          }
        }
      `}</style>
    </svg>
  )
}

function MoonSymbol() {
  return (
    <svg className="symbol-svg moon" viewBox="0 0 120 120" role="img" aria-label="Moonlight wave">
      <path d="M75 18A44 44 0 1 0 75 102 34 34 0 1 1 75 18Z" />
      <path className="wave wave-a" d="M20 83c14-10 25 10 40 0s27 8 40-2" fill="none" stroke="currentColor" strokeWidth="4" />
      <path className="wave wave-b" d="M25 96c12-8 23 8 35 0s24 7 35-1" fill="none" stroke="currentColor" strokeWidth="3" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
        .wave {
          animation: moon-wave 2.8s ease-in-out infinite;
        }
        .wave-b {
          animation-delay: 0.35s;
        }
        @keyframes moon-wave {
          0%,
          100% {
            transform: translateX(-4px);
            opacity: 0.45;
          }
          50% {
            transform: translateX(5px);
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  )
}

function StarSymbol() {
  return (
    <svg className="symbol-svg star" viewBox="0 0 120 120" role="img" aria-label="Twinkling star">
      <path d="M60 10l9 35 36 15-36 15-9 35-9-35-36-15 36-15Z" />
      <circle cx="26" cy="30" r="4" />
      <circle cx="94" cy="36" r="3" />
      <circle cx="90" cy="88" r="4" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
          animation: star-twinkle 1.8s ease-in-out infinite;
        }
        @keyframes star-twinkle {
          0%,
          100% {
            opacity: 0.56;
            transform: scale(0.92);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </svg>
  )
}

function WorldSymbol() {
  return (
    <svg className="symbol-svg world" viewBox="0 0 120 120" role="img" aria-label="Rotating world">
      <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="5" />
      <ellipse cx="60" cy="60" rx="18" ry="42" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M18 60h84M60 18v84" stroke="currentColor" strokeWidth="3" />
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: none;
          animation: world-symbol-rotate 6s linear infinite;
        }
        @keyframes world-symbol-rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </svg>
  )
}

function ParticleSymbol() {
  return (
    <svg className="symbol-svg particles" viewBox="0 0 120 120" role="img" aria-label="Floating particles">
      {[
        [60, 25, 9],
        [36, 48, 6],
        [82, 48, 7],
        [42, 79, 5],
        [76, 82, 6],
        [60, 60, 12],
      ].map(([cx, cy, r], index) => (
        <circle key={index} className={`particle-dot dot-${index}`} cx={cx} cy={cy} r={r} />
      ))}
      <style jsx>{`
        .symbol-svg {
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
        .particle-dot {
          animation: symbol-particle-float 3s ease-in-out infinite;
          transform-origin: center;
        }
        .dot-1,
        .dot-4 {
          animation-delay: 0.25s;
        }
        .dot-2,
        .dot-5 {
          animation-delay: 0.55s;
        }
        @keyframes symbol-particle-float {
          0%,
          100% {
            transform: translateY(0) scale(0.92);
            opacity: 0.52;
          }
          50% {
            transform: translateY(-10px) scale(1.12);
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  )
}
