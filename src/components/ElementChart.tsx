import type { SajuResult } from '@/types'
import type { CSSProperties } from 'react'

type Elements = SajuResult['elements']

const elementMeta = [
  { key: 'wood', label: 'Wood 木', color: '#22c55e' },
  { key: 'fire', label: 'Fire 火', color: '#ef4444' },
  { key: 'earth', label: 'Earth 土', color: '#facc15' },
  { key: 'metal', label: 'Metal 金', color: '#f8fafc' },
  { key: 'water', label: 'Water 水', color: '#38bdf8' },
] as const

export default function ElementChart({ elements }: { elements: Elements }) {
  let start = 0
  const slices = elementMeta.map((item) => {
    const value = Math.max(0, elements[item.key])
    const end = start + value
    const slice = `${item.color} ${start}% ${end}%`
    start = end
    return slice
  })

  return (
    <div className="grid gap-8 md:grid-cols-[240px_1fr] md:items-center">
      <div className="element-chart" style={{ '--chart': slices.join(', ') } as CSSProperties}>
        <div className="element-chart-core">
          <span>Five</span>
          <strong>Elements</strong>
        </div>
      </div>
      <div className="grid gap-3">
        {elementMeta.map((item) => (
          <div key={item.key} className="grid grid-cols-[92px_1fr_44px] items-center gap-3">
            <span className="text-sm text-mystic-light/72">{item.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full element-bar"
                style={
                  {
                    '--bar-width': `${elements[item.key]}%`,
                    background: item.color,
                  } as CSSProperties
                }
              />
            </span>
            <span className="text-right text-sm text-mystic-gold">{elements[item.key]}%</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .element-chart {
          position: relative;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: conic-gradient(var(--chart));
          box-shadow:
            0 0 34px rgba(245, 158, 11, 0.22),
            inset 0 0 0 1px rgba(245, 158, 11, 0.28);
          animation: chart-fill 1s ease both;
        }

        .element-chart::before {
          content: '';
          position: absolute;
          inset: 12px;
          border-radius: inherit;
          border: 1px solid rgba(245, 158, 11, 0.42);
        }

        .element-chart-core {
          position: absolute;
          inset: 48px;
          display: grid;
          place-content: center;
          border-radius: inherit;
          background: #0a0a1a;
          text-align: center;
          color: #e2e8f0;
        }

        .element-chart-core span {
          font-size: 0.72rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          opacity: 0.55;
        }

        .element-chart-core strong {
          color: #f59e0b;
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.45rem;
        }

        .element-bar {
          width: var(--bar-width);
          animation: bar-fill 0.9s ease both;
          transform-origin: left;
        }

        @keyframes chart-fill {
          from {
            clip-path: circle(0 at 50% 50%);
            transform: rotate(-24deg);
          }
          to {
            clip-path: circle(72% at 50% 50%);
            transform: rotate(0);
          }
        }

        @keyframes bar-fill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  )
}
