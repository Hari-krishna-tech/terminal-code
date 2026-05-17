import { useEffect, useRef, useCallback } from 'react';
import type { Terminal as XTerm } from '@xterm/xterm';
import { useTerminalStore } from '../../store/terminalStore';
import {
  createTerminal,
  writeTerminal,
  killTerminal,
  resizeTerminal,
  listenTerminalOutput,
} from '../../tauri/commands';

export function TerminalPane() {
  const activeTabId = useTerminalStore((s) => s.activeTabId);
  const cwd = useTerminalStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeTabId);
    return tab?.cwd ?? null;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const initializedRef = useRef<string | null>(null);

  const cleanupTerminal = useCallback(async () => {
    if (sessionIdRef.current) {
      await killTerminal(sessionIdRef.current).catch(() => {});
      sessionIdRef.current = null;
    }
    if (unlistenRef.current) {
      unlistenRef.current();
      unlistenRef.current = null;
    }
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
    if (fitAddonRef.current) {
      fitAddonRef.current.dispose();
      fitAddonRef.current = null;
    }
    initializedRef.current = null;
  }, []);

  useEffect(() => {
    if (!activeTabId || !cwd) return;

    if (initializedRef.current === activeTabId) return;

    const currentCwd = cwd;
    const currentTabId = activeTabId;

    cleanupTerminal().then(() => initTerminal());

    async function initTerminal() {
      const container = containerRef.current;
      if (!container) return;

      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#aeafad',
          selectionBackground: '#264f78',
          black: '#000000',
          red: '#cd3131',
          green: '#0dbc79',
          yellow: '#e5e510',
          blue: '#2472c8',
          magenta: '#bc3fbc',
          cyan: '#11a8cd',
          white: '#e5e5e5',
          brightBlack: '#666666',
          brightRed: '#f14c4c',
          brightGreen: '#23d18b',
          brightYellow: '#f5f543',
          brightBlue: '#3b8eea',
          brightMagenta: '#d670d6',
          brightCyan: '#29b8db',
          brightWhite: '#e5e5e5',
        },
        allowProposedApi: true,
        allowTransparency: false,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
      initializedRef.current = currentTabId;

      try {
        const sid = await createTerminal(currentCwd);
        sessionIdRef.current = sid;

        const unlisten = await listenTerminalOutput((event) => {
          if (event.sessionId === sid && xtermRef.current) {
            xtermRef.current.write(event.data);
          }
        });
        unlistenRef.current = unlisten;

        term.onData((data) => {
          if (sessionIdRef.current) {
            writeTerminal(sessionIdRef.current, data);
          }
        });

        term.onResize(({ cols, rows }) => {
          if (sessionIdRef.current) {
            resizeTerminal(sessionIdRef.current, cols, rows);
          }
        });
      } catch (err) {
        term.writeln(`\r\nFailed to start terminal: ${err}\r\n`);
      }
    }
  }, [activeTabId, cwd, cleanupTerminal]);

  useEffect(() => {
    return () => {
      cleanupTerminal();
    };
  }, [cleanupTerminal]);

  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current) {
        try { fitAddonRef.current.fit(); } catch { /* resize may fail during cleanup */ }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeTabId) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-500">
        <p className="text-sm">Open a terminal to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1e1e1e] p-1">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
