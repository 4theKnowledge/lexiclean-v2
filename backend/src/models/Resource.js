import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    tokens: [
      {
        type: String,
        required: false,
      },
    ],
    replacements: [{ type: mongoose.Schema.Types.Mixed, required: false }],
    color: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  { _id: true, timestamps: true }
);

export default mongoose.model("Resource", ResourceSchema);
