import { create } from 'zustand';

interface EditorTab {
  filePath: string;
  fileName: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

const fileContentCache = new Map<string, string>();

function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    json: 'json', css: 'css', html: 'html', md: 'markdown', py: 'python',
    rs: 'rust', go: 'go', java: 'java', yml: 'yaml', yaml: 'yaml',
    xml: 'xml', sql: 'sql', sh: 'shell', bash: 'shell', toml: 'toml',
  };
  return map[ext || ''] || 'plaintext';
}

interface EditorState {
  tabs: EditorTab[];
  activeFilePath: string | null;
  openFile: (filePath: string, content: string) => void;
  closeFile: (filePath: string) => void;
  setActiveFile: (filePath: string) => void;
  markDirty: (filePath: string, dirty: boolean) => void;
  getContent: (filePath: string) => string | undefined;
  setContent: (filePath: string, content: string) => void;
  saveFile: (filePath: string) => Promise<void>;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  tabs: [],
  activeFilePath: null,

  openFile: (filePath, content) => {
    const existing = get().tabs.find((t) => t.filePath === filePath);
    if (existing) {
      set((state) => ({
        tabs: state.tabs.map((t) => ({ ...t, isActive: t.filePath === filePath })),
        activeFilePath: filePath,
      }));
      fileContentCache.set(filePath, content);
      return;
    }
    const fileName = filePath.split('/').pop() || filePath;
    const language = detectLanguage(fileName);
    const newTab: EditorTab = {
      filePath, fileName, language, isDirty: false, isActive: true,
    };
    set((state) => ({
      tabs: state.tabs.map((t) => ({ ...t, isActive: false })).concat(newTab),
      activeFilePath: filePath,
    }));
    fileContentCache.set(filePath, content);
  },

  closeFile: (filePath) => {
    set((state) => {
      const filtered = state.tabs.filter((t) => t.filePath !== filePath);
      const newActive = filtered.length > 0 ? filtered[filtered.length - 1].filePath : null;
      return {
        tabs: filtered.map((t) => ({ ...t, isActive: t.filePath === newActive })),
        activeFilePath: newActive,
      };
    });
  },

  setActiveFile: (filePath) =>
    set((state) => ({
      tabs: state.tabs.map((t) => ({ ...t, isActive: t.filePath === filePath })),
      activeFilePath: filePath,
    })),

  markDirty: (filePath, dirty) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.filePath === filePath ? { ...t, isDirty: dirty } : t)),
    })),

  getContent: (filePath) => fileContentCache.get(filePath),

  setContent: (filePath, content) => {
    fileContentCache.set(filePath, content);
  },

  saveFile: async (filePath) => {
    const content = fileContentCache.get(filePath);
    if (content !== undefined) {
      try {
        const { writeFile } = await import('../tauri/commands');
        await writeFile(filePath, content);
        set((state) => ({
          tabs: state.tabs.map((t) => (t.filePath === filePath ? { ...t, isDirty: false } : t)),
        }));
      } catch {
        // Fallback: Tauri not available during dev in browser
        console.warn('File save only works in Tauri app');
      }
    }
  },
}));

export { fileContentCache };
