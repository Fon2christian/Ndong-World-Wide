import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/cars', label: 'Cars', icon: '🚗' },
    { path: '/tires', label: 'Tires', icon: '⚙️' },
    { path: '/wheel-drums', label: 'Wheel Drums', icon: '🔧' },
    { path: '/contacts', label: 'Customer Inquiries', icon: '📧' },
  ];

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
            <p className="admin-name">{admin?.name}</p>
            <p className="admin-email">{admin?.email}</p>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-block">
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}
