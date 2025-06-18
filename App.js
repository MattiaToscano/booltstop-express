const express = require('express'); // Importo Express
const errorHandler = require('./middlewares/errorHandler'); // Middleware per la gestione degli errori
const notFound = require('./middlewares/notFound'); // Middleware per gestire le rotte non trovate
const gamesRouter = require('./router/gamesRouter');// Importo il router dei giochi
const connection = require('./data/db_games.js'); // Importo la connessione al database


const app = express(); // Inizializzo l'app Express
const PORT = process.env.SERVER_PORT || 3000; //Imposto la porta del server

// Verifica la connessione al database
connection.connect(err => {
    if (err) {
        console.error('Errore connessione al database:', err);
    }
    console.log('Connessione al database stabilita con successo');
});

// Middlewares
app.use(express.static('public'));
app.use(express.json());  // Per il parsing dei body JSON


// Rotta base
app.get('/', (req, res) => {
    res.send('Benvenuto nell\'API di Booltstop Express');
});

// Associo il router dei giochi
app.use('/api/games', gamesRouter);

// Gestione errori
app.use(notFound);
app.use(errorHandler);

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});