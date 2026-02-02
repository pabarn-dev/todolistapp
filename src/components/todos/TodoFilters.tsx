// src/components/todos/TodoFilters.tsx

import { useMemo } from 'react';
import { useTodos } from '../../hooks';
import { selectAllTags } from '../../utils';
import { Button, Select, Badge } from '../common';
import type { FilterStatus, Priority, SortBy } from '../../types';
import styles from './TodoFilters.module.css';

const statusOptions = [
  { value: 'all', label: 'Tous' },
  { value: 'new', label: 'Nouveau' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
];

const priorityFilterOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'priority', label: 'Priority' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'dueDate', label: 'Due Date' },
];

export function TodoFilters() {
  const {
    todos,
    filters,
    setFilterStatus,
    setFilterPriority,
    setFilterTags,
    setSort,
    clearCompleted,
  } = useTodos();

  const allTags = useMemo(() => selectAllTags(todos), [todos]);
  const hasCompletedTodos = useMemo(
    () => todos.some((todo) => todo.status === 'completed'),
    [todos]
  );

  const handleTagToggle = (tag: string) => {
    if (filters.tags.includes(tag)) {
      setFilterTags(filters.tags.filter((t) => t !== tag));
    } else {
      setFilterTags([...filters.tags, tag]);
    }
  };

  const handleSortChange = (sortBy: SortBy) => {
    if (filters.sortBy === sortBy) {
      setSort(sortBy, filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(sortBy, sortBy === 'priority' ? 'desc' : 'asc');
    }
  };

  return (
    <div className={styles.filters}>
      <div className={styles.row}>
        <div className={styles.statusTabs} role="tablist" aria-label="Filter by status">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              role="tab"
              aria-selected={filters.status === option.value}
              className={`${styles.tab} ${filters.status === option.value ? styles.active : ''}`}
              onClick={() => setFilterStatus(option.value as FilterStatus)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={styles.selectGroup}>
          <Select
            options={priorityFilterOptions}
            value={filters.priority}
            onChange={(e) =>
              setFilterPriority(e.target.value as Priority | 'all')
            }
            aria-label="Filter by priority"
          />
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            aria-label="Sort by"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSort(filters.sortBy, filters.sortOrder === 'asc' ? 'desc' : 'asc')
            }
            aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? (
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
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            ) : (
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
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className={styles.tagsRow}>
          <span className={styles.tagsLabel}>Tags:</span>
          <div className={styles.tagsList}>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'primary' : 'default'}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hasCompletedTodos && (
        <div className={styles.clearRow}>
          <Button variant="ghost" size="sm" onClick={clearCompleted}>
            Clear completed
          </Button>
        </div>
      )}
    </div>
  );
}
