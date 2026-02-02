import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../../api';
import { FolderKanban, Plus, Users, CheckSquare, ArrowRight } from 'lucide-react';
import styles from './Projects.module.css';

export function ProjectsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', orgSlug],
    queryFn: () => projectsApi.getAll(orgSlug!),
    enabled: !!orgSlug,
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className={styles.empty}>
        <FolderKanban size={48} strokeWidth={1.5} />
        <h2>No projects yet</h2>
        <p>Create your first project to start managing tasks.</p>
        <Link to={`/${orgSlug}/new-project`} className={styles.createButton}>
          <Plus size={18} />
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Projects</h1>
        <Link to={`/${orgSlug}/new-project`} className={styles.createButton}>
          <Plus size={18} />
          New Project
        </Link>
      </div>

      <div className={styles.grid}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={styles.card}
            onClick={() => navigate(`/${orgSlug}/${project.slug}`)}
          >
            <div className={styles.cardHeader}>
              <div
                className={styles.projectIcon}
                style={{ backgroundColor: project.color || '#6366f1' }}
              >
                <FolderKanban size={20} color="white" />
              </div>
              <div className={styles.projectInfo}>
                <h3>{project.name}</h3>
                {project.description && (
                  <p className={styles.description}>{project.description}</p>
                )}
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <CheckSquare size={16} />
                <span>{project._count?.tasks || 0} tasks</span>
              </div>
              <div className={styles.stat}>
                <Users size={16} />
                <span>{project._count?.members || 0} members</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={`${styles.role} ${styles[project.myRole?.toLowerCase() || '']}`}>
                {project.myRole}
              </span>
              <ArrowRight size={16} className={styles.arrow} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
