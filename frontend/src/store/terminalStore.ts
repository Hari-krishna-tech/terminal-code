import { create } from 'zustand';
import { createTerminal } from '../tauri/commands';

interface TerminalTab {
  id: string;
  title: string;
  cwd: string;
  isActive: boolean;
}

interface TerminalState {
  tabs: TerminalTab[];
  activeTabId: string | null;
  createTab: (cwd: string) => Promise<void>;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  renameTab: (id: string, title: string) => void;
}

export const useTerminalStore = create<TerminalState>()((set, get) => ({
  tabs: [],
  activeTabId: null,

  createTab: async (cwd) => {
    let sessionId: string;
    try {
      sessionId = await createTerminal(cwd);
    } catch {
      sessionId = `browser-${Date.now()}`;
    }

    const tab: TerminalTab = {
      id: sessionId,
      title: `Terminal ${get().tabs.length + 1}`,
      cwd,
      isActive: true,
    };
    set((state) => ({
      tabs: state.tabs.map((t) => ({ ...t, isActive: false })).concat(tab),
      activeTabId: sessionId,
    }));
  },

  closeTab: (id) => {
    set((state) => {
      const filtered = state.tabs.filter((t) => t.id !== id);
      const newActive =
        filtered.length > 0 ? filtered[filtered.length - 1].id : null;
      return {
        tabs: filtered.map((t) => ({ ...t, isActive: t.id === newActive })),
        activeTabId: newActive,
      };
    });
  },

  setActiveTab: (id) =>
    set((state) => ({
      tabs: state.tabs.map((t) => ({ ...t, isActive: t.id === id })),
      activeTabId: id,
    })),

  renameTab: (id, title) =>
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, title } : t)),
    })),
}));
