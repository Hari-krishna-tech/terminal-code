package terminal_code.backend.user.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import terminal_code.backend.common.error.ResourceNotFoundException;
import terminal_code.backend.user.domain.User;
import terminal_code.backend.user.domain.UserRepository;
import terminal_code.backend.user.dto.UserResponse;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserResponse(
            user.getId().toString(),
            user.getEmail(),
            user.getDisplayName(),
            user.getAvatarUrl()
        );
    }

    public User findEntityById(UUID userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
