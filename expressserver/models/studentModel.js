// carichiamo crypto, la configurazione e il middleware per il database
const crypto = require("crypto");
const { config } = require("./db/config");
const { makeDb, withTransaction } = require("./db/dbmiddleware");

async function iscrizioneCds(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK" };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se l'utente esiste
      results = await db
        .query("SELECT * FROM `Autenticazione`\
        WHERE NomeUtente = ?", [
          req_body.nomeutente,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Utente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Utente non trovato";
      } else {
        let matricola = results[0].MatStudente;

        // modifica dati studente
        results = await db
          .query(
            "UPDATE `Studenti` \
            SET `IDCorso` = ?, `Anno` = ? \
            WHERE `Matricola` = ?",
            [req_body.cds, req_body.anno, matricola]
          )
          .catch((err) => {
            throw err;
          });

        // recupero insegnamenti del corso
        results = await db
          .query("SELECT * FROM `Erogazione`\
           WHERE IDCorso = ?", [
            req_body.cds,
          ])
          .catch((err) => {
            throw err;
          });

        // creazione carriera Studente
        for (let insegnamento of results) {
          if (
            (insegnamento.Blocco &&
              req_body.scelti[parseInt(insegnamento.Blocco) - 1] ==
                insegnamento.IDIns) ||
            !insegnamento.Blocco
          ) {
            await db
              .query(
                "INSERT INTO `CarrieraStudenti` \
        (Matricola, IDIns, IDEsame, Domande, Votazione, Verbalizzazione) \
        SELECT ? AS Matricola, ? AS IDIns, NULL AS IDEsame, NULL AS Domande, \
        NULL AS Votazione, NULL AS Verbalizzazione",
                [matricola, insegnamento.IDIns]
              )
              .catch((err) => {
                throw err;
              });
          }
        }

        console.log("Studente " + matricola + " iscritto a " + req_body.cds);
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere Studente";
  }

  return returndata;
}

async function corsidistudio() {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let results = {};

  try {
    await withTransaction(db, async () => {
      // recupero tutti i CdS
      results = await db.query("SELECT * FROM `Corsi`").catch((err) => {
        throw err;
      });
    });

    return results;
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function insegnamentiattivi() {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let results = {};

  try {
    await withTransaction(db, async () => {
      // recupero gli insegnamenti attivi nei vari cds
      results = await db
        .query(
          "SELECT * FROM `Erogazione` `e`\
          JOIN `Insegnamenti` `i` ON (`i`.IDIns = `e`.`IDIns`)"
        )
        .catch((err) => {
          throw err;
        });
    });

    return results;
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function carriera(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", carreer: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se lo studente esiste
      results = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        // recupero la carriera dello studente
        results = await db
          .query(
            "SELECT `Anno`, `Denominazione`, `CFU`, `aScelta`, `Blocco`, \
            `Esito`, `SchedaTrasparenza`\
            FROM `CarrieraStudenti` `cs`\
            JOIN `Insegnamenti` `i` ON (`i`.`IDIns` = `cs`.`IDIns`)\
            JOIN `Erogazione` `e` ON (`e`.`IDIns` = `cs`.`IDIns`)\
            WHERE Matricola = ?\
            ORDER BY `Anno`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.carreer = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare carriera";
  }

  return returndata;
}

module.exports = { iscrizioneCds, corsidistudio, insegnamentiattivi, carriera };
