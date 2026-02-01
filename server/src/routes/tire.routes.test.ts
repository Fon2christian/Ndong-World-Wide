import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import Tire from "../models/Tire.js";

const validTire = {
  brand: "Michelin",
  size: "205/55R16",
  price: 15000,
  condition: "new" as const,
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

describe("Tire Routes", () => {
  beforeEach(() => {
    // Set JWT_SECRET for tests using vi.stubEnv for better isolation
    vi.stubEnv('JWT_SECRET', 'test-secret-key');
    authToken = generateAuthToken();
  });

  afterEach(() => {
    // Clean up environment variable stubs
    vi.unstubAllEnvs();
  });

  describe("POST /api/tires", () => {
    it("should create a new tire", async () => {
      const res = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${authToken}`)
        .send(validTire);

      expect(res.status).toBe(201);
      expect(res.body.brand).toBe("Michelin");
      expect(res.body.size).toBe("205/55R16");
      expect(res.body.condition).toBe("new");
      expect(res.body._id).toBeDefined();
    });

    it("should create a tire with used condition", async () => {
      const usedTire = { ...validTire, condition: "used" as const };
      const res = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${authToken}`)
        .send(usedTire);

      expect(res.status).toBe(201);
      expect(res.body.condition).toBe("used");
    });

    it("should return 400 for invalid tire data", async () => {
      const res = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 for invalid condition", async () => {
      const res = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validTire, condition: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 400 for invalid displayLocation", async () => {
      const res = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validTire, displayLocation: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/tires").send(validTire);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/tires", () => {
    it("should return empty array when no tires exist", async () => {
      const res = await request(app).get("/api/tires");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all tires sorted by createdAt desc", async () => {
      // Create tires with explicit timestamps to ensure deterministic ordering
      const olderDate = new Date(Date.now() - 1000);
      const newerDate = new Date();

      await Tire.create({ ...validTire, brand: "Bridgestone", createdAt: olderDate });
      await Tire.create({ ...validTire, brand: "Michelin", createdAt: newerDate });

      const res = await request(app).get("/api/tires");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].brand).toBe("Michelin");
      expect(res.body[1].brand).toBe("Bridgestone");
    });

    it("should filter by location=market", async () => {
      await Tire.create({ ...validTire, displayLocation: "market" });
      await Tire.create({ ...validTire, brand: "Bridgestone", displayLocation: "business" });
      await Tire.create({ ...validTire, brand: "Goodyear", displayLocation: "both" });

      const res = await request(app).get("/api/tires?location=market");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Should return market and both
      const brands = res.body.map((t: any) => t.brand);
      expect(brands).toContain("Michelin");
      expect(brands).toContain("Goodyear");
      expect(brands).not.toContain("Bridgestone");
    });

    it("should filter by location=business", async () => {
      await Tire.create({ ...validTire, displayLocation: "market" });
      await Tire.create({ ...validTire, brand: "Bridgestone", displayLocation: "business" });
      await Tire.create({ ...validTire, brand: "Goodyear", displayLocation: "both" });

      const res = await request(app).get("/api/tires?location=business");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Should return business and both
      const brands = res.body.map((t: any) => t.brand);
      expect(brands).toContain("Bridgestone");
      expect(brands).toContain("Goodyear");
      expect(brands).not.toContain("Michelin");
    });

    it("should filter by condition=new", async () => {
      await Tire.create({ ...validTire, condition: "new" });
      await Tire.create({ ...validTire, brand: "Bridgestone", condition: "used" });

      const res = await request(app).get("/api/tires?condition=new");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].condition).toBe("new");
    });

    it("should filter by condition=used", async () => {
      await Tire.create({ ...validTire, condition: "new" });
      await Tire.create({ ...validTire, brand: "Bridgestone", condition: "used" });

      const res = await request(app).get("/api/tires?condition=used");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].condition).toBe("used");
    });

    it("should return 400 for invalid location filter", async () => {
      const res = await request(app).get("/api/tires?location=invalid");

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid location");
    });

    it("should return 400 for invalid condition filter", async () => {
      const res = await request(app).get("/api/tires?condition=invalid");

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid condition");
    });
  });

  describe("GET /api/tires/:id", () => {
    it("should return a tire by id", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app).get(`/api/tires/${tire._id}`);

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Michelin");
      expect(res.body.size).toBe("205/55R16");
    });

    it("should return 404 for non-existent tire", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/tires/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Tire not found");
    });

    it("should return 400 for invalid tire ID format", async () => {
      const res = await request(app).get("/api/tires/invalid-id");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid tire ID format");
    });
  });

  describe("PUT /api/tires/:id", () => {
    it("should update a tire", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Bridgestone", price: 18000 });

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Bridgestone");
      expect(res.body.price).toBe(18000);
      expect(res.body.size).toBe("205/55R16"); // Should keep original size
    });

    it("should update tire condition", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ condition: "used" });

      expect(res.status).toBe(200);
      expect(res.body.condition).toBe("used");
    });

    it("should return 404 when updating non-existent tire", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .put(`/api/tires/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Bridgestone" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Tire not found");
    });

    it("should return 400 for invalid tire ID format", async () => {
      const res = await request(app)
        .put("/api/tires/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ brand: "Bridgestone" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid tire ID format");
    });

    it("should return 400 for invalid update data", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ condition: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation failed");
    });

    it("should return 401 without authentication", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app)
        .put(`/api/tires/${tire._id}`)
        .send({ brand: "Bridgestone" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /api/tires/:id", () => {
    it("should delete a tire", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app)
        .delete(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      const deletedTire = await Tire.findById(tire._id);
      expect(deletedTire).toBeNull();
    });

    it("should return 404 when deleting non-existent tire", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .delete(`/api/tires/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Tire not found");
    });

    it("should return 400 for invalid tire ID format", async () => {
      const res = await request(app)
        .delete("/api/tires/invalid-id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid tire ID format");
    });

    it("should return 401 without authentication", async () => {
      const tire = await Tire.create(validTire);

      const res = await request(app).delete(`/api/tires/${tire._id}`);

      expect(res.status).toBe(401);
    });
  });
});
