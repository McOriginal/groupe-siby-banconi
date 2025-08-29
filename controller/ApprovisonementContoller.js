const mongoose = require('mongoose');
const Approvisonement = require('../models/ApprovisonementModel');
const Produit = require('../models/ProduitModel');
const Depense = require('../models/DepenseModel');

// Create a new approvisonement
exports.createApprovisonement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { produit, quantity, price, ...restOfData } = req.body;
    const formatQuantity = Number(quantity);
    const formatPrice = Number(price);

    // Vérification si le produit est fourni
    if (!produit) {
      throw new Error('Produit non trouvé');
    }

    // 1. Mise à jour du stock produit
    const updatedProduct = await Produit.findByIdAndUpdate(
      produit,
      { $inc: { stock: formatQuantity } },
      { new: true, session }
    );

    if (!updatedProduct) {
      throw new Error('Produit introuvable en base');
    }

    // 2. Création de l’approvisionnement
    const approvisonement = await Approvisonement.create(
      [
        {
          produit,
          quantity: formatQuantity,
          price: formatPrice,
          ...restOfData,
        },
      ],
      { session }
    );

    // 3. Création de la dépense
    await Depense.create(
      [
        {
          totalAmount: formatPrice * formatQuantity,
          motifDepense: `Approvisionnement de ${formatQuantity} unité(s) du produit ${updatedProduct.name}`,
          dateOfDepense: approvisonement[0].deliveryDate,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(approvisonement[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all approvisonements
exports.getAllApprovisonements = async (req, res) => {
  try {
    const approvisonements = await Approvisonement.find()
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('produit')
      .populate('fournisseur');
    return res.status(200).json(approvisonements);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single approvisonement by ID
exports.getApprovisonementById = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findById(req.params.id)
      .populate('Produit')
      .populate('fournisseur');

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    return res.status(200).json(approvisonement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an approvisonement by ID
exports.cancelApprovisonement = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findByIdAndDelete(
      req.params.id
    );

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    // On décrémente le stock du PRODUIT associé
    await Produit.findByIdAndUpdate(
      approvisonement.produit,
      { $inc: { stock: -approvisonement.quantity } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: 'Approvisonement deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une APPROVISONNEMENT
exports.deleteApprovisonement = async (req, res) => {
  try {
    const approvisonement = await Approvisonement.findByIdAndDelete(
      req.params.id
    );

    if (!approvisonement) {
      return res.status(404).json({ message: 'Approvisonement not found' });
    }

    return res
      .status(200)
      .json({ message: 'Approvisonement deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
