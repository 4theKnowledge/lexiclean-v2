const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
    },
    tags: {
      type: Schema.Types.Mixed,
      required: false,
    },
    replacement: {
      type: String,
      required: false,
      default: null,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    suggestion: {
      type: String,
      required: false,
      default: null,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    textId: {
      // Used to make creating project easier. TODO: Review.
      type: Schema.Types.ObjectId,
      ref: "Text",
      required: false,
    },
    index: { type: Number, required: false }, // Used to make creating project easier. TODO: review.
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("Token", TokenSchema);
