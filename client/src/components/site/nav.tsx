import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X, Heart, Scale, Sun, Moon, ShieldCheck, UserCheck } from "lucide-react";
import { Magnetic } from "./motion-kit";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/search", label: "Collection" },
  { to: "/compare", label: "Compare" },
  { to: "/financing", label: "Financing" },
  { to: "/sell", label: "Sell" },
];

const mega = [
  {
    title: "Browse",
    links: [
      { to: "/search", label: "All vehicles" },
      { to: "/search", label: "Electric" },
      { to: "/search", label: "Grand tourers" },
      { to: "/search", label: "Hyper series" },
    ],
  },
  {
    title: "Services",
    links: [
      { to: "/financing", label: "Financing" },
      { to: "/sell", label: "Sell your car" },
      { to: "/dashboard", label: "Dashboard" },
      { to: "/saved", label: "Saved" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About YE CHALEGI" },
      { to: "/contact", label: "Contact" },
      { to: "/about", label: "Concierge" },
      { to: "/contact", label: "Showrooms" },
    ],
  },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const { scrollY } = useScroll();
  const saved = useAppStore((s) => s.saved);
  const compare = useAppStore((s) => s.compare);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useMotionValueEvent(scrollY, "change", (v) => setFloating(v > 40));
  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5"
        onMouseLeave={() => setMegaOpen(false)}
      >
        <motion.nav
          animate={{
            paddingTop: floating ? 10 : 16,
            paddingBottom: floating ? 10 : 16,
            borderRadius: floating ? 18 : 8,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "mx-auto flex max-w-[1400px] items-center gap-4 px-4 sm:px-6",
            floating ? "glass glow-ring" : "border border-transparent",
          )}
        >
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <motion.span
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid h-7 w-7 place-items-center rounded-[6px] bg-primary text-primary-foreground font-extrabold text-xs"
            >
              YC
            </motion.span>
            <span className="font-display text-[15px] font-bold tracking-[0.24em]">YE CHALEGI</span>
          </Link>

          <div className="ml-4 hidden items-center gap-1 lg:flex">
            {primary.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onMouseEnter={() => setMegaOpen(false)}
                className="group relative px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
                <span className="absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
            <button
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((v) => !v)}
              className={cn(
                "px-3 py-2 text-[13px] transition-colors",
                megaOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              More
            </button>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35 }}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>

            <IconLink to="/compare" count={compare.length} label="Compare">
              <Scale className="h-4 w-4" />
            </IconLink>
            <IconLink to="/saved" count={saved.length} label="Saved">
              <Heart className="h-4 w-4" />
            </IconLink>

            {/* Auth / Admin CTA */}
            <AuthNavButtons />

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="grid h-9 w-9 place-items-center rounded-full text-foreground lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-2 hidden max-w-[1400px] rounded-2xl glass glow-ring p-8 lg:grid lg:grid-cols-4 lg:gap-10"
            >
              {mega.map((col, i) => (
                <div key={col.title}>
                  <p className="eyebrow mb-4">{col.title}</p>
                  <ul className="space-y-2.5">
                    {col.links.map((l, j) => (
                      <motion.li
                        key={l.label + j}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * (i * 2 + j), duration: 0.5 }}
                      >
                        <Link
                          to={l.to}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {l.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="rounded-xl bg-surface p-6">
                <p className="text-editorial text-2xl">Private viewings</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Book the showroom after hours. One car, one client, no rush.
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-block text-[13px] font-medium text-primary"
                >
                  Arrange →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex h-full flex-col justify-center gap-1 px-8">
              {[
                ...primary,
                { to: "/saved", label: "Saved" },
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={l.to}
                    className="block py-2 font-display text-[8vw] leading-tight tracking-tight"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconLink({
  to,
  count,
  label,
  children,
}: {
  to: string;
  count: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {children}
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

function AuthNavButtons() {
  const { user } = useAuthStore();

  if (user?.role === "admin") {
    return (
      <Magnetic className="hidden sm:inline-flex" strength={0.28}>
        <Link
          to="/admin"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <ShieldCheck className="h-4 w-4" /> Admin Portal
        </Link>
      </Magnetic>
    );
  }

  if (user) {
    return (
      <Magnetic className="hidden sm:inline-flex" strength={0.28}>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[12.5px] font-medium tracking-wide text-background transition-opacity hover:opacity-85"
        >
          <UserCheck className="h-3.5 w-3.5" /> {user.name.split(" ")[0]}
        </Link>
      </Magnetic>
    );
  }

  return (
    <Magnetic className="hidden sm:inline-flex" strength={0.28}>
      <Link
        to="/login"
        className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
      >
        Sign In / Sign Up
      </Link>
    </Magnetic>
  );
}
