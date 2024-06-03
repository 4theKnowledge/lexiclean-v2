import { MongoMemoryServer } from "mongodb-memory-server";
import { DummyUserAuth } from "../../../src/auth/DummyUserAuth.js";
import User from "../../../src/models/User.js";
import { connectDB, disconnectDB } from "../../../src/db.js";

describe("DummyUserAuth", () => {
  let mongoServer;
  let dummyUserAuth;
  process.env.AUTH_STRATEGY = "DUMMY";

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DB_URI = mongoServer.getUri();
    await connectDB();
    dummyUserAuth = new DummyUserAuth();
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  test("validateAndCreateUser creates a new user if one does not exist", async () => {
    const username = "testuser";
    const response = await dummyUserAuth.validateAndCreateUser(
      `Bearer ${username}`
    );
    const userId = response.userId;
    const user = await User.findById(userId);
    expect(user).not.toBeNull();
    expect(user.username).toBe(username);
  });

  test("validateAndCreateUser returns the id of an existing user", async () => {
    const username = "existinguser";
    const existingUser = new User({
      username: username,
      email: `${username}@mail.com`,
      name: username,
      authId: `auth|${username}`,
    });
    await existingUser.save();

    const response = await dummyUserAuth.validateAndCreateUser(
      `Bearer ${username}`
    );
    const userId = response.userId;
    expect(userId.toString()).toBe(existingUser._id.toString());
  });

  test("validateAndCreateUser handles errors during user creation", async () => {
    const username = "failuser";
    // Mock User.save to throw an error
    const mockSave = jest.spyOn(User.prototype, "save");
    mockSave.mockImplementationOnce(() => {
      throw new Error("Database save failed");
    });

    const response = await dummyUserAuth.validateAndCreateUser(
      `Bearer ${username}`
    );

    expect(response.success).toBe(false);
    expect(response.error).not.toBe("");
    expect(response.error).toBe("Database save failed");

    mockSave.mockRestore(); // Restore original implementation after the test
  });
});
