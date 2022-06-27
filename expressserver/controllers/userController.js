var createError = require("http-errors");

const { registrazione, autenticazione } = require("../models/userModel");

const secret = "mysecretsshhh";
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

async function sign_on(req, res, next) {
  try {
    let results = await registrazione(req.body);
    console.log(results);

    if (results.user == null) {
      next(createError(results.errcode, results.errmsg));
    } else {
      console.log(`Utente ${results.user.NomeUtente} inserito!`);

      //creo token studente con i dati del profilo
      let tokendata = {
        nomeutente: results.user.NomeUtente,
        isStudent: true,
        isProfessor: false,
        isAdmin: false,
        data: {
          matricola: results.user.Matricola,
          nome: results.user.Nome,
          cognome: results.user.Cognome,
          genere: results.user.Genere,
          data_nascita: results.user.DataNascita,
          luogo_nascita: results.user.LuogoNascita,
          cf: results.user.CF,
          email: results.user.Email,
          cds: null,
          anno: null,
          primarata: results.user.PrimaRata ? "Si" : "No",
          secondarata: results.user.SecondaRata ? "Si" : "No",
          reddito: results.user.Reddito,
        },
      };

      // Invio token
      jwtr
        .sign(tokendata, secret, {
          expiresIn: "1d",
        })
        .then((token) => {
          res.cookie("token", token, {
            httpOnly: true,
          });
          res.json({
            status: 200,
            token: tokendata,
          });
        })
        .catch((err) => {
          console.log(err);
          next(createError(500));
        });
    }
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function login(req, res, next) {
  try {
    let results = await autenticazione(req.body);
    if (results.user == null)
      next(createError(results.errcode, results.errmsg));
    else {
      let tokendata = {};

      // creo token con i dati dello studente/docente/admin
      if (results.type == "student") {
        tokendata = {
          nomeutente: results.user.NomeUtente,
          isStudent: true,
          isProfessor: false,
          isAdmin: false,
          data: {
            matricola: results.user.Matricola,
            nome: results.user.Nome,
            cognome: results.user.Cognome,
            genere: results.user.Genere,
            data_nascita: results.user.DataNascita,
            luogo_nascita: results.user.LuogoNascita,
            cf: results.user.CF,
            email: results.user.Email,
            cds: results.user.IDCorso
              ? results.user.Denominazione + " " + results.user.AnnoAccademico
              : null,
            anno: results.user.IDCorso ? results.user.Anno : null,
            tirocinio: results.user.Tirocinio ? "Si" : "No",
            provafinale: results.user.Provafinale ? "Si" : "No",
            primarata: results.user.PrimaRata ? "Si" : "No",
            secondarata: results.user.SecondaRata ? "Si" : "No",
            reddito: results.user.Reddito,
          },
        };
      } else if (results.type == "professor") {
        tokendata = {
          nomeutente: results.user.NomeUtente,
          isStudent: false,
          isProfessor: true,
          isAdmin: false,
          data: {
            matricola: results.user.Matricola,
            nome: results.user.Nome,
            cognome: results.user.Cognome,
            genere: results.user.Genere,
            data_nascita: results.user.DataNascita,
            luogo_nascita: results.user.LuogoNascita,
            cf: results.user.CF,
            ssd: results.user.SSD,
            email: results.user.Email,
          },
        };
      } else {
        tokendata = {
          nomeutente: results.user.NomeUtente,
          isStudent: false,
          isProfessor: false,
          isAdmin: true,
          data: {
            matricola: results.user.Matricola,
            nome: results.user.Nome,
            cognome: results.user.Cognome,
            genere: results.user.Genere,
            data_nascita: results.user.DataNascita,
            luogo_nascita: results.user.LuogoNascita,
            cf: results.user.CF,
            email: results.user.Email,
          },
        };
      }

      // Invio token
      jwtr
        .sign(tokendata, secret, {
          expiresIn: "1d",
        })
        .then((token) => {
          res.cookie("token", token, {
            httpOnly: true,
          });

          res.json({
            status: 200,
            token: tokendata,
          });
        })
        .catch((err) => {
          console.log(err);
          next(createError(500));
        });
    }
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function get_profile(req, res) {
  const token = req.cookies.token;

  // se l'utente non è autenticato o ci sono altri problemi con il token
  // invio un errore, altrimenti restituisco i dati del profilo
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        res.json({
          status: 200,
          token: {
            nomeutente: decoded.nomeutente,
            isStudent: decoded.isStudent,
            isProfessor: decoded.isProfessor,
            isAdmin: decoded.isAdmin,
            data: decoded.data,
          },
        });
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function logout(req, res) {
  const token = req.cookies.token;

  // se l'utente non è autenticato invio un errore,
  // altrimenti effettuo il logout
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr.verify(token, secret).then((decoded) => {
      jwtr.destroy(decoded.jti);
      res.json({ status: 200 });
    });
  }
}

module.exports = { sign_on, login, get_profile, logout };
