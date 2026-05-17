import { useEffect } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
import { AppShell } from '../components/layout/AppShell';
import { WorkspaceCreateDialog } from '../components/workspace/WorkspaceCreateDialog';
import { useState } from 'react';

export function WorkspacePage() {
  const { workspaces, fetchWorkspaces, isLoading } = useWorkspaceStore();
  const { isAuthenticated } = useAuthStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces]);

  if (workspaces.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1e1e1e] gap-4">
        <h2 className="text-xl text-white">Welcome to Terminal Code</h2>
        <p className="text-gray-400">Create your first workspace to get started</p>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005999] transition-colors"
        >
          Create Workspace
        </button>
        {showCreateDialog && (
          <WorkspaceCreateDialog onClose={() => setShowCreateDialog(false)} />
        )}
      </div>
    );
  }

  return <AppShell />;
}
