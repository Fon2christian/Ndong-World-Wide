import { useEffect, useState, useRef, type FormEvent } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { contactsApi } from '../api/contacts';
import { repliesApi } from '../api/replies';
import type { Contact, Reply, ReplyFormData } from '../types';

const PREV_PATH_KEY = 'contacts_prev_path';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Reply state
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [replyForm, setReplyForm] = useState<ReplyFormData>({ subject: '', message: '' });
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState(''); // Form validation/send errors
  const [loadError, setLoadError] = useState(''); // Fetch/load errors
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Request guard to prevent stale fetches from updating state
  const fetchRequestIdRef = useRef(0);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  // Fetch replies when contact is loaded
  useEffect(() => {
    if (contact) {
      fetchReplies();
      // Set default subject
      setReplyForm({
        subject: `Re: Inquiry from ${contact.name}`,
        message: ''
      });
    }
  }, [contact?._id, contact?.name]);

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
        const updated = await contactsApi.markAsRead(id);
        setContact(updated);
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
      const updated = await contactsApi.updateStatus(id, status);
      setContact(updated);
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

  const fetchReplies = async () => {
    if (!id) return;

    // Increment request ID to track this specific fetch
    const currentRequestId = ++fetchRequestIdRef.current;

    try {
      setIsLoadingReplies(true);
      setLoadError('');
      const data = await repliesApi.getByContactId(id);

      // Only update state if this is still the latest request
      if (currentRequestId !== fetchRequestIdRef.current) {
        return; // Stale response, ignore it
      }

      // Merge fetched replies with existing state to avoid dropping optimistic updates
      setReplies(prev => {
        // Create a Set of IDs from fetched data for quick lookup
        const fetchedIds = new Set(data.map(r => r._id));

        // Keep any local-only replies that aren't in the fetched data
        const localOnly = prev.filter(r => !fetchedIds.has(r._id));

        // Merge fetched data (server source of truth) with local-only replies
        const merged = [...data, ...localOnly];

        // Sort by sentAt descending (newest first) to maintain consistent ordering
        return merged.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        );
      });
    } catch (err: any) {
      // Only set error if this is still the latest request
      if (currentRequestId === fetchRequestIdRef.current) {
        setLoadError(err.response?.data?.message || 'Failed to load replies');
      }
    } finally {
      // Only clear loading if this is still the latest request
      if (currentRequestId === fetchRequestIdRef.current) {
        setIsLoadingReplies(false);
      }
    }
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !contact) return;

    // Validation
    if (!replyForm.subject.trim() || !replyForm.message.trim()) {
      setReplyError('Subject and message are required');
      return;
    }

    if (replyForm.subject.length > 200) {
      setReplyError('Subject must be 200 characters or fewer');
      return;
    }

    if (replyForm.message.length > 5000) {
      setReplyError('Message must be 5000 characters or fewer');
      return;
    }

    try {
      setIsSendingReply(true);
      setReplyError('');
      const newReply = await repliesApi.create(id, replyForm);

      // Add new reply to the list (at the beginning since sorted by newest first)
      setReplies(prev => [newReply, ...prev]);

      // Clear form and hide it
      setReplyForm({
        subject: `Re: Inquiry from ${contact.name}`,
        message: ''
      });
      setShowReplyForm(false);

      // Update contact to reflect new reply count and status
      // This is done separately to avoid showing error if contact fetch fails after successful reply
      try {
        const updatedContact = await contactsApi.getById(id);
        setContact(updatedContact);
      } catch (updateErr) {
        // Silent fail - reply was sent successfully, just couldn't refresh contact data
        console.error('Failed to refresh contact data after reply:', updateErr);
      }
    } catch (err: any) {
      setReplyError(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
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

  const getEmailStatusBadge = (status: Reply['emailStatus']) => {
    switch (status) {
      case 'sent':
        return { color: '#10b981', label: 'Sent' };
      case 'sending':
        return { color: '#f59e0b', label: 'Sending...' };
      case 'failed':
        return { color: '#ef4444', label: 'Failed' };
      default:
        // Defensive fallback for unexpected statuses
        return { color: '#6b7280', label: String(status) };
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
                  <div style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Name
                  </div>
                  <p style={{ fontSize: '1rem', margin: 0 }}>{contact.name}</p>
                </div>

                <div>
                  <div style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Furigana (読み仮名)
                  </div>
                  <p style={{ fontSize: '1rem', margin: 0 }}>{contact.furigana}</p>
                </div>

                <div>
                  <div style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Email
                  </div>
                  <p style={{ fontSize: '1rem', margin: 0 }}>
                    <a href={`mailto:${contact.email}`} style={{ color: 'var(--primary-color)' }}>
                      {contact.email}
                    </a>
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    Phone
                  </div>
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

            {/* Reply Section */}
            <div style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}>
                    Reply History
                  </h2>
                  {contact.replyCount ? (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {contact.replyCount} {contact.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(!showReplyForm);
                    setReplyError(''); // Clear any validation errors when toggling form
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {showReplyForm ? 'Cancel' : 'Send Reply'}
                </button>
              </div>

              {/* Load Error - shown outside form for fetch failures */}
              {loadError && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {loadError}
                </div>
              )}

              {/* Reply Form */}
              {showReplyForm && (
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem'
                }}>
                  <form onSubmit={handleSendReply}>

                    {/* Form/Validation Error - shown inside form */}
                    {replyError && (
                      <div className="error-message" style={{ marginBottom: '1rem' }}>
                        {replyError}
                      </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="reply-subject">Subject</label>
                      <input
                        id="reply-subject"
                        type="text"
                        className="form-input"
                        value={replyForm.subject}
                        onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                        maxLength={200}
                        required
                        disabled={isSendingReply}
                      />
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.25rem'
                      }}>
                        {replyForm.subject.length}/200 characters
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="reply-message">Message</label>
                      <textarea
                        id="reply-message"
                        className="form-input"
                        value={replyForm.message}
                        onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                        maxLength={5000}
                        rows={8}
                        required
                        disabled={isSendingReply}
                        style={{ resize: 'vertical' }}
                      />
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginTop: '0.25rem'
                      }}>
                        {replyForm.message.length}/5000 characters
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSendingReply}
                    >
                      {isSendingReply ? 'Sending...' : 'Send Email Reply'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reply History List */}
              {isLoadingReplies ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner"></div>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                    Loading replies...
                  </p>
                </div>
              ) : replies.length === 0 && !loadError ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '0.5rem',
                  border: '1px dashed var(--border-color)'
                }}>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    No replies sent yet. Click "Send Reply" to compose a message to the customer.
                  </p>
                </div>
              ) : replies.length > 0 ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {replies.map((reply) => {
                    const emailStatus = getEmailStatusBadge(reply.emailStatus);
                    return (
                      <div
                        key={reply._id}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          marginBottom: '1rem'
                        }}>
                          <div>
                            <h3 style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              margin: '0 0 0.5rem 0',
                              color: 'var(--text-primary)'
                            }}>
                              {reply.subject}
                            </h3>
                            <div style={{
                              fontSize: '0.875rem',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              flexWrap: 'wrap'
                            }}>
                              <span>From: <strong>{reply.adminName}</strong></span>
                              <span>•</span>
                              <span>{formatDate(reply.sentAt)}</span>
                            </div>
                          </div>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            backgroundColor: emailStatus.color,
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}>
                            {emailStatus.label}
                          </span>
                        </div>
                        <div style={{
                          padding: '1rem',
                          backgroundColor: 'var(--card-bg)',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border-color)'
                        }}>
                          <p style={{
                            margin: 0,
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: 'var(--text-primary)'
                          }}>
                            {reply.message}
                          </p>
                        </div>
                        {reply.errorMessage && (
                          <div className="error-message" style={{ marginTop: '0.75rem' }}>
                            <strong>Error:</strong> {reply.errorMessage}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
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
