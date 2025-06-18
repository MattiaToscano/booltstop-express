//Importo connessione al database
const connection = require('../data/db_games.js');

// GET - Recuperare tutti i giochi con paginazione
const index = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    connection.query('SELECT * FROM products LIMIT ? OFFSET ?',
        [itemsPerPage, offset],
        (error, results) => {
            if (error) return res.status(500).json({ success: false, error });
            return res.json(results);
        }
    );
};

// GET - Recuperare tutti i giochi senza paginazione
const getAll = (req, res) => {
    connection.query('SELECT * FROM products', (error, results) => {
        if (error) return res.status(500).json({ success: false, error });
        return res.json(results);
    });
};

// GET - Recuperare un gioco specifico tramite ID
const show = (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
        if (error) return res.status(500).json({ success: false, error });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Gioco non trovato' });
        return res.json(results[0]);
    });
};

// POST - Creare un nuovo gioco
const store = (req, res) => {
    // Metodo lasciato vuoto
    res.status(501).json({ message: "Funzionalità non implementata" });
};

// GET - Ricerca giochi in offerta (con discount > 0)
const getDiscounted = (req, res) => {
    connection.query('SELECT * FROM products WHERE discount > 0 ORDER BY discount DESC',
        (error, results) => {
            if (error) return res.status(500).json({ success: false, error });
            return res.json(results);

        }
    );
};

// GET - Ricerca giochi per fascia di prezzo
const getByPriceRange = (req, res) => {
    const minPrice = parseFloat(req.query.min) || 10;
    const maxPrice = parseFloat(req.query.max) || 50;

    connection.query(
        'SELECT * FROM products WHERE price >= ? AND price <= ? ORDER BY price ASC',
        [minPrice, maxPrice],
        (error, results) => {
            if (error) return res.status(500).json({ success: false, error });
            return res.json(results);
        }
    );
};

// GET - Ricerca giochi per genere
const sortByGenre = (req, res) => {
    const genre = req.params.genre;
    connection.query(
        'SELECT * FROM products WHERE genre LIKE ?',
        [`%${genre}%`],
        (error, results) => {
            if (error) return res.status(500).json({ success: false, error });
            return res.json(results);
        }
    );
};

// GET - Ricerca unificata (genere e/o sconto)
const searchGames = (req, res) => {
    // Otteniamo i parametri dalla query
    const { genre, discounted } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    // Se è specificato un genere, filtriamo per genere
    if (genre) {
        query += ' AND genre LIKE ?'; // Utilizziamo LIKE per cercare il genere
        params.push(`%${genre}%`);// Aggiungiamo il genere ai parametri
    }

    // Se è richiesto solo prodotti scontati, filtriamo per sconto
    if (discounted === 'true') {
        query += ' AND discount > 0'; // Filtriamo per prodotti con sconto maggiore di 0

        // Ordina per sconto decrescente quando cerchiamo prodotti scontati
        query += ' ORDER BY discount DESC';// Ordine per sconto decrescente

    } else {
        // Ordine predefinito per prezzo
        query += ' ORDER BY price ASC';// Ordine per prezzo crescente
    }

    connection.query(query, params, (error, results) => {
        if (error) return res.status(500).json({ success: false, error });
        return res.json(results);
    });
};

// Esporto i metodi
module.exports = {
    index,
    getAll,
    show,
    store,
    getDiscounted,
    getByPriceRange,
    sortByGenre,
    searchGames
};