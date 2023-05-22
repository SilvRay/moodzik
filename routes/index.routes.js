const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const User = require("../models/User.model");

/* GET home site */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET signup */
router.get("/signup", (req, res, next) => {
  res.render("signup", { layout: false });
});

/* POST signup */
router.post("/signup", (req, res, next) => {
  console.log("yooo", req.body);

  const passwordHash = bcrypt.hashSync(req.body.password, salt);

  new User({
    username: req.body.username,
    email: req.body.email,
    password: passwordHash,
  })
    .save()
    .then(() => {
      res.redirect("/genres");
    })
    .catch((err) => next(err));
});

/* GET login */
router.get("/login", (req, res, next) => {
  res.render("login", { layout: false });
});

/* POST login */
router.post("/login", (req, res, next) => {
  console.log("SESSION =====> ", req.session);

  User.findOne({ email: req.body.email })
    .then(function (userFromDB) {
      console.log("userFromDB is", userFromDB);
      console.log("req.body is", req.body);

      if (userFromDB) {
        if (bcrypt.compareSync(req.body.password, userFromDB.password)) {
          req.session.currentUser = userFromDB;
          res.redirect("homepage");
        } else {
          res.render("login", {
            errorMessage: "Wrong ! Try again.",
          });
        }
      } else {
        res.render("login", {
          errorMessage: "user unknown",
        });
      }
    })
    .catch((err) => next(err));
});

/* GET logout */
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

/* GET home page */
router.get("/homepage", (req, res, next) => {
  console.log("SESSION =====> ", req.session);
  if (req.session.currentUser) {
    res.render("homepage", {
      userFromDB: req.session.currentUser,
    });
  } else {
    res.redirect("login");
  }
});

router.get("/genres", (req, res, next) => {
  res.render("genres", { layout: false });
});
module.exports = router;
