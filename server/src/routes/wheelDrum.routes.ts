import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import WheelDrum from "../models/WheelDrum.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Validation schemas
const wheelDrumSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  size: z.string().min(1, "Size is required"),
  price: z.number().positive("Price must be positive"),
  condition: z.string().min(1, "Condition is required"),
  images: z.array(z.string()).default([]),
  displayLocation: z.enum(["market", "business", "both"]).default("market"),
});

const updateWheelDrumSchema = wheelDrumSchema.partial();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE wheel drum
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const validation = wheelDrumSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const wheelDrum = await WheelDrum.create(validation.data);
    res.status(201).json(wheelDrum);
  } catch (error) {
    res.status(400).json({ message: "Failed to create wheel drum", error });
  }
});

// GET all wheel drums (with optional displayLocation filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { displayLocation?: { $in: string[] } } = {};
    if (req.query.location) {
      const location = req.query.location as string;
      // Validate against allowed values
      const validLocations = ["market", "business", "both"];
      if (!validLocations.includes(location)) {
        return res.status(400).json({ message: "Invalid location filter. Must be 'market', 'business', or 'both'" });
      }
      // Match items that are set to this location OR "both"
      filter.displayLocation = { $in: [location, "both"] };
    }
    const wheelDrums = await WheelDrum.find(filter).sort({ createdAt: -1 });
    res.json(wheelDrums);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wheel drums", error });
  }
});

// GET single wheel drum
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid wheel drum ID format" });
    }
    const wheelDrum = await WheelDrum.findById(id);
    if (!wheelDrum) return res.status(404).json({ message: "Wheel drum not found" });
    res.json(wheelDrum);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch wheel drum", error });
  }
});

// DELETE wheel drum
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid wheel drum ID format" });
    }
    const wheelDrum = await WheelDrum.findByIdAndDelete(id);
    if (!wheelDrum) {
      return res.status(404).json({ message: "Wheel drum not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete wheel drum", error });
  }
});

// UPDATE wheel drum
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid wheel drum ID format" });
    }
    const validation = updateWheelDrumSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const wheelDrum = await WheelDrum.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );
    if (!wheelDrum) {
      return res.status(404).json({ message: "Wheel drum not found" });
    }
    res.json(wheelDrum);
  } catch (err) {
    res.status(400).json({ message: "Failed to update wheel drum", error: err });
  }
});

export default router;
