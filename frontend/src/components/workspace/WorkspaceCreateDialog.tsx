import { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Props {
  onClose: () => void;
}

export function WorkspaceCreateDialog({ onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createWorkspace({ name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-[#2d2d2d] rounded-lg p-6 w-96 shadow-xl border border-[#3c3c3c]"
      >
        <h3 className="text-white text-lg font-semibold mb-4">Create Workspace</h3>

        <label className="block text-gray-400 text-xs mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555]
                     focus:outline-none focus:border-[#007acc] mb-3 text-sm"
          placeholder="My Project"
          autoFocus
        />

        <label className="block text-gray-400 text-xs mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#3c3c3c] text-white px-3 py-2 rounded border border-[#555]
                     focus:outline-none focus:border-[#007acc] mb-4 text-sm"
          placeholder="Optional"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-[#3c3c3c] rounded text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005999] text-sm"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
