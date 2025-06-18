const mysql = require('mysql2'); // Importo mysql dalla libreria

// Configurazione della connessione al database
const connection = mysql.createConnection({ // Creo una connessione al database
    // Configurazione della connessione al database
    host: process.env.DB_HOST || 'localhost', // Host del database, di default localhost
    user: process.env.DB_USER, // Utente del database, prelevato da variabile d'ambiente
    port: process.env.DB_PORT || 3306, // Porta del database, di default 3306
    password: process.env.DB_PASSWORD || 'ciao', // Password del database
    database: process.env.DB_NAME || 'games_db' // Nome del database, prelevato da variabile d'ambiente o di default 'games_db'
})

// Connessione al database
connection.connect((err) => { // Connetto al database
    if (err) { // Gestisco eventuali errori di connessione
        console.error('Errore di connessione al database:', err);
        return;
    }
    console.log('Connessione al database stabilita con successo');
})


module.exports = connection; // Esporto la connessione per poterla utilizzare in altri file in caso di necessità