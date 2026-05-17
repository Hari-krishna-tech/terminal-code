import apiClient from './client';
import type {
  Workspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  Project,
  CreateProjectRequest,
} from '../types/workspace';

// Workspaces
export async function listWorkspaces(): Promise<Workspace[]> {
  const { data } = await apiClient.get<Workspace[]>('/workspaces');
  return data;
}

export async function createWorkspace(req: CreateWorkspaceRequest): Promise<Workspace> {
  const { data } = await apiClient.post<Workspace>('/workspaces', req);
  return data;
}

export async function updateWorkspace(id: string, req: UpdateWorkspaceRequest): Promise<Workspace> {
  const { data } = await apiClient.patch<Workspace>(`/workspaces/${id}`, req);
  return data;
}

export async function deleteWorkspace(id: string): Promise<void> {
  await apiClient.delete(`/workspaces/${id}`);
}

export async function toggleStar(id: string, starred: boolean): Promise<Workspace> {
  const { data } = await apiClient.put<Workspace>(
    `/workspaces/${id}/star?starred=${starred}`
  );
  return data;
}

// Projects
export async function addProject(workspaceId: string, req: CreateProjectRequest): Promise<Project> {
  const { data } = await apiClient.post<Project>(
    `/workspaces/${workspaceId}/projects`,
    req
  );
  return data;
}

export async function updateProject(
  workspaceId: string,
  projectId: string,
  req: CreateProjectRequest
): Promise<Project> {
  const { data } = await apiClient.put<Project>(
    `/workspaces/${workspaceId}/projects/${projectId}`,
    req
  );
  return data;
}

export async function deleteProject(workspaceId: string, projectId: string): Promise<void> {
  await apiClient.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
}
