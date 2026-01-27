import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CarForm from './CarForm';
import type { Car } from '../types';

describe('CarForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty form for creating new car', () => {
    render(<CarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/make/i)).toHaveValue('');
    expect(screen.getByLabelText(/model/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /create car/i })).toBeInTheDocument();
  });

  it('should render form with existing car data for editing', () => {
    const existingCar: Car = {
      _id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      mileage: 15000,
      color: 'Black',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      status: 'available',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    render(<CarForm car={existingCar} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/make/i)).toHaveValue('Toyota');
    expect(screen.getByLabelText(/model/i)).toHaveValue('Camry');
    expect(screen.getByRole('button', { name: /update car/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<CarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Honda' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Accord' } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2021' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '28000' } });
    fireEvent.change(screen.getByLabelText(/mileage/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'White' } });

    const submitButton = screen.getByRole('button', { name: /create car/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          make: 'Honda',
          model: 'Accord',
          year: 2021,
          price: 28000,
          mileage: 5000,
          color: 'White',
        })
      );
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<CarForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should display error message on submission failure', async () => {
    const mockError = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: 'Failed to create car',
        },
      },
    });

    render(<CarForm onSubmit={mockError} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Honda' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Accord' } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2021' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '28000' } });
    fireEvent.change(screen.getByLabelText(/mileage/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'White' } });

    const submitButton = screen.getByRole('button', { name: /create car/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create car')).toBeInTheDocument();
    });
  });

  it('should disable form inputs during submission', async () => {
    const mockPending = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<CarForm onSubmit={mockPending} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/make/i), { target: { value: 'Honda' } });
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'Accord' } });
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2021' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '28000' } });
    fireEvent.change(screen.getByLabelText(/mileage/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/color/i), { target: { value: 'White' } });

    const submitButton = screen.getByRole('button', { name: /create car/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/make/i)).toBeDisabled();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});
