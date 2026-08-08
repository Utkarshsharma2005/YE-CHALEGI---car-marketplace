import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/** Magnetic dot + trailing ring cursor. Desktop pointer devices only. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    if (!fine.matches) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setHot(!!el?.closest("a,button,[data-cursor='hot'],input,select,textarea"));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] hidden lg:block">
      <motion.div
        style={{ x, y }}
        className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-primary"
      />
      <motion.div
        style={{ x: rx, y: ry }}
        animate={{
          width: hot ? 52 : 30,
          height: hot ? 52 : 30,
          opacity: down ? 0.5 : 1,
          scale: down ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="absolute rounded-full border border-primary/60 mix-blend-difference"
        // centering handled via translate offsets
        initial={false}
      >
        <span className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </motion.div>
    </div>
  );
}
