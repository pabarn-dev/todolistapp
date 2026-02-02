// src/types/todo.ts

export type Priority = 'low' | 'medium' | 'high';

export type TodoStatus = 'new' | 'in_progress' | 'completed';

export type FilterStatus = 'all' | 'new' | 'in_progress' | 'completed';

export type SortBy = 'createdAt' | 'priority' | 'alphabetical' | 'dueDate';

export type SortOrder = 'asc' | 'desc';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  createdAt: string;
  dueDate?: string;
}

export interface TodoFilters {
  status: FilterStatus;
  priority: Priority | 'all';
  tags: string[];
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface TodoStats {
  total: number;
  new: number;
  inProgress: number;
  completed: number;
  byPriority: Record<Priority, number>;
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate: string;
}

export interface ValidationErrors {
  title?: string;
  dueDate?: string;
}
