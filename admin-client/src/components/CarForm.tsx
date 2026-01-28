import { useState, useEffect, type FormEvent } from 'react';
import { z } from 'zod';
import { compressImages } from '../utils/imageCompression';
import type { Car, CarFormData } from '../types';

// Zod schema for validation
const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0),
  mileage: z.number().min(0),
  fuel: z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
  transmission: z.enum(['automatic', 'manual']),
  images: z.array(z.string()),
  displayLocation: z.enum(['market', 'business', 'both']),
});

interface CarFormProps {
  car?: Car;
  onSubmit: (data: CarFormData) => Promise<void>;
  onCancel: () => void;
}

export default function CarForm({ car, onSubmit, onCancel }: CarFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    fuel: car?.fuel || 'petrol',
    transmission: car?.transmission || 'automatic',
    images: car?.images || [],
    displayLocation: car?.displayLocation || 'market',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync form state when car changes
  useEffect(() => {
    if (car) {
      setFormData({
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        fuel: car.fuel,
        transmission: car.transmission,
        images: car.images,
        displayLocation: car.displayLocation,
      });
    } else {
      setFormData({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        price: 0,
        mileage: 0,
        fuel: 'petrol',
        transmission: 'automatic',
        images: [],
        displayLocation: 'market',
      });
    }
  }, [car]);

  const handleChange = (field: keyof CarFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNumberChange = (field: keyof CarFormData, value: string) => {
    const parsed = field === 'year' || field === 'mileage' ? parseInt(value) : parseFloat(value);
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
    const result = carSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save car');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="form__error">{error}</div>}

      {/* Row 1: Brand & Model */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="brand">Brand *</label>
          <input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g. Toyota"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="model">Model *</label>
          <input
            id="model"
            name="model"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="e.g. Camry"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Row 2: Year & Price */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="year">Year *</label>
          <input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleNumberChange('year', e.target.value)}
            placeholder="e.g. 2023"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="price">Price (¥) *</label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value)}
            placeholder="e.g. 25000"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Row 3: Mileage */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="mileage">Mileage (km) *</label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => handleNumberChange('mileage', e.target.value)}
            placeholder="e.g. 50000"
            className="form__input"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {/* Row 4: Fuel & Transmission */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="fuel">Fuel Type *</label>
          <select
            id="fuel"
            name="fuel"
            value={formData.fuel}
            onChange={(e) => handleChange('fuel', e.target.value)}
            className="form__select"
            disabled={isSubmitting}
            required
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="transmission">Transmission *</label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={(e) => handleChange('transmission', e.target.value)}
            className="form__select"
            disabled={isSubmitting}
            required
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Row 5: Display Location */}
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

      {/* Row 6: Image Upload */}
      <div className="form__group">
        <label className="form__label" htmlFor="car-images">Car Images</label>
        <div className="form__file-upload">
          <input
            id="car-images"
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
          {isSubmitting ? 'Saving...' : car ? 'Update Car' : 'Upload Car'}
        </button>
      </div>
    </form>
  );
}
