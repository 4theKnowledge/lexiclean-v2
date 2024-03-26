import express from "express";
import mongoose from "mongoose";
import Notifications from "../models/Notifications.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * Invite user(s) by comma-separated usernames
 */
router.post("/invite", async (req, res) => {
  try {
    const userId = req.userId;
    let { usernames, projectId } = req.body;

    console.log("usernames: ", usernames);

    // Split on commas, trim superfluous whitespace, and remove duplicates
    usernames = [...new Set(usernames.split(",").map((name) => name.trim()))];
    console.log(usernames);

    // Check the users exist and the sender is not in the users
    const users = await User.find({ username: { $in: usernames } });

    let validUsers = users.filter(
      (user) => user._id.toString() !== userId.toString()
    );
    const validUsernames = validUsers.map((user) => user.username);
    let invalidUsernames = usernames.filter(
      (username) => !validUsernames.includes(username)
    );
    console.log("validUsernames: ", validUsernames);
    console.log("invalidUsernames: ", invalidUsernames);

    // Check if the users already have notifications
    // Fetch existing notifications for the project to avoid re-inviting
    const existingNotifications = await Notifications.find({
      projectId,
      type: "project-invite",
    })
      .populate("receiverId")
      .lean();

    const usersIdWithNotifications = existingNotifications.map((n) =>
      n.receiverId._id.toString()
    );

    const usernamesWithNotifications = existingNotifications.map(
      (n) => n.receiverId.username
    );

    // Check users are not on project already
    // Fetch the project
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const annotatorIds = project.annotators.map((a) => a.toString());

    // Filter out users already associated with the project
    const usernamesToInvite = validUsers.filter(
      (user) =>
        !annotatorIds.includes(user._id.toString()) &&
        !usersIdWithNotifications.includes(user._id.toString())
    );

    // Create notifications only for users not already in the project
    if (usernamesToInvite.length > 0) {
      const notificationObjects = usernamesToInvite.map((user) => ({
        senderId: userId,
        receiverId: user._id,
        projectId,
        type: "project-invite",
      }));

      await Notifications.insertMany(notificationObjects); // Use insertMany for bulk insertion
    }
    res.json({
      invited: usernamesToInvite.map((user) => ({
        username: user.username,
        _id: user._id,
        status: "unread",
      })),
      alreadyInProject: validUsers
        .filter((user) => annotatorIds.includes(user._id))
        .map((user) => ({
          username: user.username,
          status: "accepted",
          _id: user._id,
        })),
      invalidUsernames,
      alreadyInvited: existingNotifications
        .filter((n) =>
          usernamesWithNotifications.includes(n.receiverId.username)
        )
        .map((n) => ({
          username: n.receiverId.username,
          status: n.status,
          _id: n.receiverId._id,
        })),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while processing the invite." });
  }
});

router.post("/", async (req, res) => {
  try {
    const notification = new Notifications({
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      projectId: req.body.projectId,
      type: req.body.type,
      status: req.body.status || "unread",
      message: req.body.message,
    });
    const savedNotification = await notification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const userId = req.userId;
    let notifications = await Notifications.find({ receiverId: userId })
      .populate("senderId", { username: 1, _id: 0 })
      .populate("projectId", { name: 1 })
      .lean();

    notifications = notifications.map(({ projectId, senderId, ...rest }) => {
      return {
        ...rest,
        project: projectId,
        sender: senderId,
      };
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * User accepts/declines a project-invite notification. This adds them to the associated project.
 */
router.patch("/:id", async (req, res) => {
  try {
    const { accepted } = req.body;

    const notification = await Notifications.findByIdAndUpdate(
      req.params.id,
      { status: accepted ? "accepted" : "declined" },
      { new: true }
    );

    try {
      if (accepted) {
        // Update project with recipents ids
        await Project.findByIdAndUpdate(notification.projectId, {
          $push: { annotators: notification.receiverId },
        });
      }
    } catch (error) {
      console.log(error);
    }

    if (notification) {
      res.json(notification);
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
