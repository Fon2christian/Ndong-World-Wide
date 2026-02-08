import { useState, useEffect, type FormEvent } from 'react';
import { z } from 'zod';
import { compressImages } from '../utils/imageCompression';
import type { Car, CarFormData } from '../types';

// Dynamic Zod schema based on display location
const getCarSchema = (displayLocation: 'market' | 'business' | 'both') => {
  const isBusinessOnly = displayLocation === 'business';

  return z.object({
    // For business-only: accept any value (including empty/default) or undefined
    brand: isBusinessOnly ? z.string().optional() : z.string().min(1, 'Brand is required'),
    model: isBusinessOnly ? z.string().optional() : z.string().min(1, 'Model is required'),
    year: isBusinessOnly ? z.number().optional() : z.number().min(1900).max(new Date().getFullYear() + 1),
    price: isBusinessOnly ? z.number().optional() : z.number().min(0),
    mileage: isBusinessOnly ? z.number().optional() : z.number().min(0),
    fuel: isBusinessOnly ? z.enum(['petrol', 'diesel', 'hybrid', 'electric']).optional() : z.enum(['petrol', 'diesel', 'hybrid', 'electric']),
    transmission: isBusinessOnly ? z.enum(['automatic', 'manual']).optional() : z.enum(['automatic', 'manual']),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    displayLocation: z.enum(['market', 'business', 'both']),
  });
};

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
    if (!e.target.files || e.target.files.length === 0) return;

    // Capture files immediately before any async operations
    const files = Array.from(e.target.files);
    const fileCount = files.length;

    // Reset the input to allow selecting the same files again
    e.target.value = '';

    try {
      const compressedImages = await compressImages(files);
      if (compressedImages.length < fileCount) {
        console.warn(`Only ${compressedImages.length} of ${fileCount} images were processed successfully`);
      }
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

    // Preprocess data: convert empty/default values to undefined for optional fields
    const isBusinessOnly = formData.displayLocation === 'business';
    const dataToValidate = isBusinessOnly ? {
      ...formData,
      brand: formData.brand === '' ? undefined : formData.brand,
      model: formData.model === '' ? undefined : formData.model,
      year: formData.year === 0 ? undefined : formData.year,
      price: formData.price === 0 ? undefined : formData.price,
      mileage: formData.mileage === 0 ? undefined : formData.mileage,
    } : formData;

    // Validate form using dynamic Zod schema
    const carSchema = getCarSchema(formData.displayLocation);
    const result = carSchema.safeParse(dataToValidate);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(`${firstError.path.join('.')}: ${firstError.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save car');
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

      {/* Row 1: Brand & Model */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="brand">Brand {fieldsRequired && '*'}</label>
          <input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g. Toyota"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="model">Model {fieldsRequired && '*'}</label>
          <input
            id="model"
            name="model"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="e.g. Camry"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
      </div>

      {/* Row 2: Year & Price */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="year">Year {fieldsRequired && '*'}</label>
          <input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleNumberChange('year', e.target.value)}
            placeholder="e.g. 2023"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="price">Price (¥) {fieldsRequired && '*'}</label>
          <input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleNumberChange('price', e.target.value)}
            placeholder="e.g. 25000"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
      </div>

      {/* Row 3: Mileage */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="mileage">Mileage (km) {fieldsRequired && '*'}</label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => handleNumberChange('mileage', e.target.value)}
            placeholder="e.g. 50000"
            className="form__input"
            disabled={isSubmitting}
            required={fieldsRequired}
          />
        </div>
      </div>

      {/* Row 4: Fuel & Transmission */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="fuel">Fuel Type {fieldsRequired && '*'}</label>
          <select
            id="fuel"
            name="fuel"
            value={formData.fuel}
            onChange={(e) => handleChange('fuel', e.target.value)}
            className="form__select"
            disabled={isSubmitting}
            required={fieldsRequired}
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="transmission">Transmission {fieldsRequired && '*'}</label>
          <select
            id="transmission"
            name="transmission"
            value={formData.transmission}
            onChange={(e) => handleChange('transmission', e.target.value)}
            className="form__select"
            disabled={isSubmitting}
            required={fieldsRequired}
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Row 5: Image Upload */}
      <div className="form__group">
        <label className="form__label" htmlFor="car-images">Car Images *</label>
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
