import { Router } from "express";
import type { Request, Response } from "express";
import Tire from "../models/Tire.js";
import { requireAuth } from "../middleware/auth.js";
import { isValidObjectId, validDisplayLocations } from "../utils/validation.js";

const router = Router();

// CREATE tire (protected)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const tire = await Tire.create(req.body);
    res.status(201).json(tire);
  } catch (error) {
    console.error("Failed to create tire:", error);
    res.status(400).json({ message: "Failed to create tire" });
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
    const tires = await Tire.find(filter).sort({ createdAt: -1 });
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
    const tire = await Tire.findById(id);
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
    const tire = await Tire.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tire) {
      return res.status(404).json({ message: "Tire not found" });
    }
    res.json(tire);
  } catch (error) {
    console.error("Failed to update tire:", error);
    res.status(400).json({ message: "Failed to update tire" });
  }
});

export default router;
