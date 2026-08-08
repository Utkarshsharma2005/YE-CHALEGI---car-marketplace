import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Heart, Scale, ArrowUpRight } from "lucide-react";
import { staggerItem } from "./motion-kit";
import { useAppStore } from "@/store/app";
import { currency, type Car } from "@/lib/cars";
import { cn } from "@/lib/utils";

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  const saved = useAppStore((s) => s.saved.includes(car.id));
  const inCompare = useAppStore((s) => s.compare.includes(car.id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card"
    >
      <Link to="/cars/$carId" params={{ carId: car.id }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          <motion.img
            src={car.image}
            alt={`${car.name} — ${car.colorName}`}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            width={1280}
            height={960}
            className="h-full w-full object-cover"
            initial={{ scale: 1.08, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.06 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            <span className="rounded-full glass px-2.5 py-1 text-[10px] tracking-[0.16em] text-foreground">
              {car.fuel.toUpperCase()}
            </span>
            <span className="rounded-full glass px-2.5 py-1 text-[10px] tracking-[0.16em] text-foreground">
              {car.year}
            </span>
            {car.offerTag && (
              <span className="rounded-full bg-emerald-500/90 text-white font-medium px-2.5 py-1 text-[10px] tracking-wide shadow-md">
                🔥 {car.offerTag}
              </span>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </motion.div>
        </div>

        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="truncate font-display text-lg font-semibold">{car.name}</h3>
            <span className="shrink-0 text-sm font-medium text-primary">{currency(car.price)}</span>
          </div>
          <p className="mt-1 truncate text-[13px] text-muted-foreground">{car.tagline}</p>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            {[
              ["0–100", `${car.zeroToSixty}s`],
              ["Power", `${car.power} hp`],
              ["Range", `${car.range} km`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-1 font-display text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>

      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <IconBtn active={saved} label="Save" onClick={() => toggleSaved(car.id)}>
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </IconBtn>
        <IconBtn active={inCompare} label="Compare" onClick={() => toggleCompare(car.id)}>
          <Scale className="h-4 w-4" />
        </IconBtn>
      </div>
    </motion.article>
  );
}

function IconBtn({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      aria-label={label}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full glass transition-colors",
        active ? "text-primary" : "text-foreground/80 hover:text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] shimmer bg-surface-2" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 shimmer rounded bg-surface-2" />
        <div className="h-3 w-1/2 shimmer rounded bg-surface-2" />
        <div className="h-12 shimmer rounded bg-surface-2" />
      </div>
    </div>
  );
}
