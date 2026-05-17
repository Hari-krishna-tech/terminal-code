package terminal_code.backend.user.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import terminal_code.backend.auth.api.JwtAuthenticationFilter.JwtPrincipal;
import terminal_code.backend.user.application.UserService;
import terminal_code.backend.user.dto.UserResponse;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(userService.getUser(java.util.UUID.fromString(principal.userId())));
    }
}
