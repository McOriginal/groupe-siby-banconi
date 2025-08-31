const mongoose = require('mongoose');

const deivsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    adresse: {
      type: String,
    },
    items: [
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
        customerPrice: {
          type: Number,
          required: [true, 'Le prix client est requise'],
          min: [1, 'Le prix doit être au moins 1'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Le total de l'ordonnance est requis"],
      min: [0, 'Le total doit être positif'],
    },
  },

  { timestamps: true }
);

const Devis = mongoose.model('Devis', deivsSchema);
module.exports = Devis;
