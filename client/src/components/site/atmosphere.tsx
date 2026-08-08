import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

/** Drifting light particles — pure CSS transforms, GPU friendly. */
export function Particles({ count = 26 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 61) % 100,
        size: 1 + ((i * 13) % 3),
        delay: (i % 10) * 0.9,
        duration: 9 + ((i * 7) % 9),
        dx: ((i % 5) - 2) * 26,
      })),
    [count],
  );

  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-primary/70"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            ["--dx" as string]: `${d.dx}px`,
            animation: `drift ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Marquee({
  items,
  duration = 38,
  className = "",
}: {
  items: string[];
  duration?: number;
  className?: string;
}) {
  const row = [...items, ...items];
  return (
    <div className={`group relative overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee gap-16 group-hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="font-display text-[13px] tracking-[0.36em] text-muted-foreground transition-colors hover:text-primary"
          >
            {it}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

/** Mouse parallax wrapper. */
export function MouseParallax({
  children,
  intensity = 14,
  className,
}: {
  children: React.ReactNode;
  intensity?: number;
  className?: string;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth - 0.5) * intensity,
        y: (e.clientY / window.innerHeight - 0.5) * intensity,
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [intensity]);

  return (
    <motion.div
      className={className}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 60, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
