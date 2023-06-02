const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

const User = require("../models/User.model");
const Album = require("../models/Album.model");

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

  if (!req.session.currentUser) return res.redirect("login");

  // retrieve le user en base (pour obtenir ses infos a jour, genres)

  const promises = [];
  req.session.currentUser.genres.forEach(function (genre) {
    console.log("genre is =======", genre);
    const p = spotifyApi.getPlaylistsForCategory(genre, {
      limit: 4,
      offset: 0,
    });
    promises.push(p);
  });

  Promise.all(promises)
    .then((values) => {
      // console.log("values are:", values[0].body.playlists.items);
      let playlists = [];
      values.forEach((genre) => {
        playlists = [...playlists, ...genre.body.playlists.items];
      });
      console.log("playlists =", playlists.length);

      res.render("homepage", {
        playlists: playlists,
      });
    })
    .catch((err) => next(err));
});

router.get("/genres", (req, res, next) => {
  // console.log("SESSION =====> ", req.session);
  spotifyApi
    .getAvailableGenreSeeds()
    .then(function (values) {
      console.log(values);
      res.render("genres");
    })
    .catch((err) => next(err));
});

router.post("/genres", (req, res, next) => {
  console.log("req.body is:", req.body);

  if (req.body.genres) {
    User.findByIdAndUpdate(req.session.currentUser._id, {
      genres: req.body.genres,
    })
      .then((userFromDB) => {
        console.log("userFromDB is:", userFromDB);
        req.session.currentUser = userFromDB;
        res.redirect("homepage"); // Redirect to homepage
      })
      .catch((err) => {
        console.error("Error updating user:", err);
        next(err); // Propagate error to Express error handler
      });
  } else {
    console.error("req.body.genres is undefined");
    res.redirect("homepage"); // Redirect to homepage if genres is undefined
  }
});

router.get("/album-new", (req, res, next) => {
  spotifyApi
    .searchTracks(req.query.track)
    .then((value) => {
      console.log("value is:", value.body.tracks.items);
      res.render("album-new", {
        tracks: value.body.tracks.items[0],
      });
    })
    .catch((err) => {
      console.error(err);
      res.render("album-new"); // If there's an error, still render the page but without any track results.
    });
});

router.post("/album-new", (req, res, next) => {
  console.log("req.body =======>", req.body);

  Album.create({
    title: req.body.title,
    album_cover: req.body.album_cover, // Si l'URL de l'image est envoyée dans le corps de la demande
    tracks: req.body.tracks,
  })
    .then((albumFromDB) => {
      res.redirect("profile");
    })
    .catch((err) => {
      console.error(err); // Ajoutez cette ligne
      res.render("album-new");
    });
});

router.get("/search", (req, res, next) => {
  spotifyApi
    .searchTracks(req.query.q)
    .then((data) => {
      console.log("data is:", data.body.tracks.items);
      res.json(data.body.tracks.items);
    })
    .catch((err) => next(err));
});

router.get("/profile", (req, res, next) => {
  User.findById(req.session.currentUser)
    .then((userFromDB) => {
      Album.find()
        .then((albumsFromDB) => {
          // Affiche tous les albums dans la console
          console.log("all the albums created", albumsFromDB);

          // Vérifie si le premier album a un album_cover défini
          if (albumsFromDB.length > 0) {
            console.log("First album cover path:", albumsFromDB[0].album_cover);
          }

          res.render("profile", {
            allAlbums: albumsFromDB, // Removed [0] to pass all albums, not just the first one
            user: userFromDB,
          });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.get("/player/:playlistId", (req, res, next) => {
  const playlistId = req.params.playlistId;

  spotifyApi
    .getPlaylist(playlistId)
    .then((data) => {
      const playlist = data.body;

      res.render("player", { playlist });
    })
    .catch((err) => next(err));
});

router.post("/profile/delete-album", (req, res, next) => {
  console.log("yooo", req.session);
  Album.findByIdAndRemove(req.session.currentUser._id)
    .then(() => res.redirect("/profile"))
    .catch((err) => next(err));
});

router.get("/profile-edit", (req, res, next) => {
  console.log(req.session);
  res.render("profile-edit", {
    user: req.session.currentUser,
  });
});

router.post("/profile-edit", (req, res, next) => {
  User.findByIdAndUpdate(req.session.currentUser._id, {
    username: req.body.username,
    email: req.body.email,
  })
    .then((updatedUser) => {
      res.redirect("/profile");
    })
    .catch((err) => next(err));
});

module.exports = router;
