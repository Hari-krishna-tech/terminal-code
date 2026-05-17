package terminal_code.backend.security;

import java.security.Principal;

public record JwtPrincipal(String userId, String email) implements Principal {
    @Override
    public String getName() {
        return email;
    }
}
