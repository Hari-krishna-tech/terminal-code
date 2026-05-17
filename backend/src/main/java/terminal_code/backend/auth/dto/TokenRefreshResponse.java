package terminal_code.backend.auth.dto;

public record TokenRefreshResponse(String accessToken, String refreshToken) {}
