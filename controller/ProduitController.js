const Produit = require('../models/ProduitModel');
const Commande = require('../models/CommandeModel');

// Enregistrer un Produit
exports.createProduit = async (req, res) => {
  try {
    const { name, price, stock, ...resOfData } = req.body;

    const lowerName = name.toLowerCase();
    const formatStock = Number(stock);
    const formatPrice = Number(price);

    // Vérifier s'il existe déjà une matière avec ces critères
    const existingProduits = await Produit.findOne({
      name: lowerName,
    }).exec();

    if (existingProduits) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce Produit existe déjà.',
      });
    }

    // Création de la matière
    const produit = await Produit.create({
      name: lowerName,
      stock: formatStock,
      price: formatPrice,
      user: req.user.id,
      ...resOfData,
    });

    return res.status(201).json(produit);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour une Produit
exports.updateProduit = async (req, res) => {
  try {
    const { name, price, stock, ...resOfData } = req.body;

    const lowerName = name.toLowerCase();
    const formatPrice = Number(price);
    const formatStock = Number(stock);

    // Vérifier s'il existe déjà un produit avec ces critères
    const existingProduits = await Produit.findOne({
      name: lowerName,
      _id: { $ne: req.params.id },
    }).exec();

    if (existingProduits) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce Produit existe déjà.',
      });
    }

    // Mise à jour de produit
    const updated = await Produit.findByIdAndUpdate(
      req.params.id,
      {
        name: lowerName,
        stock: formatStock,
        price: formatPrice,
        ...resOfData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

//  Afficher les Produit avec une stock minimum de (1)
exports.getAllProduits = async (req, res) => {
  try {
    const produits = await Produit.find({ stock: { $gt: 0 } })
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 });

    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher une seule Produit avec une stock terminée (0)
exports.getAllProduitWithStockFinish = async (req, res) => {
  try {
    // Tous les produits dont le stock mximum est 3
    const produits = await Produit.find({ stock: { $lt: 10 } })
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 });

    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher une seule Produit
exports.getOneProduit = async (req, res) => {
  try {
    const produits = await Produit.findById(req.params.id);
    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

//  Afficher Produit lors de l'approvisionnemnet
exports.getOneProduitWhenApprovisionne = async (req, res) => {
  try {
    const produits = await Produit.findById(req.params.id);
    return res.status(200).json(produits);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un Produit
exports.deleteProduitById = async (req, res) => {
  try {
    await Produit.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ status: 'success', message: 'Produit supprimée avec succès' });
  } catch (err) {
    return res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer toute les Produit
exports.deleteAllProduit = async (req, res) => {
  try {
    await Produit.deleteMany({}); // Supprime tous les documents

    return res.status(200).json({
      status: 'success',
      message: 'Toute les Produit ont été supprimés avec succès',
    });
  } catch (e) {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de toute les Produit',
      error: e.message,
    });
  }
};
