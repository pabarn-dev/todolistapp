import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { tasksApi, projectsApi, organizationsApi } from '../../api';
import { Plus, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, TaskStatus } from '../../types/api';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import styles from './TaskBoard.module.css';

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'BACKLOG', title: 'Backlog', color: '#6b7280' },
  { status: 'TODO', title: 'To Do', color: '#3b82f6' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
  { status: 'IN_REVIEW', title: 'In Review', color: '#8b5cf6' },
  { status: 'DONE', title: 'Done', color: '#22c55e' },
];

export function TaskBoardPage() {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
  const queryClient = useQueryClient();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createColumnStatus, setCreateColumnStatus] = useState<TaskStatus | null>(null);

  const { data: project } = useQuery({
    queryKey: ['project', orgSlug, projectSlug],
    queryFn: () => projectsApi.getBySlug(orgSlug!, projectSlug!),
    enabled: !!orgSlug && !!projectSlug,
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', orgSlug, projectSlug],
    queryFn: () => tasksApi.getAll(orgSlug!, projectSlug!),
    enabled: !!orgSlug && !!projectSlug,
  });

  const { data: labels = [] } = useQuery({
    queryKey: ['labels', orgSlug],
    queryFn: () => organizationsApi.getLabels(orgSlug!),
    enabled: !!orgSlug,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: { status: TaskStatus } }) =>
      tasksApi.update(orgSlug!, projectSlug!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgSlug, projectSlug] });
    },
  });

  const tasks = tasksData?.items || [];

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status).sort((a, b) => a.position - b.position);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromStatus', task.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const fromStatus = e.dataTransfer.getData('fromStatus');

    if (fromStatus !== toStatus) {
      updateTaskMutation.mutate({ taskId, data: { status: toStatus } });
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div
            className={styles.projectColor}
            style={{ backgroundColor: project?.color || '#6366f1' }}
          />
          <h1>{project?.name}</h1>
        </div>
      </div>

      <div className={styles.board}>
        {COLUMNS.map((column) => (
          <div
            key={column.status}
            className={styles.column}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <span
                  className={styles.columnDot}
                  style={{ backgroundColor: column.color }}
                />
                <span>{column.title}</span>
                <span className={styles.columnCount}>
                  {getTasksByStatus(column.status).length}
                </span>
              </div>
              <button
                className={styles.addButton}
                onClick={() => setCreateColumnStatus(column.status)}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className={styles.columnContent}>
              {getTasksByStatus(column.status).map((task) => (
                <div
                  key={task.id}
                  className={styles.taskCard}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => setSelectedTask(task)}
                >
                  {task.labels.length > 0 && (
                    <div className={styles.taskLabels}>
                      {task.labels.map((label) => (
                        <span
                          key={label.id}
                          className={styles.taskLabel}
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h4 className={styles.taskTitle}>{task.title}</h4>

                  <div className={styles.taskMeta}>
                    {task.dueDate && (
                      <span className={styles.taskDue}>
                        <Calendar size={12} />
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                    {task._count?.comments ? (
                      <span className={styles.taskComments}>
                        <MessageSquare size={12} />
                        {task._count.comments}
                      </span>
                    ) : null}
                    {task.assignee && (
                      <div className={styles.taskAssignee} title={task.assignee.name}>
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          labels={labels}
          projectMembers={project?.members || []}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {createColumnStatus && (
        <CreateTaskModal
          initialStatus={createColumnStatus}
          labels={labels}
          projectMembers={project?.members || []}
          onClose={() => setCreateColumnStatus(null)}
        />
      )}
    </div>
  );
}
