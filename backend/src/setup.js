const { MongoClient } = require("mongodb");
require("dotenv").config({ path: "../.env" });
const path = require("path");
const fs = require("fs").promises; // Use fs promises for async/await

const appRoot = process.env.APP_ROOT || ".";
const lexiconPath = path.join(appRoot, "data", "en_lexicon.json");

const DB_URI = process.env.DB_URI;

const client = new MongoClient(DB_URI);

console.log(`Attempting to connect to database at URI: ${DB_URI}`);

const defaultUserData = {
  username: "system",
  email: "system@example.com",
  name: "System",
  avatar: "/static/avatars/default.jpg",
  roles: ["user"],
  lastLogin: new Date("2024-01-01T12:00:00Z").toISOString(),
  signUpDate: new Date("2023-01-01T12:00:00Z").toISOString(),
  membershipLevel: "basic",
  openAIKey: "",
};

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to the database.");

    const database = client.db("lexiclean");
    const resourcesCollection = database.collection("resources");
    const usersCollection = database.collection("users");

    // Check and insert lexicon data if not already present
    const lexiconExists = await resourcesCollection.findOne({ type: "en" });
    if (!lexiconExists) {
      try {
        const rawData = await fs.readFile(lexiconPath, "utf8");
        const docs = JSON.parse(rawData);
        // Assuming docs[0] has a 'type' property you want to check
        if (docs[0] && docs[0].type === "en") {
          const lexiconResult = await resourcesCollection.insertOne(docs[0]);
          console.log(`Lexicon added with _id: ${lexiconResult.insertedId}`);
        } else {
          console.log("No 'en' type lexicon found in the provided file.");
        }
      } catch (error) {
        console.error("Failed to read or insert lexicon data:", error);
      }
    } else {
      console.log("An 'en' type lexicon entry already exists in the database.");
    }

    // Check and insert default user if not already present
    const userExists = await usersCollection.findOne({ username: "system" });
    if (!userExists) {
      try {
        const userResponse = await usersCollection.insertOne(defaultUserData);
        console.log(`Default user added with _id: ${userResponse.insertedId}`);
      } catch (error) {
        console.error("Failed to insert default user data:", error);
      }
    } else {
      console.log(
        "A user with username 'system' already exists in the database."
      );
    }
  } catch (error) {
    console.error("An error occurred during setup:", error);
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}

run().catch(console.error);
