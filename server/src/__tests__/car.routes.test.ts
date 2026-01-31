import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Car from "../models/Car.js";

const validCar = {
  brand: "Toyota",
  model: "Camry",
  year: 2022,
  price: 35000,
  mileage: 15000,
  fuel: "petrol",
  transmission: "automatic",
  images: [],
};

describe("Car Routes", () => {
  describe("POST /api/cars", () => {
    it("should create a new car", async () => {
      const res = await request(app).post("/api/cars").send(validCar);

      expect(res.status).toBe(201);
      expect(res.body.brand).toBe("Toyota");
      expect(res.body.model).toBe("Camry");
      expect(res.body._id).toBeDefined();
    });

    it("should return 400 for invalid car data", async () => {
      const res = await request(app).post("/api/cars").send({ brand: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Failed to create car");
    });
  });

  describe("GET /api/cars", () => {
    it("should return empty array when no cars exist", async () => {
      const res = await request(app).get("/api/cars");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all cars sorted by createdAt desc", async () => {
      await Car.create({ ...validCar, brand: "Honda" });
      await Car.create({ ...validCar, brand: "Toyota" });

      const res = await request(app).get("/api/cars");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].brand).toBe("Toyota");
      expect(res.body[1].brand).toBe("Honda");
    });
  });

  describe("GET /api/cars/:id", () => {
    it("should return a car by id", async () => {
      const car = await Car.create(validCar);

      const res = await request(app).get(`/api/cars/${car._id}`);

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Toyota");
    });

    it("should return 404 for non-existent car", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/api/cars/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Car not found");
    });
  });

  describe("PUT /api/cars/:id", () => {
    it("should update a car", async () => {
      const car = await Car.create(validCar);

      const res = await request(app)
        .put(`/api/cars/${car._id}`)
        .send({ brand: "Honda", model: "Accord" });

      expect(res.status).toBe(200);
      expect(res.body.brand).toBe("Honda");
      expect(res.body.model).toBe("Accord");
    });

    it("should return 404 when updating non-existent car", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const res = await request(app)
        .put(`/api/cars/${fakeId}`)
        .send({ brand: "Honda" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Car not found");
    });
  });

  describe("DELETE /api/cars/:id", () => {
    it("should delete a car", async () => {
      const car = await Car.create(validCar);

      const res = await request(app).delete(`/api/cars/${car._id}`);

      expect(res.status).toBe(204);

      const deletedCar = await Car.findById(car._id);
      expect(deletedCar).toBeNull();
    });
  });
});
