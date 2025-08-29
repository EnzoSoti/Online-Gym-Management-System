const express = require('express');
const { SupplementController } = require('../controllers');
const router = express.Router();

// Supplements API Routes
router.get('/', SupplementController.getAllSupplements);
router.post('/', SupplementController.createSupplement);
router.put('/:id', SupplementController.updateSupplement);
router.delete('/:id', SupplementController.deleteSupplement);

module.exports = router;