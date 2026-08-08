import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { currency } from "@/lib/cars";
import { computeEmi } from "@/lib/emi";
import { Counter, Magnetic, Reveal, stagger, staggerItem } from "@/components/site/motion-kit";

export const Route = createFileRoute("/financing")({
  head: () => ({
    meta: [
      { title: "Financing — YE CHALEGI" },
      {
        name: "description",
        content:
          "Transparent financing for luxury cars and supercars: tailored EMI schemes and instant pre-approval.",
      },
      { property: "og:title", content: "Financing — YE CHALEGI" },
      { property: "og:description", content: "Transparent financing, decided in under an hour." },
    ],
  }),
  component: Financing,
});

const plans = [
  {
    name: "Flexible EMI",
    apr: 8.25,
    blurb: "Lowest monthly payments with flexible tenure up to 7 years.",
    term: 60,
  },
  {
    name: "Smart Balloon",
    apr: 8.75,
    blurb: "Deferred final lump sum payment with option to upgrade.",
    term: 48,
  },
  {
    name: "Full Purchase",
    apr: 9.25,
    blurb: "Straight forward ownership with zero foreclosure charges.",
    term: 36,
  },
];

function Financing() {
  const [price, setPrice] = useState(3500000); // 35 Lakh default
  const [deposit, setDeposit] = useState(20);
  const [plan, setPlan] = useState(0);

  const active = plans[plan]!;
  const {
    emi: monthly,
    principal: financed,
    totalInterest,
    totalPayment,
    downPayment,
  } = computeEmi(price, deposit, active.term, active.apr);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Financing</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[0.92]">
          Numbers first. <span className="text-editorial text-primary">Then the car.</span>
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-3"
          >
            {plans.map((p, i) => (
              <motion.button
                key={p.name}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                onClick={() => setPlan(i)}
                className={`relative rounded-2xl border p-6 text-left transition-colors ${
                  plan === i ? "border-primary" : "border-border hover:border-foreground/30"
                }`}
              >
                {plan === i && (
                  <motion.span
                    layoutId="plan-bg"
                    className="absolute inset-0 rounded-2xl bg-primary/[0.07]"
                    transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  />
                )}
                <span className="relative block">
                  <span className="font-display text-lg font-semibold">{p.name}</span>
                  <span className="mt-1 block text-xs text-primary">{p.apr}% APR</span>
                  <span className="mt-3 block text-sm text-muted-foreground">{p.blurb}</span>
                </span>
              </motion.button>
            ))}
          </motion.div>

          <Reveal className="mt-12 rounded-2xl border border-border bg-card p-8">
            <div className="space-y-8">
              <Slider
                label="Vehicle price"
                value={currency(price)}
                min={1500000}
                max={40000000}
                step={500000}
                v={price}
                onChange={setPrice}
              />
              <Slider
                label="Deposit"
                value={`${deposit}% · ${currency((price * deposit) / 100)}`}
                min={5}
                max={60}
                step={1}
                v={deposit}
                onChange={setDeposit}
              />
            </div>
          </Reveal>

          <Reveal className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { to: 58, suffix: " min", label: "Median decision time" },
              { to: 3.9, decimals: 1, suffix: "%", label: "Lowest available APR" },
              { to: 92, suffix: "%", label: "Applications approved" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-8 glow-ring">
              <p className="eyebrow">Estimated monthly</p>
              <motion.p
                key={monthly}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 font-display text-5xl font-semibold tracking-tighter"
              >
                {currency(monthly)}
              </motion.p>
              <dl className="mt-8 space-y-3 text-sm">
                {[
                  ["Plan", active.name],
                  ["Down payment", `${deposit}% · ${currency(downPayment)}`],
                  ["Amount financed", currency(financed)],
                  ["Term", `${active.term} months`],
                  ["APR", `${active.apr}% p.a.`],
                  ["Total interest", currency(totalInterest)],
                  ["Total payable", currency(totalPayment)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <Magnetic className="mt-8 w-full" strength={0.2}>
                <button
                  onClick={() => toast.success("Application started — check your inbox.")}
                  className="w-full rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground"
                >
                  Apply in 4 minutes
                </button>
              </Magnetic>
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Representative example only. Subject to status and affordability checks.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  v,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="font-display text-lg">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(+e.target.value)}
        className="mt-4 w-full accent-[var(--primary)]"
      />
    </div>
  );
}
