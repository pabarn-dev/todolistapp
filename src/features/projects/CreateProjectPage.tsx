import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, getErrorMessage } from '../../api';
import { FolderKanban } from 'lucide-react';
import styles from './Projects.module.css';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export function CreateProjectPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; color: string }) =>
      projectsApi.create(orgSlug!, data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects', orgSlug] });
      navigate(`/${orgSlug}/${project.slug}`);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({
      name,
      description: description || undefined,
      color,
    });
  };

  return (
    <div className={styles.createPage}>
      <div className={styles.createCard}>
        <div className={styles.createHeader}>
          <div className={styles.createIcon} style={{ backgroundColor: color }}>
            <FolderKanban size={32} color="white" />
          </div>
          <h1>Create Project</h1>
          <p>Projects help you organize tasks and collaborate with your team.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website Redesign"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Description
              <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Project Color</label>
            <div className={styles.colorPicker}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorOption} ${color === c ? styles.selected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={createMutation.isPending || !name}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
