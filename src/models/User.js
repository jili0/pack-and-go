// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Bitte geben Sie eine E-Mail-Adresse ein'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Bitte geben Sie eine gültige E-Mail-Adresse ein']
  },
  password: {
    type: String,
    required: [true, 'Bitte geben Sie ein Passwort ein'],
    minlength: [6, 'Das Passwort muss mindestens 6 Zeichen lang sein'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Bitte geben Sie Ihren Namen ein']
  },
  phone: {
    type: String,
    required: [true, 'Bitte geben Sie Ihre Telefonnummer ein']
  },
  role: {
    type: String,
    enum: ['user', 'company', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
});

// Verschlüsseln des Passworts vor dem Speichern
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Methode zum Vergleichen von Passwörtern
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);