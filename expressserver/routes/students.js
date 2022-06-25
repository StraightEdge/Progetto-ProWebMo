var createError = require("http-errors");
var express = require("express");
var router = express.Router();

const {
  sign_Cds,
  get_Cds,
  get_CdsTeachings,
  get_carreer,
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

module.exports = router;
