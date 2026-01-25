import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Car from "../models/Car.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE car
router.post("/", async (req: Request, res: Response) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: "Failed to create car", error });
  }
});

// GET all cars (with optional displayLocation filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { displayLocation?: { $in: string[] } } = {};
    if (req.query.location) {
      const location = req.query.location as string;
      // Match items that are set to this location OR "both"
      filter.displayLocation = { $in: [location, "both"] };
    }
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars", error });
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
    res.status(500).json({ message: "Failed to fetch car", error });
  }
});

// DELETE car
router.delete("/:id", async (req: Request, res: Response) => {
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
    res.status(500).json({ message: "Failed to delete car", error });
  }
});

// UPDATE car
router.put("/:id", async (req: Request, res: Response) => {
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
  } catch (err) {
    res.status(400).json({ message: "Failed to update car", error: err });
  }
});

export default router;
