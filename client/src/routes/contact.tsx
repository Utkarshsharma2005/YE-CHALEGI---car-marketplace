import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { Magnetic, Reveal, stagger, staggerItem } from "@/components/site/motion-kit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Showrooms — YE CHALEGI" },
      {
        name: "description",
        content:
          "Speak to a YE CHALEGI concierge, or arrange a private viewing in Mumbai, Delhi NCR, Bengaluru or Pune.",
      },
      { property: "og:title", content: "Contact & Showrooms — YE CHALEGI" },
      { property: "og:description", content: "Arrange a private viewing, after hours." },
    ],
  }),
  component: Contact,
});

const showrooms = [
  { city: "Mumbai", address: "Bandra Kurla Complex (BKC), Mumbai", hours: "Mon–Sat · 09:30–20:00" },
  { city: "Delhi NCR", address: "Golf Course Road, Gurgaon", hours: "Mon–Fri · 09:00–19:30" },
  { city: "Bengaluru", address: "100 Feet Road, Indiranagar", hours: "Tue–Sat · 10:00–19:30" },
  { city: "Pune", address: "Koregaon Park, Pune", hours: "Mon–Sat · 09:30–19:00" },
];

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[0.92]">
          One specialist, <span className="text-editorial text-primary">start to finish.</span>
        </h1>
      </Reveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-[1fr_1fr]">
        <Reveal delay={0.08}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Message sent — expect a reply within the hour.");
            }}
            className="space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-9"
          >
            {[
              { label: "Name", type: "text" },
              { label: "Email", type: "email" },
              { label: "Vehicle of interest", type: "text" },
            ].map((f) => (
              <label key={f.label} className="block">
                <span className="eyebrow">{f.label}</span>
                <input
                  required={f.type !== "text"}
                  type={f.type}
                  className="mt-2 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </label>
            ))}
            <label className="block">
              <span className="eyebrow">Message</span>
              <textarea
                rows={4}
                className="mt-2 w-full border-b border-border bg-transparent py-2.5 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>
            <Magnetic strength={0.22}>
              <button
                type="submit"
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground"
              >
                {sent ? "Sent ✓" : "Send message"}
              </button>
            </Magnetic>
          </form>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Showrooms</p>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8 space-y-4"
          >
            {showrooms.map((s) => (
              <motion.div
                key={s.city}
                variants={staggerItem}
                whileHover={{ x: 8 }}
                className="group flex items-baseline justify-between border-b border-border pb-5"
              >
                <div>
                  <p className="font-display text-xl font-semibold transition-colors group-hover:text-primary">
                    {s.city}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.address}</p>
                </div>
                <p className="text-right text-xs text-muted-foreground">{s.hours}</p>
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.14} className="mt-10 rounded-2xl bg-surface p-7">
            <p className="text-editorial text-2xl">After-hours viewings</p>
            <p className="mt-3 text-sm text-muted-foreground">
              The floor can be cleared for a single client. Request a time and we'll arrange it.
            </p>
            <a
              href="mailto:concierge@yechalegi.com"
              className="mt-5 inline-block text-sm font-medium text-primary"
            >
              concierge@yechalegi.com →
            </a>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
