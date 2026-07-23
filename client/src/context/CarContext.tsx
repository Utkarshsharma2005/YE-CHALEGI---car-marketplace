import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Bid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
}

export interface Car {
  id: string;
  company: string;
  model: string;
  price: number;
  year: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  imageUrl: string;
  description: string;
  status: 'available' | 'sold';
  lotNumber: number;
  bids: Bid[];
  createdAt: string;
}

interface CarContextType {
  cars: Car[];
  addCar: (car: Omit<Car, 'id' | 'lotNumber' | 'bids' | 'createdAt' | 'status'>) => void;
  updateCar: (id: string, carData: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  placeBid: (carId: string, amount: number, bidder: string) => boolean;
  toggleStatus: (id: string) => void;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

const initialCars: Car[] = [
  {
    id: "c1",
    company: "Hindustan",
    model: "Ambassador Classic (Taxi)",
    price: 185000,
    year: 1998,
    fuelType: "Diesel",
    transmission: "Manual",
    kmDriven: 142000,
    imageUrl: "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&q=80&w=800",
    description: "An absolute classic yellow Hindustan Ambassador. Iconic Indian motoring carriage with solid build quality and timeless heritage styling.",
    status: "available",
    lotNumber: 1,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b1_1", bidder: "Ramesh Kumar", amount: 150000, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "b1_2", bidder: "Sanjay Sharma", amount: 175000, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c2",
    company: "Volkswagen",
    model: "Beetle 1300 Classic",
    price: 520000,
    year: 1972,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 89000,
    imageUrl: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800",
    description: "Classic air-cooled Beetle bug in sunny canary yellow. Immaculate chrome work, original dials, and signature purr of the boxer engine.",
    status: "available",
    lotNumber: 2,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b2_1", bidder: "Vikram Malhotra", amount: 480000, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "b2_2", bidder: "Pooja Hegde", amount: 510000, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c3",
    company: "Ford",
    model: "Mustang Fastback GT",
    price: 950000,
    year: 1967,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 68000,
    imageUrl: "https://images.unsplash.com/photo-1584441401015-c93b142c6e3d?auto=format&fit=crop&q=80&w=800",
    description: "A legendary red muscle car. Immaculate fastback styling, powerful V8 engine, and custom tan leather interiors. A true head turner.",
    status: "available",
    lotNumber: 3,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b3_1", bidder: "Arun Jaitley", amount: 880000, timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "b3_2", bidder: "Karan Johar", amount: 920000, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c4",
    company: "Mini",
    model: "Cooper S (Classic)",
    price: 320000,
    year: 1974,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 52000,
    imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=800",
    description: "A nostalgic classic red pocket rocket Mini Cooper. Single owner, original circular dashboards, and highly responsive handling.",
    status: "available",
    lotNumber: 4,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b4_1", bidder: "Amit Patel", amount: 310000, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c5",
    company: "Willys",
    model: "Jeep CJ-3B",
    price: 450000,
    year: 1962,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 53000,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    description: "Authentic 4x4 military offroad pioneer. Olive green matte finish, high-low range transfer case works flawlessly. Relive the utility era.",
    status: "available",
    lotNumber: 5,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    bids: []
  },
  {
    id: "c6",
    company: "Mercedes-Benz",
    model: "240D W123",
    price: 680000,
    year: 1982,
    fuelType: "Diesel",
    transmission: "Automatic",
    kmDriven: 210000,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800",
    description: "German over-engineering at its finest. Rich slate gray shade, pristine tan MB-Tex seats. Built to last a million miles.",
    status: "available",
    lotNumber: 6,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b6_1", bidder: "Anil Ambani", amount: 650000, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c7",
    company: "Porsche",
    model: "911 Carrera Classic",
    price: 850000,
    year: 1982,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 92000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    description: "Iconic black rear-engine sports car. Pristine body lines, air-cooled boxer engine, and signature ducktail spoiler.",
    status: "sold",
    lotNumber: 7,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b7_1", bidder: "Ratan Tata", amount: 850000, timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c8",
    company: "Chevrolet",
    model: "Corvette Stingray",
    price: 780000,
    year: 1969,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 45000,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    description: "Stunning blue Stingray classic. Aggressive sports styling, chrome bumpers, and powerful small-block V8.",
    status: "available",
    lotNumber: 8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b8_1", bidder: "Zafar Khan", amount: 750000, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c9",
    company: "Jaguar",
    model: "E-Type Convertible",
    price: 980000,
    year: 1971,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 32000,
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
    description: "Highly sought-after British roadster. Classic long hood silhouette, wire wheels, and immaculate yellow exterior paint.",
    status: "available",
    lotNumber: 9,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b9_1", bidder: "Saif Ali", amount: 920000, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "b9_2", bidder: "Akshay Kapoor", amount: 950000, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c10",
    company: "Toyota",
    model: "Land Cruiser FJ40",
    price: 650000,
    year: 1979,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 115000,
    imageUrl: "https://images.unsplash.com/photo-1533519116174-d4d0ddf74e6c?auto=format&fit=crop&q=80&w=800",
    description: "Vibrant yellow FJ40 trail rig. Complete mechanical restoration with original 2F engine, rugged suspension, and heavy-duty winch.",
    status: "available",
    lotNumber: 10,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    bids: []
  },
  {
    id: "c11",
    company: "Citroën",
    model: "DS 21 Sedan",
    price: 380000,
    year: 1972,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 86000,
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
    description: "Classic French engineering masterclass. Famous hydropneumatic self-leveling suspension, unique futuristic green shade, and luxury ride quality.",
    status: "available",
    lotNumber: 11,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b11_1", bidder: "Prithvi Raj", amount: 350000, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: "c12",
    company: "Rolls-Royce",
    model: "Silver Shadow",
    price: 880000,
    year: 1975,
    fuelType: "Petrol",
    transmission: "Automatic",
    kmDriven: 125000,
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
    description: "Ultimate vintage British luxury coach. Elegant silver paint, rich walnut wood veneers, and cloud-like suspension comfort.",
    status: "available",
    lotNumber: 12,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    bids: [
      { id: "b12_1", bidder: "Dilip Kumar", amount: 850000, timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  }
];

export const CarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cars, setCars] = useState<Car[]>(() => {
    const saved = localStorage.getItem('ye_chalegi_cars_v4');
    return saved ? JSON.parse(saved) : initialCars;
  });

  useEffect(() => {
    localStorage.setItem('ye_chalegi_cars_v4', JSON.stringify(cars));
  }, [cars]);

  const addCar = (carData: Omit<Car, 'id' | 'lotNumber' | 'bids' | 'createdAt' | 'status'>) => {
    setCars(prev => {
      const nextLot = prev.length > 0 ? Math.max(...prev.map(c => c.lotNumber)) + 1 : 1;
      const newCar: Car = {
        ...carData,
        id: `c_${Date.now()}`,
        lotNumber: nextLot,
        status: 'available',
        bids: [],
        createdAt: new Date().toISOString()
      };
      return [newCar, ...prev];
    });
  };

  const updateCar = (id: string, carData: Partial<Car>) => {
    setCars(prev => prev.map(car => car.id === id ? { ...car, ...carData } : car));
  };

  const deleteCar = (id: string) => {
    setCars(prev => prev.filter(car => car.id !== id));
  };

  const toggleStatus = (id: string) => {
    setCars(prev => prev.map(car => {
      if (car.id === id) {
        return { ...car, status: car.status === 'available' ? 'sold' : 'available' };
      }
      return car;
    }));
  };

  const placeBid = (carId: string, amount: number, bidder: string): boolean => {
    let success = false;
    setCars(prev => prev.map(car => {
      if (car.id === carId) {
        // Enforce bid must be higher than current price
        const highestBid = car.bids.length > 0 ? Math.max(...car.bids.map(b => b.amount)) : car.price;
        if (amount > highestBid) {
          success = true;
          const newBid: Bid = {
            id: `b_${Date.now()}`,
            bidder,
            amount,
            timestamp: new Date().toISOString()
          };
          return {
            ...car,
            bids: [newBid, ...car.bids]
          };
        }
      }
      return car;
    }));
    return success;
  };

  return (
    <CarContext.Provider value={{ cars, addCar, updateCar, deleteCar, placeBid, toggleStatus }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};
