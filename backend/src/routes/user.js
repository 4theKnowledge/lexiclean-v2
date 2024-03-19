import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("fetching user details");
  try {
    const userId = req.userId;
    const userResponse = await User.findById({ _id: userId }).lean();
    res.json(userResponse);
  } catch (error) {
    console.error("Error accessing user data:", error);
    res.status(500).send("Internal Server Error");
  }
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

export default router;
