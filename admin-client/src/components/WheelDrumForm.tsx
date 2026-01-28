import { useState, useEffect, type FormEvent } from 'react';
import { z } from 'zod';
import { compressImages } from '../utils/imageCompression';
import type { WheelDrum, WheelDrumFormData } from '../types';

// Zod schema for validation
const wheelDrumSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  size: z.string().min(1, 'Size is required'),
  price: z.number().min(0),
  condition: z.string().min(1, 'Condition is required'),
  images: z.array(z.string()),
  displayLocation: z.enum(['market', 'business', 'both']),
});

interface WheelDrumFormProps {
  wheelDrum?: WheelDrum;
  onSubmit: (data: WheelDrumFormData) => Promise<void>;
  onCancel: () => void;
}

export default function WheelDrumForm({ wheelDrum, onSubmit, onCancel }: WheelDrumFormProps) {
  const [formData, setFormData] = useState<WheelDrumFormData>({
    brand: wheelDrum?.brand || '',
    size: wheelDrum?.size || '',
    price: wheelDrum?.price || 0,
    condition: wheelDrum?.condition || '',
    images: wheelDrum?.images || [],
    displayLocation: wheelDrum?.displayLocation || 'market',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when wheelDrum changes
  useEffect(() => {
    if (wheelDrum) {
      setFormData({
        brand: wheelDrum.brand,
        size: wheelDrum.size,
        price: wheelDrum.price,
        condition: wheelDrum.condition,
        images: wheelDrum.images,
        displayLocation: wheelDrum.displayLocation,
      });
    } else {
      setFormData({
        brand: '',
        size: '',
        price: 0,
        condition: '',
        images: [],
        displayLocation: 'market',
      });
    }
  }, [wheelDrum]);

  const handleChange = (field: keyof WheelDrumFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNumberChange = (field: keyof WheelDrumFormData, value: string) => {
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

    // Validate form using Zod
    const result = wheelDrumSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save wheel drum');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form__error">{error}</div>}

      {/* Row 1: Brand & Size */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="brand">Brand *</label>
          <input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g. BPW"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="size">Size *</label>
          <input
            id="size"
            name="size"
            value={formData.size}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="e.g. 10 hole"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Row 2: Price & Condition */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="price">Price (¥) *</label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value)}
            placeholder="e.g. 200"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="condition">Condition *</label>
          <input
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            placeholder="e.g. Good, Excellent"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Row 3: Display Location */}
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
          <option value="business">Business Only</option>
          <option value="both">Both Market & Business</option>
        </select>
      </div>

      {/* Row 4: Image Upload */}
      <div className="form__group">
        <label className="form__label" htmlFor="wheel-drum-images">Wheel Drum Images</label>
        <div className="form__file-upload">
          <input
            id="wheel-drum-images"
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
          {isSubmitting ? 'Saving...' : wheelDrum ? 'Update Wheel Drum' : 'Upload Wheel Drum'}
        </button>
      </div>
    </form>
  );
}
