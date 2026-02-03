import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ForgotPassword from './ForgotPassword';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('should render forgot password form', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should display validation error for empty email', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should display validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it('should submit form with valid email', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/forgot-password'),
        { email: 'admin@test.com' }
      );
    });
  });

  it('should display success message after submission', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument();
    });

    // Form should be hidden, success message shown
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });
  });

  it('should display rate limit error', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 429,
        data: { message: 'Too many requests. Please try again later.' },
      },
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });
  });

  it('should display generic error for other failures', async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it('should have link back to login', () => {
    renderComponent();

    const loginLink = screen.getByRole('link', { name: /back to login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should allow resubmission after error', async () => {
    const user = userEvent.setup();
    mockedAxios.post
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Error' } },
      })
      .mockResolvedValueOnce({
        data: { message: 'Success' },
      });

    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'admin@test.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    // First submission - fails
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    // Second submission - succeeds
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/reset link has been sent/i)).toBeInTheDocument();
    });
  });
});
