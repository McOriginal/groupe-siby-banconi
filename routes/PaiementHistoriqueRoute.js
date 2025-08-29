const express = require('express');
const router = express.Router();
const paiementHistoriqueController = require('../controller/PaiementHistoriqueController');

// Créer
router.post(
  '/createPaiementHistorique',
  paiementHistoriqueController.createPaiementHistorique
);

// Trouvez tous les paiements
router.get(
  '/getAllPaiementsHistorique/:id',
  paiementHistoriqueController.getAllPaiementsHistorique
);

// Trouvez un paiements
router.get(
  '/getOnePaiementHistorique/:id',
  paiementHistoriqueController.getPaiementHistorique
);

// Mettre à jour
router.put(
  '/updatePaiementHistorique/:id',
  paiementHistoriqueController.updatePaiementHistorique
);

// Supprimer
router.delete(
  '/deletePaiementHistorique/:id',
  paiementHistoriqueController.deletePaiementHistorique
);

module.exports = router;
