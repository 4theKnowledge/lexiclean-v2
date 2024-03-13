import { tokenGetUserId } from "../utils/auth.js";
import Project from "../models/Project.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const userId = await tokenGetUserId(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }
    req.userId = userId; // Attach userId to request for subsequent handlers
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    return res.status(500).json({ message: "Failed to authenticate user." });
  }
};

export const projectAccessCheck = async (req, res, next) => {
  try {
    const userId = req.userId; // Assuming userId is already attached to req
    const projectId = req.params.projectId || req.body.projectId; // Adjust based on how projectId is passed

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const isUser = project.user.toString() === userId;
    const isAnnotator = project.annotators
      .map((a) => a.toString())
      .includes(userId);

    if (!isUser && !isAnnotator) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to project." });
    }

    next(); // User has access, proceed to the next middleware/route handler
  } catch (error) {
    console.error("Error checking project access:", error);
    return res.status(500).json({ message: "Failed to check project access." });
  }
};
