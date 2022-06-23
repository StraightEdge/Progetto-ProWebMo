var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const corsOptions = {
  origin: ["http://localhost:3000", "http://192.168.1.16:3000"],
  credentials: true,
};

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var studentsRouter = require("./routes/students");
var adminsRouter = require("./routes/admins");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.options("*", cors(corsOptions));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/students", studentsRouter);
app.use("/admins", adminsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ status: err.status, message: err.message });
});

module.exports = app;
