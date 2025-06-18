const express = require('express'); // Importo express per creare il router
const router = express.Router(); // Creo un router per gestire le rotte dei giochi
const gameController = require('../controllers/gameController'); // Importo il controller dei giochi

// Tutte le route sono prefissate con /api/games

// GET - Recuperare tutti i giochi (senza paginazione)
router.get('/all', gameController.getAll); // http://localhost:3000/api/games/

// GET - Ricerca giochi per fascia di prezzo crescente
router.get('/price-range', gameController.getByPriceRange); //http://localhost:3000/api/games/price-range  OPPURE SE VUOI AVERE UN RANGE DI PREZZO SPECIFICO PUOI USARE http://localhost:3000/api/games/price-range?min=10&max=50 DOVE I NUMERI SU MIN E MAX SONO I PREZZI MINIMO E MASSIMO CHE VUOI RICERCARE

// GET - Ricerca giochi in offerta
router.get('/discounted', gameController.getDiscounted); //http://localhost:3000/api/games/discounted

// GET - Recuperare un gioco specifico tramite genere
router.get('/genre/:genre', gameController.sortByGenre); //http://localhost:3000/api/games/genre/"Inserire il genere"

// Get - Ricerca unificata per offerta e genere
router.get('/search', gameController.searchGames); //http://localhost:3000/api/games/search?genre=RPG&discounted=true  SOSTITUISCI RPG CON IL GENERE CHE VUOI RICERCARE E TRUE CON FALSE SE NON VUOI I GIOCHI IN OFFERTA

// GET - Recuperare tutti i giochi (paginazione)
router.get('/', gameController.index); //http://localhost:3000/api/games?page="1/2/3/4"

// GET - Recuperare un gioco specifico tramite ID
router.get('/:id', gameController.show); // http://localhost:3000/api/games/10

// POST - Il metodo CREA è vuoto
router.post('/', gameController.store);

module.exports = router;