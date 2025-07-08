import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  companyAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  fromAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "Germany" },
  },
  toAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "Germany" },
  },
  preferredDates: [Date], // Simple array of Date objects
  confirmedDate: {
    type: Date,
    default: null,
  },
  helpersCount: {
    type: Number,
    required: [true, "Please enter the number of helpers"],
    min: [1, "At least one helper is required"],
  },
  estimatedHours: {
    type: Number,
    required: [true, "Please enter the estimated number of hours"],
    min: [1, "At least one hour is required"],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "declined", "completed", "cancelled"],
    default: "pending",
  },
  notes: {
    type: String,
    maxlength: [500, "Notes may contain a maximum of 500 characters"],
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Aktualisiere das updatedAt-Feld vor dem Speichern
OrderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Clear any existing model to ensure schema updates are applied
delete mongoose.models.Order;

export default mongoose.model("Order", OrderSchema);
