// DummyUserAuth.js
import IUserAuth from "./IUserAuth.js";
import User from "../models/User.js";

export class DummyUserAuth extends IUserAuth {
  async validateAndCreateUser(authHeader) {
    // Simulate user authentication. In a real app, replace this with logic appropriate for your dummy auth.
    // This could involve creating a new user if one doesn't exist or simply returning a static user ID.

    let user = await User.findOne({ username: "user" }).lean();
    if (!user) {
      try {
        const newUser = new User({
          username: "user",
          email: "user@mail.com",
          name: "user",
          authId: "user1234",
        });

        console.log(newUser);

        const savedUser = await newUser.save();
        user = savedUser;
      } catch (error) {
        console.log("Failed to create user: ", error);
      }
    }

    return user._id;
  }
}
