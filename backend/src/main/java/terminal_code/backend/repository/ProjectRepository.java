package terminal_code.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import terminal_code.backend.entity.Project;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByWorkspaceIdOrderBySortOrderAsc(UUID workspaceId);
    List<Project> findByWorkspaceIdInOrderBySortOrderAsc(List<UUID> workspaceIds);
    Optional<Project> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
