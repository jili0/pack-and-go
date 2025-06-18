// src/models/Review.js
import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  rating: {
    type: Number,
    required: [true, "Please provide a rating"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot exceed 5"],
  },
  comment: {
    type: String,
    required: [true, "Please provide a comment"],
    maxlength: [500, "Comment cannot exceed 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Trigger to update company average rating
ReviewSchema.post("save", async function () {
  try {
    const Company = mongoose.model("Company");

    // Calculate average rating and review count
    const stats = await this.constructor.aggregate([
      { $match: { companyId: this.companyId } },
      {
        $group: {
          _id: "$companyId",
          averageRating: { $avg: "$rating" },
          reviewsCount: { $sum: 1 },
        },
      },
    ]);

    // Update company data
    if (stats.length > 0) {
      await Company.findByIdAndUpdate(this.companyId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to one decimal place
        reviewsCount: stats[0].reviewsCount,
      });
    } else {
      await Company.findByIdAndUpdate(this.companyId, {
        averageRating: 0,
        reviewsCount: 0,
      });
    }
  } catch (err) {
    console.error("Error updating company rating:", err);
  }
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
