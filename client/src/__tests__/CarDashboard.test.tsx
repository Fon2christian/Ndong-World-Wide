import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import CarDashboard from "../pages/CarDashboard";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const mockCars = [
  {
    _id: "1",
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    price: 35000,
    mileage: 15000,
    fuel: "petrol",
    transmission: "automatic",
    images: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    _id: "2",
    brand: "Honda",
    model: "Accord",
    year: 2021,
    price: 32000,
    mileage: 20000,
    fuel: "hybrid",
    transmission: "automatic",
    images: ["image1.jpg"],
    createdAt: "2024-01-02",
    updatedAt: "2024-01-02",
  },
];

describe("CarDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockCars });
  });

  it("should render the dashboard title", async () => {
    render(<CarDashboard />);

    expect(screen.getByText("Car Dashboard")).toBeInTheDocument();
  });

  it("should fetch and display cars on mount", async () => {
    render(<CarDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Camry (2022)")).toBeInTheDocument();
      expect(screen.getByText("Honda Accord (2021)")).toBeInTheDocument();
    });
  });

  it("should display car details", async () => {
    render(<CarDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Price: $35,000")).toBeInTheDocument();
      expect(screen.getByText("Mileage: 15,000 km")).toBeInTheDocument();
      expect(
        screen.getByText("Fuel: petrol, Transmission: automatic")
      ).toBeInTheDocument();
    });
  });

  it("should show Create New Car button", async () => {
    render(<CarDashboard />);

    expect(screen.getByText("Create New Car")).toBeInTheDocument();
  });

  it("should show the form when Create New Car is clicked", async () => {
    const user = userEvent.setup();
    render(<CarDashboard />);

    await user.click(screen.getByText("Create New Car"));

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should hide the form when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<CarDashboard />);

    await user.click(screen.getByText("Create New Car"));
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByText("Create New Car")).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("should have Edit and Delete buttons for each car", async () => {
    render(<CarDashboard />);

    await waitFor(() => {
      const editButtons = screen.getAllByText("Edit");
      const deleteButtons = screen.getAllByText("Delete");

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });

  it("should call delete API when Delete is clicked and confirmed", async () => {
    const user = userEvent.setup();
    mockedAxios.delete.mockResolvedValue({});

    render(<CarDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Camry (2022)")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining("/api/cars/1")
    );
  });

  it("should show form with car data when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<CarDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Camry (2022)")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("Edit");
    await user.click(editButtons[0]);

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should display car images when available", async () => {
    render(<CarDashboard />);

    await waitFor(() => {
      const images = screen.getAllByAltText("car");
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute("src", "image1.jpg");
    });
  });

  it("should handle fetch error gracefully", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<CarDashboard />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to fetch cars");
    });
  });

  it("should handle delete error gracefully", async () => {
    const user = userEvent.setup();
    mockedAxios.delete.mockRejectedValue(new Error("Delete failed"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<CarDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Camry (2022)")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to delete car");
    });
  });
});
