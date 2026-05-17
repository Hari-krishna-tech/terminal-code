export interface TerminalSessionInfo {
  sessionId: string;
  shellPid: number;
  cwd: string;
}

export interface TauriFileInfo {
  name: string;
  path: string;
  isDir: boolean;
  isSymlink: boolean;
  size: number;
  modified: number;
}
