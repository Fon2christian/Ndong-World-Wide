import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { contactsApi } from '../api/contacts';
import type { Contact } from '../types';

const PREV_PATH_KEY = 'contacts_prev_path';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  // Update sessionStorage with current pathname for navigation tracking
  useEffect(() => {
    sessionStorage.setItem(PREV_PATH_KEY, location.pathname);
  }, [location.pathname]);

  const fetchContact = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError('');
      const data = await contactsApi.getById(id);
      setContact(data);

      // Mark as read if not already
      if (!data.isRead) {
        await contactsApi.markAsRead(id);
        setContact({ ...data, isRead: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contact inquiry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: 'new' | 'in_progress' | 'resolved') => {
    if (!id || !contact) return;

    try {
      setIsUpdating(true);
      setError('');
      await contactsApi.updateStatus(id, status);
      setContact({ ...contact, status });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      setError('');
      await contactsApi.delete(id);
      navigate('/contacts', { state: { refetch: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return '#3b82f6';
      case 'in_progress':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              to="/contacts"
              state={{ refetch: true }}
              style={{
                color: 'var(--primary-color)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              ← Back to Inquiries
            </Link>
          </div>
          <h1>Contact Inquiry Details</h1>
          <p>View and manage customer inquiry</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading inquiry details...</p>
        </div>
      ) : !contact ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Inquiry not found.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{
            display: 'grid',
            gap: '2rem',
            maxWidth: '800px'
          }}>
            {/* Status and Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label htmlFor="status-select" style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                  Status:
                </label>
                <select
                  id="status-select"
                  value={contact.status}
                  onChange={(e) => handleStatusChange(e.target.value as 'new' | 'in_progress' | 'resolved')}
                  disabled={isUpdating}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: getStatusColor(contact.status),
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: contact.emailSent ? '#10b981' : '#f59e0b',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {contact.emailSent ? 'Email Sent' : 'No Email Sent'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-secondary"
                style={{
                  color: '#ef4444',
                  borderColor: '#ef4444'
                }}
              >
                Delete Inquiry
              </button>
            </div>

            {/* Customer Information */}
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                Customer Information
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Name
                  </label>
                  <p style={{ fontSize: '1rem', margin: 0 }}>{contact.name}</p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Furigana (読み仮名)
                  </label>
                  <p style={{ fontSize: '1rem', margin: 0 }}>{contact.furigana}</p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Email
                  </label>
                  <p style={{ fontSize: '1rem', margin: 0 }}>
                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary-color)' }}>
                      {contact.email}
                    </a>
                  </p>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Phone
                  </label>
                  <p style={{ fontSize: '1rem', margin: 0 }}>
                    <a href={`tel:${contact.phone}`} style={{ color: 'var(--primary-color)' }}>
                      {contact.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Inquiry Details */}
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                Inquiry Details
              </h2>
              <div style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                {contact.inquiryDetails ? (
                  <p style={{
                    margin: 0,
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {contact.inquiryDetails}
                  </p>
                ) : (
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic'
                  }}>
                    No inquiry details provided.
                  </p>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                Inquiry Metadata
              </h2>
              <div style={{
                display: 'grid',
                gap: '0.75rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Inquiry ID:</span>
                  <span style={{ fontFamily: 'monospace' }}>{contact._id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Received:</span>
                  <span>{formatDate(contact.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                  <span>{formatDate(contact.updatedAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Read Status:</span>
                  <span style={{
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: contact.isRead ? '#10b981' : '#3b82f6',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {contact.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
