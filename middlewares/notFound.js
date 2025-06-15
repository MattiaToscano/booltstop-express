
// Middleware per gestire le richieste a risorse non trovate
function notFound(req, res, next) {
    res.status(404).json({
        error: 'Non trovato',
        message: 'La risorsa richiesta non è stata trovata',
    });
}


module.exports = notFound; // Esporto il middleware per poterlo utilizzare in altri file