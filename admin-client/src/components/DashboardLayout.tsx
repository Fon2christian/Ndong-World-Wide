import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/cars', label: 'Cars', icon: '🚗' },
    { path: '/tires', label: 'Tires', icon: '⚙️' },
    { path: '/wheel-drums', label: 'Wheel Drums', icon: '🔧' },
    { path: '/contacts', label: 'Customer Inquiries', icon: '📧' },
    { path: '/admin-management', label: 'Admin Management', icon: '👥', requireSuperAdmin: true },
  ];

  // Filter nav items based on admin role
  const navItems = allNavItems.filter(item => {
    if (item.requireSuperAdmin) {
      return admin?.role === 'super_admin';
    }
    return true;
  });

  const isNavItemActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {children}
      </main>

      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Ndong World Wide</h2>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isNavItemActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#ffffff',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}>
                {admin?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="admin-name" style={{
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {admin?.name}
                </p>
                <p className="admin-email" style={{
                  fontSize: '0.75rem',
                  opacity: 0.8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '0.25rem'
                }}>
                  {admin?.email}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderRadius: '4px',
                  backgroundColor: admin?.role === 'super_admin' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: admin?.role === 'super_admin' ? '#10b981' : '#3b82f6',
                  border: `1px solid ${admin?.role === 'super_admin' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                }}>
                  {admin?.role === 'super_admin' ? '⭐ Super Admin' : '👤 Admin'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-block">
            <span style={{ fontSize: '1.125rem' }}>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
