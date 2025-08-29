const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const commandeSchema = new mongoose.Schema(
  {
    commandeId: {
      type: Number,
    },
    fullName: {
      type: String,
      // required: true,
    },
    phoneNumber: {
      type: Number,
      // required: true,
      // unique: true,
    },
    adresse: {
      type: String,
      // required: true,
      max: 30,
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
    statut: {
      type: String,
      enum: ['livré', 'en cours', 'en attente'],
      default: 'cash',
      required: true,
    },
  },

  { timestamps: true }
);

// AUTO INCREMENTATION de ID
commandeSchema.plugin(AutoIncrement, { inc_field: 'commandeId' });

const Commande = mongoose.model('Commande', commandeSchema);
module.exports = Commande;
