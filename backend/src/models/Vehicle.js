const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900, max: 2100 },
    licensePlate: { type: String, required: true, unique: true, trim: true, uppercase: true },
    color: { type: String, default: '', trim: true },
    dailyRate: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
