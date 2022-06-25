var createError = require("http-errors");

const { insegnamentidocente } = require("../models/professorModel");

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
        } else {
          res.json({ status: 401, message: "Unauthorized: Not a professor" });
        }
      })
      .then((results) => {
        if (results.errcode !== 200) {
          next(createError(results.errcode, results.errmsg));
        } else {
          res.json({
            status: 200,
            message: "Ok",
            insegnamenti: results.insegnamenti,
          });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = { get_profteachings };
