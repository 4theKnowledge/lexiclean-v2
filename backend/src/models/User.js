// User.js
import mongoose from "mongoose";

/**
 * User Schema
 */
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
    authId: {
      type: String,
      required: true,
      unique: true,
    },
    auth_strategy: {
      type: String,
      required: true,
      default: () => process.env.AUTH_STRATEGY.toLowerCase(),
    },
  },
  { _id: true, collection: "users" }
);

export default mongoose.model("User", UserSchema);
