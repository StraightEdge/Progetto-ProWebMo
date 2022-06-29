var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  sign_Cds,
  get_carreer,
  get_studentcounselling,
  sign_counselling,
  remove_counselling,
  get_studentexam,
  sign_exam,
  remove_exam,
} = require("../controllers/studentController");

/* La rotta /users è vietata */
router.get("/", function (req, res, next) {
  next(createError(403));
});

/* Iscrizione studenti ad un Corso di Studio */
router.post("/iscrizioneCds", sign_Cds);

/* Recupero carriera studente */
router.get("/getCarriera", get_carreer);

/* Recupero ricevimenti del corso di studi dello studente */
router.get("/getStudentCounselling", get_studentcounselling);

/* Iscrizione studente ad un ricevimento */
router.post("/signCounselling", sign_counselling);

/* Annulla iscrizione studente ad un ricevimento */
router.post("/removeCounselling", remove_counselling);

/* Recupero esami del corso di studi dello studente */
router.get("/getStudentExam", get_studentexam);

/* Iscrizione studente ad un resame */
router.post("/signExam", sign_exam);

/* Annulla iscrizione studente ad un ricevimento */
router.post("/removeExam", remove_exam);

module.exports = router;
