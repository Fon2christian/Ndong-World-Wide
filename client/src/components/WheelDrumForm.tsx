import { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { compressImages } from "../utils/imageCompression";

const wheelDrumSchema = z.object({
  brand: z.string().min(1),
  size: z.string().min(1),
  price: z.number().min(0),
  condition: z.string().min(1),
  images: z.array(z.string()),
  displayLocation: z.enum(["market", "business", "both"]),
});

interface WheelDrumFormData {
  brand: string;
  size: string;
  price: number;
  condition: string;
  images: string[];
  displayLocation: "market" | "business" | "both";
}

interface WheelDrumFormProps {
  initialData?: WheelDrumFormData;
  wheelDrumId?: string;
  onSaved?: () => void;
}

export default function WheelDrumForm({ initialData, wheelDrumId, onSaved }: WheelDrumFormProps) {
  const [form, setForm] = useState<WheelDrumFormData>(
    initialData || {
      brand: "",
      size: "",
      price: 0,
      condition: "",
      images: [],
      displayLocation: "market",
    }
  );

  // Sync form state when initialData changes (e.g., switching to edit a different wheel drum)
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        brand: "",
        size: "",
        price: 0,
        condition: "",
        images: [],
        displayLocation: "market",
      });
    }
  }, [initialData, wheelDrumId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // Handle image file upload - compresses and adds to existing images
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    try {
      const compressedImages = await compressImages(files);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...compressedImages] }));
    } catch (error) {
      console.error("Error compressing images:", error);
      alert("Failed to process images. Please try again.");
    }
  };

  // Remove a specific image
  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = wheelDrumSchema.safeParse(form);
    if (!result.success) {
      alert(
        "Validation error: " +
          JSON.stringify(
            result.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }))
          )
      );
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
      };

      let res;
      if (wheelDrumId) {
        res = await axios.put(`${import.meta.env.VITE_API_URL}/api/wheel-drums/${wheelDrumId}`, payload);
        alert("Wheel Drum updated! ID: " + res.data._id);
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/wheel-drums`, payload);
        alert("Wheel Drum created! ID: " + res.data._id);
      }

      setForm({
        brand: "",
        size: "",
        price: 0,
        condition: "",
        images: [],
        displayLocation: "market",
      });

      onSaved?.();
    } catch (err) {
      console.error("Error saving wheel drum:", err);
      alert("Failed to save wheel drum. Check server logs.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {/* Row 1: Brand & Size */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="brand">Brand</label>
          <input
            id="brand"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="e.g. BPW"
            className="form__input"
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="size">Size</label>
          <input
            id="size"
            name="size"
            value={form.size}
            onChange={handleChange}
            placeholder="e.g. 10 hole"
            className="form__input"
          />
        </div>
      </div>

      {/* Row 2: Price & Condition */}
      <div className="form__row">
        <div className="form__group">
          <label className="form__label" htmlFor="price">Price (¥)</label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 200"
            className="form__input"
          />
        </div>
        <div className="form__group">
          <label className="form__label" htmlFor="condition">Condition</label>
          <input
            id="condition"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            placeholder="e.g. Good, Excellent"
            className="form__input"
          />
        </div>
      </div>

      {/* Row 3: Display Location */}
      <div className="form__group">
        <label className="form__label" htmlFor="displayLocation">Display Location</label>
        <select
          id="displayLocation"
          name="displayLocation"
          value={form.displayLocation}
          onChange={handleChange}
          className="form__select"
        >
          <option value="market">Market Only</option>
          <option value="business">Business Only</option>
          <option value="both">Both Market & Business</option>
        </select>
      </div>

      {/* Row 4: Image Upload */}
      <div className="form__group">
        <label className="form__label">Wheel Drum Images</label>
        <div className="form__file-upload">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <p className="form__file-upload-text">
            <strong>Click to upload</strong> or drag and drop
          </p>
          <p className="form__file-upload-text">PNG, JPG up to 10MB</p>
        </div>

        {form.images.length > 0 && (
          <div className="form__image-preview">
            {form.images.map((img, i) => (
              <div key={i} className="form__image-preview-item">
                <img src={img} alt={`Preview ${i + 1}`} />
                <button
                  type="button"
                  className="form__image-remove"
                  onClick={() => handleRemoveImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                >
                  ×
                </button>
                <span className="form__image-number">{i + 1}</span>
              </div>
            ))}
          </div>
        )}
        {form.images.length > 0 && (
          <p className="form__image-count">{form.images.length} image(s) selected</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary">
          {wheelDrumId ? "Update Wheel Drum" : "Create Wheel Drum"}
        </button>
      </div>
    </form>
  );
}
