const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: String,
    email: String,
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    genres: [String],
    albums: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
