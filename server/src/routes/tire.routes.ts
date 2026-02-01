import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import Tire from "../models/Tire.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidObjectId, validDisplayLocations, validTireConditions } from "../utils/validation.js";

const router = Router();

// Validation schemas
const tireSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  size: z.string().min(1, "Size is required"),
  price: z.number().positive("Price must be positive"),
  condition: z.enum(["new", "used"]),
  images: z.array(z.string()).default([]),
  displayLocation: z.enum(["market", "business", "both"]).default("market"),
});

const updateTireSchema = tireSchema
  .omit({ images: true, displayLocation: true })
  .partial()
  .extend({
    images: z.array(z.string()).optional(),
    displayLocation: z.enum(["market", "business", "both"]).optional(),
  });

// CREATE tire (protected)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const validation = tireSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const tire = await Tire.create(validation.data);
    res.status(201).json(tire);
  } catch (error) {
    console.error("Failed to create tire:", error);
    // Distinguish between Mongoose validation errors and server errors
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// GET all tires (with optional condition and displayLocation filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { condition?: string; displayLocation?: { $in: string[] } } = {};
    if (req.query.condition) {
      // Handle array query params
      const condition = Array.isArray(req.query.condition)
        ? req.query.condition[0]
        : req.query.condition;

      if (typeof condition !== "string" || !validTireConditions.includes(condition as typeof validTireConditions[number])) {
        return res.status(400).json({
          message: `Invalid condition. Must be one of: ${validTireConditions.join(", ")}`,
        });
      }
      filter.condition = condition;
    }
    if (req.query.location) {
      // Handle array query params
      const location = Array.isArray(req.query.location)
        ? req.query.location[0]
        : req.query.location;

      if (typeof location !== "string" || !validDisplayLocations.includes(location as typeof validDisplayLocations[number])) {
        return res.status(400).json({
          message: `Invalid location. Must be one of: ${validDisplayLocations.join(", ")}`,
        });
      }
      // Match items that are set to this location OR "both"
      filter.displayLocation = { $in: [location, "both"] };
    }
    const tires = await Tire.find(filter).sort({ createdAt: -1 }).lean();
    res.json(tires);
  } catch (error) {
    console.error("Failed to fetch tires:", error);
    res.status(500).json({ message: "Failed to fetch tires" });
  }
});

// GET single tire
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid tire ID format" });
    }
    const tire = await Tire.findById(id).lean();
    if (!tire) return res.status(404).json({ message: "Tire not found" });
    res.json(tire);
  } catch (error) {
    console.error("Failed to fetch tire:", error);
    res.status(500).json({ message: "Failed to fetch tire" });
  }
});

// DELETE tire (protected)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid tire ID format" });
    }
    const tire = await Tire.findByIdAndDelete(id);
    if (!tire) {
      return res.status(404).json({ message: "Tire not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete tire:", error);
    res.status(500).json({ message: "Failed to delete tire" });
  }
});

// UPDATE tire (protected)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid tire ID format" });
    }
    const validation = updateTireSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const tire = await Tire.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );
    if (!tire) {
      return res.status(404).json({ message: "Tire not found" });
    }
    res.json(tire);
  } catch (error) {
    console.error("Failed to update tire:", error);
    // Distinguish between Mongoose validation errors and server errors
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

export default router;
