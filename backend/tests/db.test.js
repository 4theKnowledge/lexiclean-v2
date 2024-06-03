import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB, disconnectDB } from "../src/db.js";

jest.setTimeout(30000); // Set timeout to 30 seconds

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.DB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

describe("Database Connection", () => {
  it("should connect to the in-memory database", async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it("should disconnect from the in-memory database", async () => {
    await disconnectDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 means disconnected
  });
});
