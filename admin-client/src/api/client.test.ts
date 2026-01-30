import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './client';
import { TOKEN_KEY } from '../contexts/AuthContext';

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
    localStorage.setItem(TOKEN_KEY, 'test-token');

    let handlerTested = false;
    api.interceptors.request.handlers.forEach((handler) => {
      if (handler.fulfilled) {
        const config = { headers: {} } as any;
        const result = handler.fulfilled(config);
        expect(result.headers.Authorization).toBe('Bearer test-token');
        handlerTested = true;
      }
    });
    expect(handlerTested).toBe(true); // Ensure at least one handler was tested
  });

  it('should not add Authorization header when no token exists', () => {
    let handlerTested = false;
    api.interceptors.request.handlers.forEach((handler) => {
      if (handler.fulfilled) {
        const config = { headers: {} } as any;
        const result = handler.fulfilled(config);
        expect(result.headers.Authorization).toBeUndefined();
        handlerTested = true;
      }
    });
    expect(handlerTested).toBe(true); // Ensure at least one handler was tested
  });

  it('should redirect to login on 401 error', async () => {
    localStorage.setItem(TOKEN_KEY, 'test-token');

    let handlerTested = false;
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

        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(mockLocation.href).toBe('/login');
        handlerTested = true;
      }
    }
    expect(handlerTested).toBe(true); // Ensure at least one handler was tested
  });

  it('should redirect to login on 403 error', async () => {
    localStorage.setItem(TOKEN_KEY, 'test-token');

    let handlerTested = false;
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

        expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
        expect(mockLocation.href).toBe('/login');
        handlerTested = true;
      }
    }
    expect(handlerTested).toBe(true); // Ensure at least one handler was tested
  });
});
