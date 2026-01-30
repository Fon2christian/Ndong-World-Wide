import { api } from './client';
import type { Tire, TireFormData } from '../types';

export const tiresApi = {
  getAll: async (): Promise<Tire[]> => {
    const response = await api.get<Tire[]>('/api/tires');
    return response.data;
  },

  getById: async (id: string): Promise<Tire> => {
    const response = await api.get<Tire>(`/api/tires/${id}`);
    return response.data;
  },

  create: async (data: TireFormData): Promise<Tire> => {
    const response = await api.post<Tire>('/api/tires', data);
    return response.data;
  },

  update: async (id: string, data: Partial<TireFormData>): Promise<Tire> => {
    const response = await api.put<Tire>(`/api/tires/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/tires/${id}`);
  },
};
