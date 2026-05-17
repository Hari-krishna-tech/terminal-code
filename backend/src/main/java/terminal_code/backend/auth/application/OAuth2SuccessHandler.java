package terminal_code.backend.auth.application;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import terminal_code.backend.user.domain.User;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String REDIRECT_COOKIE_NAME = "oauth2_redirect_uri";

    private final JwtService jwtService;
    private final AuthService authService;

    public OAuth2SuccessHandler(JwtService jwtService, AuthService authService) {
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        User user = authService.getOrCreateUser(oAuth2User);

        String accessToken = jwtService.generateAccessToken(user.getId().toString(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId().toString(), user.getEmail());
        authService.storeRefreshToken(jwtService.extractTokenId(refreshToken), user.getId());

        String baseUrl = getRedirectBaseUrl(request);

        String redirectUrl = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("access_token", accessToken)
            .queryParam("refresh_token", refreshToken)
            .build()
            .toUriString();

        clearRedirectCookie(response);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        clearAuthenticationAttributes(request);
    }

    private String getRedirectBaseUrl(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REDIRECT_COOKIE_NAME.equals(cookie.getName())) {
                    try {
                        return new String(Base64.getUrlDecoder().decode(cookie.getValue()), StandardCharsets.UTF_8);
                    } catch (IllegalArgumentException ignored) {
                        break;
                    }
                }
            }
        }
        return "terminal-code://auth/callback";
    }

    private void clearRedirectCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REDIRECT_COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
