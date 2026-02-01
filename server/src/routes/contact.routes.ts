import { Router } from "express";
import type { Request, Response } from "express";
import Contact from "../models/Contact.js";
import { sendContactEmail } from "../services/emailService.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidObjectId, validContactStatuses } from "../utils/validation.js";

const router = Router();

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  // More strict email validation:
  // - At least 2 characters before @
  // - No consecutive dots
  // - Domain has at least 2 characters
  // - TLD has at least 2 characters
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
  return emailRegex.test(email);
}

// Helper function to validate contact input
function validateContactInput(body: any): { valid: boolean; error?: string } {
  // Guard against null/undefined and non-object types
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

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
      ...(req.body.inquiryDetails !== undefined && { inquiryDetails: req.body.inquiryDetails })
    };

    // Create contact in database
    const contact = await Contact.create(contactData);

    // Send response immediately without waiting for email
    res.status(201).json(contact);

    // Send email notification asynchronously in the background
    sendContactEmail(contact)
      .then(async () => {
        // Update emailSent status after successful send
        contact.emailSent = true;
        await contact.save();
      })
      .catch((emailError) => {
        console.error("Failed to send email notification:", emailError);
        // Email failure is logged but doesn't affect the API response
      });
  } catch (error) {
    console.error("Error creating contact inquiry:", error);
    // Distinguish between validation errors and server errors
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: "Invalid request" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// GET all contact inquiries (for admin dashboard)
// Protected endpoint - requires authentication
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const filter: { status?: string } = {};
    if (req.query.status) {
      const status = req.query.status as string;
      if (!validContactStatuses.includes(status as typeof validContactStatuses[number])) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validContactStatuses.join(", ")}`,
        });
      }
      filter.status = status;
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
    if ('status' in req.body) {
      // Validate status against allowed values (including empty strings)
      if (!validContactStatuses.includes(req.body.status as typeof validContactStatuses[number])) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validContactStatuses.join(", ")}`,
        });
      }
      allowedUpdates.status = req.body.status;
      // Automatically mark as read when status changes (cannot be overridden)
      allowedUpdates.isRead = true;
    } else if (req.body.isRead !== undefined) {
      // Validate isRead is a boolean
      if (typeof req.body.isRead !== 'boolean') {
        return res.status(400).json({
          message: 'isRead must be a boolean value',
        });
      }
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
