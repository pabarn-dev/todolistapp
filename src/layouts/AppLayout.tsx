import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../features/auth';
import { organizationsApi } from '../api';
import { Building2, FolderKanban, Settings, LogOut, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { orgSlug } = useParams();
  const navigate = useNavigate();
  const [showOrgMenu, setShowOrgMenu] = useState(false);

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
  });

  const currentOrg = organizations.find((org) => org.slug === orgSlug);

  const handleOrgChange = (slug: string) => {
    setShowOrgMenu(false);
    navigate(`/${slug}`);
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <FolderKanban size={28} />
          <span>TaskFlow</span>
        </div>

        <div className={styles.orgSelector}>
          <button
            className={styles.orgButton}
            onClick={() => setShowOrgMenu(!showOrgMenu)}
          >
            <Building2 size={18} />
            <span>{currentOrg?.name || 'Select Organization'}</span>
            <ChevronDown size={16} />
          </button>

          {showOrgMenu && (
            <div className={styles.orgMenu}>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  className={styles.orgMenuItem}
                  onClick={() => handleOrgChange(org.slug)}
                >
                  {org.name}
                  {org.myRole && (
                    <span className={styles.roleBadge}>{org.myRole}</span>
                  )}
                </button>
              ))}
              <Link to="/new-organization" className={styles.newOrgLink}>
                <Plus size={16} />
                New Organization
              </Link>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {orgSlug && (
            <>
              <Link to={`/${orgSlug}`} className={styles.navLink}>
                <FolderKanban size={18} />
                Projects
              </Link>
              <Link to={`/${orgSlug}/settings`} className={styles.navLink}>
                <Settings size={18} />
                Settings
              </Link>
            </>
          )}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          <button onClick={logout} className={styles.logoutButton} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
