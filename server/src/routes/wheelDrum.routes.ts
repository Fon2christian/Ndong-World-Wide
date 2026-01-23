import { Router } from "express";
import type { Request, Response } from "express";
import WheelDrum from "../models/WheelDrum.js";

const router = Router();

// CREATE wheel drum
router.post("/", async (req: Request, res: Response) => {
  try {
    const wheelDrum = await WheelDrum.create(req.body);
    res.status(201).json(wheelDrum);
  } catch (error) {
    res.status(400).json({ message: "Failed to create wheel drum", error });
  }
});

// GET all wheel drums
router.get("/", async (_req: Request, res: Response) => {
  const wheelDrums = await WheelDrum.find().sort({ createdAt: -1 });
  res.json(wheelDrums);
});

// GET single wheel drum
router.get("/:id", async (req: Request, res: Response) => {
  const wheelDrum = await WheelDrum.findById(req.params.id);
  if (!wheelDrum) return res.status(404).json({ message: "Wheel drum not found" });
  res.json(wheelDrum);
});

// DELETE wheel drum
router.delete("/:id", async (req: Request, res: Response) => {
  await WheelDrum.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// UPDATE wheel drum
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const wheelDrum = await WheelDrum.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(wheelDrum);
  } catch (err) {
    res.status(400).json({ message: "Failed to update wheel drum", error: err });
  }
});

export default router;
