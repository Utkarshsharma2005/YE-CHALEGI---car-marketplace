import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { fetchCars, currency, type Car } from "@/lib/cars";
import { computeMonthlyEmi } from "@/lib/emi";
import { Reveal } from "@/components/site/motion-kit";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Vehicles — YE CHALEGI" },
      {
        name: "description",
        content:
          "Pick two cars from the collection and compare prices, EMI, specs and features side by side.",
      },
      { property: "og:title", content: "Compare Vehicles — YE CHALEGI" },
      { property: "og:description", content: "Price, EMI and spec comparison." },
    ],
  }),
  component: ComparePage,
});

type Row = {
  key: string;
  label: string;
  fmt: (c: Car) => string;
  num?: (c: Car) => number;
};

const rows: Row[] = [
  { key: "price", label: "Price", fmt: (c) => currency(c.price), num: (c) => -c.price },
  {
    key: "emi",
    label: "EMI (60 mo, 20% down)",
    fmt: (c) => `${currency(computeMonthlyEmi(c.price))}/mo`,
    num: (c) => -computeMonthlyEmi(c.price),
  },
  {
    key: "down",
    label: "Down payment (20%)",
    fmt: (c) => currency(Math.round(c.price * 0.2)),
    num: (c) => -Math.round(c.price * 0.2),
  },
  { key: "power", label: "Power", fmt: (c) => `${c.power} hp`, num: (c) => c.power },
  { key: "torque", label: "Torque", fmt: (c) => `${c.torque} Nm`, num: (c) => c.torque },
  { key: "zero", label: "0–100 km/h", fmt: (c) => `${c.zeroToSixty}s`, num: (c) => -c.zeroToSixty },
  { key: "top", label: "Top speed", fmt: (c) => `${c.topSpeed} km/h`, num: (c) => c.topSpeed },
  { key: "range", label: "Range", fmt: (c) => `${c.range} km`, num: (c) => c.range },
  {
    key: "mileage",
    label: "Odometer",
    fmt: (c) => `${c.mileage.toLocaleString("en-IN")} km`,
    num: (c) => -c.mileage,
  },
  { key: "seats", label: "Seats", fmt: (c) => `${c.seats}`, num: (c) => c.seats },
  { key: "body", label: "Body type", fmt: (c) => c.bodyType },
  { key: "fuel", label: "Fuel", fmt: (c) => c.fuel },
  { key: "trans", label: "Transmission", fmt: (c) => c.transmission },
  { key: "drive", label: "Drivetrain", fmt: (c) => c.drivetrain },
  {
    key: "owners",
    label: "Ownership",
    fmt: (c) =>
      c.ownerCount === 1
        ? "1st Owner"
        : c.ownerCount === 2
          ? "2nd Owner"
          : `${c.ownerCount} Owners`,
  },
  { key: "insurance", label: "Insurance", fmt: (c) => c.insuranceStatus },
  { key: "accidental", label: "History", fmt: (c) => c.accidental },
  {
    key: "features",
    label: "Features count",
    fmt: (c) => `${c.features.length}`,
    num: (c) => c.features.length,
  },
];

function ComparePage() {
  const compare = useAppStore((s) => s.compare);
  const setCompareCars = useAppStore((s) => s.setCompareCars);
  const clear = useAppStore((s) => s.clearCompare);
  const [highlight, setHighlight] = useState(true);

  const { data: cars = [] } = useQuery({ queryKey: ["cars"], queryFn: fetchCars });
  const selected = compare
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is Car => Boolean(c));

  const available = cars.filter((c) => !selected.some((s) => s.id === c.id));

  const pick = (slot: number, id: string) => {
    if (!id) return;
    const next = [...compare];
    next[slot] = id;
    setCompareCars(next);
  };

  const pickerSlot = (slot: number) => (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="eyebrow text-[10px]">Slot {slot + 1}</p>
      <select
        value={compare[slot] || ""}
        onChange={(e) => pick(slot, e.target.value)}
        className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      >
        <option value="">Choose a car…</option>
        {cars.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — {currency(c.price)}
          </option>
        ))}
      </select>
      {compare[slot] && selected[slot] ? (
        <div className="mt-4 flex items-center gap-3">
          <img
            src={selected[slot].image}
            alt={selected[slot].name}
            className="h-14 w-20 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{selected[slot].name}</p>
            <p className="text-xs text-primary font-medium">
              {currency(selected[slot].price)} · {currency(computeMonthlyEmi(selected[slot].price))}
              /mo
            </p>
          </div>
          <button
            onClick={() => setCompareCars(compare.filter((_, i) => i !== slot))}
            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full glass"
            aria-label={`Remove ${selected[slot].name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">
          {available.length > 0
            ? "Select a vehicle from the collection."
            : "No more vehicles available."}
        </p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Side by side</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-[0.95]">Compare</h1>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setHighlight((v) => !v)}
              className={cn(
                "rounded-full border px-4 py-2 transition-colors",
                highlight ? "border-primary text-primary" : "border-border text-muted-foreground",
              )}
            >
              Highlight differences
            </button>
            {selected.length > 0 && (
              <button onClick={clear} className="text-muted-foreground hover:text-foreground">
                Clear all
              </button>
            )}
          </div>
        </div>
      </Reveal>

      {/* Car Picker */}
      <Reveal delay={0.08}>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {pickerSlot(0)}
          {pickerSlot(1)}
        </div>
      </Reveal>

      {selected.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl border border-dashed border-border py-24 text-center">
            <Scale className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-editorial text-3xl">Pick two cars to compare.</p>
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
              Choose any two vehicles above and their price, EMI, specifications and features will
              surface here.
            </p>
            <Link
              to="/search"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              Browse the collection
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 overflow-x-auto">
          <div
            className="grid min-w-[640px] gap-6"
            style={{ gridTemplateColumns: `140px repeat(${selected.length}, minmax(0,1fr))` }}
          >
            <div />
            <AnimatePresence mode="popLayout">
              {selected.map((c, i) => (
                <motion.div
                  layout
                  key={c.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <Link to="/cars/$carId" params={{ carId: c.id }}>
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      width={1280}
                      height={960}
                      className="aspect-[4/3] w-full rounded-xl object-cover"
                    />
                    <p className="mt-4 font-display text-base font-semibold">{c.name}</p>
                  </Link>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ background: c.colorHex }}
                    />
                    <span className="text-xs text-muted-foreground">{c.colorName}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {rows.map((row, ri) => {
              const values = selected.map((c) => (row.num ? row.num(c) : 0));
              const best = Math.max(...values);
              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ri * 0.04, duration: 0.6 }}
                  className="contents"
                >
                  <div className="border-t border-border py-4 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {row.label}
                  </div>
                  {selected.map((c) => {
                    const isBest =
                      row.num && highlight && row.num(c) === best && new Set(values).size > 1;
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          "border-t border-border py-4 font-display text-sm transition-colors",
                          isBest && "text-primary",
                        )}
                      >
                        {row.fmt(c)}
                        {isBest && (
                          <motion.span
                            layoutId={`best-${row.key}`}
                            className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle"
                          />
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
