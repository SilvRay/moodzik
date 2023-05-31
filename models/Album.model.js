const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const albumSchema = new Schema({
  title: String,
  album_cover: String,
  tracks: [String],
});

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
