// src/components/common/Badge.tsx

import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function Badge({
  variant = 'default',
  children,
  onClick,
  removable = false,
  onRemove,
}: BadgeProps) {
  const classNames = [
    styles.badge,
    styles[variant],
    onClick ? styles.clickable : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <span
      className={classNames}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
      {removable && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}
