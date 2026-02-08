import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import CarForm from '../components/CarForm';
import { carsApi } from '../api/cars';
import type { Car, CarFormData } from '../types';

export default function Cars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | undefined>(undefined);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setIsLoading(true);
      const data = await carsApi.getAll();
      setCars(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CarFormData) => {
    setError(''); // Clear stale error before mutation
    try {
      await carsApi.create(data);
      setShowForm(false);
      fetchCars();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create car');
      throw err; // Re-throw so form can handle it
    }
  };

  const handleUpdate = async (data: CarFormData) => {
    if (!editingCar) return;
    setError(''); // Clear stale error before mutation
    try {
      await carsApi.update(editingCar._id, data);
      setShowForm(false);
      setEditingCar(undefined);
      fetchCars();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update car');
      throw err; // Re-throw so form can handle it
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    try {
      await carsApi.delete(id);
      fetchCars();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete car');
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCar(undefined);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Cars Management</h1>
          <p>Manage your car inventory</p>
        </div>
        {!showForm && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Upload New Car
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editingCar ? 'Edit Car' : 'Upload New Car'}
          </h2>
          <CarForm
            car={editingCar}
            onSubmit={editingCar ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cars...</p>
        </div>
      ) : cars.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No cars found. Click "Upload New Car" to create your first listing.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Brand & Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Mileage</th>
                <th>Transmission</th>
                <th>Fuel</th>
                <th>Display Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td>
                    <strong>{car.brand && car.model ? `${car.brand} ${car.model}` : car.brand || car.model || '-'}</strong>
                  </td>
                  <td>{car.year ?? '-'}</td>
                  <td>{car.price != null ? `¥${car.price.toLocaleString()}` : '-'}</td>
                  <td>{car.mileage != null ? `${car.mileage.toLocaleString()} km` : '-'}</td>
                  <td className="capitalize">{car.transmission || '-'}</td>
                  <td className="capitalize">{car.fuel || '-'}</td>
                  <td className="capitalize">{car.displayLocation}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        onClick={() => handleEdit(car)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(car._id)}
                        className="btn-icon btn-delete"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
