const LivraisonHistorique = require('../models/LivraisonHistoriqueModel');
const Commande = require('../models/CommandeModel');

// Ajouter de Livraison
exports.createLivraisonHistorique = async (req, res) => {
  try {
    await LivraisonHistorique.create({ ...req.body, user: req.user.id });
    return res.status(200).json({ message: 'Livraison ajouté avec succès' });
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

// Modifier une Livraison
exports.updateLivraisonHistorique = async (req, res) => {
  try {
    await LivraisonHistorique.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res
      .status(200)
      .json({ message: 'Livraison mis a jours avec succès' });
  } catch (e) {
    console.log(e);
    return res.stauts(404).json({ message: e.message });
  }
};

// Afficher la liste des Livraison
exports.getAllLivraisonHistorique = async (req, res) => {
  try {
    const livraison = await LivraisonHistorique.find({
      commande: req.params.id,
    })
      .populate('user')
      .populate('commande')
      .sort({ createdAt: -1 });

    // Vérfion pour chaque produit livré si la quantité livré correspond au quantité commandée alors on met à jours le status de commande par "Livré"
    const commande = await Commande.findById(req.params.id)
      .populate('items.produit')
      .populate('user');
    const totalCommandeQuantity = commande.items.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);
    const totalLivraisonQuantity = livraison.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    // Si la quantité totale livrée correspond à la quantité totale commandée, on met à jour le statut de la commande
    // et on Sauvegarde le Statut de la commande par "livré"
    if (totalCommandeQuantity === totalLivraisonQuantity) {
      commande.statut = 'livré';
      commande.save();
    }
    return res.status(200).json(livraison);
  } catch (e) {
    console.log(e);
    return res.status(404).json({ message: e.message });
  }
};

// Afficher une seule Livraison
exports.getOneLivraisonHistorique = async (req, res) => {
  try {
    const livraison = await LivraisonHistorique.findById(
      req.params.id
    ).populate('user');
    return res.status(200).json(livraison);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};

// Supprimer la Livraison
exports.deleteLivraisonHistorique = async (req, res) => {
  try {
    await LivraisonHistorique.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Livraison supprimé avec succès' });
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
};
