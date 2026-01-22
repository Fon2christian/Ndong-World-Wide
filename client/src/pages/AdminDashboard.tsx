import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CarForm from "../components/CreateCarForm";

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
}

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cars`);
      setCars(res.data);
    } catch (err) {
      console.error("Failed to fetch cars:", err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/cars/${id}`);
      fetchCars();
    } catch (err) {
      console.error("Failed to delete car:", err);
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingCar(null);
    fetchCars();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your car inventory</p>
        </div>
        <div className="admin-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => {
              setEditingCar(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add New Car"}
          </button>
          <button className="btn btn--secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-panel">
          <div className="form-panel__header">
            <h2 className="form-panel__title">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h2>
          </div>
          <div className="form-panel__body">
            <CarForm
              initialData={
                editingCar
                  ? {
                      brand: editingCar.brand,
                      model: editingCar.model,
                      year: editingCar.year,
                      price: editingCar.price,
                      mileage: editingCar.mileage,
                      fuel: editingCar.fuel,
                      transmission: editingCar.transmission,
                      images: editingCar.images,
                    }
                  : undefined
              }
              carId={editingCar?._id}
              onSaved={handleSaved}
            />
          </div>
        </div>
      )}

      <div className="admin-stats">
        <div className="stat-badge">
          <span>Total Cars</span>
          <span className="stat-badge__value">{cars.length}</span>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Brand</th>
              <th>Model</th>
              <th>Year</th>
              <th>Price</th>
              <th>Mileage</th>
              <th>Fuel</th>
              <th>Transmission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id}>
                <td>
                  {car.images.length > 0 ? (
                    <img
                      src={car.images[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="admin-table__image"
                    />
                  ) : (
                    <div className="admin-table__no-image">No image</div>
                  )}
                </td>
                <td>{car.brand}</td>
                <td>{car.model}</td>
                <td>{car.year}</td>
                <td>${car.price.toLocaleString()}</td>
                <td>{car.mileage.toLocaleString()} km</td>
                <td className="capitalize">{car.fuel}</td>
                <td className="capitalize">{car.transmission}</td>
                <td>
                  <div className="admin-table__actions">
                    <button
                      className="btn btn--small btn--warning"
                      onClick={() => handleEdit(car)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(car._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cars.length === 0 && (
          <div className="admin-table__empty">
            <p>No cars in inventory. Add your first car!</p>
          </div>
        )}
      </div>
    </div>
  );
}
