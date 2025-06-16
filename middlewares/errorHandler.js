//Middleware per gestire gli errori

function errorHandler(err, req, res, next) { // Funzione middleware per gestire gli errori
    console.error(err.stack);
    res.status(500).json({
        status: 'Errore',
        message: 'Si è verificato un errore interno del server',
    });
}

module.exports = errorHandler; // Esporto il middleware per poterlo utilizzare in altri file