import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { Reveal } from "@/components/site/motion-kit";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In & Register — YE CHALEGI" },
      {
        name: "description",
        content:
          "Sign in or create a real customer account with Google or Email. Admin access for inventory management.",
      },
    ],
  }),
  component: LoginPage,
});

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [tab, setTab] = useState<"customer" | "admin">("customer");
  const [mode, setMode] = useState<"login" | "register">("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Real Customer Registration / Login via Express & MongoDB
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (mode === "register" && !form.name) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === "admin") {
        // Admin JWT Authentication
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();

        if (res.ok && data.token && data.user) {
          if (data.user.role !== "admin") {
            toast.error("Access denied. Admin role required.");
            setIsSubmitting(false);
            return;
          }
          setAuth(data.user, data.token);
          toast.success("🔑 Welcome back Admin! Control center unlocked.");
          navigate({ to: "/admin" });
          return;
        }

        toast.error(data?.error || "Admin authentication failed.");
        setIsSubmitting(false);
        return;
      }

      // Customer Real Auth (Express + MongoDB)
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "register"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              city: form.city,
            }
          : { email: form.email, password: form.password };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        setAuth(data.user, data.token);
        toast.success(
          mode === "register"
            ? `🎉 Welcome to YE CHALEGI, ${data.user.name}! Account saved to database.`
            : `✅ Signed in successfully! Welcome back, ${data.user.name}.`,
        );
        navigate({ to: "/dashboard" });
        return;
      }

      toast.error(data?.error || "Authentication failed. Please check your details.");
    } catch (err) {
      toast.error("Network error. Make sure backend server is running on port 5000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <div className="text-center space-y-3">
          <span className="eyebrow text-primary">Member Portal</span>
          <h1 className="text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[0.95] text-foreground">
            {tab === "admin"
              ? "Admin Control Center"
              : mode === "login"
                ? "Sign In to Your Account"
                : "Create a Customer Account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            {tab === "admin"
              ? "Protected JWT backend access for managing vehicle listings and inquiries."
              : mode === "login"
                ? "Access your shortlisted garage, test drive bookings, and verified customer services."
                : "Register your customer account to save vehicles, schedule test drives, and receive offers."}
          </p>
        </div>
      </Reveal>

      {/* Role / Portal Switcher */}
      <div className="mx-auto mt-10 max-w-md">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card/80 p-1.5 backdrop-blur-xl shadow-lg">
          <button
            type="button"
            onClick={() => setTab("customer")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all ${
              tab === "customer"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> Customer Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("admin");
              setForm({
                name: "",
                email: "admin@yechalegi.com",
                password: "",
                phone: "",
                city: "",
              });
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold transition-all ${
              tab === "admin"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Admin Portal
          </button>
        </div>
      </div>

      {/* Dark Glassmorphic Card */}
      <div className="mx-auto mt-6 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur-2xl space-y-6"
        >
          {tab === "customer" && (
            <>
              {/* Mode Switcher (Login vs Sign Up) */}
              <div className="flex border-b border-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`pb-3 flex-1 text-center transition-colors border-b-2 ${
                    mode === "login"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`pb-3 flex-1 text-center transition-colors border-b-2 ${
                    mode === "register"
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {tab === "customer" && mode === "register" && (
              <div>
                <label className="eyebrow block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Anshu Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="eyebrow block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="email"
                  placeholder={tab === "admin" ? "admin@yechalegi.com" : "you@example.com"}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            {tab === "customer" && mode === "register" && (
              <>
                <div>
                  <label className="eyebrow block mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">City (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Mumbai / Delhi NCR / Bangalore"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {tab === "admin" && (
              <div className="rounded-xl border border-border bg-surface p-3 text-[11px] text-muted-foreground">
                💡 <span className="font-semibold text-foreground">Default Admin Credentials:</span>{" "}
                <code className="text-primary">admin@yechalegi.com</code> /{" "}
                <code className="text-primary">admin123</code>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-xl hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                "Processing..."
              ) : tab === "admin" ? (
                <>
                  <ShieldCheck className="h-4 w-4" /> Sign In to Admin Control Center
                </>
              ) : mode === "register" ? (
                <>
                  <UserPlus className="h-4 w-4" /> Create Real Customer Account
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In to Customer Account
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
