import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import carRoutes from "./routes/car.routes.js";
import tireRoutes from "./routes/tire.routes.js";
import wheelDrumRoutes from "./routes/wheelDrum.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.use("/api/cars", carRoutes);
app.use("/api/tires", tireRoutes);
app.use("/api/wheel-drums", wheelDrumRoutes);

export default app;
