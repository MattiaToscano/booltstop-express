const express = require('express'); // Importo express per creare il router
const router = express.Router(); // Creo un router per gestire le rotte dei giochi
const gameController = require('../controllers/gameController'); // Importo il controller dei giochi

// Tutte le route sono prefissate con /api/games

// GET - Recuperare tutti i giochi (senza paginazione)
router.get('/all', gameController.getAll);

// GET - Ricerca giochi per fascia di prezzo
router.get('/price-range', gameController.getByPriceRange);

// GET - Ricerca giochi in offerta
router.get('/discounted', gameController.getDiscounted);

// GET - Recuperare un gioco specifico tramite genere
router.get('/genre/:genre', gameController.sortByGenre);

// GET - Recuperare tutti i giochi (paginazione)
router.get('/', gameController.index);

// GET - Recuperare un gioco specifico tramite ID
router.get('/:id', gameController.show);

// POST - Il metodo CREA è vuoto
router.post('/', gameController.store);

module.exports = router;