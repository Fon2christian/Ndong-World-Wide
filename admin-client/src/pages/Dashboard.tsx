import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';

interface Stats {
  totalCars: number;
  availableCars: number;
  totalTires: number;
  totalWheelDrums: number;
  pendingContacts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/stats');
      setStats(response.data.stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the admin dashboard</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <h3>Total Cars</h3>
              <p className="stat-value">{stats?.totalCars || 0}</p>
              <p className="stat-subtitle">{stats?.availableCars || 0} available</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <h3>Total Tires</h3>
              <p className="stat-value">{stats?.totalTires || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔧</div>
            <div className="stat-content">
              <h3>Wheel Drums</h3>
              <p className="stat-value">{stats?.totalWheelDrums || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-content">
              <h3>New Contacts</h3>
              <p className="stat-value">{stats?.pendingContacts || 0}</p>
              <p className="stat-subtitle">Pending inquiries</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
