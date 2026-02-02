// src/context/TodoContext.tsx

import {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
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
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: { id: string; data: Partial<Todo> } }
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
      return { ...state, todos: [action.payload, ...state.todos] };
    }

    case 'UPDATE_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, ...action.payload.data }
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
  loading: boolean;
  addTodo: (data: TodoFormData) => Promise<void>;
  updateTodo: (id: string, data: Partial<TodoFormData>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setTodoStatus: (id: string, status: TodoStatus) => Promise<void>;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterPriority: (priority: Priority | 'all') => void;
  setFilterTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  clearCompleted: () => Promise<void>;
}

export const TodoContext = createContext<TodoContextValue | null>(null);

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firestore todos
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_TODOS', payload: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const todosRef = collection(db, 'users', user.uid, 'todos');
    const todosQuery = query(todosRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      todosQuery,
      (snapshot) => {
        const todos: Todo[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            status: data.status || 'new',
            priority: data.priority,
            tags: data.tags || [],
            createdAt: data.createdAt,
            dueDate: data.dueDate,
          } as Todo;
        });
        dispatch({ type: 'SET_TODOS', payload: todos });
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTodo = useCallback(
    async (data: TodoFormData) => {
      if (!user) return;

      const todoId = uuidv4();
      const todoData: Record<string, unknown> = {
        id: todoId,
        title: data.title.trim(),
        status: 'new',
        priority: data.priority,
        tags: data.tags,
        createdAt: new Date().toISOString(),
      };

      if (data.description.trim()) {
        todoData.description = data.description.trim();
      }
      if (data.dueDate) {
        todoData.dueDate = data.dueDate;
      }

      const todoRef = doc(db, 'users', user.uid, 'todos', todoId);
      await setDoc(todoRef, todoData);
    },
    [user]
  );

  const updateTodo = useCallback(
    async (id: string, data: Partial<TodoFormData>) => {
      if (!user) return;

      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined && data.description.trim()) {
        updateData.description = data.description.trim();
      }
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.dueDate !== undefined && data.dueDate) {
        updateData.dueDate = data.dueDate;
      }

      const todoRef = doc(db, 'users', user.uid, 'todos', id);
      await setDoc(todoRef, updateData, { merge: true });
    },
    [user]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!user) return;

      const todoRef = doc(db, 'users', user.uid, 'todos', id);
      await deleteDoc(todoRef);
    },
    [user]
  );

  const setTodoStatus = useCallback(
    async (id: string, status: TodoStatus) => {
      if (!user) return;

      const todoRef = doc(db, 'users', user.uid, 'todos', id);
      await setDoc(todoRef, { status }, { merge: true });
    },
    [user]
  );

  const clearCompleted = useCallback(async () => {
    if (!user) return;

    const completedTodos = state.todos.filter(
      (todo) => todo.status === 'completed'
    );
    await Promise.all(
      completedTodos.map((todo) =>
        deleteDoc(doc(db, 'users', user.uid, 'todos', todo.id))
      )
    );
  }, [user, state.todos]);

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

  const value = useMemo(
    () => ({
      todos: state.todos,
      filters: state.filters,
      loading,
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
      loading,
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
