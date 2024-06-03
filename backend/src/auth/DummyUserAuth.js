// DummyUserAuth.js
import IUserAuth from "./IUserAuth.js";
import User from "../models/User.js";
import logger from "../logger/index.js";

export class DummyUserAuth extends IUserAuth {
  async validateAndCreateUser(authHeader) {
    // Simulate user authentication.
    const username = authHeader.replace("Bearer ", "").toLowerCase();
    logger.info(`Validating username: ${username}`);

    try {
      let user = await User.findOne({ username }).lean();
      if (!user) {
        logger.info(`Creating new user: ${username}`);
        const newUser = new User({
          username: username,
          email: `${username}@mail.com`,
          name: username,
          authId: `auth|${username}`,
        });
        user = await newUser.save();
      } else {
        logger.info("Existing user found.");
      }
      return { success: true, userId: user._id };
    } catch (error) {
      logger.error(`Failed to find/create user: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
