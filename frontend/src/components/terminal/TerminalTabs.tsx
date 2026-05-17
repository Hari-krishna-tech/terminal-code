import { useTerminalStore } from '../../store/terminalStore';
import { useWorkspaceStore } from '../../store/workspaceStore';

export function TerminalTabs() {
  const { tabs, setActiveTab, closeTab, createTab } = useTerminalStore();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  const getTerminalCwd = (): string => {
    if (activeWorkspaceId) {
      const ws = workspaces.find((w) => w.id === activeWorkspaceId);
      if (ws && ws.projects.length > 0) {
        return ws.projects[0].localPath;
      }
    }
    return '/tmp';
  };

  return (
    <div className="flex bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto h-8 shrink-0 items-center">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 px-3 text-xs cursor-pointer border-r border-[#3c3c3c] h-full
            ${tab.isActive ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span>{tab.title}</span>
          <button
            className="ml-1 hover:bg-[#3c3c3c] rounded px-0.5 text-gray-500 hover:text-white"
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="px-3 text-xs text-gray-400 hover:text-white hover:bg-[#2a2d2e] h-full"
        onClick={() => createTab(getTerminalCwd())}
      >
        +
      </button>
    </div>
  );
}
