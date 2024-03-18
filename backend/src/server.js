import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { auth } from "express-oauth2-jwt-bearer";

import projectRoute from "./routes/project.js";
import textRoute from "./routes/text.js";
import tokenRoute from "./routes/token.js";
import schemaRoute from "./routes/schema.js";
import userRoute from "./routes/user.js";
import notificationRoute from "./routes/notification.js";

import { authenticateUser, projectAccessCheck } from "./middleware/auth.js";

const app = express();

const checkJwt = auth({
  audience: `https://${process.env.AUTH0_AUDIENCE}`,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Custom middleware
app.use(authenticateUser);

// Applying JWT check globally
app.use(checkJwt);

// Applying project access check to routes that need it
app.use("/api/project", projectRoute);
app.use("/api/token", projectAccessCheck, tokenRoute);
app.use("/api/text", projectAccessCheck, textRoute);
app.use("/api/schema", projectAccessCheck, schemaRoute);

// User route might not require project access check
app.use("/api/user", userRoute);
app.use("/api/notification", notificationRoute);

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send({
    error: err.message || "An unexpected error occurred",
  });
});

// Connect to mongo db
const DB_URI = process.env.DB_URI;
console.log(`DB_URI: ${DB_URI}`);

mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("[server] Connected to db"))
  .catch((err) => console.error(err));

// Create listener
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`[server] Started on port ${port}`));
