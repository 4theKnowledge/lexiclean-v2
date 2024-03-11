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
      required: false,
      default: "/static/avatars/default.jpg",
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    lastLogin: {
      type: Date,
      required: true,
      default: Date.now,
    },
    signUpDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    membershipLevel: {
      type: String,
      default: "basic",
    },
    openAIKey: {
      type: String,
      default: "",
    },
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { _id: true, collection: "users" }
);

module.exports = mongoose.model("User", UserSchema);
