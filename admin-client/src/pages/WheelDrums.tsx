import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import WheelDrumForm from '../components/WheelDrumForm';
import { wheelDrumsApi } from '../api/wheelDrums';
import type { WheelDrum, WheelDrumFormData } from '../types';

export default function WheelDrums() {
  const [wheelDrums, setWheelDrums] = useState<WheelDrum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWheelDrum, setEditingWheelDrum] = useState<WheelDrum | undefined>(undefined);

  useEffect(() => {
    fetchWheelDrums();
  }, []);

  const fetchWheelDrums = async () => {
    try {
      setIsLoading(true);
      const data = await wheelDrumsApi.getAll();
      setWheelDrums(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wheel drums');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: WheelDrumFormData) => {
    await wheelDrumsApi.create(data);
    setShowForm(false);
    fetchWheelDrums();
  };

  const handleUpdate = async (data: WheelDrumFormData) => {
    if (!editingWheelDrum) return;
    await wheelDrumsApi.update(editingWheelDrum._id, data);
    setShowForm(false);
    setEditingWheelDrum(undefined);
    fetchWheelDrums();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wheel drum?')) return;
    try {
      await wheelDrumsApi.delete(id);
      fetchWheelDrums();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete wheel drum');
    }
  };

  const handleEdit = (wheelDrum: WheelDrum) => {
    setEditingWheelDrum(wheelDrum);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingWheelDrum(undefined);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>Wheel Drums Management</h1>
          <p>Manage your wheel drum inventory</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Upload New Wheel Drum
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm ? (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editingWheelDrum ? 'Edit Wheel Drum' : 'Upload New Wheel Drum'}
          </h2>
          <WheelDrumForm
            wheelDrum={editingWheelDrum}
            onSubmit={editingWheelDrum ? handleUpdate : handleCreate}
            onCancel={handleCancel}
          />
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading wheel drums...</p>
        </div>
      ) : wheelDrums.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No wheel drums found. Click "Upload New Wheel Drum" to create your first listing.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Size</th>
                <th>Condition</th>
                <th>Price</th>
                <th>Display Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wheelDrums.map((wheelDrum) => (
                <tr key={wheelDrum._id}>
                  <td>
                    <strong>{wheelDrum.brand}</strong>
                  </td>
                  <td>{wheelDrum.size}</td>
                  <td className="capitalize">{wheelDrum.condition}</td>
                  <td>¥{wheelDrum.price.toLocaleString()}</td>
                  <td className="capitalize">{wheelDrum.displayLocation}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(wheelDrum)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(wheelDrum._id)}
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
