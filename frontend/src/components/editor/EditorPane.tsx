import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useEditorStore } from '../../store/editorStore';

export function EditorPane() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const getContent = useEditorStore((s) => s.getContent);
  const setContent = useEditorStore((s) => s.setContent);
  const markDirty = useEditorStore((s) => s.markDirty);
  const tabs = useEditorStore((s) => s.tabs);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (activeFilePath && value !== undefined) {
        setContent(activeFilePath, value);
        markDirty(activeFilePath, true);
      }
    },
    [activeFilePath, setContent, markDirty],
  );

  const activeTab = tabs.find((t) => t.isActive);
  const content = activeFilePath ? getContent(activeFilePath) : '';
  const language = activeTab?.language ?? 'plaintext';

  if (!activeFilePath) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-500">
        <p className="text-sm">Open a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          fontSize: 13,
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
          minimap: { enabled: false },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'off',
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          padding: { top: 4 },
        }}
      />
    </div>
  );
}
