package terminal_code.backend.dto;

import java.time.Instant;
import java.util.List;

public record WorkspaceResponse(
    String id,
    String name,
    String description,
    String color,
    String icon,
    boolean isStarred,
    int sortOrder,
    Instant createdAt,
    Instant updatedAt,
    List<ProjectResponse> projects
) {}
