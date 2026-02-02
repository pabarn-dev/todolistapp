// src/components/todos/TodoList.tsx

import { useMemo } from 'react';
import { useTodos } from '../../hooks';
import { selectFilteredTodos } from '../../utils';
import { TodoItem } from './TodoItem';
import { EmptyState } from './EmptyState';
import styles from './TodoList.module.css';

export function TodoList() {
  const { todos, filters } = useTodos();

  const filteredTodos = useMemo(
    () => selectFilteredTodos(todos, filters),
    [todos, filters]
  );

  const hasFiltersApplied =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.tags.length > 0 ||
    filters.searchQuery.trim() !== '';

  if (todos.length === 0) {
    return <EmptyState type="no-todos" />;
  }

  if (filteredTodos.length === 0 && hasFiltersApplied) {
    return <EmptyState type="no-results" />;
  }

  return (
    <ul className={styles.list} role="list" aria-label="Todo list">
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
