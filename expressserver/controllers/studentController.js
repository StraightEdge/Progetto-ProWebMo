var createError = require("http-errors");

const {
  iscrizioneCds,
  corsidistudio,
  insegnamentiattivi,
  carriera,
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
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          next(createError(results.errcode, results.errmsg));
        } else {
          res.json({ status: 200, message: "Ok" });
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
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a student" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          next(createError(results.errcode, results.errmsg));
        } else {
          res.json({ status: 200, message: "Ok", carriera: results.carreer });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = { sign_Cds, get_Cds, get_CdsTeachings, get_carreer };
