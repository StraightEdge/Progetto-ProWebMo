var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  sign_Cds,
  get_Cds,
  get_CdsTeachings,
  get_carreer,
  get_studentcounselling,
  sign_counselling,
  remove_counselling,
} = require("../controllers/studentController");

/* La rotta /users è vietata */
router.get("/", function (req, res, next) {
  next(createError(403));
});

/* Iscrizione studenti ad un Corso di Studio */
router.post("/iscrizioneCds", sign_Cds);

/* Recupero lista Corsi di Studio */
router.get("/getCds", get_Cds);

/* Recupero lista degli insegnamenti */
router.get("/getCdsTeachings", get_CdsTeachings);

/* Recupero carriera studente */
router.get("/getCarriera", get_carreer);

/* Recupero ricevimenti del corso di studi dello studente */
router.get("/getStudentCounselling", get_studentcounselling);

/* Iscrizione studenti ad un ricevimento */
router.post("/signCounselling", sign_counselling);

/* Annulla iscrizione studenti ad un ricevimento */
router.post("/removeCounselling", remove_counselling);

module.exports = router;
