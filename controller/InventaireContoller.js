const mongoose = require('mongoose');
const Inventaire = require('../models/InventaireModel');
const Produit = require('../models/ProduitModel');

// Create a new approvisonement
exports.createInventaire = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { produit, quantity, ...restOfData } = req.body;

    // Vérification si le produit est fourni
    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    // 1. Mise à jour du stock produit
    const updatedProduct = await Produit.findByIdAndUpdate(
      produit,
      { $inc: { stock: -quantity } },
      { new: true, session }
    );

    if (!updatedProduct) {
      throw new Error('Produit introuvable en base');
    }

    // 2. Création de l’approvisionnement
    const inventaireDataCreate = await Inventaire.create(
      [
        {
          produit,
          quantity,
          user: req.user.id,
          ...restOfData,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(inventaireDataCreate[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all approvisonements
exports.getAllInventaire = async (req, res) => {
  try {
    const results = await Inventaire.find()
      // Trie par date de création, du plus récent au plus ancien
      .populate('produit')
      .populate('boutiquer')
      .populate('user')
      .sort({ createdAt: -1 });
    return res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single approvisonement by ID
exports.getInventaireById = async (req, res) => {
  try {
    const results = await Inventaire.findById(req.params.id)
      .populate('Produit')
      .populate('boutiquer')
      .populate('user');

    if (!results) {
      return res.status(404).json({ message: 'Inventaire non trouvée' });
    }

    return res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an approvisonement by ID
exports.cancelInventaire = async (req, res) => {
  try {
    const invent = await Inventaire.findByIdAndDelete(req.params.id);

    if (!results) {
      return res.status(404).json({ message: 'Inventaire non trouvée' });
    }

    // On décrémente le stock du PRODUIT associé
    await Produit.findByIdAndUpdate(
      invent.produit,
      { $inc: { stock: invent.quantity } },
      { new: true }
    );

    return res.status(200).json({ message: 'Inventaire supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une APPROVISONNEMENT
exports.deleteInventaire = async (req, res) => {
  try {
    const results = await Inventaire.findByIdAndDelete(req.params.id);

    if (!results) {
      return res.status(404).json({ message: 'Inventaire non trouvée' });
    }

    return res.status(200).json({ message: 'Inventaire supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
