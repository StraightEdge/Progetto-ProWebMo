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
            "SELECT `c`.Denominazione AS `Corso`, `c`.`AnnoAccademico`, `i`.`Denominazione`, \
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

module.exports = { insegnamentidocente };
