import { useState, FormEvent } from 'react';
import type { WheelDrum, WheelDrumFormData } from '../types';

interface WheelDrumFormProps {
  wheelDrum?: WheelDrum;
  onSubmit: (data: WheelDrumFormData) => Promise<void>;
  onCancel: () => void;
}

export default function WheelDrumForm({ wheelDrum, onSubmit, onCancel }: WheelDrumFormProps) {
  const [formData, setFormData] = useState<WheelDrumFormData>({
    brand: wheelDrum?.brand || '',
    model: wheelDrum?.model || '',
    size: wheelDrum?.size || '',
    price: wheelDrum?.price || 0,
    quantity: wheelDrum?.quantity || 0,
    material: wheelDrum?.material || 'Aluminum',
    description: wheelDrum?.description || '',
    images: wheelDrum?.images || [],
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
      setError(err.response?.data?.message || 'Failed to save wheel drum');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof WheelDrumFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="wheel-drum-form">
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
            placeholder="e.g., 17x7.5"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="material">Material *</label>
          <select
            id="material"
            value={formData.material}
            onChange={(e) => handleChange('material', e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="Aluminum">Aluminum</option>
            <option value="Steel">Steel</option>
            <option value="Carbon Fiber">Carbon Fiber</option>
            <option value="Alloy">Alloy</option>
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
          {isSubmitting ? 'Saving...' : wheelDrum ? 'Update Wheel Drum' : 'Create Wheel Drum'}
        </button>
      </div>
    </form>
  );
}
