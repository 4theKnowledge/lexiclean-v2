import mongoose from "mongoose";

export const safeObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId(id);
  } catch (error) {
    return null; // Return null if conversion fails
  }
};
