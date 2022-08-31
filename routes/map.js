const express = require("express");
const router = express.Router();
const logger = require("../logger");
const Resource = require("../models/Resource");
const Text = require("../models/Text");
const Token = require("../models/Token");
const Project = require("../models/Project");

const DEFAULT_COLORS = { ua: "#ff7043", st: "#2196f3", en: "#eceff1" };

router.post("/", async (req, res) => {
  logger.info("Creating map", { route: "/api/map/" });
  try {
    const map = new Resource({
      projectId: req.body.projectId,
      type: req.body.type,
      color: req.body.color,
      active: true,
    });

    await Project.findByIdAndUpdate(
      { _id: req.body.projectId },
      { $push: { maps: map._id } },
      { upsert: true }
    );
    const savedMap = await map.save();
    res.json(savedMap);
  } catch (err) {
    res.json({ message: err });
    logger.error("Map creation failed", { route: "/api/map/" });
  }
});

router.post("/one/:projectId", async (req, res) => {
  // console.log(req.params, req.body);
  try {
    const response = await Map.findOne({
      projectId: req.params.projectId,
      type: req.body.type,
    });
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

// Upload static map
router.post("/static/", async (req, res) => {
  // console.log("Adding static map");

  const map = new Resource({
    type: req.body.type,
    tokens: req.body.tokens,
    color: req.body.color,
  });

  try {
    const savedMap = await map.save();
    res.json(savedMap);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/download", async (req, res) => {
  try {
    logger.info(`Downloading ${req.body.mapName} mapping`, {
      route: "/api/map/download",
    });

    // Get tokens
    const tokens = await Token.find({ projectId: req.body.projectId }).lean();

    if (req.body.mapName === "rp") {
      // Filter tokens for those with replacements
      const tokensReplaced = tokens.filter((token) => token.replacement);

      const replacementPairs = tokensReplaced.map((token) => ({
        token: token.value,
        replacement: token.replacement,
      }));

      // Get counts of replacements
      const replacementsFreq = {}; //_.countBy(replacementPairs.map((entry) => entry.token));

      // Filter out duplicate replacements
      let uniqueReplacementPairs = replacementPairs.filter(
        (thing, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.token === thing.token && t.replacement === thing.replacement
          )
      );

      console.log(uniqueReplacementPairs);

      if (req.body.preview) {
        uniqueReplacementPairs =
          uniqueReplacementPairs.length > 10
            ? uniqueReplacementPairs.slice(0, 10)
            : uniqueReplacementPairs;
      }

      // Convert to {token: {replacement: '', count: #}
      const replacements = uniqueReplacementPairs
        .map((pair) => ({
          [pair.token]: {
            replacement: pair.replacement,
            count: replacementsFreq[pair.token],
          },
        }))
        .reduce((r, c) => Object.assign(r, c), {});
      console.log(replacements);

      // Sort key alphabetically
      const replacementsSorted = Object.fromEntries(
        Object.entries(replacements).sort()
      );

      res.json(replacementsSorted);
    } else {
      // Filter tokens for those annotated with map
      const tokensMapped = tokens.filter(
        (token) => token.tags[req.body.mapName]
      );
      // console.log(tokensMapped);

      // Filter for unique values only.
      let tokenValues = [
        ...new Set(
          tokensMapped.map((token) =>
            token.replacement ? token.replacement : token.value
          )
        ),
      ];

      if (req.body.preview) {
        tokenValues =
          tokenValues.length > 10 ? tokenValues.slice(0, 10) : tokenValues;
      }

      // console.log(tokenValues);
      res.json({ values: tokenValues });
    }
  } catch (err) {
    res.json({ message: err });
    logger.error(`Failed to download ${req.body.mapName} mapping`, {
      route: "/api/map/download",
    });
  }
});

router.get("/:projectId", async (req, res) => {
  // Here additional classes and colors are defined. TODO: integrate into front-end so the user is aware of these decisions.
  logger.info("Fetching project maps", {
    route: `/api/map/${req.params.projectId}`,
  });
  try {
    const response = await Project.findOne({
      _id: req.params.projectId,
    }).populate("maps");
    const maps = response.maps;

    // Restructure maps from arary of maps to object of maps with keys based on map type
    const mapsRestructured = Object.assign(
      ...maps.map((map) => ({ [map.type]: map }))
    );

    const mapKeys = [...Object.keys(mapsRestructured), "ua", "st", "en"]; // ua - unassigned, st - suggested token, en - english word
    let colorMap = Object.assign(
      ...maps
        .filter((map) => map.active)
        .map((map) => ({ [map.type]: map.color }))
    ); // Filters for active maps
    colorMap = { ...colorMap, ...DEFAULT_COLORS };
    res.json({
      contents: mapsRestructured,
      map_keys: mapKeys,
      color_map: colorMap,
    });
  } catch (err) {
    res.json({ message: err });
    logger.info("Failed to fetch project maps", {
      route: `/api/map/${req.params.projectId}`,
    });
  }
});

router.post("/status/:mapId", async (req, res) => {
  // Modify active state of map
  logger.info("Updating map status", {
    route: `/api/map/status/${req.params.mapId}`,
  });
  try {
    const mapResponse = await Resource.findByIdAndUpdate(
      { _id: req.params.mapId },
      { active: req.body.activeStatus }
    );
    res.json("Update successful");
  } catch (err) {
    res.json({ message: err });
    logger.info("Failed to update map status", {
      route: `/api/map/status/${req.params.mapId}`,
    });
  }
});

module.exports = router;
