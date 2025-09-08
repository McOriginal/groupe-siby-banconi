const mongoose = require('mongoose');

const depenseSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
      trim: true,
    },

    motifDepense: {
      type: String,
      required: true,
    },
    dateOfDepense: {
      type: Date,
      default: Date.now,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Depense = mongoose.model('Depense', depenseSchema);
module.exports = Depense;
