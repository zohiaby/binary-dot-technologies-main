const express = require('express');
const Vehicle = require('../models/Vehicle');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { make, model, year, licensePlate, color, dailyRate, isAvailable } = req.body;
    if (!make || !model || year == null || !licensePlate || dailyRate == null) {
      return res
        .status(400)
        .json({ message: 'Make, model, year, license plate, and daily rate are required' });
    }
    const vehicle = await Vehicle.create({
      make,
      model,
      year: Number(year),
      licensePlate: String(licensePlate).toUpperCase(),
      color: color ?? '',
      dailyRate: Number(dailyRate),
      isAvailable: isAvailable !== false,
    });
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A vehicle with this license plate already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { make, model, year, licensePlate, color, dailyRate, isAvailable } = req.body;
    const update = {};
    if (make != null) update.make = make;
    if (model != null) update.model = model;
    if (year != null) update.year = Number(year);
    if (licensePlate != null) update.licensePlate = String(licensePlate).toUpperCase();
    if (color != null) update.color = color;
    if (dailyRate != null) update.dailyRate = Number(dailyRate);
    if (typeof isAvailable === 'boolean') update.isAvailable = isAvailable;

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A vehicle with this license plate already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
