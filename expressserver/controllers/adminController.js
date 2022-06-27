var createError = require("http-errors");

const {
  aggiungiDocente,
  aggiungiInsegnamento,
  riceviInsegnamenti,
  riceviDocenti,
  controlloCFU,
  controlloCFUModifica,
  aggiungiCorso,
  modificaCorso,
  eliminaCorso,
} = require("../models/adminModel");

const secret = "mysecretsshhh";
var redis = require("redis");
var JWTR = require("jwt-redis").default;
var redisClient = redis.createClient();
var jwtr = new JWTR(redisClient);

async function add_professor(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiDocente(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
              user: results.user.NomeUtente,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function add_teaching(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiInsegnamento(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
              teaching: results.teaching,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function get_teaching(req, res) {
  try {
    let results = await riceviInsegnamenti();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function get_professors(req, res) {
  try {
    let results = await riceviDocenti();
    res.json(results);
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function check_prof_cfu(req, res) {
  try {
    let results = await controlloCFU(req.body);
    if (results.errcode !== 200) {
      res.json({
        status: results.errcode,
        message: results.errmsg,
      });
    } else {
      res.json({
        status: 200,
        message: "Ok",
      });
    }
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function check_prof_cfu_edit(req, res) {
  try {
    let results = await controlloCFUModifica(req.body);
    if (results.errcode !== 200) {
      res.json({
        status: results.errcode,
        message: results.errmsg,
      });
    } else {
      res.json({
        status: 200,
        message: "Ok",
      });
    }
  } catch (err) {
    console.log(err);
    next(createError(500));
  }
}

async function add_cds(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return aggiungiCorso(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
              corso: results.corso,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
              corso: results.corso,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function edit_cds(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return modificaCorso(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
              corso: results.corso,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
              corso: results.corso,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

async function delete_cds(req, res) {
  const token = req.cookies.token;
  if (!token) {
    res.json({ status: 401, message: "Unauthorized: No token provided" });
  } else {
    jwtr
      .verify(token, secret)
      .then((decoded) => {
        if (decoded.isAdmin) {
          return eliminaCorso(req.body);
        }
      })
      .then((results) => {
        if (results) {
          if (results.errcode !== 200) {
            res.json({
              status: results.errcode,
              message: results.errmsg,
              corso: results.corso,
            });
          } else {
            res.json({
              status: 200,
              message: "Ok",
              corso: results.corso,
            });
          }
        } else {
          res.json({ status: 401, message: "Unauthorized: Not an Admin" });
        }
      })
      .catch((err) => {
        res.json({ status: 401, message: "Unauthorized: Invalid token" });
      });
  }
}

module.exports = {
  add_professor,
  add_teaching,
  get_teaching,
  get_professors,
  check_prof_cfu,
  check_prof_cfu_edit,
  add_cds,
  edit_cds,
  delete_cds,
};
