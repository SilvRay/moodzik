const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const genresSchema = new Schema({
  genres: [String],
});

const Genres = mongoose.model("Genres", genresSchema);
module.exports = Genres;
