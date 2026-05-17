package terminal_code.backend.workspace.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceStateRepository extends JpaRepository<WorkspaceState, UUID> {
    Optional<WorkspaceState> findByWorkspaceId(UUID workspaceId);
}
