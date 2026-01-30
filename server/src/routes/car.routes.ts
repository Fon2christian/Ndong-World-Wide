import { Router } from "express";
import type { Request, Response } from "express";
import Car from "../models/Car.js";

const router = Router();

// CREATE car
router.post("/", async (req: Request, res: Response) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: "Failed to create car", error });
  }
});

// GET all cars
router.get("/", async (_req: Request, res: Response) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  res.json(cars);
});

// GET single car
router.get("/:id", async (req: Request, res: Response) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: "Car not found" });
  res.json(car);
});

// DELETE car
router.delete("/:id", async (req: Request, res: Response) => {
  await Car.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// UPDATE car
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: "Failed to update car", error: err });
  }
});

export default router;
