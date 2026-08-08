import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";

import { fetchCars } from "@/lib/cars";
import { CarCard } from "@/components/site/car-card";
import { Reveal, stagger } from "@/components/site/motion-kit";
import { useAppStore } from "@/store/app";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Cars — YE CHALEGI" },
      { name: "description", content: "Your private garage of shortlisted vehicles." },
      { property: "og:title", content: "Saved Cars — YE CHALEGI" },
      { property: "og:description", content: "Your shortlisted vehicles, kept in one place." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const saved = useAppStore((s) => s.saved);
  const { data: cars = [] } = useQuery({ queryKey: ["cars"], queryFn: fetchCars });
  const list = cars.filter((c) => saved.includes(c.id));

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Your garage</p>
        <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-[0.95]">
          Saved cars
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {list.length} vehicle{list.length === 1 ? "" : "s"} shortlisted.
        </p>
      </Reveal>

      {list.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-20 rounded-2xl border border-dashed border-border py-24 text-center">
            <p className="text-editorial text-3xl">An empty garage is a beginning.</p>
            <Link
              to="/search"
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
            >
              Start browsing
            </Link>
          </div>
        </Reveal>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {list.map((c, i) => (
            <CarCard key={c.id} car={c} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
