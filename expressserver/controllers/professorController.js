var createError = require("http-errors");

const {
  insegnamentidocente,
  ricevimentidocente,
  aggiungiricevimento,
  esamidocente,
  aggiungiesame,
  studentiesame,
  verbalizzastudente,
  caricascheda,
} = require("../models/professorModel");

const secret = "mysecretsshhh";
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

async function get_profteachings(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return insegnamentidocente(decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              insegnamenti: results.insegnamenti,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_profcounselling(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return ricevimentidocente(decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              ricevimenti: results.ricevimenti,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function add_counselling(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return aggiungiricevimento(req.body, decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              ricevimenti: results.ricevimenti,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_profexam(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return esamidocente(decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              esami: results.esami,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function add_exam(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return aggiungiesame(req.body, decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              esami: results.esami,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_examstudents(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return studentiesame(decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              studenti: results.students,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function grade_student(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return verbalizzastudente(req.body, decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function upload_scheda(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isProfessor) {
          return caricascheda(req, decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({
              status: 200,
              message: "Ok",
              insegnamenti: results.insegnamenti,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = {
  get_profteachings,
  get_profcounselling,
  add_counselling,
  get_profexam,
  add_exam,
  get_examstudents,
  grade_student,
  upload_scheda,
};
