import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Magnetic, Reveal } from "@/components/site/motion-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Your Car — YE CHALEGI" },
      {
        name: "description",
        content:
          "Three steps, one valuation, no hassle. YE CHALEGI sells your car to a vetted network.",
      },
      { property: "og:title", content: "Sell Your Car — YE CHALEGI" },
      { property: "og:description", content: "Three steps, one valuation, no hassle." },
    ],
  }),
  component: SellPage,
});

const steps = ["Vehicle", "Condition", "Contact"];

function SellPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "Excellent",
    notes: "",
    name: "",
    email: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Sell</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[0.92]">
          Your car deserves a <span className="text-editorial text-primary">better audience.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          We photograph, inspect and list against a vetted buyer network. Median time to sale:
          eleven days.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_360px]">
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-9">
            <div className="flex items-center gap-3">
              {steps.map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-3">
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] transition-colors",
                      i <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{s}</span>
                  {i < steps.length - 1 && (
                    <span className="relative h-px flex-1 bg-border">
                      <motion.span
                        initial={false}
                        animate={{ scaleX: i < step ? 1 : 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 origin-left bg-primary"
                      />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="grid gap-5 sm:grid-cols-2"
                >
                  {step === 0 && (
                    <>
                      <Field label="Make" value={form.make} onChange={(v) => set("make", v)} />
                      <Field label="Model" value={form.model} onChange={(v) => set("model", v)} />
                      <Field label="Year" value={form.year} onChange={(v) => set("year", v)} />
                      <Field
                        label="Mileage (km)"
                        value={form.mileage}
                        onChange={(v) => set("mileage", v)}
                      />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="sm:col-span-2">
                        <p className="eyebrow mb-3">Condition</p>
                        <div className="flex flex-wrap gap-2">
                          {["Concours", "Excellent", "Good", "Project"].map((c) => (
                            <button
                              key={c}
                              onClick={() => set("condition", c)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-xs transition-colors",
                                form.condition === c
                                  ? "border-primary text-primary"
                                  : "border-border text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="eyebrow mb-3">Anything we should know</p>
                        <textarea
                          rows={4}
                          value={form.notes}
                          onChange={(e) => set("notes", e.target.value)}
                          className="w-full rounded-xl border border-border bg-transparent p-4 text-sm outline-none transition-colors focus:border-primary"
                          placeholder="Service history, modifications, paintwork…"
                        />
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <Field label="Your name" value={form.name} onChange={(v) => set("name", v)} />
                      <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
                      <p className="text-sm text-muted-foreground sm:col-span-2">
                        A specialist replies within one working hour with an indicative range.
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-sm text-muted-foreground transition-opacity disabled:opacity-30"
              >
                Back
              </button>
              <Magnetic strength={0.22}>
                <button
                  onClick={() => {
                    if (step < 2) setStep(step + 1);
                    else toast.success("Valuation requested — we'll be in touch shortly.");
                  }}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
                >
                  {step < 2 ? "Continue" : "Request valuation"}
                </button>
              </Magnetic>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="space-y-6">
            {[
              {
                t: "We photograph",
                b: "Two days in the Monaco studio, 180 frames, cold-start audio.",
              },
              { t: "We inspect", b: "212 points, independently verified, published in full." },
              { t: "We negotiate", b: "You approve the floor price. We handle everything else." },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 6 }}
                className="rounded-2xl border border-border bg-surface p-6"
              >
                <p className="font-display text-base font-semibold">{c.t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{c.b}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}
