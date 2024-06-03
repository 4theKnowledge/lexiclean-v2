import request from "supertest";
import app from "../src/server";

describe("GET /status", () => {
  it('should respond with "OK"', async () => {
    const response = await request(app).get("/status");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("OK");
  });
});
