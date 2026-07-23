const mongoose = require('mongoose');
const Counter = require('./Counter');

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
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  lotNumber: { type: Number, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to generate sequential auto-increment lotNumber
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

module.exports = mongoose.model('Car', carSchema);
