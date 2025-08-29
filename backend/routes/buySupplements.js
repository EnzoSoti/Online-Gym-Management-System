const express = require('express');
const { SupplementController } = require('../controllers');
const router = express.Router();

// Buy supplements endpoint
router.post('/', SupplementController.buySupplement);

module.exports = router;