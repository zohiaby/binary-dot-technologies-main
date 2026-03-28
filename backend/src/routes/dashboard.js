const express = require('express');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/stats', async (req, res) => {
  try {
    const [totalCustomers, totalVehicles, bookings] = await Promise.all([
      Customer.countDocuments(),
      Vehicle.countDocuments(),
      Booking.find().lean(),
    ]);

    const revenueStatuses = ['confirmed', 'active', 'completed'];
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter((b) => revenueStatuses.includes(b.status))
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const availableVehicles = await Vehicle.countDocuments({ isAvailable: true });

    res.json({
      totalCustomers,
      totalVehicles,
      availableVehicles,
      totalBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
