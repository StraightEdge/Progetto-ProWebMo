// carichiamo crypto, la configurazione e il middleware per il database
const crypto = require("crypto");
const { config } = require("./db/config");
const { makeDb, withTransaction } = require("./db/dbmiddleware");

async function aggiungiDocente(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", user: null };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // verifica esistenza utente
      results = await db
        .query("SELECT * FROM `Docenti`\
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
        // inserimento docente
        results = await db
          .query(
            "INSERT INTO `Docenti` (SSD, Email)\
        SELECT ? AS SSD, ? AS Email",
            [req_body.ssd, req_body.email]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Inserimento tabella Docenti");

        let matricola = results.insertId;

        results = await db
          .query(
            "INSERT INTO `AnagraficaDocenti` \
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

        console.log("Inserimento tabella AnagraficaDocenti");

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
        (NomeUtente, Password, MatDocente) VALUES ?",
            [[[nomeutente, encpwd, matricola]]]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Utente inserito");

        results = await db
          .query(
            "SELECT * FROM `Autenticazione` `auth`\
            JOIN `Docenti` `d` ON (`d`.Matricola = `auth`.MatDocente)\
            JOIN `AnagraficaDocenti` `ad` ON (`d`.Matricola = `ad`.Matricola )\
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
    returndata.errmsg = "Impossibile aggiungere Docente";
  }
  return returndata;
}

async function aggiungiInsegnamento(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", teaching: null };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // verifica esistenza utente
      results = await db
        .query(
          "SELECT * FROM `Insegnamenti`\
            WHERE Denominazione = ?",
          [req_body.name]
        )
        .catch((err) => {
          throw err;
        });

      if (results.length == 1) {
        console.log("Insegnamento già esistente!");
        returndata.errcode = 403;
        returndata.errmsg = "Insegnamento già esistente!";
      } else {
        // inserimento insegnamento
        results = await db
          .query(
            "INSERT INTO `Insegnamenti` (Denominazione, CFU, SSD)\
        SELECT ? AS Denominazione, ? AS CFU, ? AS SSD",
            [req_body.name, req_body.cfu, req_body.ssd]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Insegnamento inserito");

        returndata.teaching = req_body.name;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere Insegnamento";
  }
  return returndata;
}

async function riceviInsegnamenti() {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", teachings: null };

  let results = {};

  try {
    await withTransaction(db, async () => {
      // seleziono tutti gli isegnamenti
      results = await db
        .query(
          "SELECT * FROM `Insegnamenti`\
           ORDER BY `Denominazione`"
        )
        .catch((err) => {
          throw err;
        });
      returndata.teachings = results;
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare Insegnamenti";
  }
  return returndata;
}

async function riceviDocenti() {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", professors: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // seleziono tutti i docenti e i loro dati anagrafici
      results = await db
        .query(
          "SELECT * FROM `Docenti` `d`\
            JOIN `AnagraficaDocenti` `ad` ON (`d`.Matricola = `ad`.Matricola )\
            ORDER BY `ad`.Cognome, `ad`.Nome"
        )
        .catch((err) => {
          throw err;
        });

      returndata.professors = results;
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile recuperare Insegnamenti";
  }
  return returndata;
}

async function controlloCFU(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK" };
  let results = {};

  try {
    // controllo se il Docente insegna la materia in due corsi
    await withTransaction(db, async () => {
      results = await db
        .query(
          "SELECT COUNT(`e`.IDCorso) as `NumCorsi`, `e`.IDIns, `e`.MatDocente\
          FROM `Erogazione` `e`\
          JOIN `Insegnamenti` `i` ON (`e`.IDIns = `i`.IDIns)\
          GROUP BY `e`.IDIns, `e`.MatDocente"
        )
        .catch((err) => {
          throw err;
        });

      for (let insegnamento of req_body) {
        for (let docente of results) {
          if (
            insegnamento.professor.Matricola == docente.MatDocente &&
            insegnamento.IDIns == docente.IDIns &&
            docente.NumCorsi > 1
          ) {
            returndata.errcode = 403;
            returndata.errmsg =
              "Insegnamento " +
              insegnamento.Denominazione +
              " già erogato in due corsi dallo stesso docente";
            return returndata;
          }
        }
      }

      // controllo se il Docente eroga più di 21 CFU
      results = await db
        .query(
          "SELECT SUM(`CFUDocenti`.CFU) AS `SommaCFU`, `CFUDocenti`.MatDocente, `ad`.Cognome, `ad`.Nome\
          FROM (SELECT `i`.CFU, `e`.IDIns, `e`.MatDocente\
          FROM `Erogazione` `e`\
          JOIN `Insegnamenti` `i` ON (`e`.IDIns = `i`.IDIns)\
          GROUP BY `e`.IDIns, `e`.MatDocente) AS `CFUDocenti`\
          JOIN `AnagraficaDocenti` `ad` ON (`CFUDocenti`.MatDocente = `ad`.`Matricola`)\
          GROUP BY `CFUDocenti`.MatDocente"
        )
        .catch((err) => {
          throw err;
        });

      for (let docente of results) {
        let totcfu = 0;
        for (let insegnamento of req_body) {
          if (insegnamento.professor.Matricola == docente.MatDocente) {
            totcfu += insegnamento.CFU;
          }
        }
        if (totcfu + parseInt(docente.SommaCFU) > 21) {
          returndata.errcode = 403;
          returndata.errmsg =
            "Il Docente " +
            docente.Cognome +
            " " +
            docente.Nome +
            " eroga più di 21 CFU";
          return returndata;
        }
      }
    });
  } catch (err) {
    returndata.errcode = 500;
    returndata.errmsg = "Impossibile controllare CFU";
  }
  return returndata;
}

async function controlloCFUModifica(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK" };
  let results = {};

  try {
    // controllo se il Docente insegna la materia in due corsi
    await withTransaction(db, async () => {
      // controllo se sto modificando un corso o aggiungendo
      // insegnamenti ad un altro corso
      results = await db
        .query(
          "SELECT COUNT(`e`.IDCorso) as `NumCorsi`, `e`.IDIns, `e`.MatDocente\
          FROM `Erogazione` `e`\
          JOIN `Insegnamenti` `i` ON (`e`.IDIns = `i`.IDIns)\
          WHERE `e`.IDCorso <> ?\
          GROUP BY `e`.IDIns, `e`.MatDocente",
          [req_body.idcorso]
        )
        .catch((err) => {
          throw err;
        });

      for (let insegnamento of req_body) {
        for (let docente of results) {
          if (
            insegnamento.professor.Matricola == docente.MatDocente &&
            insegnamento.IDIns == docente.IDIns &&
            docente.NumCorsi >= 2
          ) {
            returndata.errcode = 403;
            returndata.errmsg =
              "Insegnamento " +
              insegnamento.Denominazione +
              " già erogato in due corsi dallo stesso docente";
            return returndata;
          }
        }
      }

      // controllo se il Docente eroga più di 21 CFU
      results = await db
        .query(
          "SELECT SUM(`CFUDocenti`.CFU) AS `SommaCFU`, `CFUDocenti`.MatDocente, `ad`.Cognome, `ad`.Nome\
          FROM (SELECT `i`.CFU, `e`.IDIns, `e`.MatDocente\
          FROM `Erogazione` `e`\
          JOIN `Insegnamenti` `i` ON (`e`.IDIns = `i`.IDIns)\
          WHERE `e`.IDCorso <> ?\
          GROUP BY `e`.IDIns, `e`.MatDocente) AS `CFUDocenti`\
          JOIN `AnagraficaDocenti` `ad` ON (`CFUDocenti`.MatDocente = `ad`.`Matricola`)\
          GROUP BY `CFUDocenti`.MatDocente",
          [req_body.idcorso]
        )
        .catch((err) => {
          throw err;
        });

      for (let docente of results) {
        let totcfu = 0;
        for (let insegnamento of req_body) {
          if (insegnamento.professor.Matricola == docente.MatDocente) {
            totcfu += insegnamento.CFU;
          }
        }
        if (totcfu + parseInt(docente.SommaCFU) > 21) {
          returndata.errcode = 403;
          returndata.errmsg =
            "Il Docente " +
            docente.Cognome +
            " " +
            docente.Nome +
            " eroga più di 21 CFU";
          return returndata;
        }
      }
    });
  } catch (err) {
    returndata.errcode = 500;
    returndata.errmsg = "Impossibile controllare CFU";
  }
  return returndata;
}

async function aggiungiCorso(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = {
    errcode: 200,
    errmsg: "OK",
    corso: req_body.name + " " + req_body.academicyear,
  };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // verifica esistenza utente
      results = await db
        .query(
          "SELECT * FROM `Corsi`\
            WHERE Denominazione = ? AND AnnoAccademico = ?",
          [req_body.name, req_body.academicyear]
        )
        .catch((err) => {
          throw err;
        });

      if (results.length == 1) {
        console.log("Corso di Studi già esistente!");
        returndata.errcode = 403;
        returndata.errmsg = "Corso di Studi già esistente!";
      } else {
        // inserimento corso
        results = await db
          .query(
            "INSERT INTO `Corsi` \
            (Denominazione, AnnoAccademico, TipoCorso, CFUTirocinio, CFUProvaFinale) \
            SELECT ? AS Denominazione, ? AS AnnoAccademico, ? AS TipoCorso, \
            ? AS CFUTirocinio, ? AS CFUProvaFinale",
            [
              req_body.name,
              req_body.academicyear,
              req_body.type,
              req_body.cfutir,
              req_body.cfupf,
            ]
          )
          .catch((err) => {
            throw err;
          });

        console.log("Inserimento tabella Erogazione");

        let idcorso = results.insertId;

        // per ogni insegnamento abbino il docente che lo eroga
        for (let insegnamento of req_body.insegnamentiinseriti) {
          results = await db
            .query(
              "INSERT INTO `Erogazione` \
        (IDIns, IDCorso, aScelta, Blocco, Anno, MatDocente, SchedaTrasparenza) \
        SELECT ? AS IDIns, ? AS IDCorso, ? AS aScelta, ? AS Blocco, \
        ? AS Anno, ? AS MatDocente, NULL AS SchedaTrasparenza",
              [
                insegnamento.IDIns,
                idcorso,
                insegnamento.optional,
                insegnamento.block === "" ? null : insegnamento.block,
                insegnamento.year,
                insegnamento.professor.Matricola,
              ]
            )
            .catch((err) => {
              throw err;
            });
        }

        console.log("Corso Inserito");
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiungere Corso";
  }
  return returndata;
}

async function modificaCorso(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = {
    errcode: 200,
    errmsg: "OK",
    corso: req_body.name + " " + req_body.academicyear,
  };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // verifica esistenza corso con lo stesso nome
      results = await db
        .query(
          "SELECT * FROM `Corsi`\
            WHERE Denominazione = ? AND AnnoAccademico = ? AND IDCorso <> ?",
          [req_body.name, req_body.academicyear, req_body.idcorso]
        )
        .catch((err) => {
          throw err;
        });

      if (results.length == 1) {
        console.log("Corso di Studi con lo stesso nome già esistente!");
        returndata.errcode = 403;
        returndata.errmsg = "Corso di Studi con lo stesso nome già esistente!";
      } else {
        // controllo se esistono studenti iscritti al corso da modificare
        results = await db
          .query("SELECT * FROM `Studenti`\
            WHERE IDCorso = ?", [
            req_body.idcorso,
          ])
          .catch((err) => {
            throw err;
          });

        if (results.length > 0) {
          console.log(
            "Ci sono studenti già iscritti al corso, impossibile modificarlo!"
          );
          returndata.errcode = 405;
          returndata.errmsg =
            "Ci sono studenti già iscritti al corso, impossibile modificarlo!";
        } else {
          // elimino l'abbinamento dei docenti con il vecchio corso
          results = await db
            .query("DELETE FROM `Erogazione` \
            WHERE IDCorso = ?", [
              req_body.idcorso,
            ])
            .catch((err) => {
              throw err;
            });

          // modifica corso
          results = await db
            .query(
              "UPDATE `Corsi` \
            SET `Denominazione` = ?, `AnnoAccademico` = ?, `TipoCorso` = ?, \
            `CFUTirocinio` = ?, `CFUProvaFinale` = ? \
            WHERE `IDCorso` = ?",
              [
                req_body.name,
                req_body.academicyear,
                req_body.type,
                req_body.cfutir,
                req_body.cfupf,
                parseInt(req_body.idcorso),
              ]
            )
            .catch((err) => {
              throw err;
            });

          // per ogni insegnamento abbino il docente che lo eroga
          for (let insegnamento of req_body.insegnamentiinseriti) {
            results = await db
              .query(
                "INSERT INTO `Erogazione` \
        (IDIns, IDCorso, aScelta, Blocco, Anno, MatDocente, SchedaTrasparenza) \
        SELECT ? AS IDIns, ? AS IDCorso, ? AS aScelta, ? AS Blocco, \
        ? AS Anno, ? AS MatDocente, NULL AS SchedaTrasparenza",
                [
                  insegnamento.IDIns,
                  req_body.idcorso,
                  insegnamento.aScelta,
                  insegnamento.Blocco === "" ? null : insegnamento.Blocco,
                  insegnamento.Anno,
                  insegnamento.professor.Matricola,
                ]
              )
              .catch((err) => {
                throw err;
              });
          }
          console.log("Corso Modificato");
        }
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile modificare Corso";
  }
  return returndata;
}

async function eliminaCorso(req_body) {
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = {
    errcode: 200,
    errmsg: "OK",
  };
  let results = {};
  try {
    await withTransaction(db, async () => {
      // controllo se esistono studenti iscritti al corso da modificare
      results = await db
        .query("SELECT * FROM `Studenti`\
            WHERE IDCorso = ?", [
          req_body.idcorso,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length > 0) {
        console.log(
          "Ci sono studenti già iscritti al corso, impossibile eliminarlo!"
        );
        returndata.errcode = 405;
        returndata.errmsg =
          "Ci sono studenti già iscritti al corso, impossibile eliminarlo!";
      } else {
        // elimino l'abbinamento dei docenti con il corso
        results = await db
          .query("DELETE FROM `Erogazione` \
            WHERE IDCorso = ?", [
            req_body.idcorso,
          ])
          .catch((err) => {
            throw err;
          });

        // modifica corso
        results = await db
          .query("DELETE FROM `Corsi` \
            WHERE IDCorso = ?", [
            req_body.idcorso,
          ])
          .catch((err) => {
            throw err;
          });

        console.log("Corso Eliminato");
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile eliminare Corso";
  }
  console.log(returndata);
  return returndata;
}

async function riceviStudenti() {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", students: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // seleziono tutti i docenti e i loro dati anagrafici
      results = await db
        .query(
          "SELECT `s`.Matricola, Cognome, Nome, Email, Reddito, \
          PrimaRata, SecondaRata, Tirocinio, ProvaFinale \
          FROM `Studenti` `s`\
          JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola )\
          ORDER BY `as`.Cognome, `as`.Nome"
        )
        .catch((err) => {
          throw err;
        });
      returndata.students = results;
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile ricevere i dati degli studenti";
  }
  return returndata;
}

async function convalidatasse(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", students: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se lo studente esiste
      results = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          req_body.studente,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        let modificarata = null;

        if (req_body.rata === 1) {
          modificarata = "PrimaRata";
        } else if (req_body.rata === 2) {
          modificarata = "SecondaRata";
        }

        // aggiorno tassa studente
        if (modificarata) {
          results = await db
            .query(
              "UPDATE `Studenti` \
            SET ?? = TRUE \
            WHERE `Matricola` = ?",
              [modificarata, req_body.studente]
            )
            .catch((err) => {
              throw err;
            });
        }

        results = await db
          .query(
            "SELECT `s`.Matricola, Cognome, Nome, Email, Reddito, \
          PrimaRata, SecondaRata, Tirocinio, ProvaFinale \
          FROM `Studenti` `s`\
          JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola )\
          ORDER BY `as`.Cognome, `as`.Nome"
          )
          .catch((err) => {
            throw err;
          });

        returndata.students = results;
      }
    });
  } catch (err) {
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiornare tasse";
  }

  return returndata;
}

async function convalidatirocinio(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", students: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se lo studente esiste
      results = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          req_body.studente,
        ])
        .catch((err) => {
          throw err;
        });

      if (results.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        // recupero carriera studente
        results = await db
          .query(
            "SELECT * FROM `CarrieraStudenti` `cs` \
            WHERE Matricola = ?",
            [req_body.studente]
          )
          .catch((err) => {
            throw err;
          });

        if (results.length === 0) {
          console.log("Studente non iscritto ad un CdS");
          returndata.errcode = 406;
          returndata.errmsg = "Lo studente non è iscritto ad un CdS";
          return returndata;
        }

        // aggiorno tirocinio studente
        results = await db
          .query(
            "UPDATE `Studenti` \
            SET Tirocinio = TRUE \
            WHERE `Matricola` = ?",
            [req_body.studente]
          )
          .catch((err) => {
            throw err;
          });

        // recupero la lista aggiornata degli studenti
        results = await db
          .query(
            "SELECT `s`.Matricola, Cognome, Nome, Email, Reddito, \
          PrimaRata, SecondaRata, Tirocinio, ProvaFinale \
          FROM `Studenti` `s`\
          JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola )\
          ORDER BY `as`.Cognome, `as`.Nome"
          )
          .catch((err) => {
            throw err;
          });

        returndata.students = results;
      }
    });
  } catch (err) {
    console.log(err);
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiornare tirocinio";
  }

  return returndata;
}

