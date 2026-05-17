package terminal_code.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import terminal_code.backend.entity.WorkspaceState;

import java.util.Optional;
import java.util.UUID;

public interface WorkspaceStateRepository extends JpaRepository<WorkspaceState, UUID> {
    Optional<WorkspaceState> findByWorkspaceId(UUID workspaceId);
}
