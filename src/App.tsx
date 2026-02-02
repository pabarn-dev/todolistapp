import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth';
import { LoginPage, RegisterPage } from './features/auth';
import { OrganizationsPage, CreateOrganizationPage } from './features/organizations';
import { ProjectsPage, CreateProjectPage } from './features/projects';
import { TaskBoardPage } from './features/tasks';
import { AppLayout } from './layouts/AppLayout';
import styles from './App.module.css';

function LoadingScreen() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Loading...</p>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Private routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <OrganizationsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/new-organization"
        element={
          <PrivateRoute>
            <CreateOrganizationPage />
          </PrivateRoute>
        }
      />

      {/* Organization routes with layout */}
      <Route
        path="/:orgSlug"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<ProjectsPage />} />
        <Route path="new-project" element={<CreateProjectPage />} />
        <Route path=":projectSlug" element={<TaskBoardPage />} />
        <Route path="settings" element={<div>Organization Settings (TODO)</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
