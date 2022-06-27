// carichiamo crypto, la configurazione e il middleware per il database
const crypto = require("crypto");
const { config } = require("./db/config");
const { makeDb, withTransaction } = require("./db/dbmiddleware");

async function insegnamentidocente(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", insegnamenti: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se il docente esiste
      results = await db
        .query("SELECT * FROM `Docenti`\
        WHERE Matricola = ?", [
          matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Docente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Docente non trovato";
      } else {
        // recupero gli insegnamenti del docente
        results = await db
          .query(
            "SELECT `e`.IDIns, `c`.Denominazione AS `Corso`, `c`.`AnnoAccademico`, `i`.`Denominazione`, \
            CFU, `e`.`Anno`, aScelta, SchedaTrasparenza \
            FROM `Erogazione` `e` \
            JOIN `Corsi` `c` ON (`c`.`IDCorso` = `e`.`IDCorso`) \
            JOIN `Insegnamenti` `i` ON (`i`.`IDIns`= `e`.`IDIns`) \
            WHERE MatDocente = ? \
            ORDER BY `i`.`Denominazione`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.insegnamenti = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare insegnamenti del docente";
  }

  return returndata;
}

async function ricevimentidocente(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", ricevimenti: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se il docente esiste
      results = await db
        .query("SELECT * FROM `Docenti`\
        WHERE Matricola = ?", [
          matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Docente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Docente non trovato";
      } else {
        // recupero i ricevimenti del docente
        results = await db
          .query(
            "SELECT * \
            FROM `Ricevimenti` `r` \
            WHERE MatDocente = ? \
            ORDER BY `r`.`Data`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.ricevimenti = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare ricevimenti del docente";
  }

  return returndata;
}

async function aggiungiricevimento(req_body, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", ricevimenti: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se il docente esiste
      results = await db
        .query("SELECT * FROM `Docenti`\
        WHERE Matricola = ?", [
          matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Docente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Docente non trovato";
      } else {
        // creo la data
        let data = new Date(req_body.date);
        data.setHours(req_body.time.split(":")[0]);
        data.setMinutes(req_body.time.split(":")[1]);

        //aggiungo il ricevimento
        results = await db
          .query(
            "INSERT INTO `Ricevimenti` (IDIns, MatDocente, Data, Sede, \
            Durata, NumStudenti) \
            SELECT ? AS IDIns, ? AS MatDocente, ? AS Data, \
            ? AS Sede, ? AS Durata, ? AS NumStudenti",
            [
              req_body.idins,
              matricola,
              data,
              req_body.location,
              req_body.duration,
              req_body.numstudents,
            ]
          )
          .catch((err) => {
            throw err;
          });

        // recupero i ricevimenti del docente
        results = await db
          .query(
            "SELECT * \
            FROM `Ricevimenti` `r` \
            WHERE MatDocente = ? \
            ORDER BY `r`.`Data`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.ricevimenti = results;
      }
    });
  } catch (err) {
    console.log(err);
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere ricevimento";
  }

  return returndata;
}

module.exports = {
  insegnamentidocente,
  ricevimentidocente,
  aggiungiricevimento,
};
