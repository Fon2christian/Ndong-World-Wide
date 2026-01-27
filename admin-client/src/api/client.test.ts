import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './client';

// Mock window.location
const mockLocation = {
  href: '',
};
delete (window as any).location;
window.location = mockLocation as any;

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    mockLocation.href = '';
    vi.clearAllMocks();
  });

  it('should add JWT token to request headers', () => {
    localStorage.setItem('admin_token', 'test-token');

    api.interceptors.request.handlers.forEach((handler) => {
      if (handler.fulfilled) {
        const config = { headers: {} } as any;
        const result = handler.fulfilled(config);
        expect(result.headers.Authorization).toBe('Bearer test-token');
      }
    });
  });

  it('should not add Authorization header when no token exists', () => {
    api.interceptors.request.handlers.forEach((handler) => {
      if (handler.fulfilled) {
        const config = { headers: {} } as any;
        const result = handler.fulfilled(config);
        expect(result.headers.Authorization).toBeUndefined();
      }
    });
  });

  it('should redirect to login on 401 error', async () => {
    localStorage.setItem('admin_token', 'test-token');

    for (const handler of api.interceptors.response.handlers) {
      if (handler.rejected) {
        const error = {
          response: { status: 401 },
        };

        try {
          await handler.rejected(error);
        } catch (e) {
          // Expected to reject
        }

        expect(localStorage.getItem('admin_token')).toBeNull();
        expect(mockLocation.href).toBe('/login');
      }
    }
  });

  it('should redirect to login on 403 error', async () => {
    localStorage.setItem('admin_token', 'test-token');

    for (const handler of api.interceptors.response.handlers) {
      if (handler.rejected) {
        const error = {
          response: { status: 403 },
        };

        try {
          await handler.rejected(error);
        } catch (e) {
          // Expected to reject
        }

        expect(localStorage.getItem('admin_token')).toBeNull();
        expect(mockLocation.href).toBe('/login');
      }
    }
  });
});
