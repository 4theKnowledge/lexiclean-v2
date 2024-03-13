import express from "express";
import logger from "../logger/index.js";
import Project from "../models/Project.js";

const router = express.Router();

router.post("/:projectId", async (req, res) => {
  const { tags } = req.body;
  // Update an existing tags (schema) on a project
  logger.info("Updating tags!");

  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).send("Project not found");
    }

    const tagsToUpdate = tags.filter((tag) => tag._id);
    const tagsToAdd = tags.filter((tag) => !tag._id);

    // Update existing tags
    tagsToUpdate.forEach(async (tagToUpdate) => {
      const index = project.tags.findIndex((tag) =>
        tag._id.equals(tagToUpdate._id)
      );
      if (index !== -1) {
        console.log("tagToUpdate.description: ", tagToUpdate.description);
        project.tags[index] = {
          name: tagToUpdate.name,
          description: tagToUpdate.description,
          color: tagToUpdate.color,
          _id: tagToUpdate._id,
        };
      }
    });

    // Add new tags
    tagsToAdd.forEach((tag) =>
      project.tags.push({
        name: tag.name,
        description: tag.description,
        color: tag.color,
      })
    );

    await project.save();

    res.send(project);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

export default router;
