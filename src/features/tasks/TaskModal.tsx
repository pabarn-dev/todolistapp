import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api';
import { X, Calendar, User, Tag, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import type { Task, Label, ProjectMember, TaskStatus, TaskPriority } from '../../types/api';
import styles from './TaskModal.module.css';

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'URGENT', label: 'Urgent', color: '#dc2626' },
  { value: 'HIGH', label: 'High', color: '#f97316' },
  { value: 'MEDIUM', label: 'Medium', color: '#eab308' },
  { value: 'LOW', label: 'Low', color: '#22c55e' },
  { value: 'NONE', label: 'None', color: '#6b7280' },
];

interface TaskModalProps {
  task: Task;
  labels: Label[];
  projectMembers: ProjectMember[];
  onClose: () => void;
}

export function TaskModal({ task, labels: _labels, projectMembers, onClose }: TaskModalProps) {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [newComment, setNewComment] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', task.id],
    queryFn: () => tasksApi.getComments(orgSlug!, projectSlug!, task.id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof tasksApi.update>[3]) =>
      tasksApi.update(orgSlug!, projectSlug!, task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgSlug, projectSlug] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(orgSlug!, projectSlug!, task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', orgSlug, projectSlug] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      tasksApi.createComment(orgSlug!, projectSlug!, task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
      setNewComment('');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title,
      description: description || null,
      status,
      priority,
      assigneeId: assigneeId || null,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Task title"
          />
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.section}>
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Add a description..."
                rows={4}
              />
            </div>

            <div className={styles.section}>
              <label>Comments</label>
              <div className={styles.comments}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentAvatar}>
                      {comment.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>{comment.author.name}</span>
                        <span className={styles.commentDate}>
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className={styles.commentForm}>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button type="submit" disabled={!newComment.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.field}>
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as TaskStatus);
                  updateMutation.mutate({ status: e.target.value as TaskStatus });
                }}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as TaskPriority);
                  updateMutation.mutate({ priority: e.target.value as TaskPriority });
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>
                <User size={14} />
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  updateMutation.mutate({ assigneeId: e.target.value || null });
                }}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>
                <Calendar size={14} />
                Due Date
              </label>
              <span className={styles.value}>
                {task.dueDate
                  ? format(new Date(task.dueDate), 'MMM d, yyyy')
                  : 'No due date'}
              </span>
            </div>

            <div className={styles.field}>
              <label>
                <Tag size={14} />
                Labels
              </label>
              <div className={styles.labels}>
                {task.labels.length > 0 ? (
                  task.labels.map((label) => (
                    <span
                      key={label.id}
                      className={styles.label}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))
                ) : (
                  <span className={styles.noLabels}>No labels</span>
                )}
              </div>
            </div>

            <button
              className={styles.deleteButton}
              onClick={() => {
                if (confirm('Are you sure you want to delete this task?')) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Trash2 size={16} />
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
