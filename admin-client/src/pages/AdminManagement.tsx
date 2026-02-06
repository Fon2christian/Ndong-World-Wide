import { useState, useEffect, type FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Admin } from '../types';

interface CreateAdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AdminManagement() {
  const { admin: currentAdmin } = useAuth();
  const [formData, setFormData] = useState<CreateAdminFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoadingAdmins(true);
      console.log('Fetching admin list...');
      const response = await api.get('/api/admin/list');
      console.log('Admin list response:', response.data);
      console.log('Number of admins:', response.data.admins?.length || 0);
      setAdmins(response.data.admins || []);
    } catch (err: any) {
      console.error('Failed to fetch admins:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleDelete = async (adminId: string, adminName: string) => {
    if (!window.confirm(`Are you sure you want to delete the admin account for "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteError('');

    try {
      await api.delete(`/api/admin/${adminId}`);
      setSuccess(`Admin account for ${adminName} has been deleted successfully`);

      // Refresh the admin list
      await fetchAdmins();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setDeleteError(err.response?.data?.message || 'Cannot delete this admin');
      } else {
        setDeleteError('Failed to delete admin account. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Strip confirmPassword before sending to API
      const { confirmPassword, ...createData } = formData;
      await api.post('/api/admin/register', createData);

      setSuccess(`Admin account created successfully for ${formData.name}`);

      // Clear form after successful creation
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Refresh the admin list
      await fetchAdmins();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      // Check for rate limiting error
      if (err.response?.status === 429) {
        setError('Too many registration attempts. Please wait a few minutes before trying again.');
      } else if (err.response?.status === 409) {
        setError('An account with this email already exists');
      } else {
        setError(err.response?.data?.message || 'Failed to create admin account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Access control - only super admins can access this page
  if (currentAdmin?.role !== 'super_admin') {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'var(--color-background)',
            padding: '3rem',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h1 style={{ marginBottom: '1rem', color: '#ef4444' }}>Access Denied</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You don't have permission to access Admin Management.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              This page requires super administrator privileges. Please contact your system administrator if you need access.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Admin Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Manage admin accounts and create new ones for your team members
        </p>

        <div style={{
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Create New Admin</h2>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoComplete="name"
                disabled={isLoading}
                minLength={2}
                placeholder="Enter admin name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                disabled={isLoading}
                placeholder="Enter admin email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={8}
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                disabled={isLoading}
                minLength={8}
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Admin...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <div style={{
          backgroundColor: 'var(--color-background)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Admin Accounts</h2>

          {deleteError && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {deleteError}
            </div>
          )}

          {isLoadingAdmins ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading admin accounts...
            </div>
          ) : admins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No admin accounts found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {admins.map((admin) => {
                const isCurrentUser = currentAdmin?.id === admin.id;
                const createdDate = new Date(admin.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={admin.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: isCurrentUser ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      border: `1px solid ${isCurrentUser ? 'rgba(37, 99, 235, 0.2)' : 'var(--color-border)'}`,
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                          {admin.name}
                        </span>
                        {isCurrentUser && (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--color-primary)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {admin.email}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Created: {createdDate}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(admin.id, admin.name)}
                      disabled={isCurrentUser}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        backgroundColor: isCurrentUser ? 'rgba(107, 114, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: isCurrentUser ? 'var(--text-secondary)' : '#ef4444',
                        border: isCurrentUser ? '1px solid rgba(107, 114, 128, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                        opacity: isCurrentUser ? 0.5 : 1
                      }}
                      title={isCurrentUser ? 'You cannot delete your own account' : 'Delete this admin account'}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
