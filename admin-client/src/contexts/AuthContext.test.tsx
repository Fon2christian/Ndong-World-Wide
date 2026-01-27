import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

function TestComponent() {
  const { admin, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="admin">{admin?.email || 'null'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('admin')).toHaveTextContent('null');
  });

  it('should verify stored token on mount', async () => {
    localStorage.setItem('admin_token', 'test-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('admin')).toHaveTextContent('admin@example.com');
    });
  });

  it('should handle login successfully', async () => {
    const mockResponse = {
      data: {
        token: 'new-token',
        admin: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(localStorage.getItem('admin_token')).toBe('new-token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('admin')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle logout', async () => {
    localStorage.setItem('admin_token', 'test-token');
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('admin')).toHaveTextContent('null');
    });
  });

  it('should remove invalid token on verification failure', async () => {
    localStorage.setItem('admin_token', 'invalid-token');
    mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});
