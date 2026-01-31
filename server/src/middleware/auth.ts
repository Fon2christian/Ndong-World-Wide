import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request to include admin user
export interface AuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
}

/**
 * JWT Authentication middleware for admin endpoints
 * Verifies JWT token from Authorization header
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: "Authorization header required" });
      return;
    }

    // Expected format: "Bearer <jwt-token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res
        .status(401)
        .json({
          message: "Invalid authorization format. Expected: Bearer <token>",
        });
      return;
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET not configured in environment variables");
      res.status(500).json({ message: "Authentication not configured" });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      email: string;
    };

    // Attach admin info to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
}
