import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import Admin from "../models/Admin.js";

describe("Admin Routes", () => {
  beforeEach(async () => {
    // Clear admins before each test
    await Admin.deleteMany({});
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = "test-secret-key";
  });

  describe("POST /api/admin/register", () => {
    const validAdminData = {
      email: "admin@test.com",
      password: "SecurePassword123",
      name: "Test Admin",
    };

    it("should register a new admin with valid data", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send(validAdminData)
        .expect(201);

      expect(response.body).toHaveProperty("message", "Admin registered successfully");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("admin");
      expect(response.body.admin).toHaveProperty("id");
      expect(response.body.admin.email).toBe(validAdminData.email);
      expect(response.body.admin.name).toBe(validAdminData.name);
      expect(response.body.admin).not.toHaveProperty("password");
    });

    it("should return a valid JWT token", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send(validAdminData)
        .expect(201);

      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe("string");
      // JWT tokens have 3 parts separated by dots
      expect(response.body.token.split(".")).toHaveLength(3);
    });

    it("should reject registration with missing email", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          password: "SecurePassword123",
          name: "Test Admin",
        })
        .expect(400);

      expect(response.body.message).toBe("Email, password, and name are required");
    });

    it("should reject registration with missing password", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          email: "admin@test.com",
          name: "Test Admin",
        })
        .expect(400);

      expect(response.body.message).toBe("Email, password, and name are required");
    });

    it("should reject registration with missing name", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          email: "admin@test.com",
          password: "SecurePassword123",
        })
        .expect(400);

      expect(response.body.message).toBe("Email, password, and name are required");
    });

    it("should reject registration with invalid email format", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          ...validAdminData,
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body.message).toBe("Invalid email format");
    });

    it("should reject registration with password shorter than 8 characters", async () => {
      const response = await request(app)
        .post("/api/admin/register")
        .send({
          ...validAdminData,
          password: "short",
        })
        .expect(400);

      expect(response.body.message).toBe("Password must be at least 8 characters long");
    });

    it("should reject duplicate email registration", async () => {
      // Register first admin
      await request(app).post("/api/admin/register").send(validAdminData).expect(201);

      // Attempt to register with same email
      const response = await request(app)
        .post("/api/admin/register")
        .send(validAdminData)
        .expect(409);

      expect(response.body.message).toBe("Admin with this email already exists");
    });
  });

  describe("POST /api/admin/login", () => {
    const adminCredentials = {
      email: "admin@test.com",
      password: "SecurePassword123",
      name: "Test Admin",
    };

    beforeEach(async () => {
      // Register admin for login tests
      await request(app).post("/api/admin/register").send(adminCredentials);
    });

    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminCredentials.email,
          password: adminCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("admin");
      expect(response.body.admin.email).toBe(adminCredentials.email);
      expect(response.body.admin.name).toBe(adminCredentials.name);
    });

    it("should return a valid JWT token", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminCredentials.email,
          password: adminCredentials.password,
        })
        .expect(200);

      expect(response.body.token).toBeTruthy();
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.split(".")).toHaveLength(3);
    });

    it("should reject login with incorrect password", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminCredentials.email,
          password: "WrongPassword",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should reject login with non-existent email", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: "nonexistent@test.com",
          password: adminCredentials.password,
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should reject login with missing email", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          password: adminCredentials.password,
        })
        .expect(400);

      expect(response.body.message).toBe("Email and password are required");
    });

    it("should reject login with missing password", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: adminCredentials.email,
        })
        .expect(400);

      expect(response.body.message).toBe("Email and password are required");
    });

    it("should be case-insensitive for email", async () => {
      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: "ADMIN@TEST.COM",
          password: adminCredentials.password,
        })
        .expect(200);

      expect(response.body.message).toBe("Login successful");
    });
  });

  describe("GET /api/admin/me", () => {
    let authToken: string;
    const adminData = {
      email: "admin@test.com",
      password: "SecurePassword123",
      name: "Test Admin",
    };

    beforeEach(async () => {
      // Register and get token
      const response = await request(app)
        .post("/api/admin/register")
        .send(adminData);
      authToken = response.body.token;
    });

    it("should return admin profile with valid token", async () => {
      const response = await request(app)
        .get("/api/admin/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("admin");
      expect(response.body.admin.email).toBe(adminData.email);
      expect(response.body.admin.name).toBe(adminData.name);
      expect(response.body.admin).toHaveProperty("id");
      expect(response.body.admin).toHaveProperty("createdAt");
      expect(response.body.admin).toHaveProperty("updatedAt");
      expect(response.body.admin).not.toHaveProperty("password");
    });

    it("should reject request without authorization header", async () => {
      const response = await request(app).get("/api/admin/me").expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject request with invalid token", async () => {
      const response = await request(app)
        .get("/api/admin/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });

    it("should reject request with malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/admin/me")
        .set("Authorization", `${authToken}`)
        .expect(401);

      expect(response.body.message).toBe(
        "Invalid authorization format. Expected: Bearer <token>"
      );
    });
  });
});
