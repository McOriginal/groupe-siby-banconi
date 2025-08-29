const Commande = require('../models/CommandeModel');
const PaiementHistorique = require('../models/PaiementHistoriqueModel');
const Paiement = require('../models/PaiementModel');
// Enregistrer un paiement
exports.createPaiementHistorique = async (req, res) => {
  const { amount, ...restData } = req.body;
  try {
    const selectedCommandeId = req.body.commande;
    // On cherche si ID de Paiement
    const commandeIDInPaiements = await Paiement.findOne({
      commande: selectedCommandeId,
    });

    // On vérifie si le paiement n'existe pas
    if (!commandeIDInPaiements) {
      return res
        .status(404)
        .json({ message: "Vous devez d'abord ajouter le premier paiement" });
    }

    // Si la somme payé est supérieur au somme total restant alors
    if (
      amount > commandeIDInPaiements.totalAmount ||
      amount >
        commandeIDInPaiements.totalAmount - commandeIDInPaiements.totalPaye
    ) {
      return res
        .status(404)
        .json({ messgae: 'Votre Montant est supérieur au total restant' });
    }

    // On vérifie si la SOMME TOTAL n'est pas déjà payé
    if (commandeIDInPaiements.totalAmount === commandeIDInPaiements.totalPaye) {
      return res.status(404).json({ message: 'Le PAIEMENT est déjà complet' });
    }

    await Paiement.findByIdAndUpdate(commandeIDInPaiements, {
      $inc: { totalPaye: +amount },
    });

    const paiementHistorique = await PaiementHistorique.create(req.body);

    // après on met ajour le PAIEMENTS
    res.status(201).json(paiementHistorique);
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Mettre à jour un paiement
exports.updatePaiementHistorique = async (req, res) => {
  try {
    const newAmount = req.body.amount;
    const selectedCommandeId = req.body.commande;

    // Etape 1: chercher si ID de Paiement sélectionné
    const commandeIDInPaiements = await Paiement.findOne({
      commande: selectedCommandeId,
    });

    // On vérifie si le paiement n'existe pas
    if (!commandeIDInPaiements) {
      return res
        .status(404)
        .json({ message: "Vous devez d'abord ajouter le premier paiement" });
    }

    // Si la somme payé est supérieur au somme total de Factire ou la somme restant alors
    if (
      newAmount > commandeIDInPaiements.totalAmount ||
      newAmount >
        commandeIDInPaiements.totalAmount - commandeIDInPaiements.totalPaye
    ) {
      return res
        .status(404)
        .json({ messgae: 'Votre Montant est supérieur au total restant' });
    }

    // On vérifie si la SOMME TOTAL n'est pas déjà payé
    if (commandeIDInPaiements.totalAmount === commandeIDInPaiements.totalPaye) {
      return res.status(404).json({ message: 'Le PAIEMENT est déjà complet' });
    }

    // Etape 2 : faire soustraite le (amount) initial sur le TotalPaye, pour ne pass adionner deux fois

    const histPaiementId = req.params.id;
    const selectedPaiementHistorique = await PaiementHistorique.findById(
      histPaiementId
    );

    const oldAmount = selectedPaiementHistorique.amount;
    // Retablir d'abord le TotalPaye
    await Paiement.findByIdAndUpdate(commandeIDInPaiements, {
      $inc: { totalPaye: -oldAmount },
    });

    // en suite adintioner la nouvealle valeur
    await Paiement.findByIdAndUpdate(commandeIDInPaiements, {
      $inc: { totalPaye: +newAmount },
    });

    const updated = await PaiementHistorique.findByIdAndUpdate(
      req.params.id,
      { amount: newAmount, ...req.body },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Historique des paiements
exports.getAllPaiementsHistorique = async (req, res) => {
  try {
    // Récupération des Historique de PAIEMENT dont ID COMMANDE correspond au celle sélectionné dans URL

    const paiements = await PaiementHistorique.find({
      commande: req.params.id,
    })
      // commande: new mongoose.Types.ObjectId(req.params.id),
      // Trie par date de création, du plus récent au plus ancien
      .sort({ createdAt: -1 })
      .populate('commande');

    return res.status(200).json(paiements);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
// Historique des paiements d’un étudiant
exports.getPaiementHistorique = async (req, res) => {
  try {
    const paiements = await PaiementHistorique.findById(req.params.id).populate(
      {
        path: 'commande',
        populate: { path: 'items.produit' },
      }
    );

    return res.status(200).json(paiements);
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// Supprimer un paiement
exports.deletePaiementHistorique = async (req, res) => {
  try {
    // On Cherche d'abord l'HISTORIQUE de PAIEMENT a supprimer
    const deletedHisPaiement = await PaiementHistorique.findById(req.params.id);

    // Trouver le PAIEMENT dont ID de COMMANDE est dans l'historique de PAIEMENT
    const commandeIDInPaiements = await Paiement.findOne({
      commande: deletedHisPaiement.commande,
    });

    // On met à jour la somme de TotalPaye de PAIEMENT correspondant
    const updatedDeletePaiementAmount = await Paiement.findByIdAndUpdate(
      commandeIDInPaiements,
      {
        $inc: { totalPaye: -deletedHisPaiement.amount },
      }
    );

    // après on supprimer le PAIEMENT HISTORIQUE
    await PaiementHistorique.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Historique Paiement supprimé avec succès',
    });

    // Vérifier si la somme de PAIEMENT HISTORIQUE et égal au somme de TotalPaye de PAIEMENT alors on supprimer egalement le PAIEMENT
    // ça veux il reste un seul PAIEMENT, donc on supprime tous
    if (deletedHisPaiement.amount === commandeIDInPaiements.totalPaye) {
      await Paiement.findByIdAndDelete(updatedDeletePaiementAmount);
      return res.status(200).json({
        status: 'success',
        message: 'Paiement et son Historique ont été supprimé avec succès',
      });
    }
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
