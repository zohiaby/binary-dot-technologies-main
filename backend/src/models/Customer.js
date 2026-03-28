const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, default: '', trim: true },
    licenseNumber: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
