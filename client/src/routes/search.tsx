import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X, MapPin, Sparkles, RotateCcw } from "lucide-react";

import { fetchCars, currency, brands as brandList } from "@/lib/cars";
import { CarCard, CarCardSkeleton } from "@/components/site/car-card";
import { Reveal } from "@/components/site/motion-kit";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search the Collection — YE CHALEGI" },
      {
        name: "description",
        content:
          "Filter YE CHALEGI's inventory by body style, powertrain, price, make and location. Instant results, compare mode and wishlist.",
      },
      { property: "og:title", content: "Search the Collection — YE CHALEGI" },
      { property: "og:description", content: "Filter inventory by body, powertrain and price." },
    ],
  }),
  component: SearchPage,
});

const bodies = ["Coupe", "Sedan", "SUV", "Hyper", "Hatchback"] as const;
const fuels = ["Petrol", "Electric", "Hybrid", "Diesel"] as const;
const cities = ["Mumbai", "Delhi NCR", "Bengaluru", "Pune", "Hyderabad", "Chennai"] as const;
const sorts = {
  relevance: "Relevance",
  priceAsc: "Price ↑ (Low to High)",
  priceDesc: "Price ↓ (High to Low)",
  fastest: "Fastest (0–100 km/h)",
  newest: "Year (Newest)",
} as const;

function SearchPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
    retry: 1,
    staleTime: 30_000, // Use cached data for 30s — prevents black flash on re-navigation
  });
  const [q, setQ] = useState("");
  const [body, setBody] = useState<string[]>([]);
  const [fuel, setFuel] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(0); // 0 = no cap — show every car in stock
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState<keyof typeof sorts>("relevance");
  const [drawer, setDrawer] = useState(false);
  const compare = useAppStore((s) => s.compare);

  // Price ceiling adapts automatically to the most expensive car in stock,
  // so newly added (even costly) vehicles always appear in the grid.
  const priceCeil = useMemo(() => {
    const prices = (data ?? []).map((c) => c.price).filter((p) => Number.isFinite(p) && p > 0);
    if (prices.length === 0) return 5000000;
    return Math.max(5000000, Math.ceil(Math.max(...prices) / 500000) * 500000);
  }, [data]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const resetFilters = () => {
    setQ("");
    setBody([]);
    setFuel([]);
    setSelectedBrands([]);
    setSelectedCities([]);
    setMaxPrice(0);
    setOffersOnly(false);
    setSort("relevance");
  };

  const activeFilterCount =
    (q ? 1 : 0) +
    body.length +
    fuel.length +
    selectedBrands.length +
    selectedCities.length +
    (maxPrice > 0 ? 1 : 0) +
    (offersOnly ? 1 : 0);

  const results = useMemo(() => {
    let list = (data ?? []).filter((c) => {
      // 1. Search Query Match
      const searchMatch =
        q === "" ||
        `${c.name} ${c.make} ${c.model} ${c.bodyType} ${c.fuel} ${c.location} ${c.tagline}`
          .toLowerCase()
          .includes(q.toLowerCase());

      // 2. Body Style Match
      const bodyMatch =
        body.length === 0 || body.some((b) => b.toLowerCase() === c.bodyType.toLowerCase());

      // 3. Fuel/Powertrain Match
      const fuelMatch =
        fuel.length === 0 || fuel.some((f) => f.toLowerCase() === c.fuel.toLowerCase());

      // 4. Brand/Make Match
      const brandMatch =
        selectedBrands.length === 0 ||
        selectedBrands.some(
          (b) =>
            b.toLowerCase().includes(c.make.toLowerCase()) ||
            c.make.toLowerCase().includes(b.toLowerCase()),
        );

      // 5. City/Location Match
      const cityMatch =
        selectedCities.length === 0 ||
        selectedCities.some(
          (city) =>
            city.toLowerCase().includes(c.location.toLowerCase()) ||
            c.location.toLowerCase().includes(city.toLowerCase()),
        );

      // 6. Max Price Match (0 = no cap, show everything)
      const priceMatch = maxPrice === 0 || c.price <= maxPrice;

      // 7. Special Offers Match
      const offerMatch = !offersOnly || Boolean(c.offerTag);

      return (
        searchMatch && bodyMatch && fuelMatch && brandMatch && cityMatch && priceMatch && offerMatch
      );
    });

    // Sorting logic
    if (sort === "priceAsc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "fastest") list = [...list].sort((a, b) => a.zeroToSixty - b.zeroToSixty);
    if (sort === "newest") list = [...list].sort((a, b) => b.year - a.year);

    return list;
  }, [data, q, body, fuel, selectedBrands, selectedCities, maxPrice, offersOnly, sort]);

  const filterSidebar = (
    <div className="space-y-8">
      {/* Header & Clear Button */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <p className="text-xs text-primary font-medium">{activeFilterCount} active filters</p>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-400 hover:underline"
          >
            <RotateCcw className="h-3 w-3" /> Reset all
          </button>
        )}
      </div>

      {/* Special Offers Toggle */}
      <FilterGroup title="Special Promotions">
        <button
          onClick={() => setOffersOnly(!offersOnly)}
          className={`flex w-full items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all ${
            offersOnly
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md"
              : "border-border text-muted-foreground hover:border-foreground/30"
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" /> Only Special Offers
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {offersOnly ? "ACTIVE" : "OFF"}
          </span>
        </button>
      </FilterGroup>

      {/* Body Style */}
      <FilterGroup title="Body Style">
        <div className="flex flex-wrap gap-2">
          {bodies.map((b) => (
            <Chip key={b} active={body.includes(b)} onClick={() => toggle(body, setBody, b)}>
              {b}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {/* Powertrain / Fuel */}
      <FilterGroup title="Powertrain">
        <div className="flex flex-wrap gap-2">
          {fuels.map((f) => (
            <Chip key={f} active={fuel.includes(f)} onClick={() => toggle(fuel, setFuel, f)}>
              {f}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {/* Brand / Make */}
      <FilterGroup title="Car Make / Brand">
        <div className="flex flex-wrap gap-2">
          {["Porsche", "BMW", "Tata Motors", "Mahindra", "Maruti Suzuki"].map((b) => (
            <Chip
              key={b}
              active={selectedBrands.includes(b)}
              onClick={() => toggle(selectedBrands, setSelectedBrands, b)}
            >
              {b}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {/* Maximum Price Range */}
      <FilterGroup title="Maximum Price">
        <input
          type="range"
          min={500000}
          max={priceCeil}
          step={500000}
          value={maxPrice === 0 ? priceCeil : maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="w-full accent-[var(--primary)]"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">₹5 Lakh</span>
          <span className="font-display text-base font-semibold text-primary">
            {maxPrice === 0 ? `Up to ${currency(priceCeil)}` : currency(maxPrice)}
          </span>
        </div>
      </FilterGroup>

      {/* Showroom Cities */}
      <FilterGroup title="Showroom Location">
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Chip
              key={city}
              active={selectedCities.includes(city)}
              onClick={() => toggle(selectedCities, setSelectedCities, city)}
            >
              <MapPin className="h-3 w-3 inline mr-1" /> {city}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <p className="eyebrow">Inventory Collection</p>
        <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-[0.95]">
          Find your dream drive.
        </h1>
      </Reveal>

      {/* Search & Sort Control Bar */}
      <Reveal delay={0.08} className="sticky top-20 z-30 mt-10">
        <div className="flex items-center gap-3 rounded-2xl glass glow-ring p-2.5 shadow-xl">
          <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by model name, make, fuel, or city…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />

          {q && (
            <button
              onClick={() => setQ("")}
              className="text-xs text-muted-foreground hover:text-foreground mr-2"
            >
              Clear
            </button>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
            className="hidden rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground outline-none sm:block cursor-pointer"
          >
            {Object.entries(sorts).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <button
            onClick={() => setDrawer(true)}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground lg:hidden"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-44">{filterSidebar}</div>
        </aside>

        <div>
          {/* Inventory Count & Status Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <motion.span
              key={results.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {isLoading
                ? "Loading inventory…"
                : `Showing ${results.length} of ${(data ?? []).length} vehicles`}
            </motion.span>

            <div className="flex items-center gap-4">
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Clear {activeFilterCount} Filter
                  {activeFilterCount > 1 ? "s" : ""}
                </button>
              )}
              {compare.length > 0 && (
                <span className="text-xs text-primary font-semibold">
                  {compare.length} in compare
                </span>
              )}
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
              {q && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">
                  Search: "{q}" <X className="h-3 w-3 cursor-pointer" onClick={() => setQ("")} />
                </span>
              )}
              {body.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  Body: {b}{" "}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggle(body, setBody, b)} />
                </span>
              ))}
              {fuel.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  Fuel: {f}{" "}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggle(fuel, setFuel, f)} />
                </span>
              ))}
              {selectedBrands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  Brand: {b}{" "}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggle(selectedBrands, setSelectedBrands, b)}
                  />
                </span>
              ))}
              {selectedCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  City: {c}{" "}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggle(selectedCities, setSelectedCities, c)}
                  />
                </span>
              ))}
              {offersOnly && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400">
                  🔥 Special Offers Only{" "}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setOffersOnly(false)} />
                </span>
              )}
            </div>
          )}

          {/* Cars Grid */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => <CarCardSkeleton key={i} />)
                : results.map((c, i) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.4) }}
                    >
                      <CarCard car={c} index={i} />
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>

          {/* Error / Offline Banner */}
          {isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center border border-rose-500/30 bg-rose-500/5 rounded-3xl mt-6 p-8"
            >
              <p className="font-display text-xl font-semibold text-rose-400">
                Unable to load vehicle inventory
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Ensure backend server is online."}
              </p>
            </motion.div>
          )}

          {/* Empty Results Prompt */}
          {!isLoading && !isError && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center border border-dashed border-border rounded-3xl mt-6 p-8"
            >
              <p className="font-display text-2xl font-semibold">
                No vehicles match your active filters.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening your price budget or clearing specific brand / body style selections.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90"
              >
                <RotateCcw className="h-4 w-4" /> Reset All Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md lg:hidden"
            onClick={() => setDrawer(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 right-0 w-full max-w-sm border-l border-border bg-card p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <p className="font-display text-lg font-semibold">Filters & Sort</p>
                <button
                  onClick={() => setDrawer(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Sort Dropdown */}
              <div className="mb-6">
                <label className="eyebrow block mb-2">Sort Results By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
                  className="w-full rounded-xl border border-border bg-card p-3 text-xs font-semibold text-foreground outline-none"
                >
                  {Object.entries(sorts).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {filterSidebar}

              <button
                onClick={() => setDrawer(false)}
                className="mt-8 w-full rounded-full bg-primary py-3.5 text-xs font-semibold text-primary-foreground shadow-lg"
              >
                View {results.length} Vehicles
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
