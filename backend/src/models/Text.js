const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TextSchema = new mongoose.Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    original: {
      type: String,
      required: true,
    },
    // Reference is used when uploading parallel corpora for error correction.
    reference: {
      type: String,
      required: false,
    },
    tokens: [
      {
        _id: 0,
        index: {
          type: Number,
          required: true,
        },
        token: {
          type: Schema.Types.ObjectId,
          ref: "Token",
          required: true,
        },
      },
    ],
    weight: {
      type: Number,
      required: false,
    },
    saved: {
      type: Boolean,
      required: false,
      default: false,
    },
    tokenizationHistory: [{ type: Schema.Types.Mixed, required: false }],
    rank: {
      type: Number,
    },
    identifiers: [{ type: String }],
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("Text", TextSchema);
