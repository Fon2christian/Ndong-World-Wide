import { useState, useEffect, type FormEvent } from 'react';
import { z } from 'zod';
import { compressImages } from '../utils/imageCompression';
import type { Tire, TireFormData } from '../types';

// Dynamic Zod schema based on display location
const getTireSchema = (displayLocation: 'market' | 'business' | 'both') => {
  const isBusinessOnly = displayLocation === 'business';

  return z.object({
    brand: isBusinessOnly ? z.string().min(1, 'Brand must not be empty').optional() : z.string().min(1, 'Brand is required'),
    size: isBusinessOnly ? z.string().min(1, 'Size must not be empty').optional() : z.string().min(1, 'Size is required'),
    price: isBusinessOnly ? z.number().min(0, 'Price cannot be negative').optional() : z.number().min(0),
    condition: z.enum(['new', 'used']).optional(),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    displayLocation: z.enum(['market', 'business', 'both']),
  });
};

interface TireFormProps {
  tire?: Tire;
  onSubmit: (data: TireFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TireForm({ tire, onSubmit, onCancel }: TireFormProps) {
  const [formData, setFormData] = useState<TireFormData>({
    brand: tire?.brand || '',
    size: tire?.size || '',
    price: tire?.price || 0,
    condition: tire?.condition || 'new',
    images: tire?.images || [],
    displayLocation: tire?.displayLocation || 'market',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when tire changes
  useEffect(() => {
    if (tire) {
      setFormData({
        brand: tire.brand,
        size: tire.size,
        price: tire.price,
        condition: tire.condition,
        images: tire.images,
        displayLocation: tire.displayLocation,
      });
    } else {
      setFormData({
        brand: '',
        size: '',
        price: 0,
        condition: 'new',
        images: [],
        displayLocation: 'market',
      });
    }
  }, [tire]);

  const handleChange = (field: keyof TireFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNumberChange = (field: keyof TireFormData, value: string) => {
    const parsed = parseFloat(value);
    setFormData({ ...formData, [field]: isNaN(parsed) ? 0 : parsed });
  };

  // Handle image file upload - compresses and adds to existing images
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    try {
      const compressedImages = await compressImages(files);
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...compressedImages] }));
    } catch (error) {
      console.error('Error compressing images:', error);
      setError('Failed to process images. Please try again.');
    }
  };

  // Remove a specific image
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form using dynamic Zod schema
    const tireSchema = getTireSchema(formData.displayLocation);
    const result = tireSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save tire');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if fields are required based on display location
  const isBusinessOnly = formData.displayLocation === 'business';
  const fieldsRequired = !isBusinessOnly;

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form__error">{error}</div>}

      {/* Display Location - Show first so user can set it before filling fields */}
      <div className="form__group">
        <label className="form__label" htmlFor="displayLocation">Display Location *</label>
        <select
          id="displayLocation"
          name="displayLocation"
          value={formData.displayLocation}
          onChange={(e) => handleChange('displayLocation', e.target.value)}
          className="form__select"
          disabled={isSubmitting}
          required
        >
          <option value="market">Market Only</option>
          <option value="business">Business Only (Images Only)</option>
          <option value="both">Both Market & Business</option>
        </select>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {isBusinessOnly
            ? '📸 Business Only: Only images are required. Other fields are optional.'
            : '📋 Market/Both: All fields are required for customer listings.'}
        </p>
      </div>

      {/* Row 1: Brand & Size */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="brand">Brand {fieldsRequired && '*'}</label>
          <input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g. Bridgestone"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="size">Size {fieldsRequired && '*'}</label>
          <input
            id="size"
            name="size"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="e.g. 205/55R16"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
      </div>

      {/* Row 2: Price & Condition */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="price">Price (¥) {fieldsRequired && '*'}</label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value)}
            placeholder="e.g. 150"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="condition">Condition {fieldsRequired && '*'}</label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            className="form__select"
            disabled={isSubmitting}
            required={fieldsRequired}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>
      </div>

      {/* Row 3: Image Upload */}
      <div className="form__group">
        <label className="form__label" htmlFor="tire-images">Tire Images *</label>
        <div className="form__file-upload">
          <input
            id="tire-images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          <p className="form__file-upload-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="form__file-upload-text">PNG, JPG up to 10MB</p>
        </div>

        {/* Image Preview */}
        {formData.images.length > 0 && (
          <div className="form__image-preview">
            {formData.images.map((img, i) => (
              <div key={i} className="form__image-preview-item">
                <img src={img} alt={`Preview ${i + 1}`} />
                <button
                  type="button"
                  className="form__image-remove"
                  onClick={() => handleRemoveImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                  disabled={isSubmitting}
                >
                  ×
                </button>
                <span className="form__image-number">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {formData.images.length > 0 && (
          <p className="form__image-count">{formData.images.length} image(s) selected</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : tire ? 'Update Tire' : 'Upload Tire'}
        </button>
      </div>
    </form>
  );
}
