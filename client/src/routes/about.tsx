import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import heroImg from "@/assets/hero-car-rotated-rotated.png";
import { Counter, Reveal, stagger, staggerItem } from "@/components/site/motion-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YE CHALEGI — Premium Indian Auto Marketplace" },
      {
        name: "description",
        content:
          "YE CHALEGI is a curated automotive marketplace built on photography, provenance and restraint. Four Indian hubs, one standard.",
      },
      { property: "og:title", content: "About YE CHALEGI" },
      { property: "og:description", content: "Photography, provenance and restraint." },
    ],
  }),
  component: About,
});

const values = [
  {
    t: "Restraint",
    b: "We list fewer cars than we could. Every one is inspected before it's photographed.",
  },
  { t: "Provenance", b: "Full history, published. If we can't verify it, we don't sell it." },
  { t: "Silence", b: "No call centres, no follow-up campaigns. One specialist, start to finish." },
];

function About() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div className="pb-32 pt-32 sm:pt-40">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">About</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.2rem,6.5vw,5rem)] font-semibold leading-[0.9]">
            We built the showroom we{" "}
            <span className="text-editorial text-primary">wanted to walk into.</span>
          </h1>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <Reveal delay={0.08}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              YE CHALEGI began with a stubborn belief: buying an extraordinary car should feel like
              the car itself. Considered. Unhurried. Quiet.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We operate four luxury showrooms across Mumbai, Delhi, Bengaluru and Pune, and we
              still refuse more cars than we accept. Every listing carries a 212-point inspection, a
              full provenance file and high-resolution photography.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="grid grid-cols-2 gap-8">
              {[
                { to: 1420, suffix: "+", label: "Cars delivered" },
                { to: 4, suffix: "", label: "Indian showrooms" },
                { to: 212, suffix: "", label: "Inspection points" },
                { to: 98, suffix: "%", label: "Would buy again" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-4xl font-semibold tracking-tighter">
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div ref={ref} className="relative mt-24 h-[60svh] min-h-[380px] overflow-hidden">
        <motion.img
          style={{ y }}
          src={heroImg}
          alt="Veloce studio floor"
          loading="lazy"
          width={1920}
          height={1088}
          className="absolute inset-0 h-[120%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-8">
        <Reveal>
          <p className="eyebrow">What we hold to</p>
        </Reveal>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 grid gap-6 lg:grid-cols-3"
        >
          {values.map((v) => (
            <motion.div
              key={v.t}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <h2 className="font-display text-2xl font-semibold">{v.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.b}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
