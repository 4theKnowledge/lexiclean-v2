import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { auth } from "express-oauth2-jwt-bearer";
import { rateLimit } from "express-rate-limit";

import projectRoute from "./routes/project.js";
import textRoute from "./routes/text.js";
import tokenRoute from "./routes/token.js";
import schemaRoute from "./routes/schema.js";
import userRoute from "./routes/user.js";
import notificationRoute from "./routes/notification.js";
import { authenticateUser, projectAccessCheck } from "./middleware/auth.js";

const app = express();

console.log(`Running in ${process.env.AUTH_STRATEGY} mode`);

// Create rate limit rule
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(apiLimiter);

// Simple health check
app.get("/status", (req, res) => {
  res.status(200).send("OK");
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

if (process.env.AUTH_STRATEGY === "AUTH0") {
  const checkJwt = auth({
    audience: `https://${process.env.AUTH0_AUDIENCE}`,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  });
  // Applying JWT check globally
  app.use(checkJwt);
}

// Custom middleware
app.use(authenticateUser);

// Applying project access check to routes that need it
app.use("/api/project", projectRoute);
app.use("/api/token", projectAccessCheck, tokenRoute);
app.use("/api/text", projectAccessCheck, textRoute);
app.use("/api/schema", projectAccessCheck, schemaRoute);

// User route might not require project access check
app.use("/api/user", userRoute);
app.use("/api/notification", notificationRoute);

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

export default app;
