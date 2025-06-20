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

// GET - Recuperare i nuovi arrivi
router.get('/new-releases', gameController.getNewReleases); //http://localhost:3000/api/games/new-releases?limit=4 Recupera i primi 4 giochi aggiunti di recente. Puoi cambiare il numero di giochi cambiando il valore di limit nell'URL.

// GET - Ordinamento giochi per vari criteri
// Versione senza parametro opzionale : rotta base
router.get('/order', gameController.orderGames);
//http://localhost:3000/api/games/order

// GET - Ordinamento giochi per vari criteri con tipo specificato
router.get('/order/:type', gameController.orderGames);
// Esempi di utilizzo per questa rotta:
// http://localhost:3000/api/games/order/title-asc  (A-Z)
// http://localhost:3000/api/games/order/title-desc (Z-A)
// http://localhost:3000/api/games/order/price-asc  (prezzo crescente)
// http://localhost:3000/api/games/order/price-desc (prezzo decrescente)
// http://localhost:3000/api/games/order/release-date-desc (più recenti)
// http://localhost:3000/api/games/order/release-date-asc (più vecchi)
// http://localhost:3000/api/games/order/discount-desc (maggior sconto)
// http://localhost:3000/api/games/order/discount-asc (minor sconto)

// GET - Ricerca autocomplete per nome del gioco
router.get('/autocomplete', gameController.searchAutocomplete);
// http://localhost:3000/api/games/autocomplete?term=M
// Trova tutti i giochi che iniziano con "M"
// Per ulteriori check, sostituire alla lettera "M" qualsiasi altra lettera o parte del nome del gioco che si desidera cercare.


// GET - Recuperare tutti i giochi (paginazione)
router.get('/', gameController.index);
// http://localhost:3000/api/games?page=1&perPage=9
//Sostituisci il 9 con il numero di prodotti che vuoi visualizzare per pagina (valori consentiti: 9, 18, 27, 36). Se non specifichi il parametro perPage, verrà utilizzato il valore predefinito di 9.
// http://localhost:3000/api/games?perPage=27&page=2 perPage=27 e page=2 significa che vuoi visualizzare 27 prodotti per pagina e stai richiedendo la seconda pagina dei risultati.
// Parametri supportati:
//   - page: numero di pagina (default: 1)
//   - perPage: prodotti per pagina (valori consentiti: 9, 18, 27, 36, default: 9)


// GET - Recuperare un gioco specifico tramite ID (DEVE STARE DOPO TUTTE LE ROTTE SPECIFICHE)
router.get('/:id', gameController.show); // http://localhost:3000/api/games/10

// POST - Aggiungere nuovo ordine
router.post('/', gameController.store); //http://localhost:3000/api/games  NEL BODY DELLA RICHIESTA DEVI INSERIRE I DATI DEL GIOCO CHE VUOI AGGIUNGERE IN FORMATO JSON CON: TOTAL_PRICE,SHIPMENT_PRICE,STATUS,NAME,SURNAME,ADDRESS,EMAIL,PHONE,PRODUCTS (QUEST'ULTIMO È UN ARRAY DI OGGETTI CON ID E QUANTITY)

// Ecco un esempio  per fare un check su postman:
// {
//   "total_price": 159.99,
//   "shipment_price": 4.99,
//   "status": "pending",
//   "name": "Mario",
//   "surname": "Rossi",
//   "address": "Via Roma 123, Milano",
//   "email": "mario.rossi@example.com",
//   "phone": "3491234567",
//   "items": [
//     {
//       "id_product": 1,
//       "quantity": 1
//     },
//     {
//       "id_product": 2,
//       "quantity": 2
//     }
//   ]
// }
//}

module.exports = router;