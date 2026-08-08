export type Car = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number; // in INR (Rupees)
  monthly: number; // calculated EMI
  bodyType: "Coupe" | "Sedan" | "SUV" | "Hyper" | "Hatchback" | "MUV" | "Convertible" | "Other";
  fuel: "Electric" | "Hybrid" | "Petrol" | "Diesel";
  transmission: "Manual" | "Automatic" | "AMT" | "CVT" | "DCT";
  drivetrain: string;
  power: number;
  torque: number;
  zeroToSixty: number;
  topSpeed: number;
  range: number;
  seats: number;
  mileage: number;
  location: string;
  colorHex: string;
  colorName: string;
  image: string;
  images: string[];
  tagline: string;
  story: string;
  ownerCount: number;
  accidental: string;
  insuranceStatus: string;
  features: string[];
  offerTag?: string;
  offerDiscount?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerCity?: string;
  sellerEmail?: string;
  dealer: { name: string; rating: number; city: string; sales: number };
  reviews?: { name: string; rating: number; comment: string; date?: string }[];
  averageRating?: number;
};

export const brands = [
  "PORSCHE",
  "BMW",
  "TATA MOTORS",
  "MAHINDRA",
  "MARUTI SUZUKI",
  "MERCEDES-BENZ",
  "TOYOTA",
  "VOLKSWAGEN",
  "FIAT",
];
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/** Format numbers into Indian Lakhs (Lakh) or Crores (Cr) or standard ₹ format */
export const currency = (n: number) => {
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  } else if (n >= 100000) {
    const lakh = n / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

export type ApiCar = {
  _id?: string;
  id?: string;
  company?: string;
  model?: string;
  price?: number | string;
  year?: number | string;
  fuelType?: string;
  transmission?: string;
  kmDriven?: number | string;
  imageUrl?: string;
  description?: string;
  status?: string;
  bodyType?: string;
  registrationCity?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerCity?: string;
  sellerEmail?: string;
  offerTag?: string;
  offerDiscount?: string;
  power?: number | string;
  torque?: number | string;
  zeroToSixty?: number | string;
  topSpeed?: number | string;
  range?: number | string;
  seats?: number | string;
  drivetrain?: string;
  colorHex?: string;
  colorName?: string;
  ownerCount?: number | string;
  accidental?: string;
  insuranceStatus?: string;
  features?: string[];
  lotNumber?: number;
  reviews?: { name: string; rating: number; comment: string; date?: string }[];
  averageRating?: number;
};

const DEFAULT_CAR_IMAGE =
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800";

const resolveImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return DEFAULT_CAR_IMAGE;
  if (imageUrl.startsWith("http") || imageUrl.startsWith("data:")) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export const mapApiCar = (item: ApiCar): Car => {
  const price = Number(item.price) || 0;
  const company = item.company || "Unknown";
  const model = item.model || "Model";
  const name = `${company} ${model}`.trim();
  const mainImg = resolveImageUrl(item.imageUrl);

  return {
    id: String(item._id || item.id || item.lotNumber || ""),
    name,
    make: company,
    model,
    year: Number(item.year) || 2025,
    price,
    monthly: Math.round(price / 80),
    bodyType: (item.bodyType as Car["bodyType"]) || "Sedan",
    fuel: (item.fuelType as Car["fuel"]) || "Petrol",
    transmission: (["Manual", "Automatic", "AMT", "CVT", "DCT"].includes(item.transmission)
      ? item.transmission
      : "Manual") as Car["transmission"],
    drivetrain: item.drivetrain || "FWD",
    power:
      item.power !== undefined && item.power !== null && item.power !== ""
        ? Number(item.power)
        : 150,
    torque:
      item.torque !== undefined && item.torque !== null && item.torque !== ""
        ? Number(item.torque)
        : 220,
    zeroToSixty:
      item.zeroToSixty !== undefined && item.zeroToSixty !== null && item.zeroToSixty !== ""
        ? Number(item.zeroToSixty)
        : 8.5,
    topSpeed:
      item.topSpeed !== undefined && item.topSpeed !== null && item.topSpeed !== ""
        ? Number(item.topSpeed)
        : 180,
    range:
      item.range !== undefined && item.range !== null && item.range !== ""
        ? Number(item.range)
        : 600,
    seats:
      item.seats !== undefined && item.seats !== null && item.seats !== "" ? Number(item.seats) : 5,
    mileage: Number(item.kmDriven) || 0,
    location: item.registrationCity || item.sellerCity || "India",
    colorHex: item.colorHex || "#C0C0C0",
    colorName: item.colorName || "Silver Finish",
    image: mainImg,
    images: [mainImg],
    tagline: item.description
      ? `${item.description.slice(0, 70)}${item.description.length > 70 ? "..." : ""}`
      : `${name} available at YE CHALEGI.`,
    story: item.description || "No detailed description provided.",
    ownerCount:
      item.ownerCount !== undefined && item.ownerCount !== null ? Number(item.ownerCount) : 1,
    accidental: item.accidental || "Non-Accidental",
    insuranceStatus: item.insuranceStatus || "Valid Comprehensive",
    features:
      item.features && item.features.length > 0
        ? item.features
        : [
            "Verified Inspection",
            "Full Service History",
            "Comprehensive Warranty Available",
            "Instant Loan Sanction Partner",
          ],
    offerTag: item.offerTag || "",
    offerDiscount: item.offerDiscount || "",
    sellerName: item.sellerName || "",
    sellerPhone: item.sellerPhone || "",
    sellerCity: item.sellerCity || "",
    sellerEmail: item.sellerEmail || "",
    reviews: item.reviews || [],
    averageRating: item.averageRating || 0,
    dealer: {
      name: item.sellerName ? `YE CHALEGI ${item.sellerName}` : "YE CHALEGI Verified Showroom",
      rating: 4.9,
      city: item.sellerCity || item.registrationCity || "India",
      sales: 150,
    },
  };
};

const readApiError = async (res: Response) => {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors)) return data.errors.join(" ");
  } catch {
    // Ignore malformed error JSON
  }
  return `Request failed with status ${res.status}`;
};

