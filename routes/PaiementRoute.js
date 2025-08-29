const express = require('express');
const router = express.Router();
const paiementController = require('../controller/PaiementController');

// Créer
router.post('/createPaiement', paiementController.createPaiement);

// Trouvez tous les paiements
router.get('/getAllPaiements', paiementController.getAllPaiements);

// Trouvez un paiements
router.get('/getOnePaiement/:id', paiementController.getPaiement);

// Trouvez un PAIEMENT via ID de COMMANDE sélectionnée
router.get(
  '/getPaiementBySelectedCommandeID/:id',
  paiementController.getPaiementBySelectedCommandeID
);

// Mettre à jour
router.put('/updatePaiement/:id', paiementController.updatePaiement);

// Supprimer
router.delete('/deletePaiement/:id', paiementController.deletePaiement);

module.exports = router;
