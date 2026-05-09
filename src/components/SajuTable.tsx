import type { SajuPillar } from '@/types'

const elementClasses: Record<SajuPillar['element'], string> = {
  Wood: 'text-green-300 bg-green-400/10',
  Fire: 'text-red-300 bg-red-400/10',
  Earth: 'text-yellow-200 bg-yellow-300/10',
  Metal: 'text-slate-100 bg-white/10',
  Water: 'text-sky-300 bg-sky-400/10',
}

export default function SajuTable({
  pillars,
}: {
  pillars: { year: SajuPillar; month: SajuPillar; day: SajuPillar; hour: SajuPillar }
}) {
  const columns = [
    ['Year', pillars.year],
    ['Month', pillars.month],
    ['Day', pillars.day],
    ['Hour', pillars.hour],
  ] as const

  return (
    <div className="overflow-hidden rounded-lg border border-mystic-gold/55 bg-mystic-card/55 shadow-gold">
      <div className="grid grid-cols-4 border-b border-mystic-gold/30">
        {columns.map(([label]) => (
          <div key={label} className="px-3 py-3 text-center text-xs uppercase tracking-[0.22em] text-mystic-gold">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4">
        {columns.map(([label, pillar]) => (
          <div key={label} className="border-r border-mystic-gold/20 px-3 py-5 text-center last:border-r-0">
            <div className="font-display text-4xl text-white">{pillar.stem}</div>
            <div className="mt-3 font-display text-4xl text-white">{pillar.branch}</div>
            <div className={`mx-auto mt-5 w-fit rounded-full px-3 py-1 text-xs ${elementClasses[pillar.element]}`}>
              {pillar.element}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
