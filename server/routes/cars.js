const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Car = require('../models/Car');

// Helper to validate input data
const validateCarInput = (data, isUpdate = false) => {
  const errors = [];
  const requiredFields = [
    'company', 'model', 'price', 'year', 
    'fuelType', 'transmission', 'kmDriven', 
    'imageUrl', 'description'
  ];

  if (!isUpdate) {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`Field '${field}' is required and cannot be empty.`);
      }
    }
  }

  // Type & range checks
  if (data.price !== undefined) {
    const priceNum = Number(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push("Price must be a valid positive number.");
    }
  }

  if (data.year !== undefined) {
    const yearNum = Number(data.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear + 1) {
      errors.push(`Year must be a valid car manufacturing year (1886 - ${currentYear + 1}).`);
    }
  }

  if (data.kmDriven !== undefined) {
    const kmNum = Number(data.kmDriven);
    if (isNaN(kmNum) || kmNum < 0) {
      errors.push("kmDriven must be a valid positive number.");
    }
  }

  if (data.status !== undefined && !['available', 'sold'].includes(data.status)) {
    errors.push("Status must be either 'available' or 'sold'.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// @route   GET /api/cars
// @desc    Get all car listings
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving car listings.' });
  }
});

// @route   GET /api/cars/:id
// @desc    Get single car by MongoDB ID or sequence lotNumber
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      const lotNum = Number(id);
      if (!isNaN(lotNum)) {
        query = { lotNumber: lotNum };
      } else {
        return res.status(400).json({ error: 'Invalid ID format. Must be a valid ObjectId or integer Lot Number.' });
      }
    }

    const car = await Car.findOne(query);
    if (!car) {
      return res.status(404).json({ error: `Car with lot/id '${id}' not found.` });
    }

    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving car details.' });
  }
});

// @route   POST /api/cars
// @desc    Create a new car listing
router.post('/', async (req, res) => {
  const { isValid, errors } = validateCarInput(req.body);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    const newCar = new Car({
      company: req.body.company,
      model: req.body.model,
      price: Number(req.body.price),
      year: Number(req.body.year),
      fuelType: req.body.fuelType,
      transmission: req.body.transmission,
      kmDriven: Number(req.body.kmDriven),
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      status: req.body.status || 'available'
    });

    const car = await newCar.save();
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving the car listing.' });
  }
});

// @route   PUT /api/cars/:id
// @desc    Update an existing car listing
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { isValid, errors } = validateCarInput(req.body, true);
  if (!isValid) {
    return res.status(400).json({ errors });
  }

  try {
    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      const lotNum = Number(id);
      if (!isNaN(lotNum)) {
        query = { lotNumber: lotNum };
      } else {
        return res.status(400).json({ error: 'Invalid ID format. Must be a valid ObjectId or integer Lot Number.' });
      }
    }

    // Prepare fields to update
    const updateFields = {};
    const allowedFields = [
      'company', 'model', 'price', 'year', 
      'fuelType', 'transmission', 'kmDriven', 
      'imageUrl', 'description', 'status'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (['price', 'year', 'kmDriven'].includes(field)) {
          updateFields[field] = Number(req.body[field]);
        } else {
          updateFields[field] = req.body[field];
        }
      }
    }

    const updatedCar = await Car.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ error: `Car with lot/id '${id}' not found.` });
    }

    res.json(updatedCar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating the car listing.' });
  }
});

// @route   DELETE /api/cars/:id
// @desc    Delete a car listing
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      const lotNum = Number(id);
      if (!isNaN(lotNum)) {
        query = { lotNumber: lotNum };
      } else {
        return res.status(400).json({ error: 'Invalid ID format. Must be a valid ObjectId or integer Lot Number.' });
      }
    }

    const deletedCar = await Car.findOneAndDelete(query);
    if (!deletedCar) {
      return res.status(404).json({ error: `Car with lot/id '${id}' not found.` });
    }

    res.json({ message: 'Car listing deleted successfully', lotNumber: deletedCar.lotNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting the car listing.' });
  }
});

module.exports = router;
