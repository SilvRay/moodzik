// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "Moodzik";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

app.use(function (req, res, next) {
  // console.log("coucou");

  if (req.session.currentUser) {
    User.findById(req.session.currentUser._id).then(
      (userFromDB) => (req.session.currentUser = userFromDB)
    );
  }

  req.session.currentUser;

  next();
});

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const User = require("./models/User.model");
app.use("/", indexRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
