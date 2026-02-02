// src/components/todos/TodoSearch.tsx

import { useTodos } from '../../hooks';
import { Input } from '../common';
import styles from './TodoSearch.module.css';

export function TodoSearch() {
  const { filters, setSearchQuery } = useTodos();

  return (
    <div className={styles.search}>
      <div className={styles.icon}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </div>
      <Input
        placeholder="Search todos..."
        value={filters.searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        aria-label="Search todos"
      />
      {filters.searchQuery && (
        <button
          className={styles.clearButton}
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
