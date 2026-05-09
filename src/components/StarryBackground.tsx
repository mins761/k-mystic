export default function StarryBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.13),transparent_24%),linear-gradient(180deg,rgba(10,10,26,0.3),#0A0A1A_86%)]" />
      {Array.from({ length: 38 }).map((_, index) => (
        <span
          key={index}
          className="absolute h-1 w-1 rounded-full bg-mystic-light/80 animate-twinkle"
          style={{
            left: `${(index * 37) % 100}%`,
            top: `${(index * 19) % 100}%`,
            animationDelay: `${(index % 9) * 0.25}s`,
          }}
        />
      ))}
      <div className="absolute left-0 top-1/3 h-px w-full bg-gradient-to-r from-transparent via-mystic-gold/40 to-transparent animate-sweep" />
    </div>
  )
}
