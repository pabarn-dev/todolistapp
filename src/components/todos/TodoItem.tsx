// src/components/todos/TodoItem.tsx

import { useState, useCallback, type KeyboardEvent } from 'react';
import { useTodos } from '../../hooks';
import { Button, Input, Select, Badge } from '../common';
import type { Todo, Priority, TodoStatus } from '../../types';
import styles from './TodoItem.module.css';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const priorityVariants: Record<Priority, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const statusLabels: Record<TodoStatus, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  completed: 'Terminé',
};

const statusVariants: Record<TodoStatus, 'primary' | 'warning' | 'success'> = {
  new: 'primary',
  in_progress: 'warning',
  completed: 'success',
};

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { setTodoStatus, updateTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ''
  );
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [tagInput, setTagInput] = useState('');
  const [editTags, setEditTags] = useState<string[]>(todo.tags);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');

  const handleSave = useCallback(() => {
    if (!editTitle.trim()) return;

    updateTodo(todo.id, {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      tags: editTags,
      dueDate: editDueDate,
    });
    setIsEditing(false);
  }, [
    todo.id,
    editTitle,
    editDescription,
    editPriority,
    editTags,
    editDueDate,
    updateTodo,
  ]);

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditTags(todo.tags);
    setEditDueDate(todo.dueDate || '');
    setIsEditing(false);
  }, [todo]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  }, [tagInput, editTags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setEditTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue =
    todo.dueDate && todo.status !== 'completed' && new Date(todo.dueDate) < new Date();

  if (isEditing) {
    return (
      <li className={styles.item}>
        <div className={styles.editForm}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Title"
            fullWidth
            autoFocus
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description"
            fullWidth
          />
          <div className={styles.editRow}>
            <Select
              options={priorityOptions}
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
            />
            <Input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>
          <div className={styles.editTags}>
            <div className={styles.tagInputRow}>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
              >
                +
              </Button>
            </div>
            {editTags.length > 0 && (
              <div className={styles.tagList}>
                {editTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="primary"
                    removable
                    onRemove={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className={styles.editActions}>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`${styles.item} ${todo.status === 'completed' ? styles.completed : ''}`}
      role="listitem"
    >
      <div className={styles.statusSection}>
        <Badge variant={statusVariants[todo.status]}>
          {statusLabels[todo.status]}
        </Badge>
        <div className={styles.statusButtons}>
          {todo.status !== 'new' && (
            <button
              className={styles.statusBtn}
              onClick={() => setTodoStatus(todo.id, 'new')}
              aria-label="Marquer comme nouveau"
              title="Nouveau"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>
          )}
          {todo.status !== 'in_progress' && (
            <button
              className={styles.statusBtn}
              onClick={() => setTodoStatus(todo.id, 'in_progress')}
              aria-label="Marquer en cours"
              title="En cours"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          )}
          {todo.status !== 'completed' && (
            <button
              className={`${styles.statusBtn} ${styles.completeBtn}`}
              onClick={() => setTodoStatus(todo.id, 'completed')}
              aria-label="Marquer comme terminé"
              title="Terminé"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>{todo.title}</span>
          <Badge variant={priorityVariants[todo.priority]}>{todo.priority}</Badge>
        </div>

        {todo.description && (
          <p className={styles.description}>{todo.description}</p>
        )}

        <div className={styles.meta}>
          {todo.tags.length > 0 && (
            <div className={styles.tags}>
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className={styles.dates}>
            {todo.dueDate && (
              <span className={isOverdue ? styles.overdue : ''}>
                Due: {formatDate(todo.dueDate)}
              </span>
            )}
            <span>Created: {formatDate(todo.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          aria-label="Edit todo"
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
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteTodo(todo.id)}
          aria-label="Delete todo"
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
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </Button>
      </div>
    </li>
  );
}
