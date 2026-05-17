package terminal_code.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record WorkspaceCreateRequest(
    @NotBlank String name,
    String description,
    String color,
    String icon
) {}
