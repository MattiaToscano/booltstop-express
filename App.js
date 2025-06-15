const express = require('express'); // Importo Express
const errorHandler = require('./middlewares/errorHandler'); // Middleware per la gestione degli errori
const notFound = require('./middlewares/notFound'); // Middleware per gestire le rotte non trovate
const gamesRouter = require('./router/gamesRouter');// Importo il router dei giochi


const app = express(); // Inizializzo l'app Express
const PORT = process.env.SERVER_PORT || 3000; //Imposto la porta del server



// Middlewares
app.use(express.static('public'));
app.use(express.json());  // Per il parsing dei body JSON
app.use(express.urlencoded({ extended: true }));  // Per il parsing dei form data

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