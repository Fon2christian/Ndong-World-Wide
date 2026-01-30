import { useEffect, useState } from "react";
import axios from "axios";
import CarForm from "../components/createCarForm";


interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CarDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
      setCars(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch cars");
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${id}`);
      setCars(cars.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete car");
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleFormSaved = () => {
    fetchCars();
    setEditingCar(null);
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Car Dashboard</h1>

      {showForm ? (
        <div className="border p-4 rounded">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingCar(null);
            }}
          >
            Cancel
          </button>
          <CarForm
            carId={editingCar?._id}
            initialData={editingCar ?? undefined}
            onSaved={handleFormSaved}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create New Car
        </button>
      )}

      <div className="space-y-2">
        {cars.map((car) => (
          <div key={car._id} className="border p-2 rounded flex gap-4 items-center">
            <div className="flex-1">
              <h2 className="font-bold">{car.brand} {car.model} ({car.year})</h2>
              <p>Price: ${car.price.toLocaleString()}</p>
              <p>Mileage: {car.mileage.toLocaleString()} km</p>
              <p>Fuel: {car.fuel}, Transmission: {car.transmission}</p>
              <div className="flex gap-2 mt-2">
                {car.images.map((img, i) => (
                  <img key={i} src={img} alt="car" className="w-24 h-16 object-cover rounded" />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdit(car)}
                className="bg-yellow-400 px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(car._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
