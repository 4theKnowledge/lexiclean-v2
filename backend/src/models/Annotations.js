// Collection for annotations - token replacements/suggestions, token-level entity tags, flags, saved states, removal, etc.
import mongoose from "mongoose";
const Schema = mongoose.Schema;

// TODO: Need validator to assert that only one tokenId can have a replacement type.

const AnnotationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["flag", "save", "tag", "replacement"], // , "removed"
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSuggestion: {
      type: Boolean,
      default: false,
    },
    textId: {
      type: Schema.Types.ObjectId,
      ref: "Text",
      required: true,
    },
    tokenId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    value: {
      type: Schema.Types.Mixed,
      validate: {
        validator: function (value) {
          switch (this.type) {
            case "flag":
            case "tag":
              return value instanceof mongoose.Types.ObjectId;
            case "replacement":
              return typeof value === "string";
            case "save":
              return typeof value === "boolean";
            // case "removed":
            //   return typeof value === "boolean";
            default:
              return false; // Invalid type, validation fails
          }
        },
        message: (props) =>
          `${props.value} is not a valid type for the value field!`,
      },
    },
  },
  { _id: true, timestamps: true }
);

export default mongoose.model("Annotation", AnnotationSchema);

// flags: [
//     {
//       user: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//       value: { type: "String", required: true },
//     },
//   ],

//   saved: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: false,
//     },
//   ],
