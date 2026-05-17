import { useWorkspaceStore } from '../../store/workspaceStore';

export function WorkspaceList() {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();

  return (
    <div className="space-y-1">
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className={`px-2 py-1 rounded cursor-pointer text-xs flex items-center justify-between
            ${ws.id === activeWorkspaceId ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
          onClick={() => setActiveWorkspace(ws.id)}
        >
          <span className="flex items-center gap-2">
            <span>{ws.icon || '\u{1F4C1}'}</span>
            <span className="truncate">{ws.name}</span>
          </span>
          {ws.isStarred && <span className="text-yellow-500 text-xs">{'★'}</span>}
        </div>
      ))}
    </div>
  );
}
