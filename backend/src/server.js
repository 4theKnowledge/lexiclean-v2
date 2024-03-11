require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { auth } = require("express-oauth2-jwt-bearer");

const checkJwt = auth({
  audience: `https://${process.env.AUTH0_AUDIENCE}`,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
});

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/project", checkJwt, [require("./routes/project")]);
app.use("/api/token", checkJwt, [require("./routes/token")]);
app.use("/api/text", checkJwt, [require("./routes/text")]);
app.use("/api/schema", checkJwt, [require("./routes/schema")]);
app.use("/api/user", checkJwt, [require("./routes/user")]);

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

mongoose.connect(
  DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("[server] Connected to db");
  }
);

// Create listener
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`[server] Started on port ${port}`));
