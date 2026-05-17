package terminal_code.backend.auth.application;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import terminal_code.backend.auth.domain.RefreshToken;
import terminal_code.backend.auth.domain.RefreshTokenRepository;
import terminal_code.backend.auth.dto.TokenRefreshResponse;
import terminal_code.backend.auth.dto.TokenRefreshRequest;
import terminal_code.backend.common.error.ResourceNotFoundException;
import terminal_code.backend.common.error.TokenRefreshException;
import terminal_code.backend.user.domain.User;
import terminal_code.backend.user.domain.UserRepository;

import java.time.Duration;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public User getOrCreateUser(org.springframework.security.oauth2.core.user.OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String googleSub = oAuth2User.getAttribute("sub");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        return userRepository.findByGoogleSub(googleSub)
            .orElseGet(() -> userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getGoogleSub() == null) {
                        existingUser.setGoogleSub(googleSub);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> userRepository.save(new User(email, name, picture, googleSub)))
            );
    }

    public void storeRefreshToken(String tokenId, UUID userId) {
        RefreshToken token = RefreshToken.create(
            tokenId,
            userId,
            Duration.ofMillis(jwtService.getRefreshTokenExpiration())
        );
        refreshTokenRepository.save(token);
    }

    public TokenRefreshResponse refreshAccessToken(TokenRefreshRequest request) {
        Claims claims;
        try {
            claims = jwtService.validateRefreshToken(request.refreshToken());
        } catch (Exception e) {
            throw new TokenRefreshException("Invalid refresh token");
        }
        String tokenId = claims.get("tokenId", String.class);

        RefreshToken stored = refreshTokenRepository.findById(tokenId)
            .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));

        if (stored.isRevoked()) {
            refreshTokenRepository.revokeAllForUser(stored.getUserId());
            throw new TokenRefreshException("Refresh token revoked — possible theft detected");
        }

        if (stored.isExpired()) {
            throw new TokenRefreshException("Refresh token expired");
        }

        stored.revoke();
        refreshTokenRepository.save(stored);

        String userId = stored.getUserId().toString();
        String email = claims.getSubject();
        String newRefreshToken = jwtService.generateRefreshToken(userId, email);
        storeRefreshToken(jwtService.extractTokenId(newRefreshToken), stored.getUserId());

        String newAccessToken = jwtService.generateAccessToken(userId, email);

        return new TokenRefreshResponse(newAccessToken, newRefreshToken);
    }

    public void revokeRefreshToken(String refreshToken) {
        try {
            String tokenId = jwtService.extractTokenId(refreshToken);
            refreshTokenRepository.findById(tokenId).ifPresent(token -> {
                token.revoke();
                refreshTokenRepository.save(token);
            });
        } catch (JwtException | IllegalArgumentException ignored) {
            // Token already invalid — no-op
        }
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
