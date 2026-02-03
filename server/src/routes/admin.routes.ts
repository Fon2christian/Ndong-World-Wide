import { Router } from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

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

/**
 * POST /api/admin/forgot-password
 * Request password reset
 */
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Find admin by email (include reset fields)
    const admin = await Admin.findOne({ email }).select(
      "+lastPasswordResetRequest +resetPasswordToken +resetPasswordExpires"
    );

    // Always return same message (prevents email enumeration)
    const successMessage =
      "If an account exists with this email, a password reset link has been sent.";

    // If admin doesn't exist, return success message but don't send email
    if (!admin) {
      return res.json({ message: successMessage });
    }

    // Check rate limiting (1 request per 20 minutes)
    if (admin.lastPasswordResetRequest) {
      const timeSinceLastRequest =
        Date.now() - admin.lastPasswordResetRequest.getTime();
      const twentyMinutes = 20 * 60 * 1000;

      if (timeSinceLastRequest < twentyMinutes) {
        // Log rate limit but return generic success to prevent enumeration
        console.warn(`Rate limit exceeded for password reset: ${email}`);
        return res.json({ message: successMessage });
      }
    }

    // Generate reset token
    const resetToken = admin.createPasswordResetToken();
    await admin.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(admin, resetToken);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Clear token if email fails
      admin.clearResetToken();
      await admin.save();
      // Return generic success to prevent enumeration, but log failure internally
      return res.json({ message: successMessage });
    }

    res.json({ message: successMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

/**
 * GET /api/admin/reset-password/:token
 * Validate reset token
 */
router.get("/reset-password/:token", async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find admin with this token
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
    }).select("+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts");

    // Validate token
    if (!admin) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    // Validate using admin method (checks expiration and attempts)
    const isValid = admin.validateResetToken(token);

    if (!isValid) {
      // Check reason for failure before clearing
      const isExpired = admin.resetPasswordExpires && admin.resetPasswordExpires < new Date();
      const isMaxAttempts = admin.resetPasswordAttempts && admin.resetPasswordAttempts >= 5;

      // Clear token if expired or max attempts exceeded
      if (isExpired || isMaxAttempts) {
        admin.clearResetToken();
        await admin.save();
      }

      return res.status(400).json({
        valid: false,
        message: isMaxAttempts
            ? "Maximum validation attempts exceeded"
            : "Invalid or expired reset token",
      });
    }

    // Save incremented attempts
    await admin.save();

    res.json({
      valid: true,
      email: admin.email,
    });
  } catch (error) {
    console.error("Validate reset token error:", error);
    res.status(500).json({
      valid: false,
      message: "An error occurred. Please try again later.",
    });
  }
});

/**
 * POST /api/admin/reset-password
 * Reset password
 */
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find admin with this token
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
    }).select("+resetPasswordToken +resetPasswordExpires +resetPasswordAttempts");

    // Validate admin exists
    if (!admin) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Validate token expiration
    if (!admin.resetPasswordExpires || admin.resetPasswordExpires < new Date()) {
      admin.clearResetToken();
      await admin.save();
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Check attempt limit (this check prevents the final POST if attempts exceeded during GET validations)
    if (admin.resetPasswordAttempts && admin.resetPasswordAttempts >= 5) {
      admin.clearResetToken();
      await admin.save();
      return res.status(400).json({
        message: "Maximum validation attempts exceeded",
      });
    }

    // Update password
    admin.password = newPassword;

    // Clear reset token
    admin.clearResetToken();

    // Save (password will be hashed by pre-save hook)
    await admin.save();

    res.json({
      message: "Password successfully reset. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

export default router;
