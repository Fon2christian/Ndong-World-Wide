import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { vi, type Mocked } from 'vitest';
import ResetPassword from './ResetPassword';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('token=validtoken123')],
  };
});

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    );
  };

  it('should validate token on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });

    renderComponent();

    expect(screen.getByText(/validating/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/reset-password/validtoken123')
      );
    });
  });

  it('should display form when token is valid', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  it('should display error when token is invalid', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: false, message: 'Invalid or expired token' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /request new reset link/i })).toBeInTheDocument();
    });
  });

  it('should display error when token is expired', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Invalid or expired reset token' },
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
    });
  });

  it('should validate password minimum length', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    await user.type(passwordInput, 'short');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('should validate password confirmation matches', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'differentpassword');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('should submit password reset successfully', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'Password successfully reset' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/reset-password'),
        {
          token: 'validtoken123',
          newPassword: 'newpassword123',
        }
      );
    });
  });

  it('should redirect to login after successful reset', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: 'Password successfully reset' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });
    mockedAxios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/resetting/i)).toBeInTheDocument();
    });
  });

  it('should display error when reset fails', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Invalid or expired token' },
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmInput, 'newpassword123');

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
    });
  });

  it('should show password visibility toggle', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: true, email: 'admin@test.com' },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/new password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];
    await user.click(toggleButton);

    expect(passwordInput.type).toBe('text');
  });

  it('should have link to request new reset', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { valid: false, message: 'Invalid token' },
    });

    renderComponent();

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /request new reset link/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/forgot-password');
    });
  });
});
