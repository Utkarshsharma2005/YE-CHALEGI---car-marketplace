import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import appCss from "../styles.css?url";
import { reportRuntimeError } from "../lib/error-reporting";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Cursor } from "@/components/site/cursor";
import { SmoothScroll, ThemeSync } from "@/components/site/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth";
import { useAppStore } from "@/store/app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-semibold tracking-tighter">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This road doesn't exist. Let's get you back to the collection.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm text-background"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportRuntimeError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try again, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "YE CHALEGI — Premium Indian Automotive Marketplace" },
      {
        name: "description",
        content:
          "YE CHALEGI is India's premier marketplace for luxury cars, EVs, SUVs and supercars.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROTECTED_PATHS = ["/dashboard", "/admin"];

// Loads & persists each user's saved cars from MongoDB (per-account, never shared)
function SavedSync() {
  const saved = useAppStore((s) => s.saved);
  const setSaved = useAppStore((s) => s.setSaved);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const keepFromServer = useRef(true);

  // On login / account switch: pull that user's saved cars from MongoDB
  useEffect(() => {
    setSaved([]);
    if (!token) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/auth/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        keepFromServer.current = true;
        setSaved(Array.isArray(data.saved) ? data.saved : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // only refetch when the account changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token]);

  // When the user toggles a save, persist the new list to MongoDB
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (keepFromServer.current) {
      keepFromServer.current = false;
      return;
    }
    if (!token) return;
    const t = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/auth/saved`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ saved }),
      }).catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [saved, token]);

  return null;
}

// Restore & verify the real MongoDB session on app load (JWT based)
function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, token, setAuth } = useAuthStore();
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (token && user) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setAuth(data.user, token);
          } else {
            useAuthStore.getState().logout();
          }
        })
        .catch(() => {});
    }
    // Restore the session once on app load; token/user changes are handled by the auth store.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (isProtected && !isAuthenticated && pathname !== "/login") {
      toast.info("🔐 Please sign in to access your dashboard.");
      navigate({ to: "/login" });
    }
  }, [isProtected, isAuthenticated, pathname, navigate]);

  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <SavedSync />
        <ThemeSync />
        <SmoothScroll />
        <Cursor />
        <Nav />
        <AnimatePresence mode="wait">
          <motion.main>
            {/* Required: nested routes render here. */}
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
        <Toaster position="bottom-right" />
      </AuthGuard>
    </QueryClientProvider>
  );
}
