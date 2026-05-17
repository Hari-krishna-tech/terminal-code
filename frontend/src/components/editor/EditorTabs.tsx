import { useEditorStore } from '../../store/editorStore';

export function EditorTabs() {
  const { tabs, setActiveFile, closeFile } = useEditorStore();

  return (
    <div className="flex bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto h-8 shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.filePath}
          className={`flex items-center gap-1 px-3 text-xs cursor-pointer border-r border-[#3c3c3c] h-full
            ${tab.isActive ? 'bg-[#1e1e1e] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
          onClick={() => setActiveFile(tab.filePath)}
        >
          <span className="whitespace-nowrap max-w-40 truncate">
            {tab.fileName}
          </span>
          {tab.isDirty && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
          <button
            className="ml-1 hover:bg-[#3c3c3c] rounded px-0.5 text-gray-500 hover:text-white"
            onClick={(e) => { e.stopPropagation(); closeFile(tab.filePath); }}
          >
            ×
          </button>
        </div>
      ))}
      {tabs.length === 0 && (
        <div className="flex items-center px-3 text-xs text-gray-500 h-full">
          No open editors
        </div>
      )}
    </div>
  );
}
