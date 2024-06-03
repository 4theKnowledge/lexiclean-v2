import Project from "../models/Project.js";
import { getAuthStrategy } from "../auth/userAuthStrategyConfig.js";
import logger from "../logger/index.js";

export const authenticateUser = async (req, res, next) => {
  try {
    logger.info("headers: ", req.headers);
    const authStrategy = getAuthStrategy();
    const response = await authStrategy.validateAndCreateUser(
      req.headers.authorization
    );
    const userId = response.userId;
    logger.info("Authenticating user: ", userId);

    if (!userId) {
      logger.error("Unauthorized: User not found.");
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }
    req.userId = userId; // Attach userId to request for subsequent handlers
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    logger.error("Error authenticating user:", error);
    return res.status(500).json({ message: "Failed to authenticate user." });
  }
};

export const projectAccessCheck = async (req, res, next) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId || req.body.projectId;

    // console.log(userId, projectId);

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const isOwner = project.owner.toString() === userId.toString();
    const isAnnotator = project.annotators
      .map((a) => a.toString())
      .includes(userId.toString());

    if (!isOwner && !isAnnotator) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to project." });
    }

    next(); // User has access, proceed to the next middleware/route handler
  } catch (error) {
    logger.error("Error checking project access:", error);
    return res.status(500).json({ message: "Failed to check project access." });
  }
};

/**
 * Checks whether user is owner and has privildged rights to manage project.
 */
export const projectManagementCheck = async (req, res, next) => {
  try {
    const userId = req.userId;
    const projectId = req.params.projectId || req.body.projectId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    const isOwner = project.owner.toString() === userId.toString();
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to project." });
    }

    next(); // User has access, proceed to the next middleware/route handler
  } catch (error) {
    logger.error("Error checking project access:", error);
    return res.status(500).json({ message: "Failed to check project access." });
  }
};
