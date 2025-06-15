//Importo connessione al database
const connection = require('../data/db_games.js');

//Creo metodi per le operatzioni CRUD

// GET - Recuperare tutti i giochi
const index = (req, res) => { // Funzione per recuperare tutti i giochi
    console.log('Richiesta GET ricevuta per recuperare tutti i giochi');
    try { // Provo a eseguire la query
        connection.query('SELECT * FROM products', (error, results) => {
            if (error) { // Gestisco eventuali errori nella query
                console.error('Errore SQL:', error);
                return res.status(500).json({ success: false, message: 'Errore nel recupero dei giochi', error }); // Rispondo con un errore 500
            }
            console.log(`Recuperati ${results.length} prodotti con successo`);
            return res.status(200).json({ success: true, count: results.length, data: results }); // Rispondo con i risultati della query
        });
    } catch (error) {
        console.error('Eccezione catturata:', error);
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

// GET - Recuperare un gioco specifico per ID
const show = (req, res) => {
    try {
        const id = req.params.id;
        connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Errore nel recupero del gioco', error });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Gioco non trovato' });
            }
            return res.status(200).json({ success: true, data: results[0] });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

// POST - Creare un nuovo gioco
const store = (req, res) => {
    console.log('Richiesta POST ricevuta:', req.body);

    // Verifica se req.body è undefined o vuoto
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Body della richiesta vuoto o non valido. Assicurati di inviare dati JSON validi con header Content-Type: application/json'
        });
    }

    try {
        const { name, description, price, image, discount, release_date } = req.body;

        // Validazione dei dati
        if (!name || !price) {
            return res.status(400).json({ success: false, message: 'Nome e prezzo sono campi obbligatori' });
        }

        // Crea un oggetto con solo i campi esistenti nella tabella
        const newProduct = {
            name,
            description,
            image,
            price,
            discount: discount || null,
            release_date: release_date || null,
            sold_pieces: 0
        };

        console.log('Tentativo di inserimento:', newProduct);

        connection.query('INSERT INTO products SET ?', newProduct, (error, results) => {
            if (error) {
                console.error('Errore SQL durante inserimento:', error);
                return res.status(500).json({ success: false, message: 'Errore nella creazione del gioco', error });
            }
            newProduct.id = results.insertId;
            return res.status(201).json({ success: true, message: 'Gioco creato con successo', data: newProduct });
        });
    } catch (error) {
        console.error('Eccezione durante creazione:', error);
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

// PUT - Aggiornare un gioco esistente
const update = (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, image, discount, release_date, sold_pieces } = req.body;

        // Verifica se il prodotto esiste
        connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Errore nella verifica del gioco', error }); // Se il gioco non viene trovato, restituisco un errore 500
            }
            if (results.length === 0) { // Se il gioco non esiste, restituisco un errore 404
                return res.status(404).json({ success: false, message: 'Gioco non trovato' });
            }

            // Crea un oggetto con i campi da aggiornare
            const updatedProduct = {}; // Inizializzo un oggetto vuoto per i campi da aggiornare
            if (name !== undefined) updatedProduct.name = name; // Aggiungo il nome se definito
            if (description !== undefined) updatedProduct.description = description; // Aggiungo la descrizione se definita
            if (price !== undefined) updatedProduct.price = price; // Aggiungo il prezzo se definito
            if (image !== undefined) updatedProduct.image = image; // Aggiungo l'immagine se definita
            if (discount !== undefined) updatedProduct.discount = discount; // Aggiungo lo sconto se definito
            if (release_date !== undefined) updatedProduct.release_date = release_date; // Aggiungo la data di rilascio se definita
            if (sold_pieces !== undefined) updatedProduct.sold_pieces = sold_pieces;// Aggiungo le copie vendute se definito

            connection.query('UPDATE products SET ? WHERE id = ?', [updatedProduct, id], (error) => {
                if (error) {
                    return res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento del gioco', error }); // Se c'è un errore nell'aggiornamento, restituisco un errore 500
                }
                return res.status(200).json({ success: true, message: 'Gioco aggiornato con successo', data: { id, ...updatedProduct } }); // Rispondo con il gioco aggiornato
            });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Errore del server', error }); // Gestisco eventuali errori del server
    }
};

// DELETE - Eliminare un gioco
const destroy = (req, res) => {
    try {
        const id = req.params.id;

        // Verifica se il prodotto esiste
        connection.query('SELECT * FROM products WHERE id = ?', [id], (error, results) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Errore nella verifica del gioco', error }); // Se il gioco non viene verificato, restituisco un errore 500
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Gioco non trovato' }); // Se il gioco non esiste, restituisco un errore 404
            }

            // Elimina il gioco
            connection.query('DELETE FROM products WHERE id = ?', [id], (error) => {
                if (error) {
                    return res.status(500).json({ success: false, message: 'Errore nell\'eliminazione del gioco', error }); // Se c'è un errore nell'eliminazione, restituisco un errore 500
                }
                return res.status(200).json({ success: true, message: 'Gioco eliminato con successo' }); // Rispondo con un messaggio di successo
            });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

// GET - Ricerca giochi per prezzo massimo
const getByPriceRange = (req, res) => {
    try {
        const minPrice = parseFloat(req.query.min) || 0; // Valore minimo di prezzo, predefinito a 0
        const maxPrice = parseFloat(req.query.max) || 1000000; // Valore massimo di prezzo, predefinito a 1000000

        // Validazione dei valori di prezzo
        if (minPrice < 0 || maxPrice < 0) {
            return res.status(400).json({ success: false, message: 'I prezzi devono essere positivi' });
        }

        // Query per trovare prodotti in un intervallo di prezzo
        connection.query('SELECT * FROM products WHERE price BETWEEN ? AND ? ORDER BY price ASC',
            [minPrice, maxPrice],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ success: false, message: 'Errore nella ricerca dei giochi per intervallo di prezzo', error });
                }
                if (results.length === 0) {
                    return res.status(404).json({ success: false, message: `Nessun gioco trovato nell'intervallo di prezzo ${minPrice} - ${maxPrice}` });
                }
                return res.status(200).json({ // Rispondo con i risultati della ricerca
                    success: true,
                    count: results.length,
                    priceRange: { min: minPrice, max: maxPrice },
                    data: results
                });
            }
        );
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

// GET - Ricerca giochi in offerta (con discount > 0)
const getDiscounted = (req, res) => {
    try {
        connection.query('SELECT * FROM products WHERE discount > 0 ORDER BY discount DESC', (error, results) => {
            if (error) { //
                return res.status(500).json({ success: false, message: 'Errore nella ricerca dei giochi in offerta', error });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: 'Nessun gioco in offerta trovato' });
            }
            return res.status(200).json({ // Rispondo con i risultati della ricerca
                success: true,
                count: results.length,
                data: results
            });
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Errore del server', error });
    }
};

module.exports = {
    index,
    show,
    store,
    update,
    destroy,
    getByPriceRange,
    getDiscounted
};
