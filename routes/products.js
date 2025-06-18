const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Rotta per ottenere tutti i prodotti con paginazione
router.get('/', productsController.index);

// ...altre route...

module.exports = router;