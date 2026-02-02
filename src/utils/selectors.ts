// src/utils/selectors.ts

import type { Todo, TodoFilters, TodoStats, Priority } from '../types';

const priorityOrder: Record<Priority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function selectFilteredTodos(
  todos: Todo[],
  filters: TodoFilters
): Todo[] {
  let result = [...todos];

  // Filter by status
  if (filters.status !== 'all') {
    result = result.filter((todo) => todo.status === filters.status);
  }

  // Filter by priority
  if (filters.priority !== 'all') {
    result = result.filter((todo) => todo.priority === filters.priority);
  }

  // Filter by tags
  if (filters.tags.length > 0) {
    result = result.filter((todo) =>
      filters.tags.some((tag) => todo.tags.includes(tag))
    );
  }

  // Filter by search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        (todo.description && todo.description.toLowerCase().includes(query))
    );
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'createdAt': {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      }
      case 'priority': {
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }
      case 'alphabetical': {
        comparison = a.title.localeCompare(b.title);
        break;
      }
      case 'dueDate': {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = aDate - bDate;
        break;
      }
    }

    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  return result;
}

export function selectTodoStats(todos: Todo[]): TodoStats {
  const stats: TodoStats = {
    total: todos.length,
    new: 0,
    inProgress: 0,
    completed: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
    },
  };

  for (const todo of todos) {
    switch (todo.status) {
      case 'new':
        stats.new++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      case 'completed':
        stats.completed++;
        break;
    }
    stats.byPriority[todo.priority]++;
  }

  return stats;
}

export function selectAllTags(todos: Todo[]): string[] {
  const tagSet = new Set<string>();
  for (const todo of todos) {
    for (const tag of todo.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}
