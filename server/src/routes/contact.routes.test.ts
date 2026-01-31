import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import Admin from "../models/Admin.js";
import Contact from "../models/Contact.js";

describe("Contact Routes - Authentication", () => {
  let authToken: string;
  let testContactId: string;

  beforeEach(async () => {
    // Clear database
    await Admin.deleteMany({});
    await Contact.deleteMany({});

    // Set JWT_SECRET using vi.stubEnv for better isolation
    vi.stubEnv('JWT_SECRET', 'test-secret-key');

    // Register admin and get token
    const adminResponse = await request(app).post("/api/admin/register").send({
      email: "admin@test.com",
      password: "SecurePassword123",
      name: "Test Admin",
    });
    authToken = adminResponse.body.token;

    // Create a test contact
    const contactResponse = await request(app).post("/api/contacts").send({
      name: "Test Customer",
      furigana: "テストカスタマー",
      email: "test@example.com",
      phone: "+81-90-1234-5678",
      inquiryDetails: "Test inquiry",
    });
    testContactId = contactResponse.body._id;
  });

  afterEach(() => {
    // Clean up environment variable stubs
    vi.unstubAllEnvs();
  });

  describe("POST /api/contacts (Public Endpoint)", () => {
    it("should allow creating contact without authentication", async () => {
      const contactData = {
        name: "John Doe",
        furigana: "ジョンドウ",
        email: "john@example.com",
        phone: "+81-90-9876-5432",
        inquiryDetails: "Inquiry about cars",
      };

      const response = await request(app)
        .post("/api/contacts")
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(contactData.name);
      expect(response.body.email).toBe(contactData.email);
      expect(response.body.status).toBe("new");
    });
  });

  describe("GET /api/contacts (Protected Endpoint)", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app).get("/api/contacts").expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .get("/api/contacts")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });

    it("should allow access with valid authentication", async () => {
      const response = await request(app)
        .get("/api/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("contacts");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.contacts)).toBe(true);
    });

    it("should return contacts with pagination", async () => {
      const response = await request(app)
        .get("/api/contacts")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("pages");
    });

    it("should respect pagination parameters", async () => {
      const response = await request(app)
        .get("/api/contacts?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it("should cap pagination limit at 100", async () => {
      const response = await request(app)
        .get("/api/contacts?limit=500")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });

    it("should filter by status", async () => {
      const response = await request(app)
        .get("/api/contacts?status=new")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.contacts).toBeDefined();
    });
  });

  describe("GET /api/contacts/:id (Protected Endpoint)", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });

    it("should allow access with valid authentication", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("_id", testContactId);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("email");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/contacts/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toBe("Invalid contact ID format");
    });

    it("should return 404 for non-existent contact", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format
      const response = await request(app)
        .get(`/api/contacts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe("Contact inquiry not found");
    });
  });

  describe("PUT /api/contacts/:id (Protected Endpoint)", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .send({ status: "resolved" })
        .expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .set("Authorization", "Bearer invalid-token")
        .send({ status: "resolved" })
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });

    it("should allow update with valid authentication", async () => {
      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "resolved" })
        .expect(200);

      expect(response.body).toHaveProperty("_id", testContactId);
      expect(response.body.status).toBe("resolved");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .put("/api/contacts/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "resolved" })
        .expect(400);

      expect(response.body.message).toBe("Invalid contact ID format");
    });

    it("should return 404 for non-existent contact", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .put(`/api/contacts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "resolved" })
        .expect(404);

      expect(response.body.message).toBe("Contact inquiry not found");
    });
  });

  describe("DELETE /api/contacts/:id (Protected Endpoint)", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app)
        .delete(`/api/contacts/${testContactId}`)
        .expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .delete(`/api/contacts/${testContactId}`)
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });

    it("should allow deletion with valid authentication", async () => {
      await request(app)
        .delete(`/api/contacts/${testContactId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify contact was deleted
      const verifyResponse = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(verifyResponse.body.message).toBe("Contact inquiry not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .delete("/api/contacts/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toBe("Invalid contact ID format");
    });

    it("should return 404 for non-existent contact", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/contacts/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe("Contact inquiry not found");
    });
  });
});
