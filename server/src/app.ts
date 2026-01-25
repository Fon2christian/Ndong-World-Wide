import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import carRoutes from "./routes/car.routes.js";
import tireRoutes from "./routes/tire.routes.js";
import wheelDrumRoutes from "./routes/wheelDrum.routes.js";

const app = express();

app.use(cors());

// Rate limiting to prevent DoS attacks
// Allows 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all API routes
app.use("/api/", limiter);

// Body size limit calculation:
// - Images compressed to 1200x1200px at 0.8 quality ≈ 200-500KB
// - Base64 encoding adds ~33% overhead ≈ 300-700KB per image
// - Supporting up to ~15-20 images per request
// - 20MB limit provides safety margin while allowing multiple image uploads
// For larger file handling, consider implementing multipart/form-data with streaming
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK" });
});

app.use("/api/cars", carRoutes);
app.use("/api/tires", tireRoutes);
app.use("/api/wheel-drums", wheelDrumRoutes);

export default app;
