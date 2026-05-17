package terminal_code.backend.workspace.dto;

public record WorkspaceUpdateRequest(
    String name,
    String description,
    String color,
    String icon,
    Boolean isStarred,
    Integer sortOrder
) {}
