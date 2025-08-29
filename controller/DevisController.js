const mongoose = require('mongoose');
const Devis = require('../models/DevisModel');

// Créer un Devis
exports.createDevis = async (req, res) => {
  try {
    const { items, ...restOfData } = req.body;

    // Créer le Devis
    const newDevis = await Devis.create({
      items,

      ...restOfData,
    });

    return res.status(201).json(newDevis);
  } catch (error) {
    console.log('Erreur de validation de Devis :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Trouver toutes les Devis
exports.getAllDevis = async (req, res) => {
  try {
    const devisListe = await Devis.find()
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('items.produit');

    return res.status(201).json(devisListe);
  } catch (e) {
    return res.status(404).json(e);
  }
};

// Trouver une seulle Devis
exports.getOneDevis = async (req, res) => {
  try {
    const devisData = await Devis.findById(req.params.id).populate(
      'items.produit'
    );

    return res.status(201).json(devisData);
  } catch (e) {
    return res.status(404).json(e);
  }
};

// -----------------------------------------------

// --------------------------------------------------------------------------
// --------- Modifier un Devis ----------------------------------

exports.updateDevis = async (req, res) => {
  try {
    const { items, ...resOfData } = req.body;

    await Devis.findByIdAndUpdate(req.params.id, {
      items,
      ...resOfData,
    });

    return res.status(200).json({ message: 'Devis mise à jour avec succès' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

// ----------------------------------------------------------------------------
// Supprimer un Devis
exports.deleteDevis = async (req, res) => {
  try {
    await Devis.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Devis supprimé avec succès' });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};
