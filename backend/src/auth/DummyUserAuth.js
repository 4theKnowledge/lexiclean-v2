// DummyUserAuth.js
import IUserAuth from "./IUserAuth.js";
import User from "../models/User.js";

export class DummyUserAuth extends IUserAuth {
  async validateAndCreateUser(authHeader) {
    // Simulate user authentication.
    // Extract the username in a safe manner, ensuring it's properly validated and sanitized
    const username = authHeader.replace("Bearer ", "").toLowerCase();

    let user = await User.findOne({ username }).lean();
    if (!user) {
      console.log(`Creating new user: ${username}`);
      try {
        const newUser = new User({
          username: username,
          email: `${username}@mail.com`,
          name: username,
          authId: `auth|${username}`,
        });

        const savedUser = await newUser.save();
        user = savedUser;
      } catch (error) {
        console.log("Failed to create user: ", error);
      }
    }

    return user._id;
  }
}
