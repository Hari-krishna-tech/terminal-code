import { useState, useCallback } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useEditorStore } from '../../store/editorStore';
import { readDirectory, readFile } from '../../tauri/commands';
import type { FileEntry } from '../../tauri/commands';

interface TreeNode {
  entry: FileEntry;
  children: TreeNode[] | null;
  expanded: boolean;
  loading: boolean;
}

export function FileExplorer() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const openFile = useEditorStore((s) => s.openFile);

  const [projectTrees, setProjectTrees] = useState<Record<string, TreeNode[]>>({});

  const cloneTrees = (trees: Record<string, TreeNode[]>) =>
    JSON.parse(JSON.stringify(trees)) as Record<string, TreeNode[]>;

  const loadDirectory = useCallback(async (path: string): Promise<TreeNode[]> => {
    try {
      const entries = await readDirectory(path);
      return entries
        .filter((e) => !e.name.startsWith('.'))
        .sort((a, b) => {
          if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map((entry) => ({
          entry,
          children: entry.is_dir ? null : null,
          expanded: false,
          loading: false,
        }));
    } catch {
      return [];
    }
  }, []);

  const loadProjectTree = useCallback(async (projectId: string, localPath: string) => {
    setProjectTrees((prev) => ({ ...prev, [projectId]: [] }));
    const tree = await loadDirectory(localPath);
    setProjectTrees((prev) => ({ ...prev, [projectId]: tree }));
  }, [loadDirectory]);

  const toggleExpand = useCallback(async (projectId: string, pathSegments: number[]) => {
    const tree = projectTrees[projectId];
    if (!tree) return;

    const node = getNode(tree, pathSegments);
    if (!node || !node.entry.is_dir) return;

    if (node.expanded) {
      setProjectTrees((prev) => {
        const updated = cloneTrees(prev);
        const target = getNode(updated[projectId], pathSegments);
        if (target) target.expanded = false;
        return updated;
      });
      return;
    }

    if (node.children === null) {
      setProjectTrees((prev) => {
        const updated = cloneTrees(prev);
        const target = getNode(updated[projectId], pathSegments);
        if (target) target.loading = true;
        return updated;
      });

      const children = await loadDirectory(node.entry.path);

      setProjectTrees((prev) => {
        const updated = cloneTrees(prev);
        const target = getNode(updated[projectId], pathSegments);
        if (target) {
          target.children = children;
          target.expanded = true;
          target.loading = false;
        }
        return updated;
      });
    } else {
      setProjectTrees((prev) => {
        const updated = cloneTrees(prev);
        const target = getNode(updated[projectId], pathSegments);
        if (target) target.expanded = true;
        return updated;
      });
    }
  }, [loadDirectory, projectTrees]);

  const handleFileClick = useCallback(async (entry: FileEntry) => {
    try {
      const content = await readFile(entry.path);
      openFile(entry.path, content);
    } catch {
      // file read failed
    }
  }, [openFile]);

  return (
    <div className="space-y-0.5 text-xs">
      {workspaces.map((ws) => (
        <div key={ws.id}>
          <div
            className={`px-2 py-1 rounded cursor-pointer flex items-center justify-between
              ${ws.id === activeWorkspaceId ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
            onClick={() => {
              setActiveWorkspace(ws.id);
              ws.projects.forEach((p) => {
                if (!projectTrees[p.id]) {
                  loadProjectTree(p.id, p.localPath);
                }
              });
            }}
          >
            <span className="flex items-center gap-2">
              <span>{ws.isStarred ? '\u2605' : '\u{1F4C1}'}</span>
              <span className="truncate">{ws.name}</span>
            </span>
          </div>

          {ws.id === activeWorkspaceId && ws.projects.map((project) => (
            <div key={project.id} className="ml-3">
              <div
                className="px-2 py-0.5 text-gray-400 flex items-center gap-1 cursor-pointer hover:text-white"
                onClick={() => {
                  if (!projectTrees[project.id]) {
                    loadProjectTree(project.id, project.localPath);
                  }
                }}
              >
                <span className="text-[10px]">{projectTrees[project.id] ? '\u25BC' : '\u25B6'}</span>
                <span>{project.name}</span>
              </div>

              {projectTrees[project.id]?.length > 0 && (
                <div className="ml-2">
                  {projectTrees[project.id].map((node, i) => (
                    <FileTreeNode
                      key={node.entry.path}
                      node={node}
                      depth={0}
                      pathSegments={[i]}
                      projectId={project.id}
                      onClickFile={handleFileClick}
                      toggleExpand={toggleExpand}
                    />
                  ))}
                </div>
              )}

              {projectTrees[project.id]?.length === 0 && (
                <div className="ml-4 text-gray-600 py-0.5">Empty directory</div>
              )}
            </div>
          ))}
        </div>
      ))}

      {workspaces.length === 0 && (
        <p className="text-gray-500 p-2">No workspaces yet</p>
      )}
    </div>
  );
}

function FileTreeNode({
  node,
  depth,
  pathSegments,
  projectId,
  onClickFile,
  toggleExpand,
}: {
  node: TreeNode;
  depth: number;
  pathSegments: number[];
  projectId: string;
  onClickFile: (entry: FileEntry) => void;
  toggleExpand: (projectId: string, pathSegments: number[]) => void;
}) {
  const isDir = node.entry.is_dir;
  const indent = depth * 12;

  return (
    <>
      <div
        className="px-1 py-0.5 text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded cursor-pointer flex items-center gap-1 truncate"
        style={{ paddingLeft: 8 + indent }}
        onClick={() => (isDir ? toggleExpand(projectId, pathSegments) : onClickFile(node.entry))}
      >
        <span className="text-[10px] shrink-0 w-3 text-center">
          {isDir
            ? node.loading
              ? '\u23F3'
              : node.expanded
                ? '\u25BC'
                : '\u25B6'
            : '\u{1F4C4}'}
        </span>
        <span className="truncate">{node.entry.name}</span>
      </div>
      {isDir && node.expanded && node.children?.map((child, childIdx) => (
        <FileTreeNode
          key={child.entry.path}
          node={child}
          depth={depth + 1}
          pathSegments={[...pathSegments, childIdx]}
          projectId={projectId}
          onClickFile={onClickFile}
          toggleExpand={toggleExpand}
        />
      ))}
    </>
  );
}

function getNode(tree: TreeNode[], path: number[]): TreeNode | null {
  let current: TreeNode[] = tree;
  let result: TreeNode | null = null;
  for (let i = 0; i < path.length; i++) {
    result = current[path[i]] ?? null;
    if (!result) return null;
    if (i < path.length - 1 && result.children) {
      current = result.children;
    }
  }
  return result;
}
