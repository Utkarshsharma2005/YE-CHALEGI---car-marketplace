import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Reveal } from "./motion-kit";

const cols = [
  {
    title: "Marketplace",
    links: [
      { to: "/search", label: "Collection" },
      { to: "/compare", label: "Compare" },
      { to: "/saved", label: "Saved" },
      { to: "/financing", label: "Financing" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/sell", label: "Sell a car" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border px-5 pb-10 pt-20 sm:px-8">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="eyebrow">YE CHALEGI — Premium Indian Auto Marketplace</p>
          <h2 className="mt-6 max-w-3xl text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-[0.95]">
            The quiet way to buy an{" "}
            <span className="text-editorial text-primary">extraordinary</span> car.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {cols.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <p className="eyebrow mb-5">{c.title}</p>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <span className="h-px w-0 bg-primary transition-all duration-500 group-hover:w-5" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
          <Reveal delay={0.16} className="lg:col-span-2">
            <p className="eyebrow mb-5">Newsletter</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              One dispatch a month. New arrivals, test drive slots and special offers.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex max-w-sm items-center gap-2 border-b border-border pb-2"
            >
              <input
                type="email"
                required
                placeholder="you@domain.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              <button className="text-[13px] font-medium text-primary transition-opacity hover:opacity-70">
                Subscribe
              </button>
            </form>
          </Reveal>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 h-px origin-left bg-border"
        />

        <div className="mt-8 flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} YE CHALEGI Automotive India. All rights reserved.</p>
          <p className="tracking-[0.2em]">MUMBAI · DELHI · BENGALURU · PUNE</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none mt-6 select-none overflow-hidden text-center font-display text-[14vw] font-bold leading-[0.8] tracking-tighter text-foreground/[0.04]"
        >
          YE CHALEGI
        </div>
      </div>
    </footer>
  );
}
