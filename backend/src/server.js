require("dotenv").config({ path: "./.env" });
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// Middleware
app.use(cors());
app.use(express.urlencoded({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/project", [require("./routes/project")]);
app.use("/api/token", [require("./routes/token")]);
app.use("/api/text", [require("./routes/text")]);
app.use("/api/schema", [require("./routes/schema")]);
app.use("/api/user", [require("./routes/user")]);

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
