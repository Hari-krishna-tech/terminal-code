import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarView = 'files' | 'search' | 'git' | null;

interface UIState {
  sidebarVisible: boolean;
  sidebarView: SidebarView;
  sidebarWidth: number;
  editorHeight: number;
  terminalHeight: number;
  toggleSidebar: (view?: SidebarView) => void;
  setSidebarWidth: (w: number) => void;
  setEditorHeight: (h: number) => void;
  setTerminalHeight: (h: number) => void;
}

export const useUiStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarVisible: true,
      sidebarView: 'files',
      sidebarWidth: 280,
      editorHeight: 70,
      terminalHeight: 30,

      toggleSidebar: (view) => {
        const state = get();
        if (view === state.sidebarView && state.sidebarVisible) {
          set({ sidebarVisible: false, sidebarView: null });
        } else {
          set({ sidebarVisible: true, sidebarView: view || 'files' });
        }
      },

      setSidebarWidth: (w) => set({ sidebarWidth: Math.max(180, Math.min(600, w)) }),
      setEditorHeight: (h) => set({ editorHeight: h }),
      setTerminalHeight: (h) => set({ terminalHeight: h }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarVisible: state.sidebarVisible,
        sidebarWidth: state.sidebarWidth,
        editorHeight: state.editorHeight,
        terminalHeight: state.terminalHeight,
      }),
    }
  )
);
