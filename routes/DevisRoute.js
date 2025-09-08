const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const devisController = require('../controller/DevisController');

//  Créer une nouvelle Devis
router.post(
  '/createDevis',
  userController.authMiddleware,
  devisController.createDevis
);

//  Obtenir toutes les Deviss
router.get('/getAllDevis', devisController.getAllDevis);

//  Obtenir une Deviss
router.get('/getOneDevis/:id', devisController.getOneDevis);

router.put('/updateDevis/:id', devisController.updateDevis);

//  Supprimer une Devis
router.delete('/deleteDevis/:id', devisController.deleteDevis);

module.exports = router;
