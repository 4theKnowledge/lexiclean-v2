import mongoose from "mongoose";

const NotificationsSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    projectId: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    type: {
      type: String,
      enum: ["project-invite"], // , "project-update", "new-message"
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "accepted", "declined"],
      default: "unread",
    },
    message: String,
  },
  { _id: true, timestamps: true }
);

export default mongoose.model("Notifications", NotificationsSchema);
