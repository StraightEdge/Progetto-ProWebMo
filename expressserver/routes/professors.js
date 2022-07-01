var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  get_profteachings,
  get_profcounselling,
  add_counselling,
  get_profexam,
  add_exam,
  get_examstudents,
  grade_student,
  upload_scheda,
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

/* Recupero esami docente */
router.get("/getProfExam", get_profexam);

/* Aggiungo ricevimento */
router.post("/addExam", add_exam);

/* Recupero lista studenti iscritti all'esame */
router.get("/getExamStudents", get_examstudents);

/* Verbalizza esame studente */
router.post("/gradeStudent", grade_student);

/* Upload Scheda trasparenza */
router.post("/uploadScheda", upload_scheda);

module.exports = router;
