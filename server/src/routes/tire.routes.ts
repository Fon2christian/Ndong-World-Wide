import { Router } from "express";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import Tire from "../models/Tire.js";

const router = Router();

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE tire
router.post("/", async (req: Request, res: Response) => {
  try {
    const tire = await Tire.create(req.body);
    res.status(201).json(tire);
  } catch (error) {
    res.status(400).json({ message: "Failed to create tire", error });
  }
});

// GET all tires (with optional condition and displayLocation filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: { condition?: string; displayLocation?: { $in: string[] } } = {};
    if (req.query.condition) {
      filter.condition = req.query.condition as string;
    }
    if (req.query.location) {
      const location = req.query.location as string;
      // Match items that are set to this location OR "both"
      filter.displayLocation = { $in: [location, "both"] };
    }
    const tires = await Tire.find(filter).sort({ createdAt: -1 });
    res.json(tires);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tires", error });
  }
});

// GET single tire
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid tire ID format" });
    }
    const tire = await Tire.findById(id);
    if (!tire) return res.status(404).json({ message: "Tire not found" });
    res.json(tire);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tire", error });
  }
});

// DELETE tire
router.delete("/:id", async (req: Request, res: Response) => {
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
    res.status(500).json({ message: "Failed to delete tire", error });
  }
});

// UPDATE tire
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid tire ID format" });
    }
    const tire = await Tire.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tire) {
      return res.status(404).json({ message: "Tire not found" });
    }
    res.json(tire);
  } catch (err) {
    res.status(400).json({ message: "Failed to update tire", error: err });
  }
});

export default router;
