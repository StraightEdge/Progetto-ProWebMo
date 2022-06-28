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
        (Matricola, IDIns, IDEsame, Domande, Esito, Verbalizzazione) \
        SELECT ? AS Matricola, ? AS IDIns, NULL AS IDEsame, NULL AS Domande, \
        NULL AS Esito, NULL AS Verbalizzazione",
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
    console.log(err);
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
      let studente = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (studente.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        // recupero la carriera dello studente
        results = await db
          .query(
            "SELECT `i`.`IDIns`, `Anno`, `Denominazione`, `CFU`, \
            `SSD`, `aScelta`, `Blocco`, `Esito`, \
            `ad`.Cognome AS CognomeDocente, `ad`.Nome AS NomeDocente, `cs`.Matricola, `SchedaTrasparenza` \
            FROM `Erogazione` `e` \
            JOIN `Insegnamenti` `i` ON (`i`.`IDIns` = `e`.`IDIns`) \
            LEFT JOIN `CarrieraStudenti` `cs` ON (`cs`.`IDIns` = `e`.`IDIns` AND `cs`.`Matricola` = ?) \
            JOIN `AnagraficaDocenti` `ad` ON (`ad`.`Matricola` = `e`.MatDocente) \
            WHERE `e`.`IDCorso` = ? \
            ORDER BY `Anno`",
            [matricola, studente[0].IDCorso]
          )
          .catch((err) => {
            throw err;
          });

        // recupero tirocinio e prova finale
        let tirpf = await db
          .query(
            "SELECT CFUTirocinio, CFUProvaFinale \
            FROM `Corsi` `c` \
            JOIN `Studenti` `s` ON (`s`.`IDCorso` = `c`.`IDCorso`) \
            WHERE Matricola = ?",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        results.push({
          Denominazione: "Tirocinio",
          CFU: tirpf[0].CFUTirocinio,
          Esito: studente[0].Tirocinio,
          Matricola: matricola,
        });
        results.push({
          Denominazione: "Prova Finale",
          CFU: tirpf[0].CFUProvaFinale,
          Esito: studente[0].ProvaFinale,
          Matricola: matricola,
        });

        returndata.carreer = results;
      }
    });
  } catch (err) {
    console.log(err);
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare carriera";
  }

  return returndata;
}

async function ricevimentistudente(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", ricevimenti: null };
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
        // recupero i ricevimenti del corso
        // con il numero di studenti iscritti e se lo studente è iscritto
        results = await db
          .query(
            "SELECT `r`.IDRicev, `r`.`IDIns`, `Data`, `Sede`, `Durata`, `NumStudenti`, `NumIscritti` , `MatStudente` \
            FROM `Erogazione` `e` \
            JOIN `Ricevimenti` `r` ON (`r`.IDIns = `e`.IDIns) \
            LEFT JOIN (SELECT COUNT(`i`.MatStudente) AS `NumIscritti`, `i`.IDRicev AS `RicIscritti` \
		                  FROM `IscrizioneRicevimento` `i` \
		                  GROUP BY `i`.IDRicev) AS `StudentiIscritti` ON (`StudentiIscritti`.RicIscritti = `r`.IDRicev) \
            LEFT JOIN (SELECT `IDRicev`, `MatStudente` \
                      FROM `IscrizioneRicevimento` `i` \
                      WHERE `i`.`MatStudente` = ?) AS `Iscritto` ON (`Iscritto`.IDRicev = `r`.`IDRicev`) \
            WHERE `e`.IDCorso = ?",
            [matricola, results[0].IDCorso]
          )
          .catch((err) => {
            throw err;
          });

        returndata.ricevimenti = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare ricevimenti del corso";
  }

  return returndata;
}

async function iscrizioneRicevimento(req_body, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", ricevimenti: null };
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
        let idcorso = results[0].IDCorso;

        // iscrivo lo studente al ricevimento
        results = await db
          .query(
            "INSERT INTO `IscrizioneRicevimento` \
        (IDRicev, MatStudente) \
        SELECT ? AS IDRicev, ? AS MatStudente",
            [req_body.IDRicev, matricola]
          )
          .catch((err) => {
            throw err;
          });

        // recupero i ricevimenti del corso
        // con il numero di studenti iscritti e se lo studente è iscritto
        results = await db
          .query(
            "SELECT `r`.IDRicev, `r`.`IDIns`, `Data`, `Sede`, `Durata`, `NumStudenti`, `NumIscritti` , `MatStudente` \
            FROM `Erogazione` `e` \
            JOIN `Ricevimenti` `r` ON (`r`.IDIns = `e`.IDIns) \
            LEFT JOIN (SELECT COUNT(`i`.MatStudente) AS `NumIscritti`, `i`.IDRicev AS `RicIscritti` \
		                  FROM `IscrizioneRicevimento` `i` \
		                  GROUP BY `i`.IDRicev) AS `StudentiIscritti` ON (`StudentiIscritti`.RicIscritti = `r`.IDRicev) \
            LEFT JOIN (SELECT `IDRicev`, `MatStudente` \
                      FROM `IscrizioneRicevimento` `i` \
                      WHERE `i`.`MatStudente` = ?) AS `Iscritto` ON (`Iscritto`.IDRicev = `r`.`IDRicev`) \
            WHERE `e`.IDCorso = ?",
            [matricola, idcorso]
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
    returndata.errmsg = "Impossibile recuperare ricevimenti del corso";
  }

  return returndata;
}

async function annullaRicevimento(req_body, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", ricevimenti: null };
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
        let idcorso = results[0].IDCorso;

        // rimuovo lo studente dal ricevimento
        results = await db
          .query(
            "DELETE FROM `IscrizioneRicevimento` \
        WHERE IDRicev = ? AND MatStudente = ?",
            [req_body.IDRicev, matricola]
          )
          .catch((err) => {
            throw err;
          });

        // recupero i ricevimenti del corso
        // con il numero di studenti iscritti e se lo studente è iscritto
        results = await db
          .query(
            "SELECT `r`.IDRicev, `r`.`IDIns`, `Data`, `Sede`, `Durata`, `NumStudenti`, `NumIscritti` , `MatStudente` \
            FROM `Erogazione` `e` \
            JOIN `Ricevimenti` `r` ON (`r`.IDIns = `e`.IDIns) \
            LEFT JOIN (SELECT COUNT(`i`.MatStudente) AS `NumIscritti`, `i`.IDRicev AS `RicIscritti` \
		                  FROM `IscrizioneRicevimento` `i` \
		                  GROUP BY `i`.IDRicev) AS `StudentiIscritti` ON (`StudentiIscritti`.RicIscritti = `r`.IDRicev) \
            LEFT JOIN (SELECT `IDRicev`, `MatStudente` \
                      FROM `IscrizioneRicevimento` `i` \
                      WHERE `i`.`MatStudente` = ?) AS `Iscritto` ON (`Iscritto`.IDRicev = `r`.`IDRicev`) \
            WHERE `e`.IDCorso = ?",
            [matricola, idcorso]
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
    returndata.errmsg = "Impossibile recuperare ricevimenti del corso";
  }

  return returndata;
}

module.exports = {
  iscrizioneCds,
  corsidistudio,
  insegnamentiattivi,
  carriera,
  ricevimentistudente,
  iscrizioneRicevimento,
  annullaRicevimento,
};
