import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Scale,
  Star,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Percent,
  Landmark,
  Sparkles,
  PhoneCall,
  X,
  CheckCircle,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { currency, fetchCarById, fetchCars } from "@/lib/cars";
import { CarViewer } from "@/components/three/car-viewer";
import { Counter, Magnetic, Reveal, stagger, staggerItem } from "@/components/site/motion-kit";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Route = createFileRoute("/cars/$carId")({
  loader: ({ params }) => {
    return { carId: params.carId };
  },
  head: () => {
    return {
      meta: [
        { title: "Vehicle Details — YE CHALEGI" },
        {
          name: "description",
          content:
            "Verified vehicle details, price, gallery, finance estimate, and seller contact.",
        },
      ],
    };
  },
  component: CarDetail,
});

function CarDetail() {
  const { carId } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const {
    data: car,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["car", carId],
    queryFn: () => fetchCarById(carId),
    retry: 1,
  });
  const { data: inventory = [] } = useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
  });

  const saved = useAppStore((s) => s.saved.includes(carId));
  const inCompare = useAppStore((s) => s.compare.includes(carId));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  // Gallery state
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"gallery" | "interactive">("gallery");

  // Book Call state
  const [isBookCallOpen, setIsBookCallOpen] = useState(false);
  const [callForm, setCallForm] = useState({
    name: "",
    phone: "",
    message: "",
    preferredTime: "Tomorrow Morning",
  });

  // Review state
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Finance / EMI state
  const [depositPercent, setDepositPercent] = useState(20); // 20% down payment
  const [tenureMonths, setTenureMonths] = useState(60); // 5 years default
  const interestRate = 8.5; // 8.5% per annum

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
        <div className="h-[60vh] rounded-2xl border border-border bg-card shimmer" />
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="mx-auto max-w-[760px] px-5 pb-32 pt-32 text-center sm:px-8 sm:pt-40">
        <h1 className="text-[clamp(2rem,5vw,3.4rem)] font-semibold">Vehicle not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This listing may have been deleted from the admin panel or does not exist.
        </p>
        <Link
          to="/search"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to inventory
        </Link>
      </div>
    );
  }
  // Gallery state
  const carImages = car.images && car.images.length > 0 ? car.images : [car.image];

  const downPayment = Math.round((car.price * depositPercent) / 100);
  const loanAmount = car.price - downPayment;
  const monthlyRate = interestRate / 12 / 100;

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1),
  );

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  const nextImage = () => {
    setActiveImgIndex((prev) => (prev + 1) % carImages.length);
  };

  const prevImage = () => {
    setActiveImgIndex((prev) => (prev - 1 + carImages.length) % carImages.length);
  };

  return (
    <div className="pb-32 pt-28 sm:pt-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal>
          <Link
            to="/search"
            className="group inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
            Back to Collection
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">
                {car.make} · {car.year} · {car.location}
              </p>
              <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.4rem)] font-semibold leading-[0.92]">
                {car.name}
              </h1>
              <p className="mt-3 text-editorial text-2xl text-primary">{car.tagline}</p>
            </div>

            <div className="text-right">
              <p className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                {currency(car.price)}
              </p>
              <p className="mt-1 text-sm text-primary font-medium">
                EMI starting from ₹{emi.toLocaleString("en-IN")}/month
              </p>
            </div>
          </div>
        </Reveal>

        {/* View Mode Selector Tabs */}
        <Reveal delay={0.06} className="mt-8">
          <div className="mb-4 flex gap-2">
            {[
              { id: "gallery", label: "Photo Gallery (Amazon Swipe)" },
              { id: "interactive", label: "3D Interactive View" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setViewMode(t.id as "gallery" | "interactive")}
                className={cn(
                  "relative rounded-full px-5 py-2 text-xs font-medium transition-colors",
                  viewMode === t.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {viewMode === t.id && (
                  <motion.span
                    layoutId="view-tab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "gallery" ? (
              /* Amazon / Flipkart Style Swipeable Photo Gallery */
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Main Swipeable Image Container */}
                <div className="relative group overflow-hidden rounded-2xl bg-card border border-border">
                  <motion.div
                    key={activeImgIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -40) nextImage();
                      if (info.offset.x > 40) prevImage();
                    }}
                    className="relative cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={carImages[activeImgIndex]}
                      alt={`${car.name} photo ${activeImgIndex + 1}`}
                      loading="lazy"
                      className="h-[48svh] min-h-[350px] w-full object-cover sm:h-[64svh] pointer-events-none select-none"
                    />

                    {/* Image Counter Tag */}
                    <div className="absolute top-4 right-4 rounded-full glass px-3.5 py-1 text-xs font-semibold tracking-wider text-white">
                      {activeImgIndex + 1} / {carImages.length}
                    </div>

                    {/* Swipe Hint overlay */}
                    <div className="absolute bottom-4 left-4 rounded-full glass px-3 py-1 text-[11px] text-white/80 sm:hidden">
                      ← Swipe to view more photos →
                    </div>
                  </motion.div>

                  {/* Left Navigation Arrow */}
                  <button
                    onClick={prevImage}
                    aria-label="Previous photo"
                    className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  {/* Right Navigation Arrow */}
                  <button
                    onClick={nextImage}
                    aria-label="Next photo"
                    className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full glass text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>

                {/* Thumbnail Strip Below */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {carImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={cn(
                        "relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                        activeImgIndex === idx
                          ? "border-primary scale-105 shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-100",
                      )}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="h-20 w-32 object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* 3D Interactive Hover View */
              <motion.div
                key="interactive"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <CarViewer
                  image={car.image}
                  className="h-[48svh] min-h-[350px] w-full sm:h-[64svh]"
                  label="Hover & Move Cursor to Tilt 3D View"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>

        {/* Specifications & Story */}
        <section className="mt-20 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {/* Cars24 / CarDekho Style Provenance & History Banner */}
            <Reveal className="mb-12 rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 shadow-xl">
              <p className="eyebrow text-primary mb-4 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Verified Vehicle History & Condition (Cars24 /
                CarDekho Standard)
              </p>
              <div className="grid gap-4 sm:grid-cols-4 text-xs">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="eyebrow text-[10px] text-muted-foreground">Ownership</p>
                  <p className="mt-2 text-sm font-bold text-foreground">
                    👤{" "}
                    {car.ownerCount === 1
                      ? "1st Owner"
                      : car.ownerCount === 2
                        ? "2nd Owner"
                        : `${car.ownerCount}th Owner`}
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-400">RC Verified</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="eyebrow text-[10px] text-muted-foreground">Accident History</p>
                  <p className="mt-2 text-sm font-bold text-emerald-400">🛡️ {car.accidental}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">212 Points Checked</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="eyebrow text-[10px] text-muted-foreground">Insurance Status</p>
                  <p className="mt-2 text-sm font-bold text-foreground">📋 {car.insuranceStatus}</p>
                  <p className="mt-1 text-[10px] text-emerald-400">Policy Verified</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="eyebrow text-[10px] text-muted-foreground">Color & Finish</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-border shadow-sm"
                      style={{ background: car.colorHex }}
                    />
                    <span className="text-xs font-bold text-foreground truncate">
                      {car.colorName}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Original Paint</p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <p className="eyebrow">Technical Specification</p>
              <motion.dl
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4"
              >
                {[
                  { k: "Power", v: car.power, s: " hp" },
                  { k: "Torque", v: car.torque, s: " Nm" },
                  { k: "0–100 km/h", v: car.zeroToSixty, s: "s", d: 1 },
                  { k: "Top Speed", v: car.topSpeed, s: " km/h" },
                  { k: "Range", v: car.range, s: " km" },
                  { k: "Odometer", v: car.mileage, s: " km" },
                  { k: "Seating", v: car.seats, s: " seats" },
                  { k: "Model Year", v: car.year, s: "" },
                ].map((s) => (
                  <motion.div key={s.k} variants={staggerItem}>
                    <dt className="eyebrow text-[10px]">{s.k}</dt>
                    <dd className="mt-2 font-display text-2xl font-semibold tracking-tight">
                      <Counter to={s.v} suffix={s.s} decimals={s.d ?? 0} />
                    </dd>
                  </motion.div>
                ))}
              </motion.dl>
            </Reveal>

            <Reveal className="mt-16">
              <p className="eyebrow">Vehicle Overview</p>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {car.story}
              </p>
            </Reveal>

            <Reveal className="mt-16">
              <p className="eyebrow">Key Features & Options</p>
              <motion.ul
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2"
              >
                {car.features.map((f: string) => (
                  <motion.li
                    key={f}
                    variants={staggerItem}
                    className="flex items-center gap-3 border-b border-border pb-3 text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </motion.li>
                ))}
              </motion.ul>
            </Reveal>
          </div>

          {/* Sidebar Actions & Concierge Dealer */}
          <div className="lg:sticky lg:top-32 lg:h-fit">
            <Reveal>
              <div className="rounded-2xl border border-border bg-card p-7 shadow-xl">
                <p className="eyebrow">Instant Quote & Valuation</p>
                <p className="mt-4 font-display text-3xl font-semibold text-foreground">
                  {currency(car.price)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ex-Showroom · Inclusive of GST & Duties
                </p>

                <div className="mt-7 flex flex-col gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsBookCallOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
                  >
                    <PhoneCall className="h-4 w-4" /> Book a Call with Seller
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      toggleSaved(car.id);
                      toast(saved ? "Removed from garage" : "Saved to your garage");
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium transition-colors",
                      saved && "border-primary text-primary bg-primary/10",
                    )}
                  >
                    <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                    {saved ? "Saved in Garage" : "Save to Garage"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      toggleCompare(car.id);
                      toast(inCompare ? "Removed from compare" : "Added to compare list");
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium transition-colors",
                      inCompare && "border-primary text-primary bg-primary/10",
                    )}
                  >
                    <Scale className="h-4 w-4" />
                    {inCompare ? "In Comparison" : "Compare Vehicle"}
                  </motion.button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-7">
                <p className="eyebrow">Verified Showroom</p>
                <p className="mt-4 font-display text-lg font-semibold">{car.dealer.name}</p>
                <p className="text-sm text-muted-foreground">{car.dealer.city}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {car.dealer.rating} Rating · {car.dealer.sales} verified sales
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Indian EMI Plans & Finance Breakdown Section ── */}
        <section className="mt-28 border-t border-border pt-16">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Flexible Financing</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Custom EMI & Bank Offer Plans
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-medium rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
                <Percent className="h-3.5 w-3.5" />
                Rates starting from 8.25% p.a.
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* EMI Calculator Controls */}
            <Reveal className="lg:col-span-2 rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-lg">
              <h3 className="text-xl font-semibold">Calculate Your Monthly EMI</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust down payment and loan tenure to suit your financial budget.
              </p>

              {/* Special Admin Offer Highlight */}
              {car.offerTag && (
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white font-bold text-lg">
                    🔥
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-emerald-400">
                      Special Offer: {car.offerTag}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {car.offerDiscount ||
                        "Exclusive festive promotion valid on YE CHALEGI this week."}
                    </p>
                  </div>
                </div>
              )}

              {/* Tenure Selection */}
              <div className="mt-8">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Loan Tenure
                </label>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {[
                    { m: 12, label: "12 Months" },
                    { m: 36, label: "3 Years" },
                    { m: 60, label: "5 Years" },
                    { m: 84, label: "7 Years" },
                  ].map((item) => (
                    <button
                      key={item.m}
                      onClick={() => setTenureMonths(item.m)}
                      className={cn(
                        "rounded-xl border py-3 text-xs sm:text-sm font-medium transition-all",
                        tenureMonths === item.m
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Down Payment Slider */}
              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">
                    Down Payment ({depositPercent}%)
                  </span>
                  <span className="font-semibold text-primary">{currency(downPayment)}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none bg-surface accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>10% (Min)</span>
                  <span>30%</span>
                  <span>50% (Max)</span>
                </div>
              </div>

              {/* Calculated Breakdown Grid */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-8 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Net Loan Amount
                  </p>
                  <p className="mt-1 text-lg font-semibold">{currency(loanAmount)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Interest Rate
                  </p>
                  <p className="mt-1 text-lg font-semibold text-primary">{interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Total Interest
                  </p>
                  <p className="mt-1 text-lg font-semibold">{currency(totalInterest)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                    Monthly EMI
                  </p>
                  <p className="mt-1 text-xl font-bold text-primary">
                    ₹{emi.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Bank Partner Offers */}
            <Reveal delay={0.1} className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-7 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Landmark className="h-4 w-4" />
                  Bank Partner Offers
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Exclusive tie-ups for instant sanction & zero foreclosure fees.
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    {
                      bank: "HDFC Bank Auto Loan",
                      perk: "100% On-Road Funding",
                      rate: "8.25% p.a.",
                    },
                    {
                      bank: "ICICI Bank Express",
                      perk: "Pre-approved 30-min Sanction",
                      rate: "8.50% p.a.",
                    },
                    {
                      bank: "SBI Drive Luxury",
                      perk: "Zero Processing Charges",
                      rate: "8.35% p.a.",
                    },
                  ].map((b) => (
                    <div
                      key={b.bank}
                      className="rounded-xl border border-border bg-surface p-4 text-xs transition-colors hover:border-primary/50"
                    >
                      <div className="flex justify-between font-semibold">
                        <span>{b.bank}</span>
                        <span className="text-primary">{b.rate}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{b.perk}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() =>
                    toast.success(
                      "Financing callback requested — an advisor will call you within 15 minutes.",
                    )
                  }
                  className="mt-6 w-full rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Apply for Pre-Approved EMI
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Customer Reviews & Ratings Section ── */}
        <section className="mt-28 border-t border-border pt-16">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Owner Reviews</p>
                <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Ratings & Feedback</h2>
              </div>
              {car.reviews && car.reviews.length > 0 && (
                <div className="flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-5 py-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-4 w-4",
                          n <= Math.round(Number(car.averageRating) || 0)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {Number(car.averageRating || 0).toFixed(1)} · {car.reviews.length} reviews
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* Reviews List */}
            <Reveal className="lg:col-span-2 rounded-2xl border border-border bg-card p-7 sm:p-9 shadow-lg">
              {car.reviews && car.reviews.length > 0 ? (
                <div className="space-y-6">
                  {car.reviews.map((r, i) => (
                    <div key={i} className="border-b border-border pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{r.name}</p>
                            {r.date && (
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(r.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={cn(
                                "h-3.5 w-3.5",
                                n <= r.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No reviews yet. Be the first to share your experience with this vehicle.
                  </p>
                </div>
              )}
            </Reveal>

            {/* Write a Review */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-border bg-card p-7 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  Write a Review
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Share your experience and help other buyers make the right decision.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
                      toast.error("Please provide your name, a rating and a comment.");
                      return;
                    }
                    setIsSubmittingReview(true);
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/cars/${car.id}/reviews`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: reviewForm.name.trim(),
                          rating: reviewForm.rating,
                          comment: reviewForm.comment.trim(),
                        }),
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        toast.error(data?.error || "Could not submit review.");
                        return;
                      }
                      setReviewForm({ name: "", rating: 5, comment: "" });
                      queryClient.invalidateQueries({ queryKey: ["car", carId] });
                      toast.success("Thanks for your review!");
                    } catch {
                      toast.error("Network error. Make sure the backend is running on port 5000.");
                    } finally {
                      setIsSubmittingReview(false);
                    }
                  }}
                  className="mt-6 space-y-4 text-xs"
                >
                  <div>
                    <label className="eyebrow block mb-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Mehta"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                          aria-label={`${n} star`}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6",
                              n <= reviewForm.rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share details about condition, driving experience, ownership cost..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Related Vehicles */}
        <section className="mt-28">
          <Reveal>
            <p className="eyebrow">Similar Collection</p>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {inventory
              .filter((c) => c.id !== car.id)
              .slice(0, 3)
              .map((c) => (
                <motion.div key={c.id} variants={staggerItem}>
                  <Link
                    to="/cars/$carId"
                    params={{ carId: c.id }}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                    <div className="flex items-center justify-between p-5">
                      <span className="font-display text-sm font-semibold">{c.name}</span>
                      <span className="text-sm font-semibold text-primary">
                        {currency(c.price)}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </motion.div>
        </section>
      </div>

      {/* Sticky Bottom CTA */}
      <motion.div
        initial={{ y: 90 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6"
      >
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 rounded-2xl glass glow-ring px-5 py-3 shadow-2xl">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold">{car.name}</p>
            <p className="text-xs text-primary font-medium">
              {currency(car.price)} · ₹{emi.toLocaleString("en-IN")}/mo
            </p>
          </div>
          <Magnetic strength={0.25}>
            <button
              onClick={() =>
                toast.success("Test Drive Booking Confirmed — our concierge will contact you.")
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground sm:text-sm"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Doorstep Test Drive</span>
              <span className="sm:hidden">Test Drive</span>
            </button>
          </Magnetic>
        </div>
      </motion.div>

      {/* Book a Call with Seller Modal Overlay */}
      <AnimatePresence>
        {isBookCallOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">Book a Call with Seller</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {car.name} · {currency(car.price)}
                  </p>
                </div>
                <button
                  onClick={() => setIsBookCallOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/cars/${car.id}/inquiry`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(callForm),
                    });
                    if (!res.ok) {
                      toast.error("Could not book the call right now. Please try again.");
                      return;
                    }
                  } catch (err) {
                    toast.error("Network error. Make sure the backend is running on port 5000.");
                    return;
                  }
                  toast.success(
                    `Call booked with YE CHALEGI advisor for ${callForm.name || "you"}!`,
                  );
                  setIsBookCallOpen(false);
                }}
                className="mt-6 space-y-4 text-xs"
              >
                <div>
                  <label className="eyebrow block mb-1">Your Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    value={callForm.name}
                    onChange={(e) => setCallForm({ ...callForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Phone Number (WhatsApp preferred)</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={callForm.phone}
                    onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="eyebrow block mb-1">Preferred Time for Call</label>
                  <select
                    value={callForm.preferredTime}
                    onChange={(e) => setCallForm({ ...callForm, preferredTime: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="Tomorrow Morning">Tomorrow Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Tomorrow Afternoon">
                      Tomorrow Afternoon (1:00 PM - 5:00 PM)
                    </option>
                    <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                    <option value="Within 1 Hour (Urgent)">Within 1 Hour (Urgent Inquiry)</option>
                  </select>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Questions / Special Offer Request</label>
                  <textarea
                    rows={3}
                    placeholder="Ask about 50% less downpayment offer, test drive at doorstep, or loan EMI details..."
                    value={callForm.message}
                    onChange={(e) => setCallForm({ ...callForm, message: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBookCallOpen(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90"
                  >
                    <PhoneCall className="h-4 w-4" /> Confirm Call Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
