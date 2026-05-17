export interface Project {
  id: string;
  name: string;
  localPath: string;
  description: string | null;
  isStarred: boolean;
  lastOpenedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isStarred: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  projects: Project[];
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isStarred?: boolean;
  sortOrder?: number;
}

export interface CreateProjectRequest {
  name: string;
  localPath: string;
  description?: string;
}
