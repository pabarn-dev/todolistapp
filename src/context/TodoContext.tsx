// src/context/TodoContext.tsx

import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Todo,
  TodoFilters,
  TodoStatus,
  Priority,
  FilterStatus,
  SortBy,
  SortOrder,
  TodoFormData,
} from '../types';

// Actions
type TodoAction =
  | { type: 'ADD_TODO'; payload: TodoFormData }
  | { type: 'UPDATE_TODO'; payload: { id: string; data: Partial<TodoFormData> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_TODO_STATUS'; payload: { id: string; status: TodoStatus } }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'SET_FILTER_STATUS'; payload: FilterStatus }
  | { type: 'SET_FILTER_PRIORITY'; payload: Priority | 'all' }
  | { type: 'SET_FILTER_TAGS'; payload: string[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: SortBy; sortOrder: SortOrder } }
  | { type: 'CLEAR_COMPLETED' };

interface TodoState {
  todos: Todo[];
  filters: TodoFilters;
}

const initialFilters: TodoFilters = {
  status: 'all',
  priority: 'all',
  tags: [],
  searchQuery: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const initialState: TodoState = {
  todos: [],
  filters: initialFilters,
};

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO': {
      const newTodo: Todo = {
        id: uuidv4(),
        title: action.payload.title.trim(),
        description: action.payload.description.trim() || undefined,
        status: 'new',
        priority: action.payload.priority,
        tags: action.payload.tags,
        createdAt: new Date().toISOString(),
        dueDate: action.payload.dueDate || undefined,
      };
      return { ...state, todos: [newTodo, ...state.todos] };
    }

    case 'UPDATE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? {
                ...todo,
                title: action.payload.data.title?.trim() ?? todo.title,
                description:
                  action.payload.data.description?.trim() || todo.description,
                priority: action.payload.data.priority ?? todo.priority,
                tags: action.payload.data.tags ?? todo.tags,
                dueDate: action.payload.data.dueDate ?? todo.dueDate,
              }
            : todo
        ),
      };
    }

    case 'DELETE_TODO': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    }

    case 'SET_TODO_STATUS': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, status: action.payload.status }
            : todo
        ),
      };
    }

    case 'SET_TODOS': {
      return { ...state, todos: action.payload };
    }

    case 'SET_FILTER_STATUS': {
      return {
        ...state,
        filters: { ...state.filters, status: action.payload },
      };
    }

    case 'SET_FILTER_PRIORITY': {
      return {
        ...state,
        filters: { ...state.filters, priority: action.payload },
      };
    }

    case 'SET_FILTER_TAGS': {
      return {
        ...state,
        filters: { ...state.filters, tags: action.payload },
      };
    }

    case 'SET_SEARCH_QUERY': {
      return {
        ...state,
        filters: { ...state.filters, searchQuery: action.payload },
      };
    }

    case 'SET_SORT': {
      return {
        ...state,
        filters: {
          ...state.filters,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder,
        },
      };
    }

    case 'CLEAR_COMPLETED': {
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.status !== 'completed'),
      };
    }

    default:
      return state;
  }
}

interface TodoContextValue {
  todos: Todo[];
  filters: TodoFilters;
  addTodo: (data: TodoFormData) => void;
  updateTodo: (id: string, data: Partial<TodoFormData>) => void;
  deleteTodo: (id: string) => void;
  setTodoStatus: (id: string, status: TodoStatus) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterPriority: (priority: Priority | 'all') => void;
  setFilterTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  clearCompleted: () => void;
}

export const TodoContext = createContext<TodoContextValue | null>(null);

const STORAGE_KEY = 'todo-app-data';

function loadFromStorage(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as unknown;
      if (Array.isArray(parsed)) {
        return parsed as Todo[];
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

function saveToStorage(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Ignore storage errors
  }
}

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTodos = loadFromStorage();
    if (savedTodos.length > 0) {
      dispatch({ type: 'SET_TODOS', payload: savedTodos });
    }
  }, []);

  // Save to localStorage on todos change
  useEffect(() => {
    saveToStorage(state.todos);
  }, [state.todos]);

  const addTodo = useCallback((data: TodoFormData) => {
    dispatch({ type: 'ADD_TODO', payload: data });
  }, []);

  const updateTodo = useCallback((id: string, data: Partial<TodoFormData>) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, data } });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, []);

  const setTodoStatus = useCallback((id: string, status: TodoStatus) => {
    dispatch({ type: 'SET_TODO_STATUS', payload: { id, status } });
  }, []);

  const setFilterStatus = useCallback((status: FilterStatus) => {
    dispatch({ type: 'SET_FILTER_STATUS', payload: status });
  }, []);

  const setFilterPriority = useCallback((priority: Priority | 'all') => {
    dispatch({ type: 'SET_FILTER_PRIORITY', payload: priority });
  }, []);

  const setFilterTags = useCallback((tags: string[]) => {
    dispatch({ type: 'SET_FILTER_TAGS', payload: tags });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setSort = useCallback((sortBy: SortBy, sortOrder: SortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, []);

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, []);

  const value = useMemo(
    () => ({
      todos: state.todos,
      filters: state.filters,
      addTodo,
      updateTodo,
      deleteTodo,
      setTodoStatus,
      setFilterStatus,
      setFilterPriority,
      setFilterTags,
      setSearchQuery,
      setSort,
      clearCompleted,
    }),
    [
      state.todos,
      state.filters,
      addTodo,
      updateTodo,
      deleteTodo,
      setTodoStatus,
      setFilterStatus,
      setFilterPriority,
      setFilterTags,
      setSearchQuery,
      setSort,
      clearCompleted,
    ]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
