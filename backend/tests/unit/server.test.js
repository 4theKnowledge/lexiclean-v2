import request from "supertest";
import app from "../../src/server.js";

describe("GET /status", () => {
  it("should respond with 200", async () => {
    const response = await request(app).get("/status");
    expect(response.statusCode).toBe(200);
  });
});
