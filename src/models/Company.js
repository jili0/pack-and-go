// src/models/Company.js
import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  companyName: {
    type: String,
    required: [true, "Bitte geben Sie den Firmennamen ein"],
    trim: true,
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: "Deutschland" },
  },
  taxId: {
    type: String,
    required: [true, "Bitte geben Sie Ihre Steuernummer ein"],
  },
  description: {
    type: String,
    maxlength: [500, "Die Beschreibung darf maximal 500 Zeichen lang sein"],
  },
  serviceAreas: [
    {
      from: String,
      to: String,
    },
  ],
  hourlyRate: {
    type: Number,
    required: [true, "Bitte geben Sie Ihren Stundensatz ein"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isKisteKlarCertified: {
    type: Boolean,
    default: false,
  },
  documents: {
    businessLicense: {
      url: String,
      verified: { type: Boolean, default: false },
    },
    kisteKlarCertificate: {
      url: String,
      verified: { type: Boolean, default: false },
    },
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index für die Suche nach Servicegebieten
CompanySchema.index({ "serviceAreas.from": 1, "serviceAreas.to": 1 });

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);
