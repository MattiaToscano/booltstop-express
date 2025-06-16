const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
// Definisco le rotte CRUD principali

// GET - Recuperare tutti i giochi
router.get('/', gameController.index);

// GET - Ricerca giochi in offerta
router.get('/discounted', gameController.getDiscounted);

// GET - Ricerca giochi per intervallo di prezzo
router.get('/price-range', gameController.getByPriceRange);

// GET - Recuperare un gioco specifico tramite ID
router.get('/:id', gameController.show);

// GET - Recuperare un gioco specifico tramite genere
router.get('/genre/:genre', gameController.sortByGenre);

// POST - Creare un nuovo gioco
router.post('/', gameController.store);

// PUT - Aggiornare completamente un gioco esistente
router.put('/:id', gameController.update);

// DELETE - Eliminare un gioco
router.delete('/:id', gameController.destroy);

module.exports = router;
