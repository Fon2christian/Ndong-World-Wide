import { api } from './client';
import type { Contact, PaginationParams, PaginatedResponse } from '../types';

export const contactsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Contact>> => {
    const response = await api.get<PaginatedResponse<Contact>>('/api/contact', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Contact> => {
    const response = await api.get<Contact>(`/api/contact/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: 'new' | 'in_progress' | 'resolved'): Promise<Contact> => {
    const response = await api.put<Contact>(`/api/contact/${id}`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/contact/${id}`);
  },
};
