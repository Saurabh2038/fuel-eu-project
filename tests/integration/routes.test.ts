import request from "supertest";
import app from "../../src/server";

describe("Routes API", () => {
  it("GET /routes returns 200", async () => {
    const res = await request(app).get("/routes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
