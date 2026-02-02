// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, TodoProvider, ThemeProvider } from './context';
import { useAuth } from './hooks';
import { Layout, TodoForm, TodoSearch, TodoFilters, TodoStats, TodoList } from './components';
import { LoginPage, RegisterPage, AdminPage } from './pages';
import styles from './App.module.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Chargement...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function TodoApp() {
  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.section} aria-labelledby="add-todo-heading">
          <h2 id="add-todo-heading" className={styles.srOnly}>
            Add new todo
          </h2>
          <TodoForm />
        </section>

        <section className={styles.section} aria-labelledby="search-heading">
          <h2 id="search-heading" className={styles.srOnly}>
            Search todos
          </h2>
          <TodoSearch />
        </section>

        <section className={styles.section} aria-labelledby="stats-heading">
          <h2 id="stats-heading" className={styles.srOnly}>
            Statistics
          </h2>
          <TodoStats />
        </section>

        <section className={styles.section} aria-labelledby="filters-heading">
          <h2 id="filters-heading" className={styles.srOnly}>
            Filters
          </h2>
          <TodoFilters />
        </section>

        <section className={styles.section} aria-labelledby="todos-heading">
          <h2 id="todos-heading" className={styles.srOnly}>
            Todo list
          </h2>
          <TodoList />
        </section>
      </div>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
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
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <TodoProvider>
              <TodoApp />
            </TodoProvider>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
