const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

// Enregistrer un nouvel utilisateur
router.post('/register', userController.register);

// Login User
router.post('/login', userController.login);

// Update Password
router.put('/updatePassword/:id', userController.updatePassword);

// sendVerifyCodePassword
router.post('/sendVerifyCodePassword', userController.sendVerifyCodePassword);

// Reset Password
router.put('/resetPassword', userController.resetPassword);

module.exports = router;
