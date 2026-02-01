import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import WheelDrum from "../models/WheelDrum.js";

const validWheelDrum = {
  brand: "Toyota",
  size: "15x6",
  price: 8000,
  condition: "good",
  images: [],
  displayLocation: "market" as const,
};

// Generate a valid JWT token for testing protected routes
const generateAuthToken = () => {
  const secret = process.env.JWT_SECRET || "test-secret-key";
  return jwt.sign({ id: "test-admin-id", email: "admin@test.com" }, secret, {
    expiresIn: "1h",
  });
};

let authToken: string;

describe("WheelDrum Routes", () => {
  beforeEach(() => {
    // Set JWT_SECRET for tests using vi.stubEnv for better isolation
    vi.stubEnv('JWT_SECRET', 'test-secret-key');
    authToken = generateAuthToken();
  });

  afterEach(async () => {
    // Clean up database
    await WheelDrum.deleteMany({});
    // Clean up environment variable stubs
    vi.unstubAllEnvs();
  });

  describe("POST /api/wheel-drums", () => {
    it("should create a new wheel drum", async () => {
      const res = await request(app)
        .post("/api/wheel-drums")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validWheelDrum);

      expect(res.status).toBe(201);
      expect(res.body.brand).toBe("Toyota");
      expect(res.body.size).toBe("15x6");
      expect(res.body.condition).toBe("good");
      expect(res.body._id).toBeDefined();
    });

    it("should create a wheel drum with displayLocation=both", async () => {
      const wheelDrum = { ...validWheelDrum, displayLocation: "both" as const };
      const res = await request(app)
        .post("/api/wheel-drums")
        .set("Authorization", `Bearer ${authToken}`)
        .send(wheelDrum);

      expect(res.status).toBe(201);
      expect(res.body.displayLocation).toBe("both");
    });

    it("should return 400 for invalid wheel drum data", async () => {
      const res = await request(app)
        .post("/api/wheel-drums")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 for invalid displayLocation", async () => {
      const res = await request(app)
        .post("/api/wheel-drums")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validWheelDrum, displayLocation: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 for negative price", async () => {
      const res = await request(app)
        .post("/api/wheel-drums")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validWheelDrum, price: -100 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/wheel-drums").send(validWheelDrum);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/wheel-drums", () => {
    it("should return empty array when no wheel drums exist", async () => {
      const res = await request(app).get("/api/wheel-drums");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all wheel drums sorted by createdAt desc", async () => {
      // Create wheel drums with explicit timestamps to ensure deterministic ordering
      const olderDate = new Date(Date.now() - 1000);
      const newerDate = new Date();

      await WheelDrum.create({ ...validWheelDrum, brand: "Honda", createdAt: olderDate });
      await WheelDrum.create({ ...validWheelDrum, brand: "Toyota", createdAt: newerDate });

      const res = await request(app).get("/api/wheel-drums");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].brand).toBe("Toyota");
      expect(res.body[1].brand).toBe("Honda");
    });

    it("should filter by location=market", async () => {
      await WheelDrum.create({ ...validWheelDrum, displayLocation: "market" });
      await WheelDrum.create({ ...validWheelDrum, brand: "Honda", displayLocation: "business" });
      await WheelDrum.create({ ...validWheelDrum, brand: "Nissan", displayLocation: "both" });

      const res = await request(app).get("/api/wheel-drums?location=market");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Should return market and both
      const brands = res.body.map((w: any) => w.brand);
      expect(brands).toContain("Toyota");
      expect(brands).toContain("Nissan");
      expect(brands).not.toContain("Honda");
    });

    it("should filter by location=business", async () => {
      await WheelDrum.create({ ...validWheelDrum, displayLocation: "market" });
      await WheelDrum.create({ ...validWheelDrum, brand: "Honda", displayLocation: "business" });
      await WheelDrum.create({ ...validWheelDrum, brand: "Nissan", displayLocation: "both" });

      const res = await request(app).get("/api/wheel-drums?location=business");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Should return business and both
      const brands = res.body.map((w: any) => w.brand);
      expect(brands).toContain("Honda");
      expect(brands).toContain("Nissan");
      expect(brands).not.toContain("Toyota");
    });

    it("should return 400 for invalid location filter", async () => {
      const res = await request(app).get("/api/wheel-drums?location=invalid");

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid location filter");
    });
  });

  describe("GET /api/wheel-drums/:id", () => {
    it("should return a wheel drum by id", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app).get(`/api/wheel-drums/${wheelDrum._id}`);

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Toyota");
      expect(res.body.size).toBe("15x6");
    });

    it("should return 404 for non-existent wheel drum", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/wheel-drums/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wheel drum not found");
    });

    it("should return 400 for invalid wheel drum ID format", async () => {
      const res = await request(app).get("/api/wheel-drums/invalid-id");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid wheel drum ID format");
    });
  });

  describe("PUT /api/wheel-drums/:id", () => {
    it("should update a wheel drum", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .put(`/api/wheel-drums/${wheelDrum._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Honda", price: 9000 });

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Honda");
      expect(res.body.price).toBe(9000);
      expect(res.body.size).toBe("15x6"); // Should keep original size
    });

    it("should update wheel drum condition", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .put(`/api/wheel-drums/${wheelDrum._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ condition: "excellent" });

      expect(res.status).toBe(200);
      expect(res.body.condition).toBe("excellent");
    });

    it("should update displayLocation", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .put(`/api/wheel-drums/${wheelDrum._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ displayLocation: "both" });

      expect(res.status).toBe(200);
      expect(res.body.displayLocation).toBe("both");
    });

    it("should return 404 when updating non-existent wheel drum", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .put(`/api/wheel-drums/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Honda" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wheel drum not found");
    });

    it("should return 400 for invalid wheel drum ID format", async () => {
      const res = await request(app)
        .put("/api/wheel-drums/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Honda" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid wheel drum ID format");
    });

    it("should return 400 for invalid update data", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .put(`/api/wheel-drums/${wheelDrum._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ price: -100 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 401 without authentication", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .put(`/api/wheel-drums/${wheelDrum._id}`)
        .send({ brand: "Honda" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/wheel-drums/:id", () => {
    it("should delete a wheel drum", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app)
        .delete(`/api/wheel-drums/${wheelDrum._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      const deletedWheelDrum = await WheelDrum.findById(wheelDrum._id);
      expect(deletedWheelDrum).toBeNull();
    });

    it("should return 404 when deleting non-existent wheel drum", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .delete(`/api/wheel-drums/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Wheel drum not found");
    });

    it("should return 400 for invalid wheel drum ID format", async () => {
      const res = await request(app)
        .delete("/api/wheel-drums/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid wheel drum ID format");
    });

    it("should return 401 without authentication", async () => {
      const wheelDrum = await WheelDrum.create(validWheelDrum);

      const res = await request(app).delete(`/api/wheel-drums/${wheelDrum._id}`);

      expect(res.status).toBe(401);
    });
  });
});
