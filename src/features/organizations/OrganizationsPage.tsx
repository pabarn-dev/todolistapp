import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { organizationsApi } from '../../api';
import { Building2, Users, FolderKanban, Plus, ArrowRight } from 'lucide-react';
import styles from './Organizations.module.css';

export function OrganizationsPage() {
  const navigate = useNavigate();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading organizations...</div>;
  }

  if (organizations.length === 0) {
    return (
      <div className={styles.empty}>
        <Building2 size={48} strokeWidth={1.5} />
        <h2>No organizations yet</h2>
        <p>Create your first organization to get started.</p>
        <Link to="/new-organization" className={styles.createButton}>
          <Plus size={18} />
          Create Organization
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Organizations</h1>
        <Link to="/new-organization" className={styles.createButton}>
          <Plus size={18} />
          New Organization
        </Link>
      </div>

      <div className={styles.grid}>
        {organizations.map((org) => (
          <div
            key={org.id}
            className={styles.card}
            onClick={() => navigate(`/${org.slug}`)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.orgIcon}>
                <Building2 size={24} />
              </div>
              <div className={styles.orgInfo}>
                <h3>{org.name}</h3>
                <span className={styles.slug}>/{org.slug}</span>
              </div>
              <span className={`${styles.role} ${styles[org.myRole?.toLowerCase() || '']}`}>
                {org.myRole}
              </span>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <FolderKanban size={16} />
                <span>{org._count?.projects || 0} projects</span>
              </div>
              <div className={styles.stat}>
                <Users size={16} />
                <span>{org._count?.members || 0} members</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span>View projects</span>
              <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
