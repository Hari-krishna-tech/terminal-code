package terminal_code.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import terminal_code.backend.entity.Workspace;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    List<Workspace> findByUserIdOrderBySortOrderAsc(UUID userId);
    List<Workspace> findByUserIdAndIsStarredTrue(UUID userId);
    Optional<Workspace> findByIdAndUserId(UUID id, UUID userId);
}
