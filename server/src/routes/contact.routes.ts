import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { sendContactEmail } from "../services/emailService.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE contact inquiry
router.post("/", async (req: Request, res: Response) => {
  try {
    // Create contact in database
    const contact = await Contact.create(req.body);

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
// TODO: Add authentication middleware to protect this endpoint
// This endpoint exposes sensitive customer data (names, emails, phone numbers)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { status?: string } = {};
    if (req.query.status) {
      filter.status = req.query.status as string;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
// TODO: Add authentication middleware to protect this endpoint
router.get("/:id", async (req: Request, res: Response) => {
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
// TODO: Add authentication middleware to protect this endpoint
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }

    // Whitelist only updatable fields to prevent modification of sensitive data
    const allowedUpdates: Partial<{ status: string }> = {};
    if (req.body.status) {
      allowedUpdates.status = req.body.status;
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
// TODO: Add authentication middleware to protect this endpoint
router.delete("/:id", async (req: Request, res: Response) => {
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
