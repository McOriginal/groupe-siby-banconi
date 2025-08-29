const express = require('express');
const router = express.Router();
const livraisonHistoriqueController = require('../controller/LivraisonHistoriqueController');

// Ajouter une Livraison
router.post(
  '/createLivraisonHistorique',
  livraisonHistoriqueController.createLivraisonHistorique
);

// Mettre à jours une livraion
router.put(
  '/updateLivraisonHistorique/:id',
  livraisonHistoriqueController.updateLivraisonHistorique
);

// Afficher la liste des Livraison Historique
router.get(
  '/getAllLivraisonHistorique/:id',
  livraisonHistoriqueController.getAllLivraisonHistorique
);

// Afficher une seule Livraison Historique
router.get(
  '/getOneLivraisonHistorique',
  livraisonHistoriqueController.getOneLivraisonHistorique
);

// Supprimer une Livraison Historique
router.delete(
  '/deleteLivraisonHistorique/:id',
  livraisonHistoriqueController.deleteLivraisonHistorique
);

module.exports = router;
