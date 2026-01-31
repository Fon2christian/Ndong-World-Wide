import { describe, it, expect } from "vitest";
import Car from "../models/Car.js";

describe("Car Model", () => {
  const validCar = {
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    price: 35000,
    mileage: 15000,
    fuel: "petrol" as const,
    transmission: "automatic" as const,
    images: ["image1.jpg", "image2.jpg"],
  };

  describe("validation", () => {
    it("should create a car with valid data", async () => {
      const car = await Car.create(validCar);

      expect(car.brand).toBe("Toyota");
      expect(car.model).toBe("Camry");
      expect(car.year).toBe(2022);
      expect(car.price).toBe(35000);
      expect(car.mileage).toBe(15000);
      expect(car.fuel).toBe("petrol");
      expect(car.transmission).toBe("automatic");
      expect(car.images).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should fail without required brand", async () => {
      const { brand: _, ...carWithoutBrand } = validCar;

      await expect(Car.create(carWithoutBrand)).rejects.toThrow();
    });

    it("should fail without required model", async () => {
      const { model: _, ...carWithoutModel } = validCar;

      await expect(Car.create(carWithoutModel)).rejects.toThrow();
    });

    it("should fail without required year", async () => {
      const { year: _, ...carWithoutYear } = validCar;

      await expect(Car.create(carWithoutYear)).rejects.toThrow();
    });

    it("should fail without required price", async () => {
      const { price: _, ...carWithoutPrice } = validCar;

      await expect(Car.create(carWithoutPrice)).rejects.toThrow();
    });

    it("should fail without required mileage", async () => {
      const { mileage: _, ...carWithoutMileage } = validCar;

      await expect(Car.create(carWithoutMileage)).rejects.toThrow();
    });

    it("should fail without required fuel", async () => {
      const { fuel: _, ...carWithoutFuel } = validCar;

      await expect(Car.create(carWithoutFuel)).rejects.toThrow();
    });

    it("should fail without required transmission", async () => {
      const { transmission: _, ...carWithoutTransmission } = validCar;

      await expect(Car.create(carWithoutTransmission)).rejects.toThrow();
    });

    it("should fail with invalid fuel type", async () => {
      await expect(
        Car.create({ ...validCar, fuel: "invalid" })
      ).rejects.toThrow();
    });

    it("should fail with invalid transmission type", async () => {
      await expect(
        Car.create({ ...validCar, transmission: "invalid" })
      ).rejects.toThrow();
    });

    it("should accept all valid fuel types", async () => {
      const fuelTypes = ["petrol", "diesel", "hybrid", "electric"] as const;

      for (const fuel of fuelTypes) {
        const car = await Car.create({ ...validCar, fuel });
        expect(car.fuel).toBe(fuel);
        await Car.deleteOne({ _id: car._id });
      }
    });

    it("should accept all valid transmission types", async () => {
      const transmissionTypes = ["automatic", "manual"] as const;

      for (const transmission of transmissionTypes) {
        const car = await Car.create({ ...validCar, transmission });
        expect(car.transmission).toBe(transmission);
        await Car.deleteOne({ _id: car._id });
      }
    });
  });

  describe("timestamps", () => {
    it("should add createdAt and updatedAt timestamps", async () => {
      const car = await Car.create(validCar);

      expect(car).toHaveProperty("createdAt");
      expect(car).toHaveProperty("updatedAt");
    });
  });

  describe("images default", () => {
    it("should default images to empty array", async () => {
      const { images: _, ...carWithoutImages } = validCar;
      const car = await Car.create(carWithoutImages);

      expect(car.images).toEqual([]);
    });
  });
});
