const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    lastLogin: {
      type: Date,
      required: true,
    },
    signUpDate: {
      type: Date,
      required: true,
    },
    membershipLevel: {
      type: String,
      required: true,
      default: "basic",
    },
    openAIKey: {
      type: String,
      default: "",
    },
  },
  { _id: true, collection: "users" }
);

module.exports = mongoose.model("User", UserSchema);
