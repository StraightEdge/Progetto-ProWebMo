var createError = require("http-errors");

const {
  aggiungiDocente,
  aggiungiInsegnamento,
  riceviInsegnamenti,
  riceviDocenti,
  controlloCFU,
  aggiungiCorso,
} = require("../models/adminModel");

const secret = "mysecretsshhh";
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

async function add_professor(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiDocente(req.body);
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          res.json({
            status: results.errcode,
            message: results.errmsg,
          });
        } else {
          res.json({
            status: 200,
            message: "Ok",
            user: results.user.NomeUtente,
          });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function add_teaching(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiInsegnamento(req.body);
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          res.json({
            status: results.errcode,
            message: results.errmsg,
          });
        } else {
          res.json({
            status: 200,
            message: "Ok",
            teaching: results.teaching,
          });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_teaching(req, res) {
  try {
    let results = await riceviInsegnamenti();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function get_professors(req, res) {
  try {
    let results = await riceviDocenti();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function check_prof_cfu(req, res) {
  try {
    let results = await controlloCFU(req.body);
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
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function add_cds(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiCorso(req.body);
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          res.json({
            status: results.errcode,
            message: results.errmsg,
            corso: results.corso,
          });
        } else {
          res.json({
            status: 200,
            message: "Ok",
            corso: results.corso,
          });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = {
  add_professor,
  add_teaching,
  get_teaching,
  get_professors,
  check_prof_cfu,
  add_cds,
};
