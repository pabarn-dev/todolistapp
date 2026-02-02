import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi, getErrorMessage } from '../../api';
import { Building2 } from 'lucide-react';
import styles from './Organizations.module.css';

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string }) => organizationsApi.create(data),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      navigate(`/${org.slug}`);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ name, slug: slug || undefined });
  };

  return (
    <div className={styles.createPage}>
      <div className={styles.createCard}>
        <div className={styles.createHeader}>
          <div className={styles.createIcon}>
            <Building2 size={32} />
          </div>
          <h1>Create Organization</h1>
          <p>Organizations contain projects and team members.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="name">Organization Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="slug">
              URL Slug
              <span className={styles.optional}>(auto-generated)</span>
            </label>
            <div className={styles.slugInput}>
              <span>taskflow.app/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="acme-inc"
              />
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
              {createMutation.isPending ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
