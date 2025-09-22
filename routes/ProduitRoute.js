const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const produitController = require('../controller/ProduitController');

// Créer un Produit
router.post(
  '/addProduit',
  userController.authMiddleware,
  produitController.createProduit
);

// Afficher une toutes les Produit
router.get('/getAllProduits', produitController.getAllProduits);

// Afficher une toutes les Produit sans Stcok
router.get(
  '/getAllProduitWithStockFinish',
  produitController.getAllProduitWithStockFinish
);

// Afficher une seule Produit
router.get('/getOneProduit/:id', produitController.getOneProduit);

// Afficher une seule Produit lors de l'approvisionnement
router.get(
  '/approvisonnement/:id',
  produitController.getOneProduitWhenApprovisionne
);

// Mettre à jour une Produit
router.put('/updateProduit/:id', produitController.updateProduit);

// supprimer un PRODUIT
router.delete('/deleteProduit/:id', produitController.deleteProduitById);

// Supprimer toutes les Produit
router.delete('/deleteAllProduit', produitController.deleteAllProduit);

module.exports = router;
