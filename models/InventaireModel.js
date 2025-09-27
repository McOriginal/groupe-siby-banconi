const mongoose = require('mongoose');

const inventaireSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [1, 'La quantité doit être au moins 1'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Le prix est requise'],
      min: [1, 'Le prix doit être au moins 1'],
    },

    inventaireDate: {
      type: Date,
      default: Date.now,
    },
    boutiquer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

const Inventaire = mongoose.model('Inventaire', inventaireSchema);
module.exports = Inventaire;
