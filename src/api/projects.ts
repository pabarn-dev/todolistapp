import { apiClient, ApiResponse } from './client';
import type {
  Project,
  ProjectMember,
  CreateProjectInput,
  ProjectRole
} from '../types/api';

export const projectsApi = {
  async getAll(orgSlug: string): Promise<Project[]> {
    const response = await apiClient.get<ApiResponse<Project[]>>(
      `/organizations/${orgSlug}/projects`
    );
    return response.data.data;
  },

  async getBySlug(orgSlug: string, projectSlug: string): Promise<Project & { members: ProjectMember[] }> {
    const response = await apiClient.get<ApiResponse<Project & { members: ProjectMember[] }>>(
      `/organizations/${orgSlug}/projects/${projectSlug}`
    );
    return response.data.data;
  },

  async create(orgSlug: string, data: CreateProjectInput): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/organizations/${orgSlug}/projects`,
      data
    );
    return response.data.data;
  },

  async update(orgSlug: string, projectSlug: string, data: Partial<CreateProjectInput>): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/organizations/${orgSlug}/projects/${projectSlug}`,
      data
    );
    return response.data.data;
  },

  async delete(orgSlug: string, projectSlug: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgSlug}/projects/${projectSlug}`);
  },

  // Members
  async addMember(orgSlug: string, projectSlug: string, userId: string, role: ProjectRole): Promise<ProjectMember> {
    const response = await apiClient.post<ApiResponse<ProjectMember>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/members`,
      { userId, role }
    );
    return response.data.data;
  },

  async updateMemberRole(orgSlug: string, projectSlug: string, userId: string, role: ProjectRole): Promise<ProjectMember> {
    const response = await apiClient.patch<ApiResponse<ProjectMember>>(
      `/organizations/${orgSlug}/projects/${projectSlug}/members/${userId}`,
      { role }
    );
    return response.data.data;
  },

  async removeMember(orgSlug: string, projectSlug: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${orgSlug}/projects/${projectSlug}/members/${userId}`);
  },
};
