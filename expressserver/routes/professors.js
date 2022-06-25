var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const { get_profteachings } = require("../controllers/professorController");

/* La rotta /users è vietata */
router.get("/", function (req, res, next) {
  next(createError(403));
});

/* Recupero insegnamenti docente */
router.get("/getProfTeachings", get_profteachings);

module.exports = router;
