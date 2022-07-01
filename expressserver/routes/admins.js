var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  add_professor,
  add_teaching,
  get_teachings,
  get_professors,
  check_prof_cfu,
  check_prof_cfu_edit,
  add_cds,
  edit_cds,
  delete_cds,
  get_students,
  validate_tax,
  validate_internship,
  validate_final,
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
router.get("/getTeachings", get_teachings);

/* Controlla CFU Docenti */
router.post("/checkProfCFU", check_prof_cfu);

/* Controlla CFU Docenti in caso di modifica CdS */
router.post("/checkProfCFUEdit", check_prof_cfu_edit);

/* Aggiungi Corsi */
router.post("/addCdS", add_cds);

/* Modifica Corsi */
router.post("/editCdS", edit_cds);

/* Elimina Corsi */
router.post("/deleteCdS", delete_cds);

/* Scarica Studenti */
router.get("/getStudents", get_students);

/* Convalida Tassa */
router.post("/validateTax", validate_tax);

/* Convalida Tirocinio */
router.post("/validateInternship", validate_internship);

/* Convalida Prova Finale */
router.post("/validateFinal", validate_final);

module.exports = router;
