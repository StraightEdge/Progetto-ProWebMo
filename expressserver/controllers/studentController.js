var createError = require("http-errors");

const {
  iscrizioneCds,
  corsidistudio,
  insegnamentiattivi,
  carriera,
  ricevimentistudente,
  iscrizioneRicevimento,
  annullaRicevimento,
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

async function get_Cds(req, res) {
  try {
    let results = await corsidistudio();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function get_CdsTeachings(req, res) {
  try {
    let results = await insegnamentiattivi();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
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

module.exports = {
  sign_Cds,
  get_Cds,
  get_CdsTeachings,
  get_carreer,
  get_studentcounselling,
  sign_counselling,
  remove_counselling,
};
