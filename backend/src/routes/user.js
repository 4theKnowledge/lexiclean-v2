const express = require("express");
const router = express.Router();
const logger = require("../logger");
const User = require("../models/User");
const { jwtDecode } = require("jwt-decode");

router.get("/", async (req, res) => {
  const user = jwtDecode(req.headers.authorization.replace("Bearer ", ""));

  try {
    // Check if user exists in db
    const userResponse = await User.findOne({ auth0Id: user.sub }).lean();

    if (!userResponse) {
      // Create user and return
      newUser = new User({
        username: user.nickname,
        email: user.email,
        name: user.nickname,
        auth0Id: user.sub,
      });
      await newUser.save();
    }
    res.json(userResponse);
  } catch (error) {
    console.error("Error accessing user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/system", async (req, res) => {
  // Fetch system user which is used in the single annotator application variant.
  // TODO: Review this when the system's build config is put together.
  const user = await User.findOne({ username: "system" }).lean();
  res.json(user);
});

router.patch("/:userId", async (req, res) => {
  try {
    // Extract userID from request parameters (this is the Auth0 `sub`)
    const userId = req.params.userId;

    console.log(`userId: ${userId}`);

    // Find the user by ID
    const user = await User.findById(userId);

    // If user not found, return a 404
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Sanitize req.body to only include 'name' and 'openAIKey'
    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (["name", "openAIKey"].includes(key)) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {});

    // Manually set the allowed fields
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    // Save the user document
    await user.save();

    // Respond with the updated user data
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === "ValidationError") {
      res
        .status(400)
        .json({ message: "Validation Error", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while updating the user." });
    }
  }
});

module.exports = router;
