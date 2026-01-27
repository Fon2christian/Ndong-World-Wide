import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TireForm from '../components/TireForm';
import { tiresApi } from '../api/tires';
import type { Tire, TireFormData } from '../types';

export default function Tires() {
  const [tires, setTires] = useState<Tire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTire, setEditingTire] = useState<Tire | undefined>(undefined);

  useEffect(() => {
    fetchTires();
  }, []);

  const fetchTires = async () => {
    try {
      setIsLoading(true);
      const data = await tiresApi.getAll();
      setTires(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tires');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: TireFormData) => {
    await tiresApi.create(data);
    setShowForm(false);
    fetchTires();
  };

  const handleUpdate = async (data: TireFormData) => {
    if (!editingTire) return;
    await tiresApi.update(editingTire._id, data);
    setShowForm(false);
    setEditingTire(undefined);
    fetchTires();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tire?')) return;
    try {
      await tiresApi.delete(id);
      fetchTires();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tire');
    }
  };

  const handleEdit = (tire: Tire) => {
    setEditingTire(tire);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTire(undefined);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Tires Management</h1>
          <p>Manage your tire inventory</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add New Tire
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editingTire ? 'Edit Tire' : 'Add New Tire'}
          </h2>
          <TireForm
            tire={editingTire}
            onSubmit={editingTire ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading tires...</p>
        </div>
      ) : tires.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No tires found. Click "Add New Tire" to create your first listing.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Brand & Model</th>
                <th>Size</th>
                <th>Season</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tires.map((tire) => (
                <tr key={tire._id}>
                  <td>
                    <strong>{tire.brand} {tire.model}</strong>
                  </td>
                  <td>{tire.size}</td>
                  <td>{tire.season}</td>
                  <td>¥{tire.price.toLocaleString()}</td>
                  <td>{tire.quantity}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(tire)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(tire._id)}
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
