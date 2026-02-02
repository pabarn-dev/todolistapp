import { apiClient, ApiResponse } from './client';
import type {
  Task,
  TaskStats,
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus,
  TaskPriority,
  Comment
} from '../types/api';

interface TasksResponse {
  items: Task[];
  nextCursor: string | null;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  labelId?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export const tasksApi = {
  async getAll(orgSlug: string, projectSlug: string, filters?: TaskFilters): Promise<TasksResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters?.labelId) params.set('labelId', filters.labelId);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.cursor) params.set('cursor', filters.cursor);
    if (filters?.limit) params.set('limit', filters.limit.toString());

    const response = await apiClient.get<ApiResponse<Task[]> & { pagination: { nextCursor: string | null } }>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks?${params}`
    );
    return {
      items: response.data.data,
      nextCursor: response.data.pagination?.nextCursor ?? null,
    };
  },

  async getById(orgSlug: string, projectSlug: string, taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`
    );
    return response.data.data;
  },

  async create(orgSlug: string, projectSlug: string, data: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks`,
      data
    );
    return response.data.data;
  },

  async update(orgSlug: string, projectSlug: string, taskId: string, data: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`,
      data
    );
    return response.data.data;
  },

  async delete(orgSlug: string, projectSlug: string, taskId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`);
  },

  async reorder(orgSlug: string, projectSlug: string, tasks: { id: string; position: number; status?: TaskStatus }[]): Promise<void> {
    await apiClient.patch(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/reorder`,
      { tasks }
    );
  },

  async getStats(orgSlug: string, projectSlug: string): Promise<TaskStats> {
    const response = await apiClient.get<ApiResponse<TaskStats>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/stats`
    );
    return response.data.data;
  },

  // Comments
  async getComments(orgSlug: string, projectSlug: string, taskId: string): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<Comment[]>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments`
    );
    return response.data.data;
  },

  async createComment(orgSlug: string, projectSlug: string, taskId: string, content: string): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}/comments`,
      { content }
    );
    return response.data.data;
  },

  async updateComment(orgSlug: string, projectSlug: string, commentId: string, content: string): Promise<Comment> {
    const response = await apiClient.patch<ApiResponse<Comment>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/comments/${commentId}`,
      { content }
    );
    return response.data.data;
  },

  async deleteComment(orgSlug: string, projectSlug: string, commentId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgSlug}/projects/${projectSlug}/comments/${commentId}`);
  },
};
