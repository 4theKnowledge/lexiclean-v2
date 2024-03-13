import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ProjectSchema = mongoose.Schema(
  {
    owner: {
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
    parallelCorpus: { type: Boolean, required: true },
    preprocessing: {
      removeLowerCase: { type: Boolean, required: false },
      removeDuplicates: { type: Boolean, required: false },
      removeChars: { type: String, required: false },
      digitsIV: { type: Boolean, required: false },
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
    tags: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    flags: [
      {
        name: { type: String, required: true },
      },
    ],
    specialTokens: [{ type: String, required: false }], // Used for parellel corpus to treat as IV (without adding to En lexicon)
    metrics: {
      startVocabSize: { type: Number, default: 0 },
      startCandidateVocabSize: { type: Number, default: 0 }, // OOV tokens
      startTokenCount: { type: Number, default: 0 },
    },
    annotators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
  },
  { _id: true, timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
