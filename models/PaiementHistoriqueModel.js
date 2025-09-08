const mongoose = require('mongoose');

const paiementHistoriqueSchema = new mongoose.Schema(
  {
    // Clé de rélation COMMANDE
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
    },

    amount: {
      type: Number,
      required: true,
      trim: true,
    },

    paiementDate: {
      type: Date,
      required: true,
    },
    methode: {
      type: String,
      enum: ['cash', 'orange money', 'moove money'],
      default: 'cash',
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

const PaiementHistorique = mongoose.model(
  'PaiementHistorique',
  paiementHistoriqueSchema
);
module.exports = PaiementHistorique;
