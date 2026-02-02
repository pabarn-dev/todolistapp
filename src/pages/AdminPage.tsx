// src/pages/AdminPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button } from '../components/common';
import { Layout } from '../components/layout';
import styles from './AdminPage.module.css';

interface UserWithId {
  uid: string;
  email: string;
  createdAt: Date;
  isAdmin: boolean;
}

export function AdminPage() {
  const { isAdmin, getAllUsers, deleteUserAccount, user } = useAuth();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers() as UserWithId[];
      setUsers(allUsers);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin, navigate, loadUsers]);

  const handleDelete = async (userId: string, email: string) => {
    if (userId === user?.uid) {
      alert('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }

    if (!confirm(`Voulez-vous vraiment supprimer le compte de ${email} ?`)) {
      return;
    }

    try {
      setDeletingId(userId);
      await deleteUserAccount(userId);
      setUsers(users.filter((u) => u.uid !== userId));
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Administration</h1>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Retour à l'app
          </Button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{users.length}</span>
            <span className={styles.statLabel}>Utilisateurs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {users.filter((u) => u.isAdmin).length}
            </span>
            <span className={styles.statLabel}>Admins</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Date d'inscription</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.uid}>
                    <td className={styles.email}>{u.email}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${u.isAdmin ? styles.admin : styles.user}`}
                      >
                        {u.isAdmin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td>
                      {u.uid !== user?.uid && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(u.uid, u.email)}
                          disabled={deletingId === u.uid}
                        >
                          {deletingId === u.uid ? '...' : 'Supprimer'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
