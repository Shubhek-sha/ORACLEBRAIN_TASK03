const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symbol:  { type: String, required: true, uppercase: true },
    name:    { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Each user can only favorite a stock once
favoriteSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
