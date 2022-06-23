var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  add_professor,
  add_teaching,
  get_teaching,
  get_professors,
  check_prof_cfu,
  add_cds,
} = require("../controllers/adminController");

/* La rotta /users è vietata */
router.get("/", function (req, res, next) {
  next(createError(403));
});

/* Registrazione Docente */
router.post("/addProfessor", add_professor);

/* Scarica Docenti */
router.get("/getProfessors", get_professors);

/* Aggiungi Insegnamenti */
router.post("/addTeaching", add_teaching);

/* Scarica Insegnamenti */
router.get("/getTeaching", get_teaching);

/* Controlla CFU Docenti */
router.post("/checkProfCFU", check_prof_cfu);

/* Aggiungi Corsi */
router.post("/addCdS", add_cds);

module.exports = router;