export const fetchCars = async (): Promise<Car[]> => {
  const res = await fetch(`${API_BASE_URL}/api/cars`);
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const data = await res.json();
  if (Array.isArray(data)) return data.map(mapApiCar);
  return [];
};

export const fetchCarById = async (id: string): Promise<Car> => {
  const res = await fetch(`${API_BASE_URL}/api/cars/${id}`);
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const data = await res.json();
  return mapApiCar(data);
};

export const loginAdmin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Admin login failed.");
  }
  return data;
};

export type CarPayload = {
  company: string;
  model: string;
  price: number;
  year: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  imageUrl: string;
  description: string;
  bodyType: string;
  registrationCity: string;
  offerTag?: string;
  offerDiscount?: string;
  power?: number;
  torque?: number;
  zeroToSixty?: number;
  topSpeed?: number;
  range?: number;
  seats?: number;
  drivetrain?: string;
  colorName?: string;
  colorHex?: string;
  ownerCount?: number;
  accidental?: string;
  insuranceStatus?: string;
  features?: string[];
  sellerName?: string;
  sellerPhone?: string;
  sellerCity?: string;
  sellerEmail?: string;
};

const authedJsonRequest = async (
  path: string,
  method: "POST" | "PUT" | "DELETE",
  token: string,
  payload?: CarPayload,
) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!res.ok) {
    throw new Error(await readApiError(res));
  }

  if (method === "DELETE") return null;
  const data = await res.json();
  return mapApiCar(data);
};

export const createCar = (payload: CarPayload, token: string) =>
  authedJsonRequest("/api/cars", "POST", token, payload);

export const updateCar = (id: string, payload: CarPayload, token: string) =>
  authedJsonRequest(`/api/cars/${id}`, "PUT", token, payload);

export const deleteCar = (id: string, token: string) =>
  authedJsonRequest(`/api/cars/${id}`, "DELETE", token);
