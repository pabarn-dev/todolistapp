// src/components/todos/EmptyState.tsx

import styles from './EmptyState.module.css';

interface EmptyStateProps {
  type: 'no-todos' | 'no-results';
}

export function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className={styles.emptyState} role="status">
      <div className={styles.icon}>
        {type === 'no-todos' ? (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ) : (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M8 8l6 6M14 8l-6 6" />
          </svg>
        )}
      </div>
      <h3 className={styles.title}>
        {type === 'no-todos' ? 'No todos yet' : 'No results found'}
      </h3>
      <p className={styles.description}>
        {type === 'no-todos'
          ? 'Create your first todo to get started!'
          : 'Try adjusting your search or filters.'}
      </p>
    </div>
  );
}
