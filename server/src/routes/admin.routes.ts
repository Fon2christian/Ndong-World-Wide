import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * Generate JWT token
 */
function generateToken(adminId: string, email: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign({ id: adminId, email }, jwtSecret, {
    expiresIn: "7d", // Token expires in 7 days
  });
}

/**
 * POST /api/admin/register
 * Register a new admin user
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password, and name are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const admin = await Admin.create({
      email,
      password,
      name,
    });

    // Generate token
    const token = generateToken(admin._id.toString(), admin.email);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    const message =
      error instanceof Error ? error.message : "Registration failed";
    res.status(500).json({ message });
  }
});

/**
 * POST /api/admin/login
 * Login admin user
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(admin._id.toString(), admin.email);

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(500).json({ message });
  }
});

/**
 * GET /api/admin/me
 * Get current admin user profile
 */
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
});

export default router;