async function convalidapf(req_body) {
  // istanziamo il middleware
  const db = await makeDb(config);

  // formattiamo la nostra struttura dati di ritorno
  let returndata = { errcode: 200, errmsg: "OK", students: null };
  let results = {};

  try {
    await withTransaction(db, async () => {
      // controllo se lo studente esiste
      let studente = await db
        .query("SELECT * FROM `Studenti`\
        WHERE Matricola = ?", [
          req_body.studente,
        ])
        .catch((err) => {
          throw err;
        });

      if (studente.length == 0) {
        console.log("Studente non trovato!");
        returndata.errcode = 404;
        returndata.errmsg = "Studente non trovato";
      } else {
        // recupero carriera studente
        results = await db
          .query(
            "SELECT * FROM `CarrieraStudenti` `cs` \
            WHERE Matricola = ?",
            [req_body.studente]
          )
          .catch((err) => {
            throw err;
          });

        // controllo se lo studente è iscritto ad un CdS
        // ed ha sostenuto tutti gli esami
        if (results.length === 0) {
          console.log("Studente non iscritto ad un CdS");
          returndata.errcode = 406;
          returndata.errmsg = "Lo studente non è iscritto ad un CdS";
          return returndata;
        } else {
          for (let esame of results) {
            if (esame.Verbalizzazione !== 1) {
              returndata.errcode = 407;
              returndata.errmsg =
                "Lo studente non ha sostenuto tutti gli esami";
              return returndata;
            }
          }
        }

        // controllo se lo studente ha sostenuto il tirocinio
        if (!studente[0].Tirocinio) {
          console.log("Studente non tirocinato!");
          returndata.errcode = 405;
          returndata.errmsg = "Lo studente non ha sostenuto il tirocinio";
          return returndata;
        }

        // aggiorno prova finale studente
        results = await db
          .query(
            "UPDATE `Studenti` \
            SET ProvaFinale = TRUE \
            WHERE `Matricola` = ?",
            [req_body.studente]
          )
          .catch((err) => {
            throw err;
          });

        // recupero la lista aggiornata degli studenti
        results = await db
          .query(
            "SELECT `s`.Matricola, Cognome, Nome, Email, Reddito, \
          PrimaRata, SecondaRata, Tirocinio, ProvaFinale \
          FROM `Studenti` `s`\
          JOIN `AnagraficaStudenti` `as` ON (`s`.Matricola = `as`.Matricola )\
          ORDER BY `as`.Cognome, `as`.Nome"
          )
          .catch((err) => {
            throw err;
          });

        returndata.students = results;
      }
    });
  } catch (err) {
    console.log(err);
    returndata.errcode = 404;
    returndata.errmsg = "Impossibile aggiornare tirocinio";
  }

  return returndata;
}

module.exports = {
  aggiungiDocente,
  aggiungiInsegnamento,
  riceviInsegnamenti,
  riceviDocenti,
  controlloCFU,
  controlloCFUModifica,
  aggiungiCorso,
  modificaCorso,
  eliminaCorso,
  riceviStudenti,
  convalidatasse,
  convalidatirocinio,
  convalidapf,
};
