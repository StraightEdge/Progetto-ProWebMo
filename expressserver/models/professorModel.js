// carichiamo crypto, la configurazione e il middleware per il database
const crypto = require("crypto");
const { config } = require("./db/config");
const { makeDb, withTransaction } = require("./db/dbmiddleware");
var path = require("path");

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

async function esamidocente(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", esami: null };
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
            FROM `Esami` `e` \
            WHERE MatDocente = ? \
            ORDER BY `e`.`Data`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.esami = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare esami del docente";
  }

  return returndata;
}

async function aggiungiesame(req_body, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", esami: null };
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
            "INSERT INTO `Esami` (IDIns, MatDocente, Data, Sede, \
            Sessione, Appello) \
            SELECT ? AS IDIns, ? AS MatDocente, ? AS Data, \
            ? AS Sede, ? AS Sessione, ? AS Appello",
            [
              req_body.idins,
              matricola,
              data,
              req_body.location,
              req_body.session,
              req_body.number,
            ]
          )
          .catch((err) => {
            throw err;
          });

        // recupero i ricevimenti del docente
        results = await db
          .query(
            "SELECT * \
            FROM `Esami` `e` \
            WHERE MatDocente = ? \
            ORDER BY `e`.`Data`",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.esami = results;
      }
    });
  } catch (err) {
    console.log(err);
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere esame";
  }

  return returndata;
}

async function studentiesame(matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", students: null };
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
        // recupero gli iscritti gli esami del docente
        results = await db
          .query(
            "SELECT `e`.IDEsame, `s`.Matricola, Cognome, Nome, Email \
            FROM `Esami` `e` \
            JOIN `IscrizioneEsame` `ie` ON (`ie`.IDEsame = `e`.`IDEsame`) \
            JOIN `Studenti` `s` ON (`s`.Matricola = `ie`.MatStudente) \
            JOIN `AnagraficaStudenti` `as` ON (`as`.Matricola = `s`.Matricola) \
            WHERE `e`.MatDocente = ? ",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });

        returndata.students = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare iscritti esame del docente";
  }

  return returndata;
}

async function verbalizzastudente(req_body, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK" };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se lo studente esiste
      results = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          req_body.studente.Matricola,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        // convalido lo studente con la password
        results = await db
          .query(
            "SELECT * FROM `Autenticazione` \
            WHERE MatDocente = ?",
            [matricola]
          )
          .catch((err) => {
            throw err;
          });
        
        let pwdhash = crypto.createHash("sha512"); // istanziamo l'algoritmo di hashing
        pwdhash.update(req_body.pass); // cifriamo la password
        let encpwd = pwdhash.digest("hex"); // otteniamo la stringa esadecimale

        if (encpwd != results[0].Password) {
          // password non coincidenti
          console.log("Password errata!");
          returndata.errcode = 403;
          returndata.errmsg = "Password errata";
          return returndata;
        }

        // aggiorno carriera studente
        results = await db
          .query(
            "UPDATE `CarrieraStudenti` \
            SET `IDEsame` = ?, `Domande` = ?, `Esito` = ?, \
            `Verbalizzazione` = 0 \
            WHERE `Matricola` = ? AND `IDIns` = ?",
            [
              req_body.esame.IDEsame,
              req_body.questions,
              req_body.grade,
              req_body.studente.Matricola,
              req_body.insegnamento.IDIns,
            ]
          )
          .catch((err) => {
            throw err;
          });
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile verbalizzare studente";
  }

  return returndata;
}

async function caricascheda(req, matricola) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", insegnamenti: null };
  let results = {};

  const newpath = path.join(__dirname, "..", "public/schede/");
  const file = req.files.file;
  file.mv(`${newpath}${req.body.fileName}`, (err) => {
    if (err) {
      console.log("Errore nell'upload del file");
      returndata = { errcode: 500, errmsg: "Errore nell'upload del file" };
      return returndata;
    }
  });

  try {
    await withTransaction(db, async () => {
      // aggiorno link scheda trasparenza
      results = await db
        .query(
          "UPDATE `Erogazione` \
            SET `SchedaTrasparenza` = ? \
            WHERE `MatDocente` = ? AND `IDIns` = ?",
          [req.body.fileName, matricola, req.body.insegnamento]
        )
        .catch((err) => {
          throw err;
        });

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
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile caricare scheda";
  }

  return returndata;
}

module.exports = {
  insegnamentidocente,
  ricevimentidocente,
  aggiungiricevimento,
  esamidocente,
  aggiungiesame,
  studentiesame,
  verbalizzastudente,
  caricascheda,
};
