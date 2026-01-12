import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import carRoutes from "./routes/car.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.use("/api/cars", carRoutes);

export default app;
