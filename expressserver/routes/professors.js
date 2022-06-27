var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  get_profteachings,
  get_profcounselling,
  add_counselling,
} = require("../controllers/professorController");

/* La rotta /users è vietata */
router.get("/", function (req, res, next) {
  next(createError(403));
});

/* Recupero insegnamenti docente */
router.get("/getProfTeachings", get_profteachings);

/* Recupero ricevimenti docente */
router.get("/getProfCounselling", get_profcounselling);

/* Aggiungo ricevimento */
router.post("/addCounselling", add_counselling);

module.exports = router;
