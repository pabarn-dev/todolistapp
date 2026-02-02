import { apiClient, ApiResponse } from './client';
import type {
  Organization,
  OrganizationMember,
  CreateOrganizationInput,
  OrganizationRole,
  Label,
  Invitation
} from '../types/api';

export const organizationsApi = {
  // Organizations
  async getAll(): Promise<Organization[]> {
    const response = await apiClient.get<ApiResponse<Organization[]>>('/organizations');
    return response.data.data;
  },

  async getBySlug(slug: string): Promise<Organization & { members: OrganizationMember[] }> {
    const response = await apiClient.get<ApiResponse<Organization & { members: OrganizationMember[] }>>(
      `/organizations/${slug}`
    );
    return response.data.data;
  },

  async create(data: CreateOrganizationInput): Promise<Organization> {
    const response = await apiClient.post<ApiResponse<Organization>>('/organizations', data);
    return response.data.data;
  },

  async update(slug: string, data: Partial<CreateOrganizationInput>): Promise<Organization> {
    const response = await apiClient.patch<ApiResponse<Organization>>(`/organizations/${slug}`, data);
    return response.data.data;
  },

  async delete(slug: string): Promise<void> {
    await apiClient.delete(`/organizations/${slug}`);
  },

  // Members
  async getMembers(slug: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get<ApiResponse<OrganizationMember[]>>(
      `/organizations/${slug}/members`
    );
    return response.data.data;
  },

  async updateMemberRole(slug: string, userId: string, role: OrganizationRole): Promise<OrganizationMember> {
    const response = await apiClient.patch<ApiResponse<OrganizationMember>>(
      `/organizations/${slug}/members/${userId}`,
      { role }
    );
    return response.data.data;
  },

  async removeMember(slug: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${slug}/members/${userId}`);
  },

  // Labels
  async getLabels(slug: string): Promise<Label[]> {
    const response = await apiClient.get<ApiResponse<Label[]>>(`/organizations/${slug}/labels`);
    return response.data.data;
  },

  async createLabel(slug: string, data: { name: string; color: string }): Promise<Label> {
    const response = await apiClient.post<ApiResponse<Label>>(`/organizations/${slug}/labels`, data);
    return response.data.data;
  },

  async updateLabel(slug: string, labelId: string, data: { name?: string; color?: string }): Promise<Label> {
    const response = await apiClient.patch<ApiResponse<Label>>(
      `/organizations/${slug}/labels/${labelId}`,
      data
    );
    return response.data.data;
  },

  async deleteLabel(slug: string, labelId: string): Promise<void> {
    await apiClient.delete(`/organizations/${slug}/labels/${labelId}`);
  },

  // Invitations
  async getInvitations(slug: string): Promise<Invitation[]> {
    const response = await apiClient.get<ApiResponse<Invitation[]>>(`/organizations/${slug}/invitations`);
    return response.data.data;
  },

  async createInvitation(slug: string, data: { email: string; role: OrganizationRole }): Promise<Invitation> {
    const response = await apiClient.post<ApiResponse<Invitation>>(
      `/organizations/${slug}/invitations`,
      data
    );
    return response.data.data;
  },

  async revokeInvitation(slug: string, invitationId: string): Promise<void> {
    await apiClient.delete(`/organizations/${slug}/invitations/${invitationId}`);
  },
};

export const invitationsApi = {
  async getByToken(token: string): Promise<Invitation> {
    const response = await apiClient.get<ApiResponse<Invitation>>(`/invitations/${token}`);
    return response.data.data;
  },

  async accept(token: string): Promise<OrganizationMember> {
    const response = await apiClient.post<ApiResponse<OrganizationMember>>(`/invitations/${token}/accept`);
    return response.data.data;
  },
};
