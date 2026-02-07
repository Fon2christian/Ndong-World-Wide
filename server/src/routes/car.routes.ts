import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import Car from "../models/Car.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidObjectId, validDisplayLocations } from "../utils/validation.js";

const router = Router();

// Dynamic Zod schema based on display location
const getCarSchema = (displayLocation: 'market' | 'business' | 'both') => {
  const isBusinessOnly = displayLocation === 'business';

  return z.object({
    brand: isBusinessOnly ? z.string().optional() : z.string().min(1, 'Brand is required'),
    model: isBusinessOnly ? z.string().optional() : z.string().min(1, 'Model is required'),
    year: isBusinessOnly ? z.number().optional() : z.number().int().min(1900).refine(
      (year) => year <= new Date().getFullYear() + 1,
      { message: `Year must not exceed ${new Date().getFullYear() + 1}` }
    ),
    price: isBusinessOnly ? z.number().optional() : z.number().positive("Price must be positive"),
    mileage: isBusinessOnly ? z.number().optional() : z.number().nonnegative("Mileage must be non-negative"),
    fuel: isBusinessOnly ? z.enum(["petrol", "diesel", "hybrid", "electric"]).optional() : z.enum(["petrol", "diesel", "hybrid", "electric"]),
    transmission: isBusinessOnly ? z.enum(["automatic", "manual"]).optional() : z.enum(["automatic", "manual"]),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    displayLocation: z.enum(["market", "business", "both"]),
  });
};

// Static schema for backward compatibility (uses market validation)
const carSchema = getCarSchema('market');

const updateCarSchema = carSchema
  .omit({ images: true, displayLocation: true })
  .partial()
  .extend({
    images: z.array(z.string()).optional(),
    displayLocation: z.enum(["market", "business", "both"]).optional(),
  });

// CREATE car (protected)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    // Use dynamic schema based on displayLocation
    const displayLocation = req.body.displayLocation || 'market';
    const schema = getCarSchema(displayLocation);
    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const car = await Car.create(validation.data);
    res.status(201).json(car);
  } catch (error) {
    console.error("Failed to create car:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET all cars (with optional displayLocation filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { displayLocation?: { $in: string[] } } = {};
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
    const cars = await Car.find(filter).sort({ createdAt: -1 }).lean();
    res.json(cars);
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
});

// GET single car
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    const car = await Car.findById(id).lean();
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (error) {
    console.error("Failed to fetch car:", error);
    res.status(500).json({ message: "Failed to fetch car" });
  }
});

// DELETE car (protected)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete car:", error);
    res.status(500).json({ message: "Failed to delete car" });
  }
});

// UPDATE car (protected)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid car ID format" });
    }
    const validation = updateCarSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.issues
      });
    }
    const car = await Car.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error("Failed to update car:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
