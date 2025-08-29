const mongoose = require('mongoose');

// Création de SCHEMA pour APPROVISONNEMENT
const approvisonementSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    fournisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true,
    },
  },
  { timestamps: true }
);

const Approvisonement = mongoose.model(
  'Approvisonnement',
  approvisonementSchema
);
module.exports = Approvisonement;
