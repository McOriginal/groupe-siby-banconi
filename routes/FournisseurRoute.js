const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const fournisseurController = require('../controller/FournisseurController');

// Créer un Fournisseur
router.post(
  '/createFournisseur',
  userController.authMiddleware,
  fournisseurController.createFournisseur
);

// Afficher toutes les Fournisseurs
router.get('/getAllFournisseurs', fournisseurController.getAllFournisseurs);

// Afficher un seul Fournisseur
router.get('/getOneFournisseur/:id', fournisseurController.getFournisseur);

// Mettre à jour un Fournisseur
router.put('/updateFournisseur/:id', fournisseurController.updateFournisseur);

// supprimer un Fournisseur
router.delete(
  '/deleteFournisseur/:id',
  fournisseurController.deleteFournisseur
);

// Supprimer toutes les Fournisseur
router.delete(
  '/deleteAllFournisseur',
  fournisseurController.deleteAllFournisseurs
);

module.exports = router;
