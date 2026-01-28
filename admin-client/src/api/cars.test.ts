import { describe, it, expect, beforeEach, vi } from 'vitest';
import { carsApi } from './cars';
import { api } from './client';

vi.mock('./client');
const mockedApi = vi.mocked(api, true);

describe('Cars API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all cars', async () => {
    const mockCars = [
      {
        _id: '1',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 25000,
        mileage: 15000,
        fuel: 'petrol' as const,
        transmission: 'automatic' as const,
        images: [],
        displayLocation: 'market' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];

    mockedApi.get.mockResolvedValueOnce({ data: mockCars });

    const result = await carsApi.getAll();
    expect(result).toEqual(mockCars);
    expect(mockedApi.get).toHaveBeenCalledWith('/api/cars');
  });

  it('should fetch car by id', async () => {
    const mockCar = {
      _id: '1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      mileage: 15000,
      fuel: 'petrol' as const,
      transmission: 'automatic' as const,
      images: [],
      displayLocation: 'market' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    mockedApi.get.mockResolvedValueOnce({ data: mockCar });

    const result = await carsApi.getById('1');
    expect(result).toEqual(mockCar);
    expect(mockedApi.get).toHaveBeenCalledWith('/api/cars/1');
  });

  it('should create a new car', async () => {
    const carData = {
      brand: 'Honda',
      model: 'Accord',
      year: 2021,
      price: 28000,
      mileage: 5000,
      fuel: 'petrol' as const,
      transmission: 'automatic' as const,
      images: [],
      displayLocation: 'market' as const,
    };

    const mockResponse = { ...carData, _id: '2', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
    mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await carsApi.create(carData);
    expect(result).toEqual(mockResponse);
    expect(mockedApi.post).toHaveBeenCalledWith('/api/cars', carData);
  });

  it('should update a car', async () => {
    const updateData = { price: 27000 };
    const mockResponse = {
      _id: '1',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 27000,
      mileage: 15000,
      fuel: 'petrol' as const,
      transmission: 'automatic' as const,
      images: [],
      displayLocation: 'market' as const,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    };

    mockedApi.put.mockResolvedValueOnce({ data: mockResponse });

    const result = await carsApi.update('1', updateData);
    expect(result).toEqual(mockResponse);
    expect(mockedApi.put).toHaveBeenCalledWith('/api/cars/1', updateData);
  });

  it('should delete a car', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    await carsApi.delete('1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/cars/1');
  });

  // Error scenario tests
  it('should handle errors when fetching all cars fails', async () => {
    const error = new Error('Network error');
    mockedApi.get.mockRejectedValueOnce(error);

    await expect(carsApi.getAll()).rejects.toThrow('Network error');
    expect(mockedApi.get).toHaveBeenCalledWith('/api/cars');
  });

  it('should handle errors when fetching car by id fails', async () => {
    const error = new Error('Car not found');
    mockedApi.get.mockRejectedValueOnce(error);

    await expect(carsApi.getById('999')).rejects.toThrow('Car not found');
    expect(mockedApi.get).toHaveBeenCalledWith('/api/cars/999');
  });

  it('should handle errors when creating a car fails', async () => {
    const carData = {
      brand: 'Honda',
      model: 'Accord',
      year: 2021,
      price: 28000,
      mileage: 5000,
      fuel: 'petrol' as const,
      transmission: 'automatic' as const,
      images: [],
      displayLocation: 'market' as const,
    };
    const error = new Error('Validation failed');
    mockedApi.post.mockRejectedValueOnce(error);

    await expect(carsApi.create(carData)).rejects.toThrow('Validation failed');
    expect(mockedApi.post).toHaveBeenCalledWith('/api/cars', carData);
  });

  it('should handle errors when updating a car fails', async () => {
    const updateData = { price: 27000 };
    const error = new Error('Unauthorized');
    mockedApi.put.mockRejectedValueOnce(error);

    await expect(carsApi.update('1', updateData)).rejects.toThrow('Unauthorized');
    expect(mockedApi.put).toHaveBeenCalledWith('/api/cars/1', updateData);
  });

  it('should handle errors when deleting a car fails', async () => {
    const error = new Error('Car not found');
    mockedApi.delete.mockRejectedValueOnce(error);

    await expect(carsApi.delete('999')).rejects.toThrow('Car not found');
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/cars/999');
  });
});
