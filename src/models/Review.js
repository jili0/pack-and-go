// src/models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Bitte geben Sie eine Bewertung ab'],
    min: [1, 'Die Bewertung muss mindestens 1 sein'],
    max: [5, 'Die Bewertung darf maximal 5 sein']
  },
  comment: {
    type: String,
    required: [true, 'Bitte geben Sie einen Kommentar ab'],
    maxlength: [500, 'Der Kommentar darf maximal 500 Zeichen lang sein']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Trigger für die Aktualisierung der durchschnittlichen Bewertung der Firma
ReviewSchema.post('save', async function() {
  try {
    const Company = mongoose.model('Company');
    
    // Berechne die durchschnittliche Bewertung und Anzahl der Bewertungen
    const stats = await this.constructor.aggregate([
      { $match: { companyId: this.companyId } },
      { 
        $group: { 
          _id: '$companyId',
          averageRating: { $avg: '$rating' },
          reviewsCount: { $sum: 1 }
        } 
      }
    ]);
    
    // Aktualisiere die Unternehmensdaten
    if (stats.length > 0) {
      await Company.findByIdAndUpdate(this.companyId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Runde auf eine Dezimalstelle
        reviewsCount: stats[0].reviewsCount
      });
    } else {
      await Company.findByIdAndUpdate(this.companyId, {
        averageRating: 0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Unternehmensbewertung:', err);
  }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);