// src/models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  fromAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Deutschland' }
  },
  toAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Deutschland' }
  },
  preferredDates: [{
    date: { type: Date, required: true }
  }],
  confirmedDate: {
    type: Date,
    default: null
  },
  helpersCount: {
    type: Number,
    required: [true, 'Bitte geben Sie die Anzahl der Helfer ein'],
    min: [1, 'Mindestens ein Helfer wird benötigt']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Bitte geben Sie die geschätzte Stundenzahl ein'],
    min: [1, 'Mindestens eine Stunde wird benötigt']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Die Notizen dürfen maximal 500 Zeichen lang sein']
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Aktualisiere das updatedAt-Feld vor dem Speichern
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);