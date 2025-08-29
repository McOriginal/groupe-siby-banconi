const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    emailAdresse: {
      type: String,
      trim: true,
    },

    adresse: {
      type: String,
      required: true,
      max: 30,
    },
  },
  { timestamps: true }
);

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);

module.exports = Fournisseur;
