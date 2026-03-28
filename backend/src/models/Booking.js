const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
