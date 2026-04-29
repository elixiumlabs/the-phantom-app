interface InfiniteRibbonProps {
  children: React.ReactNode
  reverse?: boolean
  rotation?: number
  className?: string
}

export function InfiniteRibbon({ children, reverse = false, rotation = 0, className }: InfiniteRibbonProps) {
  const items = Array(8).fill(children)

  return (
    <div
      className={['w-full overflow-hidden py-3', className].filter(Boolean).join(' ')}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `ribbon-scroll${reverse ? '-reverse' : ''} 28s linear infinite`,
          width: 'max-content',
        }}
      >
        {items.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-6 font-display font-bold text-[13px] uppercase tracking-widest"
            style={{ color: '#89F336' }}
          >
            {text}
            <span style={{ color: '#89F336', opacity: 0.4 }}>✦</span>
          </span>
        ))}
        {/* duplicate for seamless loop */}
        {items.map((text, i) => (
          <span
            key={`dup-${i}`}
            className="inline-flex items-center gap-6 px-6 font-display font-bold text-[13px] uppercase tracking-widest"
            style={{ color: '#89F336' }}
          >
            {text}
            <span style={{ color: '#89F336', opacity: 0.4 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
