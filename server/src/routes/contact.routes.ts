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
    res.status(400).json({ message: "Failed to create contact inquiry", error });
  }
});

// GET all contact inquiries (for admin dashboard)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { status?: string } = {};
    if (req.query.status) {
      filter.status = req.query.status as string;
    }
    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch contact inquiries", error });
  }
});

// GET single contact inquiry
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
    res.status(500).json({ message: "Failed to fetch contact inquiry", error });
  }
});

// UPDATE contact inquiry status (for admin to mark as resolved, etc.)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact ID format" });
    }
    const contact = await Contact.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!contact) {
      return res.status(404).json({ message: "Contact inquiry not found" });
    }
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: "Failed to update contact inquiry", error: err });
  }
});

// DELETE contact inquiry
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
    res.status(500).json({ message: "Failed to delete contact inquiry", error });
  }
});

export default router;
