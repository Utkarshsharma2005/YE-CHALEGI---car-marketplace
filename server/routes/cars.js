const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Car = require('../models/Car');
const { auth, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const fileFilter = (req, file, cb) => cb(null, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype));
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const validStatuses = ['available', 'pending', 'sold'];
const validBodyTypes = ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Coupe', 'Convertible', 'Other'];
const validFuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const validTransmissions = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'];
const numericFields = ['price', 'year', 'kmDriven', 'ownerCount', 'power', 'torque', 'zeroToSixty', 'topSpeed', 'range', 'seats'];

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : value);

const parseBoolean = (value) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return Boolean(value);
};

const getCarQuery = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) return { _id: id };
  const lotNum = Number(id);
  if (Number.isInteger(lotNum) && lotNum > 0) return { lotNumber: lotNum };
  return null;
};

const validateCarInput = (data, isUpdate = false) => {
  const errors = [];
  const requiredFields = ['company', 'model', 'price', 'year', 'fuelType', 'transmission', 'kmDriven', 'imageUrl', 'description'];
  if (!isUpdate) {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || sanitizeString(data[field]) === '') {
        errors.push(`Field '${field}' is required.`);
      }
    }
  }

  if (data.price !== undefined) {
    const val = Number(data.price);
    if (isNaN(val) || val < 0) errors.push("Price must be a valid non-negative number.");
  }
  if (data.year !== undefined) {
    const y = Number(data.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(y) || y < 1886 || y > currentYear + 1) errors.push(`Year must be a valid number between 1886 and ${currentYear + 1}.`);
  }
  if (data.kmDriven !== undefined) {
    const km = Number(data.kmDriven);
    if (isNaN(km) || km < 0) errors.push("Km driven must be a valid non-negative number.");
  }
  if (data.ownerCount !== undefined) {
    const oc = Number(data.ownerCount);
    if (isNaN(oc) || oc < 1) errors.push("Owner count must be at least 1.");
  }

  if (data.status !== undefined && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}.`);
  }

  if (data.bodyType !== undefined && !validBodyTypes.includes(data.bodyType)) {
    errors.push(`Body type must be one of: ${validBodyTypes.join(', ')}.`);
  }

  if (data.fuelType !== undefined && !validFuelTypes.includes(data.fuelType)) {
    errors.push(`Fuel type must be one of: ${validFuelTypes.join(', ')}.`);
  }

  if (data.transmission !== undefined && !validTransmissions.includes(data.transmission)) {
    errors.push(`Transmission must be one of: ${validTransmissions.join(', ')}.`);
  }

  return { isValid: errors.length === 0, errors };
};

const normalizeCarBody = (body) => {
  const normalized = {};
  const allowed = [
    'company', 'model', 'price', 'year', 'fuelType', 'transmission', 'kmDriven',
    'imageUrl', 'description', 'status', 'bodyType', 'ownerCount', 'insuranceValid',
    'registrationCity', 'sellerName', 'sellerPhone', 'sellerCity', 'sellerEmail',
    'offerTag', 'offerDiscount', 'power', 'torque', 'zeroToSixty', 'topSpeed',
    'range', 'seats', 'drivetrain', 'colorName', 'colorHex', 'accidental',
    'insuranceStatus', 'features'
  ];

  for (const field of allowed) {
    if (body[field] === undefined) continue;
    if (field === 'features') {
      if (Array.isArray(body[field])) {
        normalized[field] = body[field].map(s => String(s).trim()).filter(Boolean);
      } else if (typeof body[field] === 'string') {
        normalized[field] = body[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (numericFields.includes(field)) {
      normalized[field] = Number(body[field]);
    } else if (field === 'insuranceValid') {
      normalized[field] = parseBoolean(body[field]);
    } else {
      normalized[field] = sanitizeString(body[field]);
    }
  }

  return normalized;
};


// GET /api/cars — all cars, supports query filters
router.get('/', async (req, res) => {
  try {
    const { search, company, fuelType, transmission, bodyType, minPrice, maxPrice, sort } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (company && company !== 'All') query.company = company;
    if (fuelType && fuelType !== 'All') query.fuelType = fuelType;
    if (transmission && transmission !== 'All') query.transmission = transmission;
    if (bodyType && bodyType !== 'All') query.bodyType = bodyType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'km_asc') sortObj = { kmDriven: 1 };
    else if (sort === 'year_desc') sortObj = { year: -1 };
    const cars = await Car.find(query).sort(sortObj);
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/cars/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = getCarQuery(id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOne(query);
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/cars — Create Car (Admin only)
router.post('/', auth, requireRole('admin'), upload.single('image'), async (req, res) => {
  const body = req.body;
  if (req.file) body.imageUrl = `/uploads/${req.file.filename}`;
  const normalized = normalizeCarBody(body);
  const { isValid, errors } = validateCarInput(normalized);
  if (!isValid) return res.status(400).json({ error: errors.join(' ') });
  try {
    const newCar = new Car({
      ...normalized,
      status: normalized.status || 'available',
      bodyType: normalized.bodyType || 'Other',
      ownerCount: normalized.ownerCount || 1,
      insuranceValid: normalized.insuranceValid !== undefined ? normalized.insuranceValid : true,
      registrationCity: normalized.registrationCity || '',
      sellerName: normalized.sellerName || '',
      sellerPhone: normalized.sellerPhone || '',
      sellerCity: normalized.sellerCity || '',
      sellerEmail: normalized.sellerEmail || '',
      offerTag: normalized.offerTag || '',
      offerDiscount: normalized.offerDiscount || ''
    });
    const car = await newCar.save();
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving car.' });
  }
});

// PUT /api/cars/:id — Update Car (Admin only)
router.put('/:id', auth, requireRole('admin'), upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  if (req.file) body.imageUrl = `/uploads/${req.file.filename}`;
  const normalized = normalizeCarBody(body);
  const { isValid, errors } = validateCarInput(normalized, true);
  if (!isValid) return res.status(400).json({ error: errors.join(' ') });
  try {
    const query = getCarQuery(id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOneAndUpdate(query, { $set: normalized }, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating car.' });
  }
});

// DELETE /api/cars/:id — Delete Car (Admin only)
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const query = getCarQuery(id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOneAndDelete(query);
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    res.json({ message: 'Deleted successfully', id: car._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting car.' });
  }
});

// PATCH /api/cars/:id/status — quick status toggle (Admin only)
router.patch('/:id/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'pending', 'sold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const query = getCarQuery(req.params.id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOneAndUpdate(query, { status }, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating status.' });
  }
});


// POST /api/cars/:id/reviews — add a review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) return res.status(400).json({ error: 'Name, rating and comment are required.' });
    const query = getCarQuery(req.params.id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOne(query);
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    car.reviews.push({ name, rating: Number(rating), comment });
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error adding review.' });
  }
});

const createInquiry = async (req, res) => {
  try {
    const { name, phone, message } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
    const query = getCarQuery(req.params.id);
    if (!query) return res.status(400).json({ error: 'Invalid ID.' });
    const car = await Car.findOne(query);
    if (!car) return res.status(404).json({ error: 'Car not found.' });
    car.inquiries.push({
      name: sanitizeString(name),
      phone: sanitizeString(phone),
      message: sanitizeString(message || '')
    });
    await car.save();
    res.status(201).json({ message: 'Inquiry submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error submitting inquiry.' });
  }
};

// POST /api/cars/:id/inquire — buyer inquiry
router.post('/:id/inquire', createInquiry);
router.post('/:id/inquiry', createInquiry);

module.exports = router;
