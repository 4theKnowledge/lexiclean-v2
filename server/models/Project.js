const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    preprocessing: {
      lower_case: { type: Boolean, required: false },
      remove_duplicates: { type: Boolean, required: false },
      digits_iv: { type: Boolean, required: false },
      chars_removed: { type: String, required: false },
    },
    texts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Text",
        required: true,
      },
    ],
    maps: [
      {
        type: Schema.Types.ObjectId,
        ref: "Map",
        required: true,
      },
    ],
    metrics: {
      starting_vocab_size: { type: Number, required: true },
      starting_oov_token_count: { type: Number, required: true },
    },
    id2textIdMapping: {
      type: Schema.Types.ObjectId,
      ref: "Text",
      required: false,
    }, // Contains {identifier:textObjectId} mapping
    created_on: {
      type: Date,
      required: true,
      default: Date.now,
    },
    last_modified: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
