// Tauri IPC wrappers — typed invoke calls for all Rust commands.
// These are no-ops with console warnings when running outside Tauri (browser dev).

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

let tauriCore: typeof import('@tauri-apps/api/core') | null = null;
let tauriEvent: typeof import('@tauri-apps/api/event') | null = null;

async function getCore() {
  if (!isTauri) return null;
  if (!tauriCore) {
    try { tauriCore = await import('@tauri-apps/api/core'); } catch { /* no Tauri */ }
  }
  return tauriCore;
}

async function getEvent() {
  if (!isTauri) return null;
  if (!tauriEvent) {
    try { tauriEvent = await import('@tauri-apps/api/event'); } catch { /* no Tauri */ }
  }
  return tauriEvent;
}

// --- Terminal ---

export async function createTerminal(cwd: string): Promise<string> {
  const core = await getCore();
  if (!core) { console.warn('Tauri not available'); return 'browser-session'; }
  return core.invoke<string>('create_terminal', { cwd });
}

export async function writeTerminal(sessionId: string, data: string): Promise<void> {
  const core = await getCore();
  if (!core) return;
  return core.invoke('write_terminal', { sessionId, data });
}

export async function resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
  const core = await getCore();
  if (!core) return;
  return core.invoke('resize_terminal', { sessionId, cols, rows });
}

export async function killTerminal(sessionId: string): Promise<void> {
  const core = await getCore();
  if (!core) return;
  return core.invoke('kill_terminal', { sessionId });
}

// --- File System ---

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_symlink: boolean;
  size: number;
  modified: number;
}

export async function readDirectory(path: string): Promise<FileEntry[]> {
  const core = await getCore();
  if (!core) return [];
  return core.invoke<FileEntry[]>('read_directory', { path });
}

export async function readFile(path: string): Promise<string> {
  const core = await getCore();
  if (!core) return '';
  return core.invoke<string>('read_file', { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  const core = await getCore();
  if (!core) return;
  return core.invoke('write_file', { path, content });
}

// --- Auth Store ---

export async function storeToken(key: string, value: string): Promise<void> {
  const core = await getCore();
  if (!core) { localStorage.setItem(key, value); return; }
  return core.invoke('store_token', { key, value });
}

export async function getToken(key: string): Promise<string | null> {
  const core = await getCore();
  if (!core) return localStorage.getItem(key);
  return core.invoke<string | null>('get_token', { key });
}

export async function clearTokens(): Promise<void> {
  const core = await getCore();
  if (!core) { localStorage.clear(); return; }
  return core.invoke('clear_tokens');
}

// --- Events ---

export interface TerminalOutputEvent {
  sessionId: string;
  data: string;
}

export async function listenTerminalOutput(
  callback: (event: TerminalOutputEvent) => void
): Promise<() => void> {
  const event = await getEvent();
  if (!event) return () => {};
  const unlisten = await event.listen<TerminalOutputEvent>('terminal-output', (e) => {
    callback(e.payload);
  });
  return unlisten;
}
