// src/components/todos/TodoForm.tsx

import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import { useTodos } from '../../hooks';
import { validateTodoForm, hasValidationErrors } from '../../utils';
import { Button, Input, Select, Badge } from '../common';
import type { Priority, TodoFormData, ValidationErrors } from '../../types';
import styles from './TodoForm.module.css';

const priorityOptions = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
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

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validateTodoForm(formData);
      setErrors(validationErrors);

      if (hasValidationErrors(validationErrors)) {
        return;
      }

      await addTodo(formData);
      setFormData(initialFormData);
      setTagInput('');
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
      <h2 className={styles.formTitle}>Nouvelle tâche</h2>

      <div className={styles.formGrid}>
        <div className={styles.mainFields}>
          <Input
            label="Titre"
            placeholder="Que devez-vous faire ?"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            error={errors.title}
            fullWidth
            aria-label="Titre de la tâche"
          />

          <Input
            label="Description"
            placeholder="Ajouter des détails..."
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

        <div className={styles.sideFields}>
          <Select
            label="Priorité"
            options={priorityOptions}
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as Priority,
              }))
            }
            fullWidth
          />

          <Input
            label="Date d'échéance"
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            error={errors.dueDate}
            fullWidth
          />
        </div>
      </div>

      <div className={styles.tagsSection}>
        <div className={styles.tagInput}>
          <Input
            label="Tags"
            placeholder="Ajouter un tag..."
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
            +
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

      <Button type="submit" fullWidth>
        Ajouter la tâche
      </Button>
    </form>
  );
}
