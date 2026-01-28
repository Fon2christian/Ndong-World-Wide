import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { contactsApi } from '../api/contacts';
import type { Contact } from '../types';

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter, currentPage]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      setError(''); // Clear stale error state before refetching
      const response = await contactsApi.getAll({
        page: currentPage,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
      });
      setContacts(response.contacts || response.data || []);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: 'new' | 'in_progress' | 'resolved') => {
    try {
      await contactsApi.updateStatus(id, status);
      fetchContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactsApi.markAsRead(id);
      fetchContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact inquiry?')) return;
    try {
      await contactsApi.delete(id);
      fetchContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1>
            Customer Inquiries
            {contacts.length > 0 && (
              <span style={{
                marginLeft: '0.75rem',
                fontSize: '0.875rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: contacts.filter(c => !c.isRead).length > 0 ? '#3b82f6' : 'var(--border-color)',
                color: contacts.filter(c => !c.isRead).length > 0 ? 'white' : 'var(--text-secondary)',
                borderRadius: '9999px',
                fontWeight: '600'
              }}>
                {contacts.filter(c => !c.isRead).length} unread
              </span>
            )}
          </h1>
          <p>View and manage customer inquiries</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        <div className="form-group" style={{ maxWidth: '200px' }}>
          <label htmlFor="status-filter">Filter by Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No contact inquiries found.
          </p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Inquiry</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    onClick={() => navigate(`/contacts/${contact._id}`)}
                    style={{
                      backgroundColor: !contact.isRead ? 'rgba(59, 130, 246, 0.08)' : undefined,
                      cursor: 'pointer',
                      opacity: contact.isRead ? 0.7 : 1,
                      borderLeft: !contact.isRead ? '3px solid #3b82f6' : '3px solid transparent'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!contact.isRead ? (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '0.625rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            flexShrink: 0
                          }}>
                            Unread
                          </span>
                        ) : (
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: '0.25rem',
                            backgroundColor: '#e5e7eb',
                            color: '#6b7280',
                            fontSize: '0.625rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            flexShrink: 0
                          }}>
                            Read
                          </span>
                        )}
                        <div>
                          <strong style={{ fontWeight: !contact.isRead ? '700' : '600' }}>{contact.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {contact.furigana}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: !contact.isRead ? '600' : '400' }}>{contact.email}</td>
                    <td style={{ fontWeight: !contact.isRead ? '600' : '400' }}>{contact.phone}</td>
                    <td>
                      <div style={{
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: !contact.isRead ? '600' : '400'
                      }}>
                        {contact.inquiryDetails || 'N/A'}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={contact.status}
                        onChange={(e) =>
                          handleStatusChange(
                            contact._id,
                            e.target.value as 'new' | 'in_progress' | 'resolved'
                          )
                        }
                        className="status-select"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(contact.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        {!contact.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(contact._id)}
                            className="btn-icon"
                            title="Mark as read"
                            style={{ backgroundColor: '#3b82f6', color: 'white' }}
                          >
                            ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(contact._id)}
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

          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
