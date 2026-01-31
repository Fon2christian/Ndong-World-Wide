import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { TOKEN_KEY } from '../contexts/AuthContext';

describe('API Client', () => {
  const mockLocation = { href: '' };

  beforeEach(() => {
    localStorage.clear();
    mockLocation.href = '';
    vi.clearAllMocks();
    vi.stubGlobal('location', mockLocation);
    // Reset modules to clear the isRedirecting guard between tests
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should add JWT token to request headers', async () => {
    const { api } = await import('./client');
    const mock = new MockAdapter(api);

    localStorage.setItem(TOKEN_KEY, 'test-token');

    let capturedHeaders: Record<string, string> = {};
    mock.onGet('/test').reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, { success: true }];
    });

    await api.get('/test');

    expect(capturedHeaders.Authorization).toBe('Bearer test-token');
    mock.restore();
  });

  it('should not add Authorization header when no token exists', async () => {
    const { api } = await import('./client');
    const mock = new MockAdapter(api);

    let capturedHeaders: Record<string, string> = {};
    mock.onGet('/test').reply((config) => {
      capturedHeaders = config.headers as Record<string, string>;
      return [200, { success: true }];
    });

    await api.get('/test');

    expect(capturedHeaders.Authorization).toBeUndefined();
    mock.restore();
  });

  it('should redirect to login on 401 error', async () => {
    const { api } = await import('./client');
    const mock = new MockAdapter(api);

    localStorage.setItem(TOKEN_KEY, 'test-token');
    mock.onGet('/test').reply(401);

    try {
      await api.get('/test');
    } catch {
      // Expected to throw
    }

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(mockLocation.href).toBe('/login');
    mock.restore();
  });

  it('should redirect to login on 403 error', async () => {
    const { api } = await import('./client');
    const mock = new MockAdapter(api);

    localStorage.setItem(TOKEN_KEY, 'test-token');
    mock.onGet('/test').reply(403);

    try {
      await api.get('/test');
    } catch {
      // Expected to throw
    }

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(mockLocation.href).toBe('/login');
    mock.restore();
  });
});
