import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import heroImg from "@/assets/hero-car-rotated-rotated.jpeg";
import interiorImg from "@/assets/_ (7)-rotated (1)-rotated.jpeg";
import { brands, fetchCars } from "@/lib/cars";
import { CarCard, CarCardSkeleton } from "@/components/site/car-card";
import { Counter, Magnetic, Reveal, stagger } from "@/components/site/motion-kit";
import { Marquee, MouseParallax, Particles } from "@/components/site/atmosphere";
import { CarViewer } from "@/components/three/car-viewer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YE CHALEGI — Extraordinary Cars, Quietly Acquired" },
      {
        name: "description",
        content:
          "India's curated marketplace for hypercars, grand tourers, SUVs and electric flagships.",
      },
      { property: "og:title", content: "YE CHALEGI — Extraordinary Cars, Quietly Acquired" },
      {
        property: "og:description",
        content: "Curated hypercars, grand tourers and electric flagships.",
      },
    ],
  }),
  component: Landing,
});

const timeline = [
  {
    year: "2019",
    title: "One showroom",
    body: "A single Monaco floor with nine cars and a waiting list.",
  },
  {
    year: "2021",
    title: "The digital gallery",
    body: "We rebuilt buying online: photography, telemetry, provenance.",
  },
  {
    year: "2023",
    title: "European network",
    body: "Four cities, one standard. 212-point inspection on every listing.",
  },
  {
    year: "2026",
    title: "Electric flagship program",
    body: "Direct allocations from six manufacturers, delivered to your door.",
  },
];

const testimonials = [
  {
    quote:
      "The only place I've bought a car without a phone call. Everything was already answered.",
    name: "Marcus Adler",
    role: "Collector, Zürich",
  },
  {
    quote: "They delivered at midnight so the street would be empty. That's the level.",
    name: "Sofia Renzi",
    role: "Architect, Milan",
  },
  {
    quote: "Provenance documentation better than the auction houses I use.",
    name: "Idris Haaland",
    role: "Advisor, London",
  },
];

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { data: cars, isLoading } = useQuery({ queryKey: ["cars"], queryFn: fetchCars });

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[620px] overflow-hidden">
        <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0">
          <img
            src={heroImg}
            alt="Matte graphite hypercar in a dark gallery"
            width={1920}
            height={1088}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        </motion.div>

        <Particles count={30} />

        <motion.div
          style={{ y: textY, opacity: fade }}
          className="relative mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24"
        >
          <MouseParallax intensity={10}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="eyebrow"
            >
              Curated since 2019 · 212-point inspection
            </motion.p>

            <h1 className="mt-6 max-w-4xl text-[clamp(2.6rem,9vw,7.5rem)] font-semibold leading-[0.86]">
              {["Extraordinary", "cars, quietly"].map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.25 + i * 0.12, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-editorial text-primary"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.49, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  acquired.
                </motion.span>
              </span>
            </h1>
          </MouseParallax>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Magnetic strength={0.3}>
              <Link
                to="/search"
                className="group inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[0_20px_60px_-20px_var(--glow)]"
              >
                Enter the collection
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.22}>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 rounded-full border border-border glass px-7 py-3.5 text-sm text-foreground"
              >
                Sell your car
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          style={{ opacity: fade }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="eyebrow text-[9px]">Scroll</span>
          <motion.span
            animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-10 w-px bg-primary"
          />
        </motion.div>
      </section>

      {/* ── Brand marquee ────────────────────────────────── */}
      <section className="border-y border-border py-7">
        <Marquee items={brands} />
      </section>

      {/* ── Statistics ───────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: 1420, suffix: "+", label: "Cars delivered" },
            { to: 212, suffix: "", label: "Inspection points" },
            { to: 4.9, decimals: 1, label: "Average client rating" },
            { to: 11, suffix: " days", label: "Median time to sale" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.09}>
              <p className="font-display text-[clamp(2.6rem,6vw,4rem)] font-semibold leading-none tracking-tighter">
                <Counter to={s.to} suffix={s.suffix ?? ""} decimals={s.decimals ?? 0} />
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured collection ──────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 pb-28 sm:px-8">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Current inventory</p>
            <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.95]">
              This week on the floor
            </h2>
          </div>
          <Link
            to="/search"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all {cars?.length ?? 6} vehicles
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-10%" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <CarCardSkeleton key={i} />)
            : cars?.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
        </motion.div>
      </section>

      {/* ── 3D configurator teaser ───────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
          <Reveal>
            <p className="eyebrow">Three-dimensional</p>
            <h2 className="mt-5 text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[0.95]">
              Walk around it <span className="text-editorial text-primary">before</span> you fly
              out.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Every listing ships with a real-time viewer. Orbit the silhouette, change the paint,
              inspect the stance — at 60fps, on any device.
            </p>
            <Magnetic className="mt-9" strength={0.3}>
              <Link
                to={cars?.[0] ? "/cars/$carId" : "/search"}
                params={cars?.[0] ? { carId: cars[0].id } : undefined}
                className="group inline-flex items-center gap-3 rounded-full border border-border px-6 py-3 text-sm"
              >
                Open a viewer
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
          <Reveal delay={0.12}>
            <CarViewer className="h-[380px] w-full sm:h-[460px]" color="#c9ccd2" />
          </Reveal>
        </div>
      </section>

      {/* ── Scroll storytelling ──────────────────────────── */}
      <StoryStrip />

      {/* ── Timeline ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-5 py-28 sm:px-8">
        <Reveal>
          <p className="eyebrow">The path here</p>
          <h2 className="mt-4 text-[clamp(2rem,5vw,3.6rem)] font-semibold">Seven quiet years</h2>
        </Reveal>
        <div className="relative mt-16">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[7px] top-2 h-full w-px origin-top bg-border md:left-1/2"
          />
          <div className="space-y-14">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.06}>
                <div
                  className={`relative pl-10 md:w-1/2 md:pl-0 ${
                    i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14 md:text-right"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-2 grid h-3.5 w-3.5 place-items-center rounded-full border border-primary bg-background md:left-auto ${
                      i % 2 ? "md:-left-[7px]" : "md:-right-[7px]"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <p className="font-display text-sm tracking-[0.2em] text-primary">{t.year}</p>
                  <h3 className="mt-2 text-xl font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="border-t border-border bg-surface px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="eyebrow">Clients</p>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {testimonials.map((t) => (
              <motion.figure
                key={t.name}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-border bg-card p-8"
              >
                <blockquote className="text-editorial text-2xl leading-snug">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-8 border-t border-border pt-5 text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="block text-muted-foreground">{t.role}</span>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-32 sm:px-8">
        <Particles count={18} />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[0.95]">
              Your next car is already{" "}
              <span className="text-editorial text-primary">in the room.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[15px] text-muted-foreground">
              Tell us the specification. We'll find it, inspect it and deliver it.
            </p>
            <Magnetic className="mt-10" strength={0.32}>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background"
              >
                Speak to a concierge
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function StoryStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <section ref={ref} className="relative h-[85svh] min-h-[520px] overflow-hidden">
      <motion.img
        style={{ y, scale }}
        src={interiorImg}
        alt="Illuminated luxury car interior at night"
        loading="lazy"
        width={1280}
        height={960}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-background/45" />
      <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
        <div className="max-w-xl">
          <Reveal>
            <p className="eyebrow">Chapter two</p>
            <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3.4rem)] font-semibold leading-[1]">
              We photograph in the dark so you see the light.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
              Every car is shot in our Monaco studio over two days — 180 frames, interior scans and
              a full cold-start recording. No filters, no stock imagery.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
