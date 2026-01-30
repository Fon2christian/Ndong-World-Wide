// client/src/components/CarForm.tsx
import { useState } from "react";
import axios from "axios";
import { z } from "zod";

// Zod schema for validation
const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear()),
  price: z.number().min(0),
  mileage: z.number().min(0),
  fuel: z.string().min(1),
  transmission: z.string().min(1),
  images: z.array(z.string()),
});

// Car form type
interface CarForm {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
}

interface CarFormProps {
  initialData?: CarForm;
  carId?: string; // pass this for editing
  onSaved?: () => void; // callback after create/update
}

export default function CarForm({ initialData, carId, onSaved }: CarFormProps) {
  const [form, setForm] = useState<CarForm>(
    initialData || {
      brand: "",
      model: "",
      year: 2020,
      price: 0,
      mileage: 0,
      fuel: "",
      transmission: "",
      images: [],
    }
  );

  // Handle text/number input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // Handle image file upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    ).then((base64Images) => setForm({ ...form, images: base64Images }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using Zod
    const result = carSchema.safeParse(form);
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
      // Ensure number fields are numbers
      const payload = {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
      };

      const url = carId
      ? `${import.meta.env.VITE_API_URL}/api/cars/${carId}`
      : `${import.meta.env.VITE_API_URL}/api/cars`;
    console.log("Submitting to:", url);
    console.log("Payload:", payload);

      let res;
      if (carId) {
        // Update existing car
        res = await axios.put(`${import.meta.env.VITE_API_URL}/api/cars/${carId}`, payload);
        alert("Car updated! ID: " + res.data._id);
      } else {
        // Create new car
        res = await axios.post(`${import.meta.env.VITE_API_URL}/api/cars`, payload);
        alert("Car created! ID: " + res.data._id);
      }

      // Reset form
      setForm({
        brand: "",
        model: "",
        year: 2020,
        price: 0,
        mileage: 0,
        fuel: "",
        transmission: "",
        images: [],
      });

      // Notify parent to refresh list
      onSaved?.();
    } catch (err) {
      console.error("Error saving car:", err);
      alert("Failed to save car. Check server logs.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" />
      <input name="model" value={form.model} onChange={handleChange} placeholder="Model" />
      <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Year" />
      <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" />
      <input name="mileage" type="number" value={form.mileage} onChange={handleChange} placeholder="Mileage" />
      <input name="fuel" value={form.fuel} onChange={handleChange} placeholder="Fuel" />
      <input name="transmission" value={form.transmission} onChange={handleChange} placeholder="Transmission" />
      <input type="file" multiple onChange={handleImageChange} />
      <button type="submit">{carId ? "Update Car" : "Create Car"}</button>
    </form>
  );
}
