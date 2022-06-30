var createError = require("http-errors");

const {
  iscrizioneCds,
  carriera,
  ricevimentistudente,
  iscrizioneRicevimento,
  annullaRicevimento,
  esamistudente,
  iscrizioneEsame,
  annullaEsame,
  riceviesiti,
  sottoscriviEsame,
} = require("../models/studentModel");

const secret = "mysecretsshhh";
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

async function sign_Cds(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return iscrizioneCds(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({ status: 200, message: "Ok" });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_carreer(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return carriera(decoded.data.matricola);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            next(createError(results.errcode, results.errmsg));
          } else {
            res.json({ status: 200, message: "Ok", carriera: results.carreer });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_studentcounselling(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return ricevimentistudente(decoded.data.matricola);
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
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function sign_counselling(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return iscrizioneRicevimento(req.body, decoded.data.matricola);
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
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function remove_counselling(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return annullaRicevimento(req.body, decoded.data.matricola);
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
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_studentexam(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return esamistudente(decoded.data.matricola);
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
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function sign_exam(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return iscrizioneEsame(req.body, decoded.data.matricola);
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
              esami: results.esami,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function remove_exam(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return annullaEsame(req.body, decoded.data.matricola);
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
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_examgrade(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return riceviesiti(decoded.data.matricola);
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
              esami: results.esami,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function sign_grade(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isStudent) {
          return sottoscriviEsame(req.body, decoded.data.matricola);
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
              esami: results.esami,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = {
  sign_Cds,
  get_carreer,
  get_studentcounselling,
  sign_counselling,
  remove_counselling,
  get_studentexam,
  sign_exam,
  remove_exam,
  get_examgrade,
  sign_grade,
};
