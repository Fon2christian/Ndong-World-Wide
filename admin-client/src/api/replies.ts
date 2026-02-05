import { api } from './client';
import type { Reply, ReplyFormData } from '../types';

export const repliesApi = {
  getByContactId: async (contactId: string): Promise<Reply[]> => {
    const response = await api.get<{ replies: Reply[] }>(
      `/api/contacts/${contactId}/replies`
    );
    return response.data.replies;
  },

  create: async (contactId: string, data: ReplyFormData): Promise<Reply> => {
    const response = await api.post<Reply>(
      `/api/contacts/${contactId}/replies`,
      data
    );
    return response.data;
  },
};
