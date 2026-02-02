// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Organization
export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  myRole?: OrganizationRole;
  _count?: {
    projects: number;
    members: number;
  };
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

// Project
export type ProjectRole = 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  color: string | null;
  createdAt: string;
  myRole?: ProjectRole;
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

// Task
export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface Task {
  id: string;
  projectId: string;
  creatorId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  assignee: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null;
  labels: Label[];
  _count?: {
    comments: number;
  };
}

// Label
export interface Label {
  id: string;
  organizationId: string;
  name: string;
  color: string;
}

// Comment
export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

// Invitation
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  organization?: Pick<Organization, 'id' | 'name' | 'slug' | 'logoUrl'>;
  sender?: Pick<User, 'id' | 'name'>;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// Task Stats
export interface TaskStats {
  total: number;
  byStatus: Partial<Record<TaskStatus, number>>;
  completed: number;
  inProgress: number;
}

// Form inputs
export interface CreateOrganizationInput {
  name: string;
  slug?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  slug?: string;
  color?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  labelIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  labelIds?: string[];
}
