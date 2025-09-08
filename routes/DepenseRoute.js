const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

const depenseController = require('./../controller/DepenseController');

// Route to create a new expense
router.post(
  '/createDepense',
  userController.authMiddleware,
  depenseController.createDepense
);

// Route to update an existing expense
router.put('/updateDepense/:id', depenseController.updateDepense);

// Route to get all expenses
router.get('/getAllDepense', depenseController.getAllDepenses);

// Route to get an expense by ID
router.get('/getDepenseById/:id', depenseController.getDepenseById);

// Route to delete an expense
router.delete('/deleteDepense/:id', depenseController.deleteDepense);

// Export the router
module.exports = router;
