const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const commandeController = require('../controller/CommandeController');

//  Créer une nouvelle Commande
router.post(
  '/createCommande',
  userController.authMiddleware,
  commandeController.createCommande
);

//  Obtenir toutes les Commandes
router.get('/getAllCommandes', commandeController.getAllCommandes);

//  Obtenir une Commandes
router.get('/getOneCommande/:id', commandeController.getOneCommande);

// Decrementer le Stcok de PRODUIT
// router.post(
//   '/decrementMultipleStocks',
//   commandeController.decrementMultipleStocks
// );

router.put('/updateCommande/:commandeId', commandeController.updateCommande);

//  Supprimer une Commande
router.post('/deleteCommande/:commandeId', commandeController.deleteCommande);

module.exports = router;
