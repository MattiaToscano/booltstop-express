const express = require('express'); // Importo express per creare il router
const router = express.Router(); // Creo un router per gestire le rotte dei giochi
const gameController = require('../controllers/gameController'); // Importo il controller dei giochi

// IMPORTANTE: Modificare l'ordine delle route!
// Le route specifiche devono venire PRIMA delle route con parametri

// GET - Recuperare tutti i giochi (senza paginazione)
router.get('/all', gameController.getAll);

// GET - Recuperare tutti i giochi (paginazione)
router.get('/', gameController.index);

// GET - Ricerca giochi in offerta
router.get('/discounted', gameController.getDiscounted);

// GET - Ricerca giochi per intervallo di prezzo
router.get('/price-range', gameController.getByPriceRange);

// GET - Recuperare un gioco specifico tramite genere
router.get('/genre/:genre', gameController.sortByGenre);

// IMPORTANTE: Questa route deve venire DOPO tutte le route specifiche
// GET - Recuperare un gioco specifico tramite ID
router.get('/:id', gameController.show);

// POST - Creare un nuovo gioco
router.post('/', gameController.store);

// PUT - Aggiornare completamente un gioco esistente
router.put('/:id', gameController.update);

// DELETE - Eliminare un gioco
router.delete('/:id', gameController.destroy);

module.exports = router;