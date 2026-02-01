import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load admin pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cars = lazy(() => import('./pages/Cars'));
const Tires = lazy(() => import('./pages/Tires'));
const WheelDrums = lazy(() => import('./pages/WheelDrums'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactDetail = lazy(() => import('./pages/ContactDetail'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      }>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cars"
            element={
              <ProtectedRoute>
                <Cars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tires"
            element={
              <ProtectedRoute>
                <Tires />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wheel-drums"
            element={
              <ProtectedRoute>
                <WheelDrums />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts/:id"
            element={
              <ProtectedRoute>
                <ContactDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Contacts />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
