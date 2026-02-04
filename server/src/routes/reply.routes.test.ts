import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import Admin from "../models/Admin.js";
import Contact from "../models/Contact.js";
import Reply from "../models/Reply.js";

// Mock the email service to prevent actual email sends
vi.mock("../services/emailService.js", () => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendReplyEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Reply Routes", () => {
  let authToken: string;
  let testContactId: string;
  let adminId: string;

  beforeEach(async () => {
    // Clear database
    await Admin.deleteMany({});
    await Contact.deleteMany({});
    await Reply.deleteMany({});

    // Set JWT_SECRET using vi.stubEnv for better isolation
    vi.stubEnv('JWT_SECRET', 'test-secret-key');

    // Register admin and get token
    const adminResponse = await request(app).post("/api/admin/register").send({
      email: "admin@test.com",
      password: "SecurePassword123",
      name: "Test Admin",
    });
    authToken = adminResponse.body.token;
    adminId = adminResponse.body.admin.id;

    // Create a test contact
    const contactResponse = await request(app).post("/api/contacts").send({
      name: "Test Customer",
      furigana: "テストカスタマー",
      email: "customer@example.com",
      phone: "+81-90-1234-5678",
      inquiryDetails: "Test inquiry about cars",
    });
    testContactId = contactResponse.body._id;
  });

  afterEach(() => {
    // Clean up environment variable stubs
    vi.unstubAllEnvs();
  });

  describe("POST /api/contacts/:contactId/replies - Authentication", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .send({
          subject: "Test Reply",
          message: "This is a test message",
        })
        .expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", "Bearer invalid-token")
        .send({
          subject: "Test Reply",
          message: "This is a test message",
        })
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("POST /api/contacts/:contactId/replies - Validation", () => {
    it("should reject invalid contactId", async () => {
      const response = await request(app)
        .post("/api/contacts/invalid-id/replies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Reply",
          message: "This is a test message",
        })
        .expect(400);

      expect(response.body.message).toBe("Invalid contact ID");
    });

    it("should reject non-existent contact", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format but doesn't exist
      const response = await request(app)
        .post(`/api/contacts/${fakeId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Reply",
          message: "This is a test message",
        })
        .expect(404);

      expect(response.body.message).toBe("Contact not found");
    });

    it("should reject empty subject", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "",
          message: "This is a test message",
        })
        .expect(400);

      expect(response.body.message).toBe("Subject and message are required");
    });

    it("should reject empty message", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Reply",
          message: "",
        })
        .expect(400);

      expect(response.body.message).toBe("Subject and message are required");
    });

    it("should reject subject longer than 200 characters", async () => {
      const longSubject = "a".repeat(201);
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: longSubject,
          message: "This is a test message",
        })
        .expect(400);

      expect(response.body.message).toBe("Subject must be less than 200 characters");
    });

    it("should reject message longer than 5000 characters", async () => {
      const longMessage = "a".repeat(5001);
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Reply",
          message: longMessage,
        })
        .expect(400);

      expect(response.body.message).toBe("Message must be less than 5000 characters");
    });

    it("should reject non-string subject", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: 123,
          message: "This is a test message",
        })
        .expect(400);

      expect(response.body.message).toBe("Subject and message are required");
    });

    it("should reject non-string message", async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          subject: "Test Reply",
          message: 123,
        })
        .expect(400);

      expect(response.body.message).toBe("Subject and message are required");
    });
  });

  describe("POST /api/contacts/:contactId/replies - Reply Creation", () => {
    it("should create reply with valid data", async () => {
      const replyData = {
        subject: "Re: Inquiry from Test Customer",
        message: "Thank you for your inquiry. We will get back to you soon.",
      };

      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.subject).toBe(replyData.subject);
      expect(response.body.message).toBe(replyData.message);
      expect(response.body.contactId).toBe(testContactId);
      expect(response.body.adminName).toBe("Test Admin");
      expect(response.body.adminEmail).toBe("admin@test.com");
      expect(response.body.emailStatus).toBe("sending");
    });

    it("should attach admin info from JWT token", async () => {
      const replyData = {
        subject: "Test Reply",
        message: "Test message",
      };

      const response = await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      expect(response.body.adminId).toBe(adminId);
      expect(response.body.adminName).toBe("Test Admin");
      expect(response.body.adminEmail).toBe("admin@test.com");
    });

    it("should update contact lastReplyAt and replyCount", async () => {
      const replyData = {
        subject: "Test Reply",
        message: "Test message",
      };

      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      // Fetch contact and verify updates
      const contact = await Contact.findById(testContactId);
      expect(contact?.lastReplyAt).toBeDefined();
      expect(contact?.replyCount).toBe(1);
    });

    it("should auto-change contact status to in_progress", async () => {
      const replyData = {
        subject: "Test Reply",
        message: "Test message",
      };

      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      // Fetch contact and verify status
      const contact = await Contact.findById(testContactId);
      expect(contact?.status).toBe("in_progress");
    });

    it("should increment replyCount for multiple replies", async () => {
      const replyData = {
        subject: "Test Reply",
        message: "Test message",
      };

      // Create first reply
      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      // Create second reply
      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...replyData, subject: "Second Reply" })
        .expect(201);

      // Verify replyCount
      const contact = await Contact.findById(testContactId);
      expect(contact?.replyCount).toBe(2);
    });
  });

  describe("GET /api/contacts/:contactId/replies - Authentication", () => {
    it("should reject access without authentication", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}/replies`)
        .expect(401);

      expect(response.body.message).toBe("Authorization header required");
    });

    it("should reject access with invalid token", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("GET /api/contacts/:contactId/replies - Fetching Replies", () => {
    it("should reject invalid contactId", async () => {
      const response = await request(app)
        .get("/api/contacts/invalid-id/replies")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toBe("Invalid contact ID");
    });

    it("should reject non-existent contact", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/contacts/${fakeId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe("Contact not found");
    });

    it("should return empty array for contact with no replies", async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.replies).toEqual([]);
    });

    it("should return replies for contact", async () => {
      // Create a reply first
      const replyData = {
        subject: "Test Reply",
        message: "Test message",
      };
      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      // Fetch replies
      const response = await request(app)
        .get(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.replies).toHaveLength(1);
      expect(response.body.replies[0].subject).toBe(replyData.subject);
      expect(response.body.replies[0].message).toBe(replyData.message);
    });

    it("should return replies sorted by sentAt descending", async () => {
      // Create multiple replies
      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ subject: "First Reply", message: "Message 1" })
        .expect(201);

      // Add delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .post(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ subject: "Second Reply", message: "Message 2" })
        .expect(201);

      // Fetch replies
      const response = await request(app)
        .get(`/api/contacts/${testContactId}/replies`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.replies).toHaveLength(2);
      // Newest reply should be first
      expect(response.body.replies[0].subject).toBe("Second Reply");
      expect(response.body.replies[1].subject).toBe("First Reply");
    });
  });
});
