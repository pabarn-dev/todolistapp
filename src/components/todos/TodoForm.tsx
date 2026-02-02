// src/components/todos/TodoForm.tsx

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useTodos } from '../../hooks';
import { validateTodoForm, hasValidationErrors } from '../../utils';
import { Button, Input, Select, Badge } from '../common';
import type { Priority, TodoFormData, ValidationErrors } from '../../types';
import styles from './TodoForm.module.css';

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const initialFormData: TodoFormData = {
  title: '',
  description: '',
  priority: 'medium',
  tags: [],
  dueDate: '',
};

interface TodoFormProps {
  onSuccess?: () => void;
}

export function TodoForm({ onSuccess }: TodoFormProps) {
  const { addTodo } = useTodos();
  const [formData, setFormData] = useState<TodoFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validateTodoForm(formData);
      setErrors(validationErrors);

      if (hasValidationErrors(validationErrors)) {
        return;
      }

      addTodo(formData);
      setFormData(initialFormData);
      setTagInput('');
      setIsExpanded(false);
      onSuccess?.();
    },
    [formData, addTodo, onSuccess]
  );

  const handleTitleChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
    setErrors((prev) => ({ ...prev, title: undefined }));
  }, []);

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.mainRow}>
        <Input
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          error={errors.title}
          fullWidth
          aria-label="Todo title"
        />
        <Button type="submit">Add</Button>
      </div>

      {isExpanded && (
        <div className={styles.expandedSection}>
          <div className={styles.row}>
            <Input
              label="Description"
              placeholder="Add more details..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              fullWidth
            />
          </div>

          <div className={styles.row}>
            <Select
              label="Priority"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as Priority,
                }))
              }
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              error={errors.dueDate}
            />
          </div>

          <div className={styles.tagsSection}>
            <div className={styles.tagInput}>
              <Input
                label="Tags"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
              >
                Add Tag
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className={styles.tagList}>
                {formData.tags.map((tag) => (
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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Collapse
          </Button>
        </div>
      )}
    </form>
  );
}
