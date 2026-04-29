import { cn } from "@/lib/utils"

export function Marquee({
  children,
  direction = "left",
  repeat = 4,
  duration = 60,
  className,
  ...props
}: {
  children: React.ReactNode
  direction?: "left" | "right"
  repeat?: number
  duration?: number
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("group flex overflow-hidden", className)}
      style={{ "--duration": `${duration}s`, "--gap": "1rem", gap: "1rem" } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex shrink-0 justify-around group-hover-pause",
              direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
            )}
            style={{ gap: "1rem" }}
          >
            {children}
          </div>
        ))}
    </div>
  )
}
