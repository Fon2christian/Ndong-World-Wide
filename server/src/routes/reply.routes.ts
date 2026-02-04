import { Router } from "express";
import type { Request, Response } from "express";
import Reply from "../models/Reply.js";
import Contact from "../models/Contact.js";
import Admin from "../models/Admin.js";
import { sendReplyEmail } from "../services/emailService.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { isValidObjectId } from "../utils/validation.js";

const router = Router();

// Helper function to validate reply input
function validateReplyInput(body: any): { valid: boolean; error?: string } {
  // Guard against null/undefined and non-object types
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { subject, message } = body;

  // Check required fields exist and are strings
  if (!subject || typeof subject !== 'string' || !message || typeof message !== 'string') {
    return { valid: false, error: "Subject and message are required" };
  }

  // Validate field lengths
  if (subject.length > 200) {
    return { valid: false, error: "Subject must be less than 200 characters" };
  }
  if (message.length > 5000) {
    return { valid: false, error: "Message must be less than 5000 characters" };
  }

  return { valid: true };
}

// GET replies for a contact
router.get("/:contactId/replies", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    // Validate contactId
    if (!isValidObjectId(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Fetch replies, sorted by sentAt descending (newest first)
    // Limit to 20 per page for now (pagination can be added later)
    const replies = await Reply.find({ contactId })
      .sort({ sentAt: -1 })
      .limit(20);

    return res.json({ replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return res.status(500).json({ message: "Failed to fetch replies" });
  }
});

// CREATE reply to a contact
router.post("/:contactId/replies", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    // Validate contactId
    if (!isValidObjectId(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }

    // Validate input
    const validation = validateReplyInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    // Verify contact exists
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Extract admin info from JWT token (set by requireAuth middleware)
    if (!req.admin) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Fetch full admin document to get name
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Whitelist only allowed fields
    const replyData = {
      contactId,
      adminId: admin._id,
      adminName: admin.name,
      adminEmail: admin.email,
      subject: req.body.subject,
      message: req.body.message,
      emailStatus: "sending" as const,
    };

    // Create reply
    const reply = await Reply.create(replyData);

    // Update contact fields: lastReplyAt and replyCount
    await Contact.findByIdAndUpdate(
      contactId,
      {
        lastReplyAt: new Date(),
        $inc: { replyCount: 1 },
        // Auto-change status to in_progress as per user preference
        status: "in_progress",
      },
      { new: true }
    );

    // Send email asynchronously (don't block response)
    sendReplyEmail({
      customerEmail: contact.email,
      customerName: contact.name,
      subject: reply.subject,
      message: reply.message,
      adminName: reply.adminName,
      replyId: reply._id.toString(),
    })
      .then(async () => {
        // Update email status to sent
        await Reply.findByIdAndUpdate(reply._id, { emailStatus: "sent" });
        console.log(`Reply email sent successfully (Reply ID: ${reply._id})`);
      })
      .catch(async (error) => {
        // Update email status to failed
        await Reply.findByIdAndUpdate(reply._id, {
          emailStatus: "failed",
          errorMessage: error.message || "Failed to send email",
        });
        console.error(`Failed to send reply email (Reply ID: ${reply._id}):`, error);
      });

    // Return created reply immediately
    return res.status(201).json(reply);
  } catch (error) {
    console.error("Error creating reply:", error);
    return res.status(500).json({ message: "Failed to create reply" });
  }
});

export default router;
