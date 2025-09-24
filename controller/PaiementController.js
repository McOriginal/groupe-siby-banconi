const Paiement = require('../models/PaiementModel');
const PaiementHistorique = require('../models/PaiementHistoriqueModel');

// Enregistrer un paiement
exports.createPaiement = async (req, res) => {
  try {
    // On vérifie si le PAIEMENT n'existe pas via ID de Commande
    const commandeID = req.body.commande;
    const existingPaiement = await Paiement.findOne({
      commande: commandeID,
    }).exec();

    // si la COMMANDE existe alors cela veux dire que le PAIEMENT existe déjà
    if (existingPaiement) {
      return res
        .status(404)
        .json({ message: 'Il existe déjà un Paiement pour cette Commande' });
    }

    // sinon on créer un nouveau PAIEMENT
    const paiement = await Paiement.create({ ...req.body, user: req.user.id });

    // Et On Ajout le paiement dans son l'historique
    await PaiementHistorique.create({
      amount: req.body.totalPaye,
      user: req.user.id,
      ...req.body,
    });
    res.status(201).json(paiement);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour un paiement
exports.updatePaiement = async (req, res) => {
  try {
    // On vérifie si le PAIEMENT n'existe pas via ID de Commande
    const commandeID = req.body.commande;
    const existingPaiement = await Paiement.findOne({
      commande: commandeID,
      _id: { $ne: req.params.id },
    }).exec();

    // si la COMMANDE existe alors cela veux dire que le PAIEMENT existe déjà
    if (existingPaiement) {
      return res.status(404).json({ message: 'Cette Commande est déjà payé' });
    }

    const updated = await Paiement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Historique des paiements
exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find()
      .populate({ path: 'commande', populate: { path: 'items.produit' } })
      .populate('user')
      .sort({ createdAt: -1 });

    // Calcul du chiffre d'affaires et du coût d'achat
    let totalCA = 0; // chiffre d'affaires
    let totalAchat = 0; // coût d'achat

    paiements.forEach((paiement) => {
      paiement.commande?.items.forEach((item) => {
        const produit = item.produit;

        const ca = item.customerPrice * item.quantity; // revenu
        const achat = produit.achatPrice * item.quantity; // coût d'achat

        totalCA += ca;
        totalAchat += achat;
      });
    });

    const benefice = totalCA - totalAchat;

    return res.status(200).json({ paiements, totalCA, totalAchat, benefice });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver un PAIEMENT
exports.getPaiement = async (req, res) => {
  try {
    const paiements = await Paiement.findById(req.params.id)
      .populate('user')
      .populate({
        path: 'commande',
        populate: { path: 'items.produit' },
      });

    return res.status(200).json(paiements);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Trouver le PAIEMENT via la COMMANDE sélectionnée
exports.getPaiementBySelectedCommandeID = async (req, res) => {
  try {
    // Récupération de PAIEMENT via ID de COMMANDE sélectionnée
    const selectedCommandePaiement = await Paiement.findOne({
      commande: req.params.id,
    }).populate({
      path: 'commande',
      populate: { path: 'items.produit' },
    });

    return res.status(200).json(selectedCommandePaiement);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un paiement
exports.deletePaiement = async (req, res) => {
  try {
    // Trouver le PAIEMENT à supprimer via son ID
    const deletedPaiement = await Paiement.findById(req.params.id);

    // On Trouve la liste des HISTORIQUE de PAIEMENT dont ID de COMMANDE correspond à celle qu'on veux supprimer
    await PaiementHistorique.deleteMany({
      commande: deletedPaiement.commande,
    });

    // On supprimer HISTORIQUE de PAIEMENT
    // const hisdelete = await PaiementHistorique.findByIdAndDelete(
    //   deletedHistoriquePaiement
    // );
    // console.log('------ Historique supprimés---------\n ', hisdelete);

    // après on supprime le PAIEMENT
    await Paiement.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ status: 'success', message: 'Paiement supprimé avec succès' });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
