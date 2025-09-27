const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const inventaireController = require('../controller/InventaireContoller');
// Route pour créer un approvisionnement
router.post(
  '/createInventaire',
  userController.authMiddleware,
  inventaireController.createInventaire
);

// Route pour récupérer tous les approvisionnements
router.get('/getAllInventaires', inventaireController.getAllInventaire);

// Route pour récupérer un approvisionnement par son ID
router.get('/getInventaire/:id', inventaireController.getInventaireById);

// Route pour Annuler une approvisionnement
router.delete('/cancelInventaire/:id', inventaireController.cancelInventaire);

// Route pour supprimer un approvisionnement
router.delete('/deleteInventaire/:id', inventaireController.deleteInventaire);

module.exports = router;
