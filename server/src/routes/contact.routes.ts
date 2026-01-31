import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { sendContactEmail } from "../services/emailService.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate contact input
function validateContactInput(body: any): { valid: boolean; error?: string } {
  const { name, furigana, email, phone, inquiryDetails } = body;

  // Check required fields exist and are strings
  if (!name || typeof name !== 'string' || !furigana || typeof furigana !== 'string' ||
      !email || typeof email !== 'string' || !phone || typeof phone !== 'string') {
    return { valid: false, error: "All required fields must be provided" };
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate field lengths to prevent abuse
  if (name.length > 200) {
    return { valid: false, error: "Name must be less than 200 characters" };
  }
  if (furigana.length > 200) {
    return { valid: false, error: "Furigana must be less than 200 characters" };
  }
  if (email.length > 100) {
    return { valid: false, error: "Email must be less than 100 characters" };
  }
  if (phone.length > 50) {
    return { valid: false, error: "Phone must be less than 50 characters" };
  }
  // Validate inquiryDetails if provided
  if (inquiryDetails !== undefined) {
    if (typeof inquiryDetails !== 'string') {
      return { valid: false, error: "Inquiry details must be a string" };
    }
    if (inquiryDetails.length > 5000) {
      return { valid: false, error: "Inquiry details must be less than 5000 characters" };
    }
  }

  return { valid: true };
}

// CREATE contact inquiry
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = validateContactInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Whitelist only allowed fields to prevent mass-assignment
    const contactData = {
      name: req.body.name,
      furigana: req.body.furigana,
      email: req.body.email,
      phone: req.body.phone,
      ...(req.body.inquiryDetails && { inquiryDetails: req.body.inquiryDetails })
    };

    // Create contact in database
    const contact = await Contact.create(contactData);

    // Send email notification
    try {
      await sendContactEmail(contact);
      // Update emailSent status
      contact.emailSent = true;
      await contact.save();
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Continue even if email fails - contact is saved in database
    }

    res.status(201).json(contact);
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    // Return sanitized error message
    const message = error instanceof Error ? error.message : "Failed to create contact inquiry";
    res.status(400).json({ message });
  }
});

// GET all contact inquiries (for admin dashboard)
// Protected endpoint - requires authentication
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const filter: { status?: string } = {};
    if (req.query.status) {
      filter.status = req.query.status as string;
    }

    // Pagination with bounds checking to prevent abuse and invalid values
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const requestedLimit = parseInt(req.query.limit as string) || 50;
    const limit = Math.max(1, Math.min(requestedLimit, 100)); // Clamp between 1 and 100
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    res.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact inquiries:", error);
    res.status(500).json({ message: "Failed to fetch contact inquiries" });
  }
});

// GET single contact inquiry
// Protected endpoint - requires authentication
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }
    const contact = await Contact.findById(id);
    if (!contact) return res.status(404).json({ message: "Contact inquiry not found" });
    res.json(contact);
  } catch (error) {
    console.error("Error fetching contact inquiry:", error);
    res.status(500).json({ message: "Failed to fetch contact inquiry" });
  }
});

// UPDATE contact inquiry status (for admin to mark as resolved, etc.)
// Protected endpoint - requires authentication
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }

    // Whitelist only updatable fields to prevent modification of sensitive data
    const allowedUpdates: Partial<{ status: string; isRead: boolean }> = {};
    if (req.body.status) {
      allowedUpdates.status = req.body.status;
      // Automatically mark as read when status changes (cannot be overridden)
      allowedUpdates.isRead = true;
    } else if (req.body.isRead !== undefined) {
      // Only allow explicit isRead change when status is not being updated
      allowedUpdates.isRead = req.body.isRead;
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Contact inquiry not found" });
    }
    res.json(contact);
  } catch (error) {
    console.error("Error updating contact inquiry:", error);
    const message = error instanceof Error ? error.message : "Failed to update contact inquiry";
    res.status(400).json({ message });
  }
});

// DELETE contact inquiry
// Protected endpoint - requires authentication
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact inquiry not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting contact inquiry:", error);
    res.status(500).json({ message: "Failed to delete contact inquiry" });
  }
});

export default router;
