import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Valid location values for filtering
const validLocations = ["market", "business", "both"];

// CREATE car (protected)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (error) {
    console.error("Failed to create car:", error);
    res.status(400).json({ message: "Failed to create car" });
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

      if (typeof location !== "string" || !validLocations.includes(location)) {
        return res.status(400).json({
          message: `Invalid location. Must be one of: ${validLocations.join(", ")}`,
        });
      }
      // Match items that are set to this location OR "both"
      filter.displayLocation = { $in: [location, "both"] };
    }
    const cars = await Car.find(filter).sort({ createdAt: -1 });
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
    const car = await Car.findById(id);
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
    const car = await Car.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error("Failed to update car:", error);
    res.status(400).json({ message: "Failed to update car" });
  }
});

export default router;
