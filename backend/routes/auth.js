const express = require('express');
const { AuthController } = require('../controllers');
const router = express.Router();

// User Authentication Routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;