import { api } from './client';
import type { WheelDrum, WheelDrumFormData } from '../types';

export const wheelDrumsApi = {
  getAll: async (): Promise<WheelDrum[]> => {
    const response = await api.get<WheelDrum[]>('/api/wheel-drums');
    return response.data;
  },

  getById: async (id: string): Promise<WheelDrum> => {
    const response = await api.get<WheelDrum>(`/api/wheel-drums/${id}`);
    return response.data;
  },

  create: async (data: WheelDrumFormData): Promise<WheelDrum> => {
    const response = await api.post<WheelDrum>('/api/wheel-drums', data);
    return response.data;
  },

  update: async (id: string, data: Partial<WheelDrumFormData>): Promise<WheelDrum> => {
    const response = await api.put<WheelDrum>(`/api/wheel-drums/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/wheel-drums/${id}`);
  },
};
