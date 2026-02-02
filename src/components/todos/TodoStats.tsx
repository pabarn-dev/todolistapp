// src/components/todos/TodoStats.tsx

import { useMemo } from 'react';
import { useTodos } from '../../hooks';
import { selectTodoStats } from '../../utils';
import styles from './TodoStats.module.css';

export function TodoStats() {
  const { todos } = useTodos();
  const stats = useMemo(() => selectTodoStats(todos), [todos]);

  if (stats.total === 0) {
    return null;
  }

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className={styles.stats}>
      <div className={styles.progress}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progress</span>
          <span className={styles.progressValue}>{completionRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${completionRate}%` }}
            role="progressbar"
            aria-valuenow={completionRate}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className={styles.counters}>
        <div className={styles.counter}>
          <span className={styles.counterValue}>{stats.total}</span>
          <span className={styles.counterLabel}>Total</span>
        </div>
        <div className={styles.counter}>
          <span className={`${styles.counterValue} ${styles.new}`}>
            {stats.new}
          </span>
          <span className={styles.counterLabel}>Nouveau</span>
        </div>
        <div className={styles.counter}>
          <span className={`${styles.counterValue} ${styles.inProgress}`}>
            {stats.inProgress}
          </span>
          <span className={styles.counterLabel}>En cours</span>
        </div>
        <div className={styles.counter}>
          <span className={`${styles.counterValue} ${styles.completed}`}>
            {stats.completed}
          </span>
          <span className={styles.counterLabel}>Terminé</span>
        </div>
      </div>

      <div className={styles.priorities}>
        <div className={styles.priorityItem}>
          <span className={`${styles.dot} ${styles.high}`} />
          <span>High: {stats.byPriority.high}</span>
        </div>
        <div className={styles.priorityItem}>
          <span className={`${styles.dot} ${styles.medium}`} />
          <span>Medium: {stats.byPriority.medium}</span>
        </div>
        <div className={styles.priorityItem}>
          <span className={`${styles.dot} ${styles.low}`} />
          <span>Low: {stats.byPriority.low}</span>
        </div>
      </div>
    </div>
  );
}
