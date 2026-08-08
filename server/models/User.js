const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  password: { type: String, default: '' },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  city: { type: String, default: '' },
  picture: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google', 'auth0'], default: 'local' },
  savedCars: { type: [String], default: [] }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
