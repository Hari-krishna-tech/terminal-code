import { create } from 'zustand';
import * as workspacesApi from '../api/workspaces';
import type { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest, CreateProjectRequest } from '../types/workspace';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isLoading: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceRequest) => Promise<Workspace>;
  updateWorkspace: (id: string, data: UpdateWorkspaceRequest) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setActiveWorkspace: (id: string) => void;
  toggleStar: (id: string, starred: boolean) => Promise<void>;
  addProject: (workspaceId: string, data: CreateProjectRequest) => Promise<void>;
  removeProject: (workspaceId: string, projectId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    const workspaces = await workspacesApi.listWorkspaces();
    set({ workspaces, isLoading: false });
  },

  createWorkspace: async (data) => {
    const ws = await workspacesApi.createWorkspace(data);
    set((state) => ({ workspaces: [...state.workspaces, ws] }));
    return ws;
  },

  updateWorkspace: async (id, data) => {
    const updated = await workspacesApi.updateWorkspace(id, data);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
    }));
  },

  deleteWorkspace: async (id) => {
    await workspacesApi.deleteWorkspace(id);
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
    }));
  },

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  toggleStar: async (id, starred) => {
    await workspacesApi.toggleStar(id, starred);
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, isStarred: starred } : w
      ),
    }));
  },

  addProject: async (workspaceId, data) => {
    const project = await workspacesApi.addProject(workspaceId, data);
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, projects: [...w.projects, project] }
          : w
      ),
    }));
  },

  removeProject: async (workspaceId, projectId) => {
    await workspacesApi.deleteProject(workspaceId, projectId);
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId
          ? { ...w, projects: w.projects.filter((p) => p.id !== projectId) }
          : w
      ),
    }));
  },
}));
