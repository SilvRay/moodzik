const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const User = require("../models/User.model");

const Genres = require("../models/Genres.model");

const SpotifyWebApi = require("spotify-web-api-node");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

/* GET home site */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET signup */
router.get("/signup", (req, res, next) => {
  res.render("signup");
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
    .then((userFromDB) => {
      console.log("userFromDB is:", userFromDB);

      User.findOne({ email: req.body.email }).then(() => {
        if (userFromDB) {
          if (bcrypt.compareSync(req.body.password, userFromDB.password)) {
            req.session.currentUser = userFromDB;
            res.redirect("genres");
          }
        }
      });
    })
    .catch((err) => next(err));
});

/* GET login */
router.get("/login", (req, res, next) => {
  res.render("login");
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
  // spotifyApi.getPlaylistsForCategory(req.session.currentUser.genres);
  if (req.session.currentUser) {
    res.render("homepage", {
      userFromDB: req.session.currentUser,
    });
  } else {
    res.redirect("login");
  }
});

router.get("/genres", (req, res, next) => {
  // console.log("SESSION =====> ", req.session);

  res.render("genres");
});

router.post("/genres", (req, res, next) => {
  console.log("req.body is:", req.body);
  Genres.create({
    genres: req.body.genres,
  })
    .then((genresFromDB) => {
      console.log("genresFromDB is:", genresFromDB);
      res.redirect("homepage");
    })
    .catch((err) => next(err));
});

router.get("/album-new", (req, res, next) => {
  res.render("album-new");
});
module.exports = router;
