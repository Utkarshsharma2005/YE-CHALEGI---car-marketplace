const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./db');
const Car = require('./models/Car');
const Counter = require('./models/Counter');

const sampleCars = [
  {
    company: "Hindustan",
    model: "Ambassador Nova 1.5D",
    price: 185000,
    year: 1998,
    fuelType: "Diesel",
    transmission: "Manual",
    kmDriven: 142000,
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    description: "An absolute classic broadsheet carriage. Immaculately maintained engine with original white coat. Perfect for heritage rallies and vintage enthusiasts.",
    status: "available"
  },
  {
    company: "Premier",
    model: "Padmini Delux",
    price: 120000,
    year: 1985,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 85000,
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
    description: "Charming vintage sedan in classic powder blue. Column shifter transmission working perfectly. A rare specimen of India's motoring history.",
    status: "available"
  },
  {
    company: "Hindustan",
    model: "Contessa Classic",
    price: 320000,
    year: 1990,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 98000,
    imageUrl: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800",
    description: "The muscle car of the East. Striking black gloss finish, refurbished custom interiors, and smooth Isuzu engine. Truly a head turner.",
    status: "sold"
  },
  {
    company: "Maruti Suzuki",
    model: "800 Standard",
    price: 65000,
    year: 1995,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 72000,
    imageUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
    description: "A nostalgic classic red pocket rocket. Single owner, original dashboard, and fuel economy that matches modern day standards.",
    status: "available"
  },
  {
    company: "Standard",
    model: "Herald Saloon",
    price: 250000,
    year: 1968,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 45000,
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
    description: "A rare double-door British lineage beauty. Cream white finish with authentic leather upholstery. Starts in a single crank.",
    status: "available"
  },
  {
    company: "Willys",
    model: "Jeep CJ-3B",
    price: 450000,
    year: 1962,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 53000,
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800",
    description: "Authentic 4x4 offroad pioneer. Olive green matte finish, high-low range transfer case works flawlessly. Relive the golden era of utility.",
    status: "available"
  },
  {
    company: "Mercedes-Benz",
    model: "240D W123",
    price: 680000,
    year: 1982,
    fuelType: "Diesel",
    transmission: "Automatic",
    kmDriven: 210000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    description: "German over-engineering at its finest. Rich coffee brown shade, pristine tan MB-Tex seats. Built to last a million miles.",
    status: "sold"
  },
  {
    company: "Toyota",
    model: "Land Cruiser FJ60",
    price: 950000,
    year: 1984,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 185000,
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    description: "Rugged bronze overland explorer. Vintage high-roof styling, 4.2L inline 6-cylinder engine. Mechanically sound and ready for cross-country runs.",
    status: "available"
  },
  {
    company: "BMW",
    model: "325i E30",
    price: 780000,
    year: 1988,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 115000,
    imageUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=800",
    description: "Iconic coupe in crimson red. Smooth inline-6 engine, authentic BBS alloys, and tight rack-and-pinion steering. A pure enthusiast's joy.",
    status: "available"
  },
  {
    company: "Volkswagen",
    model: "Beetle 1300",
    price: 520000,
    year: 1972,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 89000,
    imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=800",
    description: "Classic air-cooled bug in sunny canary yellow. Immaculate chrome work, original dials, and signature purr of the boxer engine.",
    status: "available"
  },
  {
    company: "Fiat",
    model: "1100 Millecento",
    price: 160000,
    year: 1964,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 67000,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
    description: "Gorgeous round-body Fiat in pastel green. Suicidal front doors, original steering wheel, and retro chrome grille. A collector's dream.",
    status: "available"
  },
  {
    company: "Hindustan",
    model: "Landmaster",
    price: 380000,
    year: 1956,
    fuelType: "Petrol",
    transmission: "Manual",
    kmDriven: 120000,
    imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800",
    description: "Predecessor to the Ambassador. Features the rare bubble boot design, original Smiths dials, and beautiful vintage grey styling.",
    status: "available"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Car.deleteMany({});
    await Counter.deleteMany({});
    console.log('Collections cleared.');

    // Initialize sequence counter
    const counter = new Counter({ id: 'carLotNumber', seq: 0 });
    await counter.save();
    console.log('Counter initialized.');

    // Save each car document sequentially to invoke pre-save auto-increment hooks
    console.log('Seeding 12 sample car lots...');
    for (const carData of sampleCars) {
      const car = new Car(carData);
      const savedCar = await car.save();
      console.log(`Saved: Lot ${String(savedCar.lotNumber).padStart(3, '0')} - ${savedCar.company} ${savedCar.model}`);
    }

    console.log('Seeding complete. Successfully loaded 12 lots into database.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding Failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
