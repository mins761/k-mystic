import { splitReadingSections } from '@/lib/fortune'

type ReadingSectionsProps = {
  body: string
  borderColor?: string
  textColor?: string
}

export default function ReadingSections({
  body,
  borderColor = 'border-mystic-gold/20',
  textColor = 'text-mystic-light/82',
}: ReadingSectionsProps) {
  const sections = splitReadingSections(body)

  return (
    <div className="mt-5 space-y-5">
      {sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className={`border-t ${borderColor} pt-4`}>
          {section.title ? (
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-mystic-gold">{section.title}</h4>
          ) : null}
          <p className={`${section.title ? 'mt-2' : ''} max-w-[62ch] text-[1.02rem] leading-8 ${textColor}`}>
            {section.body}
          </p>
        </section>
      ))}
    </div>
  )
}
