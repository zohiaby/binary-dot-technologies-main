const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

function dayCountInclusive(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

async function hasOverlap(vehicleId, startDate, endDate, excludeBookingId) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const filter = {
    vehicle: vehicleId,
    status: { $nin: ['cancelled'] },
    startDate: { $lte: end },
    endDate: { $gte: start },
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }
  const found = await Booking.findOne(filter);
  return !!found;
}

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model licensePlate dailyRate')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer')
      .populate('vehicle');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customerId, vehicleId, startDate, endDate, status, notes } = req.body;
    if (!customerId || !vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Customer, vehicle, start date, and end date are required' });
    }
    if (!mongoose.isValidObjectId(customerId) || !mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({ message: 'Invalid customer or vehicle id' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: 'End date must be on or after start date' });
    }

    const [customer, vehicle] = await Promise.all([
      Customer.findById(customerId),
      Vehicle.findById(vehicleId),
    ]);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: 'Vehicle is marked unavailable for booking' });
    }

    const overlap = await hasOverlap(vehicleId, start, end, null);
    if (overlap) {
      return res.status(409).json({ message: 'Vehicle already has a booking in this date range' });
    }

    const days = dayCountInclusive(start, end);
    const totalAmount = Math.round(days * vehicle.dailyRate * 100) / 100;

    const booking = await Booking.create({
      customer: customerId,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      totalAmount,
      status: status && ['pending', 'confirmed', 'active', 'completed', 'cancelled'].includes(status)
        ? status
        : 'confirmed',
      notes: notes ?? '',
    });
    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model licensePlate dailyRate');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const { customerId, vehicleId, startDate, endDate, status, notes } = req.body;
    const nextCustomer = customerId || booking.customer;
    const nextVehicle = vehicleId || booking.vehicle;
    const nextStart = startDate ? new Date(startDate) : booking.startDate;
    const nextEnd = endDate ? new Date(endDate) : booking.endDate;

    if (nextEnd < nextStart) {
      return res.status(400).json({ message: 'End date must be on or after start date' });
    }

    if (customerId && !mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ message: 'Invalid customer id' });
    }
    if (vehicleId && !mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json({ message: 'Invalid vehicle id' });
    }

    const vehicle = await Vehicle.findById(nextVehicle);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicleId && !vehicle.isAvailable && String(nextVehicle) !== String(booking.vehicle)) {
      return res.status(400).json({ message: 'Vehicle is marked unavailable' });
    }

    const effectiveStatus = status ?? booking.status;
    if (effectiveStatus !== 'cancelled') {
      const overlap = await hasOverlap(nextVehicle, nextStart, nextEnd, booking._id);
      if (overlap) {
        return res.status(409).json({ message: 'Vehicle already has a booking in this date range' });
      }
    }

    let totalAmount = booking.totalAmount;
    if (startDate || endDate || vehicleId) {
      const days = dayCountInclusive(nextStart, nextEnd);
      totalAmount = Math.round(days * vehicle.dailyRate * 100) / 100;
    }

    booking.customer = nextCustomer;
    booking.vehicle = nextVehicle;
    booking.startDate = nextStart;
    booking.endDate = nextEnd;
    booking.totalAmount = totalAmount;
    if (status) booking.status = status;
    if (notes != null) booking.notes = notes;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email phone')
      .populate('vehicle', 'make model licensePlate dailyRate');
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
