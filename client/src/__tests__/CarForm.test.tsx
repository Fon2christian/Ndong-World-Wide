import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import CarForm from "../components/CreateCarForm";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("CarForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("should render all form inputs", () => {
    render(<CarForm />);

    expect(screen.getByPlaceholderText("Brand")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Model")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Year")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mileage")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Fuel")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Transmission")).toBeInTheDocument();
  });

  it("should show Create Car button for new car", () => {
    render(<CarForm />);

    expect(screen.getByText("Create Car")).toBeInTheDocument();
  });

  it("should show Update Car button when carId is provided", () => {
    render(<CarForm carId="123" />);

    expect(screen.getByText("Update Car")).toBeInTheDocument();
  });

  it("should populate form with initialData", () => {
    const initialData = {
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      price: 35000,
      mileage: 15000,
      fuel: "petrol",
      transmission: "automatic",
      images: [],
    };

    render(<CarForm initialData={initialData} />);

    expect(screen.getByPlaceholderText("Brand")).toHaveValue("Toyota");
    expect(screen.getByPlaceholderText("Model")).toHaveValue("Camry");
    expect(screen.getByPlaceholderText("Year")).toHaveValue(2022);
    expect(screen.getByPlaceholderText("Price")).toHaveValue(35000);
    expect(screen.getByPlaceholderText("Mileage")).toHaveValue(15000);
    expect(screen.getByPlaceholderText("Fuel")).toHaveValue("petrol");
    expect(screen.getByPlaceholderText("Transmission")).toHaveValue(
      "automatic"
    );
  });

  it("should update form values on input change", async () => {
    const user = userEvent.setup();
    render(<CarForm />);

    const brandInput = screen.getByPlaceholderText("Brand");
    await user.type(brandInput, "Toyota");

    expect(brandInput).toHaveValue("Toyota");
  });

  it("should show validation error for empty required fields", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert");
    render(<CarForm />);

    await user.click(screen.getByText("Create Car"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("Validation error"));
    });
  });

  it("should call POST endpoint when creating a new car", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ data: { _id: "123" } });
    const onSaved = vi.fn();

    render(<CarForm onSaved={onSaved} />);

    await user.type(screen.getByPlaceholderText("Brand"), "Toyota");
    await user.type(screen.getByPlaceholderText("Model"), "Camry");
    await user.clear(screen.getByPlaceholderText("Year"));
    await user.type(screen.getByPlaceholderText("Year"), "2022");
    await user.clear(screen.getByPlaceholderText("Price"));
    await user.type(screen.getByPlaceholderText("Price"), "35000");
    await user.clear(screen.getByPlaceholderText("Mileage"));
    await user.type(screen.getByPlaceholderText("Mileage"), "15000");
    await user.type(screen.getByPlaceholderText("Fuel"), "petrol");
    await user.type(screen.getByPlaceholderText("Transmission"), "automatic");

    await user.click(screen.getByText("Create Car"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/cars"),
        expect.objectContaining({
          brand: "Toyota",
          model: "Camry",
          year: 2022,
        })
      );
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it("should call PUT endpoint when updating an existing car", async () => {
    const user = userEvent.setup();
    mockedAxios.put.mockResolvedValue({ data: { _id: "123" } });
    const onSaved = vi.fn();

    const initialData = {
      brand: "Toyota",
      model: "Camry",
      year: 2022,
      price: 35000,
      mileage: 15000,
      fuel: "petrol",
      transmission: "automatic",
      images: [],
    };

    render(<CarForm carId="123" initialData={initialData} onSaved={onSaved} />);

    await user.clear(screen.getByPlaceholderText("Brand"));
    await user.type(screen.getByPlaceholderText("Brand"), "Honda");

    await user.click(screen.getByText("Update Car"));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining("/api/cars/123"),
        expect.objectContaining({
          brand: "Honda",
        })
      );
      expect(onSaved).toHaveBeenCalled();
    });
  });

  it("should reset form after successful submission", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ data: { _id: "123" } });

    render(<CarForm />);

    await user.type(screen.getByPlaceholderText("Brand"), "Toyota");
    await user.type(screen.getByPlaceholderText("Model"), "Camry");
    await user.clear(screen.getByPlaceholderText("Year"));
    await user.type(screen.getByPlaceholderText("Year"), "2022");
    await user.clear(screen.getByPlaceholderText("Price"));
    await user.type(screen.getByPlaceholderText("Price"), "35000");
    await user.clear(screen.getByPlaceholderText("Mileage"));
    await user.type(screen.getByPlaceholderText("Mileage"), "15000");
    await user.type(screen.getByPlaceholderText("Fuel"), "petrol");
    await user.type(screen.getByPlaceholderText("Transmission"), "automatic");

    await user.click(screen.getByText("Create Car"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Brand")).toHaveValue("");
      expect(screen.getByPlaceholderText("Model")).toHaveValue("");
    });
  });

  it("should handle submission error gracefully", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValue(new Error("Server error"));
    const alertSpy = vi.spyOn(window, "alert");

    render(<CarForm />);

    await user.type(screen.getByPlaceholderText("Brand"), "Toyota");
    await user.type(screen.getByPlaceholderText("Model"), "Camry");
    await user.clear(screen.getByPlaceholderText("Year"));
    await user.type(screen.getByPlaceholderText("Year"), "2022");
    await user.clear(screen.getByPlaceholderText("Price"));
    await user.type(screen.getByPlaceholderText("Price"), "35000");
    await user.clear(screen.getByPlaceholderText("Mileage"));
    await user.type(screen.getByPlaceholderText("Mileage"), "15000");
    await user.type(screen.getByPlaceholderText("Fuel"), "petrol");
    await user.type(screen.getByPlaceholderText("Transmission"), "automatic");

    await user.click(screen.getByText("Create Car"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to save car. Check server logs."
      );
    });
  });

  it("should have file input for images", () => {
    render(<CarForm />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("multiple");
  });
});
