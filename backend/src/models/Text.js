import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Token subdocument schema
const TokenSchema = new Schema(
  {
    index: {
      type: Number,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    en: {
      type: Boolean,
      required: true,
    },
  },
  { _id: true }
); // Enable _id for each token, it's enabled by default but included here for clarity

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
    tokens: [TokenSchema],
    weight: {
      type: Number,
      required: false,
    },
    rank: {
      type: Number,
      required: true,
    },
    // saved: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    //     required: false,
    //   },
    // ],
    // tokenizationHistory: [{ type: Schema.Types.Mixed, required: false }],
    identifiers: [{ type: String }],
    // flags: [
    //   {
    //     user: {
    //       type: Schema.Types.ObjectId,
    //       ref: "User",
    //       required: true,
    //     },
    //     value: { type: "String", required: true },
    //   },
    // ],
  },
  { _id: true, timestamps: true }
);

export default mongoose.model("Text", TextSchema);
