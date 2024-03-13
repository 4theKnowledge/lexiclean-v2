import { jwtDecode } from "jwt-decode";
import User from "../models/User.js";

export const tokenGetUserId = async (authHeader) => {
  const user = jwtDecode(authHeader.replace("Bearer ", ""));
  const userResponse = await User.findOne({ auth0Id: user.sub }).lean();
  return userResponse._id;
};
