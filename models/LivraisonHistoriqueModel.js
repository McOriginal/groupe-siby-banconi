const mongoose = require('mongoose');

const livraisonHistoriqueSchema = new mongoose.Schema(
  {
    // Clé de rélation COMMANDE
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
    },

    produit: {
      type: String,
      required: true,
      trim: true,
    },

    livraisonDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
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

const LivraisonHistorique = mongoose.model(
  'LivraisonHistorique',
  livraisonHistoriqueSchema
);
module.exports = LivraisonHistorique;
