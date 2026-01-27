import { useState, FormEvent } from 'react';
import type { Tire, TireFormData } from '../types';

interface TireFormProps {
  tire?: Tire;
  onSubmit: (data: TireFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TireForm({ tire, onSubmit, onCancel }: TireFormProps) {
  const [formData, setFormData] = useState<TireFormData>({
    brand: tire?.brand || '',
    model: tire?.model || '',
    size: tire?.size || '',
    price: tire?.price || 0,
    quantity: tire?.quantity || 0,
    season: tire?.season || 'All Season',
    description: tire?.description || '',
    images: tire?.images || [],
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
      setError(err.response?.data?.message || 'Failed to save tire');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof TireFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="tire-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="brand">Brand *</label>
          <input
            id="brand"
            type="text"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
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
          <label htmlFor="size">Size *</label>
          <input
            id="size"
            type="text"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="e.g., 205/55R16"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="season">Season *</label>
          <select
            id="season"
            value={formData.season}
            onChange={(e) => handleChange('season', e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="All Season">All Season</option>
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
          </select>
        </div>
      </div>

      <div className="form-row">
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

        <div className="form-group">
          <label htmlFor="quantity">Quantity *</label>
          <input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>
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
          {isSubmitting ? 'Saving...' : tire ? 'Update Tire' : 'Create Tire'}
        </button>
      </div>
    </form>
  );
}
