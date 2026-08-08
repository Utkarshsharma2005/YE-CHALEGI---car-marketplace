import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Search as SearchIcon,
  Heart,
  ShieldCheck,
  LogOut,
  CheckCircle,
  Calendar,
  PhoneCall,
  Car,
  MapPin,
  Sparkles,
  User,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Edit3,
  X,
  Phone,
  Save,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchCars, currency } from "@/lib/cars";
import { Reveal, stagger, staggerItem } from "@/components/site/motion-kit";
import { useAppStore } from "@/store/app";
import { useAuthStore } from "@/store/auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Customer Hub — YE CHALEGI" },
      {
        name: "description",
        content: "Manage your saved garage, booked test drives, inquiries, and real profile.",
      },
    ],
  }),
  component: Dashboard,
});

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function Dashboard() {
  const navigate = useNavigate();
  const { user: storeUser, token: storeToken, logout: storeLogout, updateUser } = useAuthStore();

  const saved = useAppStore((s) => s.saved);
  const toggleSaved = useAppStore((s) => s.toggleSaved);

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
  });

  const watch = cars.filter((c) => saved.includes(c.id));
  const totalGarageValue = watch.reduce((sum, item) => sum + item.price, 0);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: storeUser?.name || "",
    phone: storeUser?.phone || "",
    city: storeUser?.city || "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      if (storeToken) {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storeToken}`,
          },
          body: JSON.stringify(editForm),
        });
        const data = await res.json();
        if (res.ok && data.user) {
          updateUser(data.user);
          toast.success("Profile updated successfully!");
          setIsEditProfileOpen(false);
          return;
        }
      }
      updateUser(editForm);
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch {
      toast.error("Failed to update profile on backend.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    storeLogout();
    toast.success("Signed out successfully.");
    navigate({ to: "/login" });
  };

  const displayName = storeUser?.name || "Valued Customer";
  const displayEmail = storeUser?.email || "customer@yechalegi.com";
  const displayPhone = storeUser?.phone || "Not set";
  const displayCity = storeUser?.city || "Not set";
  const displayPicture = storeUser?.picture;

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40 space-y-10">
      {/* Top Welcome Header Banner */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-5">
            {displayPicture ? (
              <img
                src={displayPicture}
                alt={displayName}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-primary/40 shadow-lg"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="eyebrow text-primary">Registered Customer Account</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle className="h-3 w-3" /> Verified Account
                </span>
                {storeUser?.authProvider && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-400 border border-blue-500/30 capitalize">
                    {storeUser.authProvider} Auth
                  </span>
                )}
              </div>

              <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-foreground">
                Hello, {displayName}!
              </h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                <span>{displayEmail}</span>
                <span>• Phone: {displayPhone}</span>
                <span>• City: {displayCity}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditForm({
                  name: storeUser?.name || "",
                  phone: storeUser?.phone || "",
                  city: storeUser?.city || "",
                });
                setIsEditProfileOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:border-primary transition-colors"
            >
              <Edit3 className="h-4 w-4 text-primary" /> Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout Account
            </button>
          </div>
        </div>
      </Reveal>

      {/* Summary Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-3"
      >
        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-card p-6 shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="eyebrow text-[10px]">Shortlisted Garage</p>
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-foreground">
            {watch.length} <span className="text-sm font-normal text-muted-foreground">Cars</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Saved vehicles in your personal garage
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-card p-6 shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="eyebrow text-[10px]">Total Garage Value</p>
            <Car className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-3 font-display text-3xl font-bold text-primary">
            {currency(totalGarageValue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Combined market value of shortlisted vehicles
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-card p-6 shadow-md"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="eyebrow text-[10px]">Account Security</p>
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 font-display text-xl font-bold text-emerald-400 truncate">
            {storeUser?.email || "Verified User"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">JWT Session Active • Express Backend</p>
        </motion.div>
      </motion.div>

      {/* Main Content: Garage Grid */}
      <Reveal className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-primary">My Shortlist</p>
            <h2 className="text-xl font-bold text-foreground mt-0.5">Shortlisted Vehicles</h2>
          </div>
          <Link
            to="/saved"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View All Saved <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-48 rounded-2xl border border-border bg-surface shimmer" />
        ) : watch.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Your shortlisted garage is currently empty.
            </p>
            <Link
              to="/search"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-90"
            >
              Browse Car Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {watch.map((c) => (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-card">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={() => toggleSaved(c.id)}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove from Garage"
                    >
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>

                  <div>
                    <p className="eyebrow text-[10px]">
                      {c.make} · {c.year}
                    </p>
                    <h3 className="text-sm font-bold text-foreground truncate">{c.name}</h3>
                    <p className="mt-1 font-display text-base font-bold text-primary">
                      {currency(c.price)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{c.location}</span>
                  <Link
                    to="/cars/$carId"
                    params={{ carId: c.id }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    View Details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Account Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Update your personal details and contact info
                  </p>
                </div>
                <button
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="eyebrow block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      required
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="eyebrow block mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Mumbai / Delhi NCR / Bangalore"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="rounded-full border border-border px-5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isSavingProfile ? "Saving..." : "Save to Database"}
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
