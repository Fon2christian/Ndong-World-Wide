import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

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
    const decoded = jwt.verify(token, jwtSecret);

    // Validate decoded payload has required properties
    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).id !== "string" ||
      typeof (decoded as Record<string, unknown>).email !== "string" ||
      !(decoded as Record<string, unknown>).id ||
      !(decoded as Record<string, unknown>).email
    ) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    const payload = decoded as { id: string; email: string };

    // Attach admin info to request
    req.admin = {
      id: payload.id,
      email: payload.email,
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

/**
 * Super Admin authorization middleware
 * Must be used after requireAuth middleware
 * Checks if authenticated admin has super_admin role
 */
export async function requireSuperAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Fetch admin from database to check role
    const admin = await Admin.findById(req.admin.id).select("role");

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    if (admin.role !== "super_admin") {
      res.status(403).json({
        message: "Access denied. Super admin privileges required.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Super admin authorization error:", error);
    res.status(500).json({ message: "Authorization failed" });
  }
}
