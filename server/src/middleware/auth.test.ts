import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireAuth, type AuthRequest } from "./auth.js";

describe("Auth Middleware", () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Setup mock request
    mockRequest = {
      headers: {},
    };

    // Setup mock response
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Setup next function
    nextFunction = vi.fn();

    // Set JWT_SECRET for tests using vi.stubEnv for better isolation
    vi.stubEnv('JWT_SECRET', 'test-secret-key');
  });

  afterEach(() => {
    // Clean up environment variable stubs
    vi.unstubAllEnvs();
  });

  describe("Missing Authorization Header", () => {
    it("should return 401 when authorization header is missing", () => {
      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Authorization header required",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Invalid Authorization Format", () => {
    it("should return 401 when authorization format is invalid (no Bearer prefix)", () => {
      mockRequest.headers = {
        authorization: "InvalidToken",
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid authorization format. Expected: Bearer <token>",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization format has wrong parts count", () => {
      mockRequest.headers = {
        authorization: "Bearer",
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid authorization format. Expected: Bearer <token>",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("JWT_SECRET Not Configured", () => {
    it("should return 500 when JWT_SECRET is not set", () => {
      vi.unstubAllEnvs();

      mockRequest.headers = {
        authorization: "Bearer sometoken",
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Authentication not configured",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Invalid JWT Token", () => {
    it("should return 403 for invalid token signature", () => {
      mockRequest.headers = {
        authorization: "Bearer invalid.jwt.token",
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 403 for malformed token", () => {
      mockRequest.headers = {
        authorization: "Bearer malformed-token",
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Expired JWT Token", () => {
    it("should return 401 for expired token", () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: "123", email: "admin@test.com" },
        "test-secret-key",
        { expiresIn: "-1s" } // Already expired
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Token expired",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Invalid JWT Payload Shape", () => {
    it("should return 401 for token with missing id field", () => {
      const invalidPayload = { email: "admin@test.com" };
      const token = jwt.sign(invalidPayload, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token payload",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 for token with missing email field", () => {
      const invalidPayload = { id: "123" };
      const token = jwt.sign(invalidPayload, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token payload",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 for token with empty id", () => {
      const invalidPayload = { id: "", email: "admin@test.com" };
      const token = jwt.sign(invalidPayload, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token payload",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 for token with non-string id", () => {
      const invalidPayload = { id: 123, email: "admin@test.com" };
      const token = jwt.sign(invalidPayload, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid token payload",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Valid JWT Token", () => {
    it("should call next() and attach admin info to request for valid token", () => {
      const adminData = { id: "123", email: "admin@test.com" };
      const validToken = jwt.sign(adminData, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.admin).toEqual(adminData);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it("should decode token payload correctly", () => {
      const adminData = {
        id: "user-id-123",
        email: "test.admin@example.com",
      };
      const validToken = jwt.sign(adminData, "test-secret-key", {
        expiresIn: "1h",
      });

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.admin).toEqual(adminData);
      expect(mockRequest.admin?.id).toBe(adminData.id);
      expect(mockRequest.admin?.email).toBe(adminData.email);
    });
  });

  describe("Case Sensitivity", () => {
    it("should handle Bearer with correct case", () => {
      const validToken = jwt.sign(
        { id: "123", email: "admin@test.com" },
        "test-secret-key",
        { expiresIn: "1h" }
      );

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it("should reject lowercase bearer prefix", () => {
      const validToken = jwt.sign(
        { id: "123", email: "admin@test.com" },
        "test-secret-key",
        { expiresIn: "1h" }
      );

      mockRequest.headers = {
        authorization: `bearer ${validToken}`,
      };

      requireAuth(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
