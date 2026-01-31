import { api } from './client';
import type { Car, CarFormData } from '../types';

export const carsApi = {
  getAll: async (): Promise<Car[]> => {
    const response = await api.get<Car[]>('/api/cars');
    return response.data;
  },

  getById: async (id: string): Promise<Car> => {
    const response = await api.get<Car>(`/api/cars/${id}`);
    return response.data;
  },

  create: async (data: CarFormData): Promise<Car> => {
    const response = await api.post<Car>('/api/cars', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CarFormData>): Promise<Car> => {
    const response = await api.put<Car>(`/api/cars/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/cars/${id}`);
  },
};
