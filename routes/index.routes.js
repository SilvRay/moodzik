const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// ********* require fileUploader in order to use it *********
const fileUploader = require("../config/cloudinary.config");

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

router.get("/albums", (req, res, next) => {
  Album.find()
    .then((albumsFromDB) => {
      // Affiche tous les albums dans la console
      console.log("all the albums created", albumsFromDB);

      // Vérifie si le premier album a un album_cover défini
      if (albumsFromDB.length > 0) {
        console.log("First album cover path:", albumsFromDB[0].album_cover);
      }

      res.render("albums", {
        allAlbums: albumsFromDB, // Removed [0] to pass all albums, not just the first one
      });
    })
    .catch((err) => next(err));
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

router.post("/album-new", fileUploader.single("cover"), (req, res, next) => {
  // console.log("req.body =======>", req.body);
  console.log("req.file ===", req.file);

  Album.create({
    title: req.body.title,
    album_cover: req.file.path,
    tracks: req.body.tracks,
  })
    .then((albumFromDB) => {
      console.log("albumFromDB ===", albumFromDB);

      User.findByIdAndUpdate(
        req.session.currentUser._id,
        { $push: { albums: albumFromDB._id } },
        { new: true }
      )
        // .populate("albums")
        .then((userFromDB) => {
          console.log("userFromDB avec albums:", userFromDB);
          res.redirect("albums");
        });
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
      // console.log("data is:", data.body.tracks.items);
      res.json(data.body.tracks.items);
    })
    .catch((err) => next(err));
});

router.get("/album/:albumId/edit", (req, res, next) => {
  const albumId = req.params.albumId;

  console.log("req.params is:", req.params);

  Album.findById(albumId)
    .then((albumFromDB) => {
      console.log("albumFromDB ======>", albumFromDB);

      spotifyApi
        .getTracks(albumFromDB.tracks)
        .then((tracks) => {
          console.log("tracks are:", tracks.body.tracks);
          res.render("album-edit", {
            album: albumFromDB,
            tracks: tracks.body.tracks,
          });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.post("/album/:albumId/edit", (req, res, next) => {
  console.log("req.params ===>", req.params, "req.body", req.body);
  const albumId = req.params.albumId;
  console.log("albumId=", albumId);

  Album.findByIdAndUpdate(albumId, {
    title: req.body.title,
    album_cover: req.body.cover,
    tracks: req.body.tracks,
  })
    .then((updatedAlbum) => {
      res.redirect("/albums");
    })
    .catch((err) => next(err));
});

router.post("/albums/delete", (req, res, next) => {
  // console.log("yooo", req.session);
  console.log(req.body); // Ajoutez ceci pour voir ce qui est contenu dans le corps de la requête.
  Album.findByIdAndRemove(req.body.albumId)
    .then(() => res.redirect("/albums"))
    .catch((err) => {
      console.log(err); // Ajoutez ceci pour voir l'erreur qui est renvoyée.
      next(err);
    });
});

router.get("/album/:albumId", (req, res, next) => {
  const albumId = req.params.albumId;

  Album.findById(albumId)
    .then((albumFounded) => {
      console.log("albumFounded ===", albumFounded);

      albumFounded.tracks.forEach((track) => {
        spotifyApi.getTrack("0RAiBUgOC5pgFUHsldtix3").then((trackFounded) => {
          console.log("search by Id ===", trackFounded.body);

          res.render("player-album", {
            track: trackFounded.body,
            album: albumFounded,
          });
        });
      });
    })
    .catch((err) => next(err));
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
        res.redirect("albums"); // Redirect to homepage
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

router.get("/playlist/:playlistId", (req, res, next) => {
  const playlistId = req.params.playlistId;

  spotifyApi
    .getPlaylist(playlistId)
    .then((data) => {
      console.log("heeey", data);
      const playlist = data.body;

      res.render("player", { playlist });
    })
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
      res.redirect("/albums");
    })
    .catch((err) => next(err));
});

// router.get("/album-edit", (req, res, next) => {
//   res.render("album-edit");
// });

module.exports = router;
