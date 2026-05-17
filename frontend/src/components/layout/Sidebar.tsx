import { useUiStore } from '../../store/uiStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { FileExplorer } from '../fileExplorer/FileExplorer';

export function Sidebar() {
  const { sidebarView, sidebarWidth } = useUiStore();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return (
    <div
      className="bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0"
      style={{ width: sidebarWidth }}
    >
      <div className="h-8 flex items-center px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 border-b border-[#3c3c3c]">
        {sidebarView === 'files' && 'Explorer'}
        {sidebarView === 'search' && 'Search'}
        {sidebarView === 'git' && 'Source Control'}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sidebarView === 'files' && (
          activeWorkspaceId ? (
            <FileExplorer />
          ) : (
            <p className="text-gray-500 p-2 text-xs">Select a workspace to browse files</p>
          )
        )}
        {sidebarView === 'search' && (
          <div className="p-2">
            <input
              type="text"
              placeholder="Search files..."
              className="w-full bg-[#3c3c3c] text-gray-300 px-3 py-1.5 rounded border border-[#555]
                         focus:outline-none focus:border-[#007acc] text-xs"
            />
          </div>
        )}
        {sidebarView === 'git' && (
          <p className="text-gray-500 p-2 text-xs">Git integration coming soon</p>
        )}
      </div>
    </div>
  );
}
