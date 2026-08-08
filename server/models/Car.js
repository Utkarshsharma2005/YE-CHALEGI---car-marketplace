const mongoose = require('mongoose');
const Counter = require('./Counter');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, required: true, trim: true },
  transmission: { type: String, required: true, trim: true },
  kmDriven: { type: Number, required: true },
  imageUrl: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ['available', 'pending', 'sold'], default: 'available' },
  lotNumber: { type: Number, unique: true },
  bodyType: { type: String, enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Other'], default: 'Other' },
  power: { type: Number, default: 150 },
  torque: { type: Number, default: 220 },
  zeroToSixty: { type: Number, default: 8.5 },
  topSpeed: { type: Number, default: 180 },
  range: { type: Number, default: 600 },
  seats: { type: Number, default: 5 },
  drivetrain: { type: String, default: 'FWD' },
  colorName: { type: String, default: 'Silver' },
  colorHex: { type: String, default: '#C0C0C0' },
  ownerCount: { type: Number, default: 1, min: 1 },
  accidental: { type: String, enum: ['Non-Accidental', 'Minor Scratches', 'Accidental Repair'], default: 'Non-Accidental' },
  insuranceStatus: { type: String, enum: ['Valid Comprehensive', 'Third Party Only', 'Expired', 'Unclaimed Insurance'], default: 'Valid Comprehensive' },
  features: [{ type: String }],
  insuranceValid: { type: Boolean, default: true },
  registrationCity: { type: String, default: '' },
  sellerName: { type: String, default: '' },
  sellerPhone: { type: String, default: '' },
  sellerCity: { type: String, default: '' },
  sellerEmail: { type: String, default: '' },
  offerTag: { type: String, default: '' },
  offerDiscount: { type: String, default: '' },
  reviews: [reviewSchema],
  inquiries: [inquirySchema],
  createdAt: { type: Date, default: Date.now }
});

carSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  try {
    const counter = await Counter.findOneAndUpdate(
      { id: 'carLotNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.lotNumber = counter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

carSchema.virtual('averageRating').get(function () {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

carSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Car', carSchema);
