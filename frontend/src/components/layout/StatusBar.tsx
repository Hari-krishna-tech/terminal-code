import { useEditorStore } from '../../store/editorStore';
import { useAuthStore } from '../../store/authStore';

export function StatusBar() {
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-xs shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span>main</span>
        <span>0</span>
        <span>0</span>
      </div>
      <div className="flex items-center gap-3">
        {activeFilePath && (
          <span>Ln 1, Col 1</span>
        )}
        <span>UTF-8</span>
        {user && <span>{user.email}</span>}
      </div>
    </div>
  );
}
