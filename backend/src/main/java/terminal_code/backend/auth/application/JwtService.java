package terminal_code.backend.auth.application;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final SecretKey accessKey;
    private final SecretKey refreshKey;

    public JwtService(
        @Value("${jwt.access-secret}") String accessSecret,
        @Value("${jwt.refresh-secret}") String refreshSecret,
        @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
        @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration
    ) {
        byte[] accessBytes = Base64.getDecoder().decode(accessSecret);
        byte[] refreshBytes = Base64.getDecoder().decode(refreshSecret);
        this.accessKey = new SecretKeySpec(accessBytes, "HmacSHA256");
        this.refreshKey = new SecretKeySpec(refreshBytes, "HmacSHA256");
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(String userId, String email) {
        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(accessKey)
            .compact();
    }

    public String generateRefreshToken(String userId, String email) {
        return Jwts.builder()
            .subject(email)
            .claim("userId", userId)
            .claim("tokenId", UUID.randomUUID().toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
            .signWith(refreshKey)
            .compact();
    }

    public Claims validateAccessToken(String token) {
        return Jwts.parser()
            .verifyWith(accessKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public Claims validateRefreshToken(String token) {
        return Jwts.parser()
            .verifyWith(refreshKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractTokenId(String token) {
        return validateRefreshToken(token).get("tokenId", String.class);
    }

    public long getRefreshTokenExpiration() {
        return refreshTokenExpiration;
    }
}
