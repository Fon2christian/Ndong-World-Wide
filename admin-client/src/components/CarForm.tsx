import { useState, FormEvent } from 'react';
import type { Car, CarFormData } from '../types';

interface CarFormProps {
  car?: Car;
  onSubmit: (data: CarFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CarForm({ car, onSubmit, onCancel }: CarFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    make: car?.make || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    color: car?.color || '',
    transmission: car?.transmission || 'Automatic',
    fuelType: car?.fuelType || 'Petrol',
    description: car?.description || '',
    images: car?.images || [],
    status: car?.status || 'available',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save car');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CarFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="car-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="make">Make *</label>
          <input
            id="make"
            type="text"
            value={formData.make}
            onChange={(e) => handleChange('make', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            id="model"
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year *</label>
          <input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            min="1900"
            max={new Date().getFullYear() + 1}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (¥) *</label>
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mileage">Mileage (km) *</label>
          <input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => handleChange('mileage', parseInt(e.target.value))}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="color">Color *</label>
          <input
            id="color"
            type="text"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="transmission">Transmission *</label>
          <select
            id="transmission"
            value={formData.transmission}
            onChange={(e) => handleChange('transmission', e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fuelType">Fuel Type *</label>
          <select
            id="fuelType"
            value={formData.fuelType}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as 'available' | 'sold' | 'pending')}
          required
          disabled={isSubmitting}
        >
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : car ? 'Update Car' : 'Create Car'}
        </button>
      </div>
    </form>
  );
}
