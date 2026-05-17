package terminal_code.backend.dto;

import java.time.Instant;

public record ProjectResponse(
    String id,
    String name,
    String localPath,
    String description,
    boolean isStarred,
    Instant lastOpenedAt,
    int sortOrder,
    Instant createdAt,
    Instant updatedAt
) {}
