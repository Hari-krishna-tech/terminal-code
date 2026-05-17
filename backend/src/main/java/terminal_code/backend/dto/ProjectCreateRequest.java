package terminal_code.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectCreateRequest(
    @NotBlank String name,
    @NotBlank String localPath,
    String description
) {}
