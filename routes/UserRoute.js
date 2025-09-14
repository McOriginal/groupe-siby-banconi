const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

// Enregistrer un nouvel utilisateur
router.post(
  '/register',
  userController.authMiddleware,
  userController.register
);

// Login User
router.post('/login', userController.login);

// Update Password
router.put('/updatePassword/:id', userController.updatePassword);

// sendVerifyCodePassword
router.post('/sendVerifyCodePassword', userController.sendVerifyCodePassword);

// Reset Password
router.put('/resetPassword', userController.resetPassword);

// Get All Users
router.get('/getAllUsers', userController.getAllUsers);

// Get One User
router.get('/getOneUser/:id', userController.getOneUser);

// Update User
router.put('/updateUser/:id', userController.updateUser);

module.exports = router;
