import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { EditorTabs } from '../editor/EditorTabs';
import { TerminalTabs } from '../terminal/TerminalTabs';
import { EditorPane } from '../editor/EditorPane';
import { TerminalPane } from '../terminal/TerminalPane';

const ACTIVITY_ITEMS = [
  { id: 'files' as const, icon: '\u{1F4C1}', label: 'Files' },
  { id: 'search' as const, icon: '\u{1F50D}', label: 'Search' },
  { id: 'git' as const, icon: '⎇', label: 'Git' },
];

export function AppShell() {
  const { sidebarVisible, sidebarView, toggleSidebar, editorHeight, terminalHeight, setEditorHeight, setTerminalHeight } = useUiStore();
  const [dragging, setDragging] = useState(false);

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    const startY = e.clientY;
    const container = (e.target as HTMLElement).parentElement;
    const containerHeight = container?.clientHeight || 600;
    const startEditorPct = editorHeight;

    const onMouseMove = (ev: MouseEvent) => {
      const deltaY = ev.clientY - startY;
      const deltaPct = (deltaY / containerHeight) * 100;
      const newEditorPct = startEditorPct + deltaPct;
      const clamped = Math.max(20, Math.min(85, newEditorPct));
      setEditorHeight(clamped);
      setTerminalHeight(100 - clamped);
    };

    const onMouseUp = () => {
      setDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e]">
      {/* Activity Bar + Sidebar + Main */}
      <div className="flex flex-1 min-h-0">
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-1 border-r border-[#3c3c3c]">
          {ACTIVITY_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleSidebar(item.id)}
              className={`w-10 h-10 flex items-center justify-center rounded hover:bg-[#3c3c3c] text-lg
                ${sidebarVisible && sidebarView === item.id ? 'text-white border-l-2 border-[#007acc]' : 'text-gray-400'}`}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* Sidebar */}
        {sidebarVisible && <Sidebar />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Area */}
          <div className="flex flex-col" style={{ height: `${editorHeight}%` }}>
            <EditorTabs />
            <div className="flex-1 min-h-0">
              <EditorPane />
            </div>
          </div>

          {/* Divider */}
          <div
            className={`h-1 bg-[#3c3c3c] cursor-row-resize hover:bg-[#007acc] transition-colors
              ${dragging ? 'bg-[#007acc]' : ''}`}
            onMouseDown={handleDividerMouseDown}
          />

          {/* Terminal Area */}
          <div className="flex flex-col" style={{ height: `${terminalHeight}%` }}>
            <TerminalTabs />
            <div className="flex-1 min-h-0">
              <TerminalPane />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
