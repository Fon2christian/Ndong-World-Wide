import { Router } from "express";
import type { Request, Response } from "express";
import Tire from "../models/Tire.js";

const router = Router();

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
});

// GET single tire
router.get("/:id", async (req: Request, res: Response) => {
  const tire = await Tire.findById(req.params.id);
  if (!tire) return res.status(404).json({ message: "Tire not found" });
  res.json(tire);
});

// DELETE tire
router.delete("/:id", async (req: Request, res: Response) => {
  await Tire.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// UPDATE tire
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const tire = await Tire.findByIdAndUpdate(
      req.params.id,
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
