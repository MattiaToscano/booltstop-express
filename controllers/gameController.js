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

// POST - Creare un nuovo ordine
const store = (req, res) => {
    // Ottengo i dati dal body della richiesta
    const {
        total_price, // Prezzo totale dell'ordine
        shipment_price, // Prezzo totale della spedizione
        status, // Stato dell'ordine (paid, shipped, cancelled, pending)
        name,   // Nome del cliente
        surname, // Cognome del cliente
        address, // Indirizzo del cliente
        email, // Email del cliente
        phone, //  Telefono del cliente
        items // Array di oggetti {id_product, quantity}
    } = req.body;

    // Verifico che siano presenti tutti i campi obbligatori
    if (!total_price || !shipment_price || !status || !name || !surname || !address || !email || !phone || !items || !Array.isArray(items)) {
        return res.status(400).json({
            success: false,
            message: 'Dati mancanti. Tutti i campi sono obbligatori.'
        });
    }

    // Validazione basilare dello status
    const validStatus = ['paid', 'shipped', 'cancelled', 'pending']; // Definisco gli stati validi
    if (!validStatus.includes(status)) { // Controllo se lo status è valido
        return res.status(400).json({
            success: false,
            message: 'Status non valido. Valori accettati: paid, shipped, cancelled, pending'
        });
    }

    // Eseguo la query per inserire l'ordine
    connection.query(
        'INSERT INTO `order` (total_price, shipment_price, status, name, surname, address, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', // Query per inserire l'ordine
        [total_price, shipment_price, status, name, surname, address, email, phone],
        (error, results) => {
            if (error) {
                console.error('Errore nella creazione dell\'ordine:', error);
                return res.status(500).json({ success: false, error: 'Errore durante la creazione dell\'ordine' });
            }

            const orderId = results.insertId;

            // Inserisco gli elementi dell'ordine
            if (items.length > 0) {
                // Preparo i valori per l'inserimento multiplo
                const orderItemValues = items.map(item => [item.id_product, orderId, item.quantity]);

                // Query per inserire gli elementi dell'ordine
                const orderItemsQuery = 'INSERT INTO order_item (id_product, id_order, quantity) VALUES ?';

                connection.query(orderItemsQuery, [orderItemValues], (orderItemsError) => {
                    if (orderItemsError) {
                        console.error('Errore nell\'inserimento degli elementi dell\'ordine:', orderItemsError);
                        return res.status(500).json({
                            success: false,
                            message: 'Ordine creato ma errore nell\'inserimento degli elementi',
                            orderId
                        });
                    }

                    // Risposta con successo
                    return res.status(201).json({
                        success: true,
                        message: 'Ordine creato con successo',
                        orderId
                    });
                });
            } else {
                // Risposta con successo se non ci sono elementi nell'ordine
                return res.status(201).json({
                    success: true,
                    message: 'Ordine creato con successo (nessun elemento)',
                    orderId
                });
            }
        }
    );
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

    let query = 'SELECT * FROM products WHERE 1=1'; // Iniziamo con una query di base che seleziona tutti i prodotti
    let params = []; // Array per i parametri della query

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