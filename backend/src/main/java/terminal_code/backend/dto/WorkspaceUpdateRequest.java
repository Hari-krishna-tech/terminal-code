package terminal_code.backend.dto;

public record WorkspaceUpdateRequest(
    String name,
    String description,
    String color,
    String icon,
    Boolean isStarred,
    Integer sortOrder
) {}
