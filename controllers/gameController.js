//Importo connessione al database
const connection = require('../data/db_games.js');

// GET - Recuperare tutti i giochi con paginazione e limite personalizzabile
const index = (req, res) => {
    // Recupero i parametri di paginazione dalla query string
    const page = parseInt(req.query.page) || 1; // Pagina corrente (default: 1)
    const perPage = parseInt(req.query.perPage) || 9; // Prodotti per pagina (default: 9)

    // Calcolo l'offset per la query SQL
    const offset = (page - 1) * perPage;

    // Array di valori consentiti per perPage
    const allowedPerPageValues = [9, 18, 27, 36];

    // Verifica se il valore perPage è consentito, altrimenti usa il default
    const validPerPage = allowedPerPageValues.includes(perPage) ? perPage : 9;

    // Prima query: recupero i prodotti con paginazione
    connection.query(
        'SELECT * FROM products LIMIT ? OFFSET ?',
        [validPerPage, offset],
        (error, results) => {
            if (error) return res.status(500).json({ success: false, error });

            // Seconda query: recupero il numero totale di prodotti
            connection.query(
                'SELECT COUNT(*) as total FROM products',
                (countError, countResults) => {
                    if (countError) return res.status(500).json({ success: false, error: countError });

                    // Calcolo il numero totale di pagine
                    const total = countResults[0].total;
                    const totalPages = Math.ceil(total / validPerPage);

                    // Costruisco l'oggetto di risposta con informazioni sulla paginazione
                    return res.json({
                        success: true,
                        currentPage: page,
                        totalPages: totalPages,
                        perPage: validPerPage,
                        total: total,
                        allowedPerPageValues: allowedPerPageValues,
                        results: results
                    });
                }
            );
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
        'INSERT INTO `orders` (total_price, shipment_price, status, name, surname, address, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
                            error: orderItemsError.message,
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
    // Ottengo i parametri dalla query
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

// GET - Recuperare i nuovi arrivi del 2024
const getNewReleases = (req, res) => {
    // Ottengo il limite opzionale dalla query string o usiamo 8 come predefinito
    const limit = parseInt(req.query.limit) || 8;

    // Imposto le date specifiche per il 2024
    const startDate = '2023-01-01';
    const endDate = '2023-12-31';

    // Query per ottenere i giochi rilasciati nel 2023, ordinati per data di rilascio decrescente
    connection.query(
        'SELECT * FROM products WHERE release_date >= ? AND release_date <= ? ORDER BY release_date DESC LIMIT ?',
        [startDate, endDate, limit],
        (error, results) => {
            if (error) {
                console.error('Errore nel recupero dei nuovi arrivi:', error);
                return res.status(500).json({ success: false, error: 'Errore nel recupero dei nuovi arrivi' });
            }

            if (results.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Nessun gioco rilasciato nel 2024',
                    results: []
                });
            }

            return res.json(results);
        }
    );
};

// GET - Ordinamento giochi per vari criteri
const orderGames = (req, res) => {
    // Parametro per specificare il tipo di ordinamento
    const orderType = req.params.type || 'title-asc';

    // Oggetto di configurazione per i diversi tipi di ordinamento
    const orderConfigs = {
        // Ordinamento alfabetico
        'title-asc': { field: 'name', direction: 'ASC' },
        'title-desc': { field: 'name', direction: 'DESC' },

        // Ordinamento per prezzo
        'price-asc': { field: 'price', direction: 'ASC' },
        'price-desc': { field: 'price', direction: 'DESC' },

        // Ordinamento per data di rilascio
        'release-date-asc': { field: 'release_date', direction: 'ASC' },
        'release-date-desc': { field: 'release_date', direction: 'DESC' },

        // Ordinamento per sconto
        'discount-asc': { field: 'discount', direction: 'ASC' },
        'discount-desc': { field: 'discount', direction: 'DESC' }
    };

    // Verifica se il tipo di ordinamento è valido
    if (!orderConfigs[orderType]) {
        return res.status(400).json({
            success: false,
            message: `Tipo di ordinamento "${orderType}" non valido.`,
        });
    }

    // Ottengo la configurazione per il tipo di ordinamento richiesto
    const config = orderConfigs[orderType];

    //Eseguo la query per ordinare i giochi
    connection.query(
        `SELECT * FROM products ORDER BY ${config.field} ${config.direction}`,
        (error, results) => {
            if (error) {
                console.error('Errore durante l\'ordinamento dei giochi:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Errore durante l\'ordinamento dei giochi',
                    error: error.message
                });
            }
            return res.json(results);
        }
    );
};

// GET - Ricerca autocomplete per nome del gioco (case-insensitive)
const searchAutocomplete = (req, res) => {
    try {
        // Ottieni il termine di ricerca dalla query string
        const term = req.query.term;
        console.log('Termine ricevuto:', term);

        // Se non c'è un termine di ricerca, restituisci un array vuoto
        if (!term || term.trim() === '') {
            return res.json({
                success: true,
                count: 0,
                results: []
            });
        }

        // Uso LOWER per rendere la ricerca case-insensitive
        const query = 'SELECT id, name, price, image, discount FROM products WHERE LOWER(name) LIKE LOWER(?) ORDER BY name ASC LIMIT 10';
        const searchPattern = term + '%'; // Sostituisco il punto interrogativo con il termine di ricerca seguito da un carattere jolly che rappresenta qualsiasi sequenza di caratteri

        connection.query( // Eseguo la query di ricerca
            query,
            [searchPattern],
            (error, results) => {
                if (error) {
                    console.error('Errore nella ricerca autocomplete:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Errore durante la ricerca autocomplete',
                        error: error.message
                    });
                }

                console.log(`Trovati ${results.length} risultati per "${term}"`);

                return res.json({
                    success: true,
                    count: results.length,
                    results: results
                });
            }
        );
    } catch (err) {
        console.error('Errore generale in searchAutocomplete:', err);
        return res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: err.message
        });
    }
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
    searchGames,
    getNewReleases,
    orderGames,
    searchAutocomplete
};