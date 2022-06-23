// carichiamo crypto, la configurazione e il middleware per il database
const crypto = require("crypto");
const { config } = require("./db/config");
const { makeDb, withTransaction } = require("./db/dbmiddleware");

async function registrazione(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", user: null };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // verifica esistenza utente
      results = await db
        .query("SELECT * FROM `Studenti`\
            WHERE Email = ?", [
          req_body.email,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 1) {
        console.log("Utente già esistente!");
        returndata.errcode = 403;
        returndata.errmsg = "Utente già esistente!";
      } else {
        // inserimento utente
        results = await db
          .query(
            "INSERT INTO `Studenti` \
        (IDCorso, Anno, Email, Reddito, PrimaRata, SecondaRata) \
        SELECT NULL AS IDCorso, NULL AS Anno, ? AS Email, ? AS Reddito, FALSE AS PrimaRata, FALSE AS SecondaRata",
            [req_body.email, req_body.income]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Inserimento tabella Studente");

        let matricola = results.insertId;

        results = await db
          .query(
            "INSERT INTO `AnagraficaStudenti` \
        (Matricola, Nome, Cognome, Genere, DataNascita, LuogoNascita, CF) \
        SELECT ? AS Matricola, ? AS Nome, ? AS Cognome, ? AS Genere, \
        ? AS DataNascita, ? AS LuogoNascita, ? AS CF",
            [
              matricola,
              req_body.name,
              req_body.surname,
              req_body.gender == "male"
                ? "M"
                : req_body.gender == "female"
                ? "F"
                : "A",
              req_body.birthdate,
              req_body.birthplace,
              req_body.cf,
            ]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Inserimento tabella AnagraficaStudente");

        // generazione della password cifrata con SHA512
        let pwdhash = crypto.createHash("sha512"); // istanziamo l'algoritmo di hashing
        pwdhash.update(req_body.pass); // cifriamo la password
        let encpwd = pwdhash.digest("hex"); // otteniamo la stringa esadecimale
        console.log("Password cifrata");

        //creo struttura del nome utente del tipo nome.cognome
        let nomeutente =
          req_body.name.replace(/[^a-zA-Z]/g, "") +
          "." +
          req_body.surname.replace(/[^a-zA-Z]/g, "");
        nomeutente = nomeutente.toLowerCase();

        results = await db
          .query(
            "SELECT * FROM `Autenticazione`\
            WHERE NomeUtente = ?",
            [nomeutente]
          )
          .catch((err) => {
            throw err;
          });

        // se il nome utente già esiste aggiungo un numero alla fine
        // tipo nome.utente1
        if (results.length > 0) {
          nomeutente = nomeutente + results.length;
        }

        results = await db
          .query(
            "INSERT INTO `Autenticazione` \
        (NomeUtente, Password, MatStudente) VALUES ?",
            [[[nomeutente, encpwd, matricola]]]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Utente inserito");

        results = await db
          .query(
            "SELECT * FROM `Autenticazione` `auth`\
            JOIN `Studenti` `s` ON (`s`.Matricola = `auth`.MatStudente)\
            JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola )\
            WHERE `auth`.NomeUtente = ?",
            [nomeutente]
          )
          .catch((err) => {
            throw err;
          });

        returndata.user = results[0];
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere Studente";
  }
  return returndata;
}

async function autenticazione(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", user: null, type: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo esistenza utente
      results = await db
        .query("SELECT * FROM `Autenticazione`\
        WHERE NomeUtente = ?", [
          req_body.user,
        ])
        .catch((err) => {
          throw err;
        });
      if (results.length == 0) {
        console.log("Utente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Utente non trovato";
      } else {
        let pwdhash = crypto.createHash("sha512"); // istanziamo l'algoritmo di hashing
        pwdhash.update(req_body.pass); // cifriamo la password
        let encpwd = pwdhash.digest("hex"); // otteniamo la stringa esadecimale

        if (encpwd != results[0].Password) {
          // password non coincidenti
          console.log("Password errata!");
          returndata.errcode = 403;
          returndata.errmsg = "Password errata";
        } else {
          console.log("Utente autenticato");

          // recupero dati dell'account in maniera diversa
          // se sono studenti, docenti o admin
          if (results[0].MatStudente) {
            results = await db
              .query(
                "SELECT * FROM `Autenticazione` `auth`\
                JOIN `Studenti` `s` ON (`s`.Matricola = `auth`.MatStudente)\
                JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola)\
                LEFT JOIN `Corsi` `c` ON (`s`.IDCorso IS NOT NULL AND `s`.IDCorso = `c`.IDCorso)\
                WHERE `auth`.NomeUtente = ?",
                [req_body.user]
              )
              .catch((err) => {
                throw err;
              });

            returndata.type = "student";
          } else if (results[0].MatDocente) {
            results = await db
              .query(
                "SELECT * FROM `Autenticazione` `auth`\
                JOIN `Docenti` `d` ON (`d`.Matricola = `auth`.MatDocente)\
                JOIN `AnagraficaDocenti` `ad` ON (`d`.Matricola = `ad`.Matricola)\
                WHERE `auth`.NomeUtente = ?",
                [req_body.user]
              )
              .catch((err) => {
                throw err;
              });

            returndata.type = "teacher";
          } else {
            results = await db
              .query(
                "SELECT * FROM `Autenticazione` `auth`\
                JOIN `Amministrazione` `a` ON (`a`.Matricola = `auth`.MatAdmin)\
                WHERE `auth`.NomeUtente = ?",
                [req_body.user]
              )
              .catch((err) => {
                throw err;
              });

            returndata.type = "admin";
          }
          returndata.user = results[0];
        }
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Autenticazione impossibile";
  }
  return returndata;
}

module.exports = { registrazione, autenticazione };
