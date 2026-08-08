import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  PhoneCall,
  LogOut,
  Sparkles,
  Search,
  CheckCircle,
  X,
  Building2,
  Upload,
  Car as CarIcon,
  Users,
  Phone,
  MapPin,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import {
  createCar,
  deleteCar,
  fetchCars,
  updateCar,
  currency,
  type Car,
  type CarPayload,
} from "@/lib/cars";
import { Reveal } from "@/components/site/motion-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal & Inventory Management — YE CHALEGI" },
      {
        name: "description",
        content:
          "Admin control center for car listings, CRUD operations, and seller call bookings.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, logout } = useAuthStore();

  const isAdmin = user?.role === "admin";

  const {
    data: inventory = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
  });

  const [search, setSearch] = useState("");
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"cars" | "inquiries">("cars");

  const [carForm, setCarForm] = useState({
    name: "",
    make: "",
    model: "",
    year: 2025,
    price: 1500000,
    fuel: "Petrol" as "Electric" | "Hybrid" | "Petrol" | "Diesel",
    transmission: "Manual" as "Manual" | "Automatic" | "AMT" | "CVT" | "DCT",
    bodyType: "SUV" as
      "Coupe" | "Sedan" | "SUV" | "Hyper" | "Hatchback" | "MUV" | "Convertible" | "Other",
    drivetrain: "FWD",
    power: 120,
    torque: 200,
    zeroToSixty: 9.5,
    topSpeed: 180,
    range: 650,
    seats: 5,
    mileage: 2000,
    location: "Mumbai",
    colorHex: "#17181a",
    colorName: "Midnight Black",
    image: "",
    tagline: "Premium automobile in peak condition.",
    story: "Detailed inspection completed. Single owner vehicle with full service history.",
    offerTag: "",
    offerDiscount: "",
    ownerCount: 1,
    accidental: "Non-Accidental",
    insuranceStatus: "Valid Comprehensive",
    features: "Verified Inspection, Full Service History, Leather Seats, Touchscreen",
    sellerName: "YE CHALEGI Verified Showroom",
    sellerPhone: "+91 98765 43210",
    sellerCity: "Mumbai",
    sellerEmail: "contact@yechalegi.com",
  });

  const [inquiries] = useState([
    {
      id: "inq-101",
      carName: "Porsche 911 GT3 RS",
      buyerName: "Vikram Malhotra",
      buyerPhone: "+91 98200 11223",
      preferredTime: "Tomorrow at 4:00 PM",
      message: "Interested in test drive and 50% downpayment EMI scheme.",
      date: "31 Jul 2026",
    },
    {
      id: "inq-102",
      carName: "Mahindra Thar ROXX 4x4",
      buyerName: "Ananya Roy",
      buyerPhone: "+91 99300 44556",
      preferredTime: "Weekend Morning",
      message: "Looking to check finance approval for 5-year loan.",
      date: "31 Jul 2026",
    },
  ]);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCarForm((prev) => ({ ...prev, image: reader.result as string }));
          toast.success("Image file uploaded successfully! Live preview updated.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (car: Car) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      fuel: car.fuel,
      transmission: car.transmission || "Manual",
      bodyType: car.bodyType,
      drivetrain: car.drivetrain || "FWD",
      power: car.power,
      torque: car.torque,
      zeroToSixty: car.zeroToSixty,
      topSpeed: car.topSpeed,
      range: car.range,
      seats: car.seats,
      mileage: car.mileage,
      location: car.location,
      colorHex: car.colorHex,
      colorName: car.colorName,
      image: car.image,
      tagline: car.tagline,
      story: car.story,
      offerTag: car.offerTag || "",
      offerDiscount: car.offerDiscount || "",
      ownerCount: car.ownerCount || 1,
      accidental: car.accidental || "Non-Accidental",
      insuranceStatus: car.insuranceStatus || "Valid Comprehensive",
      features: Array.isArray(car.features) ? car.features.join(", ") : car.features || "",
      sellerName: car.sellerName || "",
      sellerPhone: car.sellerPhone || "",
      sellerCity: car.sellerCity || car.location || "",
      sellerEmail: car.sellerEmail || "",
    });
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !token) {
      toast.error("Admin login is required before publishing inventory changes.");
      navigate({ to: "/login" });
      return;
    }

    if (!carForm.image || carForm.image.trim() === "") {
      toast.error("Please add at least one vehicle photo before publishing the listing.");
      return;
    }

    const featuresList =
      typeof carForm.features === "string"
        ? carForm.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : carForm.features;

    const fullName = carForm.name.trim();
    if (!fullName) {
      toast.error("Please enter a car name before saving.");
      return;
    }
    const makeText = carForm.make.trim();
    let company: string;
    let model: string;
    if (makeText && fullName.toLowerCase().startsWith(makeText.toLowerCase())) {
      company = makeText;
      model = fullName.slice(makeText.length).trim() || makeText;
    } else {
      const tokens = fullName.split(/\s+/);
      company = tokens[0] || "Unknown";
      model = tokens.slice(1).join(" ") || tokens[0];
    }

    const payload: CarPayload = {
      company,
      model,
      price: carForm.price,
      year: carForm.year,
      fuelType: carForm.fuel,
      transmission: carForm.transmission,
      kmDriven: carForm.mileage,
      imageUrl:
        carForm.image ||
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
      description: carForm.story,
      bodyType: carForm.bodyType,
      registrationCity: carForm.location,
      offerTag: carForm.offerTag,
      offerDiscount: carForm.offerDiscount,
      power: carForm.power,
      torque: carForm.torque,
      zeroToSixty: carForm.zeroToSixty,
      topSpeed: carForm.topSpeed,
      range: carForm.range,
      seats: carForm.seats,
      drivetrain: carForm.drivetrain,
      colorName: carForm.colorName,
      colorHex: carForm.colorHex,
      ownerCount: carForm.ownerCount,
      accidental: carForm.accidental,
      insuranceStatus: carForm.insuranceStatus,
      features: featuresList,
      sellerName: carForm.sellerName,
      sellerPhone: carForm.sellerPhone,
      sellerCity: carForm.sellerCity || carForm.location,
      sellerEmail: carForm.sellerEmail,
    };

    setIsSaving(true);
    try {
      if (editingCar) {
        await updateCar(editingCar.id, payload, token);
        toast.success(`Car "${carForm.name}" updated successfully!`);
      } else {
        await createCar(payload, token);
        toast.success(`New car "${carForm.name}" added to YE CHALEGI inventory!`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to save car. Check server and admin login.",
      );
      return;
    } finally {
      setIsSaving(false);
    }

    setEditingCar(null);
    setIsAddOpen(false);
    queryClient.invalidateQueries({ queryKey: ["cars"] });
    refetch();
  };

  const handleDeleteCar = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    if (!isAdmin || !token) {
      toast.error("Admin login is required before deleting listings.");
      navigate({ to: "/login" });
      return;
    }

    try {
      await deleteCar(id, token);
      toast.success(`Car "${name}" deleted.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete car.");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["cars"] });
    refetch();
  };

  const handleApplyOffer = (car: Car, offerTag: string, offerDiscount: string) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      fuel: car.fuel,
      transmission: car.transmission || "Manual",
      bodyType: car.bodyType,
      drivetrain: car.drivetrain || "FWD",
      power: car.power,
      torque: car.torque,
      zeroToSixty: car.zeroToSixty,
      topSpeed: car.topSpeed,
      range: car.range,
      seats: car.seats,
      mileage: car.mileage,
      location: car.location,
      colorHex: car.colorHex,
      colorName: car.colorName,
      image: car.image,
      tagline: car.tagline,
      story: car.story,
      offerTag,
      offerDiscount,
      ownerCount: car.ownerCount || 1,
      accidental: car.accidental || "Non-Accidental",
      insuranceStatus: car.insuranceStatus || "Valid Comprehensive",
      features: Array.isArray(car.features) ? car.features.join(", ") : car.features || "",
      sellerName: car.sellerName || "",
      sellerPhone: car.sellerPhone || "",
      sellerCity: car.sellerCity || car.location || "",
      sellerEmail: car.sellerEmail || "",
    });
    toast.info(`Offer preset loaded for "${car.name}". Click 'Save Changes' to publish.`);
  };

  const filteredCars = inventory.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.make.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (!isAdmin || !token) {
      toast.error("🔑 Admin login required. Redirecting to sign in page...");
      navigate({ to: "/login" });
    }
  }, [isAdmin, token, navigate]);

  if (!isAdmin || !token) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow">YE CHALEGI Control Center</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> Authenticated Admin
              </span>
            </div>
            <h1 className="mt-2 text-[clamp(2.2rem,6vw,4.2rem)] font-semibold leading-[0.95]">
              Vehicle Operations
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Add, update price, edit specs, change status or remove vehicle listings from the
              control center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditingCar(null);
                setCarForm({
                  name: "",
                  make: "",
                  model: "",
                  year: 2025,
                  price: 1500000,
                  fuel: "Petrol",
                  transmission: "Manual",
                  bodyType: "SUV",
                  drivetrain: "FWD",
                  power: 120,
                  torque: 200,
                  zeroToSixty: 9.5,
                  topSpeed: 180,
                  range: 650,
                  seats: 5,
                  mileage: 2000,
                  location: "Mumbai",
                  colorHex: "#17181a",
                  colorName: "Midnight Black",
                  image: "",
                  tagline: "Premium vehicle in peak condition.",
                  story: "Single owner vehicle with verified inspection history.",
                  offerTag: "",
                  offerDiscount: "",
                  ownerCount: 1,
                  accidental: "Non-Accidental",
                  insuranceStatus: "Valid Comprehensive",
                  features: "Verified Inspection, Full Service History, Leather Seats, Touchscreen",
                  sellerName: "YE CHALEGI Verified Showroom",
                  sellerPhone: "+91 98765 43210",
                  sellerCity: "Mumbai",
                  sellerEmail: "contact@yechalegi.com",
                });
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add Vehicle
            </button>

            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-b border-border pb-4">
          <button
            onClick={() => setActiveTab("cars")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
              activeTab === "cars"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-surface",
            )}
          >
            <CarIcon className="h-4 w-4" /> Vehicle Inventory ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors",
              activeTab === "inquiries"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-surface",
            )}
          >
            <Users className="h-4 w-4" /> Buyer Test Drive Requests ({inquiries.length})
          </button>
        </div>
      </Reveal>

      {activeTab === "inquiries" ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Active Customer Inquiries
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {inquiries.map((inq) => (
              <div key={inq.id} className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-[10px] text-primary">{inq.carName}</span>
                  <span className="text-[10px] text-muted-foreground">{inq.date}</span>
                </div>
                <p className="text-base font-semibold">{inq.buyerName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" /> {inq.buyerPhone}
                </p>
                <div className="rounded-xl bg-surface p-3 text-xs space-y-1">
                  <p className="font-medium text-foreground">Requested: {inq.preferredTime}</p>
                  <p className="text-muted-foreground italic">"{inq.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search inventory by title, make, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredCars.length === inventory.length
                ? `${inventory.length} vehicle${inventory.length !== 1 ? "s" : ""} in inventory`
                : `Showing ${filteredCars.length} of ${inventory.length} vehicles`}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 text-center py-20">
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading live inventory from backend...
              </p>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="mt-8 text-center py-20 rounded-2xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                No vehicle listings match your search.
              </p>
            </div>
          ) : (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Year / Fuel</th>
                    <th className="px-5 py-4">Provenence & History</th>
                    <th className="px-5 py-4">Specs (0-100 / Power / Range)</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCars.map((car) => (
                    <tr key={car.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={car.image}
                            alt={car.name}
                            className="h-12 w-16 rounded-lg object-cover bg-surface"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{car.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {car.bodyType} · {car.make}
                            </p>
                            {car.offerTag && (
                              <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                🔥 {car.offerTag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-primary">
                        {currency(car.price)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-medium">{car.year}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {car.fuel} · {car.drivetrain}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="inline-block rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold">
                            👤{" "}
                            {car.ownerCount === 1
                              ? "1st Owner"
                              : car.ownerCount === 2
                                ? "2nd Owner"
                                : `${car.ownerCount}th Owner`}
                          </span>
                          <span className="block text-[10px] text-emerald-400 font-medium">
                            🛡️ {car.accidental}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            📋 {car.insuranceStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-[11px] space-y-0.5">
                          <p>
                            <span className="text-muted-foreground">0-100:</span> {car.zeroToSixty}s
                          </p>
                          <p>
                            <span className="text-muted-foreground">Power:</span> {car.power} hp
                          </p>
                          <p>
                            <span className="text-muted-foreground">Range:</span> {car.range} km
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {car.location}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(car)}
                            className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs text-foreground hover:bg-surface transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-primary" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car.id, car.name)}
                            className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {(isAddOpen || editingCar) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface shrink-0">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  {editingCar ? (
                    <Edit2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                  {editingCar
                    ? `Edit Listing — ${editingCar.name}`
                    : "Add New Vehicle to Inventory"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingCar(null);
                  }}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSaveCar}
                className="flex flex-col min-h-0 flex-1 overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                  <div>
                    <p className="eyebrow text-primary mb-3">1. Basic Vehicle Information</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="eyebrow block mb-1">Car Name / Title</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Maruti Suzuki Swift Sport"
                          value={carForm.name}
                          onChange={(e) => setCarForm({ ...carForm, name: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Make / Company</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Maruti Suzuki"
                          value={carForm.make}
                          onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="eyebrow block mb-1">Price (in INR ₹)</label>
                        <input
                          required
                          type="number"
                          placeholder="850000"
                          value={carForm.price}
                          onChange={(e) => setCarForm({ ...carForm, price: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Manufacturing Year</label>
                        <input
                          required
                          type="number"
                          placeholder="2023"
                          value={carForm.year}
                          onChange={(e) => setCarForm({ ...carForm, year: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Registration City / Location</label>
                        <input
                          required
                          type="text"
                          placeholder="Mumbai / Delhi"
                          value={carForm.location}
                          onChange={(e) => setCarForm({ ...carForm, location: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-4">
                      <div>
                        <label className="eyebrow block mb-1">Body Type</label>
                        <select
                          value={carForm.bodyType}
                          onChange={(e) =>
                            setCarForm({
                              ...carForm,
                              bodyType: e.target.value as
                                | "Coupe"
                                | "Sedan"
                                | "SUV"
                                | "Hyper"
                                | "Hatchback"
                                | "MUV"
                                | "Convertible"
                                | "Other",
                            })
                          }
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-sm outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="SUV">SUV</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="MUV">MUV</option>
                          <option value="Coupe">Coupe</option>
                          <option value="Convertible">Convertible</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Fuel Type</label>
                        <select
                          value={carForm.fuel}
                          onChange={(e) =>
                            setCarForm({
                              ...carForm,
                              fuel: e.target.value as "Electric" | "Hybrid" | "Petrol" | "Diesel",
                            })
                          }
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-sm outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Electric">Electric</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Diesel">Diesel</option>
                        </select>
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Transmission</label>
                        <select
                          value={carForm.transmission}
                          onChange={(e) =>
                            setCarForm({
                              ...carForm,
                              transmission: e.target.value as
                                "Manual" | "Automatic" | "AMT" | "CVT" | "DCT",
                            })
                          }
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-sm outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic</option>
                          <option value="AMT">AMT</option>
                          <option value="CVT">CVT</option>
                          <option value="DCT">DCT</option>
                        </select>
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Odometer (KM Driven)</label>
                        <input
                          type="number"
                          placeholder="25000"
                          value={carForm.mileage}
                          onChange={(e) => setCarForm({ ...carForm, mileage: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <p className="eyebrow text-primary">
                      2. Vehicle Provenance & History (Cars24 / CarDekho Standard)
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="eyebrow block mb-1">Owner Count</label>
                        <select
                          value={carForm.ownerCount}
                          onChange={(e) => setCarForm({ ...carForm, ownerCount: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value={1}>1st Owner (Single Owner)</option>
                          <option value={2}>2nd Owner</option>
                          <option value={3}>3rd Owner</option>
                          <option value={4}>4th Owner or More</option>
                        </select>
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Accident History</label>
                        <select
                          value={carForm.accidental}
                          onChange={(e) => setCarForm({ ...carForm, accidental: e.target.value })}
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="Non-Accidental">Non-Accidental (Zero Accidents)</option>
                          <option value="Minor Scratches">Minor Scratches Noted</option>
                          <option value="Accidental Repair">Accidental Repair History</option>
                        </select>
                      </div>

                      <div>
                        <label className="eyebrow block mb-1">Insurance Status</label>
                        <select
                          value={carForm.insuranceStatus}
                          onChange={(e) =>
                            setCarForm({ ...carForm, insuranceStatus: e.target.value })
                          }
                          className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="Valid Comprehensive">Valid Comprehensive Insurance</option>
                          <option value="Third Party Only">Third Party Insurance Only</option>
                          <option value="Expired">Insurance Expired</option>
                          <option value="Unclaimed Insurance">Zero Insurance Claim History</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                    <p className="eyebrow text-foreground">3. Dynamic Performance Specifications</p>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <div>
                        <label className="eyebrow block mb-1">0-100 km/h (Sec)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
                          value={carForm.zeroToSixty}
                          onChange={(e) => setCarForm({ ...carForm, zeroToSixty: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Power (hp)</label>
                        <input
                          type="number"
                          placeholder="150"
                          value={carForm.power}
                          onChange={(e) => setCarForm({ ...carForm, power: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Torque (Nm)</label>
                        <input
                          type="number"
                          placeholder="220"
                          value={carForm.torque}
                          onChange={(e) => setCarForm({ ...carForm, torque: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Top Speed (km/h)</label>
                        <input
                          type="number"
                          placeholder="180"
                          value={carForm.topSpeed}
                          onChange={(e) => setCarForm({ ...carForm, topSpeed: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="eyebrow block mb-1">Driving Range (km)</label>
                        <input
                          type="number"
                          placeholder="600"
                          value={carForm.range}
                          onChange={(e) => setCarForm({ ...carForm, range: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Seats</label>
                        <input
                          type="number"
                          placeholder="5"
                          value={carForm.seats}
                          onChange={(e) => setCarForm({ ...carForm, seats: +e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Drivetrain</label>
                        <input
                          type="text"
                          placeholder="FWD / RWD / AWD / Manual / Automatic"
                          value={carForm.drivetrain}
                          onChange={(e) => setCarForm({ ...carForm, drivetrain: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="eyebrow block mb-1">Color Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Pearl White / Midnight Black"
                        value={carForm.colorName}
                        onChange={(e) => setCarForm({ ...carForm, colorName: e.target.value })}
                        className="w-full rounded-xl border border-border bg-transparent p-2.5 text-xs outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="eyebrow block mb-1">Color Hex Code</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={carForm.colorHex}
                          onChange={(e) => setCarForm({ ...carForm, colorHex: e.target.value })}
                          className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={carForm.colorHex}
                          onChange={(e) => setCarForm({ ...carForm, colorHex: e.target.value })}
                          className="flex-1 rounded-xl border border-border bg-transparent p-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Key Features (Comma-Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Touchscreen, Sunroof, Alloy Wheels, ADAS, Leather Seats, 6 Airbags"
                      value={carForm.features}
                      onChange={(e) => setCarForm({ ...carForm, features: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent p-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-4 w-4" /> Special Offer / Promotion Tag
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="eyebrow block mb-1">Offer Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. 50% Less Downpayment"
                          value={carForm.offerTag}
                          onChange={(e) => setCarForm({ ...carForm, offerTag: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="eyebrow block mb-1">Offer Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Festive Scheme / ₹1 Lakh Bonus"
                          value={carForm.offerDiscount}
                          onChange={(e) =>
                            setCarForm({ ...carForm, offerDiscount: e.target.value })
                          }
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-xs outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                    <label className="eyebrow block">Car Photo (Upload File or Enter URL)</label>

                    <div className="grid gap-3 sm:grid-cols-2 items-center">
                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">
                          Upload File from Device:
                        </span>
                        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 p-3 text-xs font-semibold text-primary cursor-pointer transition-colors hover:bg-primary/10">
                          <Upload className="h-4 w-4" /> Select Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block mb-1">
                          Or Paste Image Web URL:
                        </span>
                        <input
                          type="text"
                          placeholder="https://... or /assets/..."
                          value={carForm.image}
                          onChange={(e) => setCarForm({ ...carForm, image: e.target.value })}
                          className="w-full rounded-xl border border-border bg-transparent p-2.5 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {carForm.image && (
                      <div className="mt-2 flex items-center gap-3 rounded-xl border border-border p-2.5 bg-card">
                        <img
                          src={carForm.image}
                          alt="Car Preview"
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-emerald-400">
                            ✓ Image Loaded Successfully
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {carForm.image.slice(0, 50)}...
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCarForm({ ...carForm, image: "" })}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="eyebrow block mb-1">Description / Story</label>
                    <textarea
                      rows={3}
                      placeholder="Vehicle description, features, warranty..."
                      value={carForm.story}
                      onChange={(e) => setCarForm({ ...carForm, story: e.target.value })}
                      className="w-full rounded-xl border border-border bg-transparent p-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-card shrink-0 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      setEditingCar(null);
                    }}
                    className="rounded-full border border-border px-5 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
                  >
                    {isSaving ? "Saving..." : editingCar ? "Save Changes" : "Publish Listing"}
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
