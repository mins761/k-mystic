import { splitReadingSections } from '@/lib/fortune'

type ReadingSectionsProps = {
  body: string
  borderColor?: string
  textColor?: string
}

export default function ReadingSections({
  body,
  borderColor = 'border-white/5',
  textColor = 'text-slate-100/95',
}: ReadingSectionsProps) {
  const sections = splitReadingSections(body)

  return (
    <div className="mt-6 space-y-6">
      {sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className={`border-t ${borderColor} pt-5`}>
          {section.title ? (
            <h4 className="border-l-2 border-mystic-gold/80 pl-2.5 text-xs md:text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-amber-400/95">
              {section.title}
            </h4>
          ) : null}
          <p className={`${section.title ? 'mt-3' : ''} text-base md:text-[1.05rem] leading-relaxed md:leading-[1.78] tracking-wide ${textColor} antialiased`}>
            {section.body}
          </p>
        </section>
      ))}
    </div>
  )
}

