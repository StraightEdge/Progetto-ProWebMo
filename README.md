# Progetto-ProWebMo

## Configurazione

Come prima cosa bisogna installare redis che ci permette di gestire i token di autenticazione.
Consiglio di usare Linux, Mac o Vagrant/Docker perché la versione di redis di Windows non funziona.

Su Linux
`sudo apt install redis`

Su Mac
`brew install redis`

Poi bisogna installare i moduli npm sia nella cartella del server Express sia in quella del progetto React, sono tanti MB da scaricare quindi non li metto direttamente su GitHub

`npm install`

### Attenzione
Sul mio pc ho installato mysql2 quindi il file `package.json` del server fa installare il modulo mysql2 e l'import del middleware fa riferimento a mysql2 
```
const mysql = require("mysql2")
```
Se voi avete mysql basta fare 
```
npm uninstall mysql2
npm install mysql
```
E poi cambiare l'import in `require("mysql")`

## Configurazione Database

Nella cartella `expressserver/models/db` sono presenti vari file:
- `DB.txt` ha la spiegazione del database con le varie tabelle ed i campi
- `UniDB.sql` ha il codice MySQL per la creazione del database, da copiare ed incollare per esempio su phpMyAdmin

Una volta creato il database bisogna creare sempre in questa cartella il file `config.js` per permettere al middleware di parlare col database.

```
exports.config = {
  connectionLimit: 10,
  host: "localhost",
  // Inserire utente con privilegi, password
  user: "*******",
  password: "******",
  database: "UniDB",
  multipleStatements: true, // consente query multiple in un'unica istruzione SQL
};
```
Il file è fatto in questo modo, sostituire gli asterischi con l'utente e la password del vostro utente mysql con privilegi
