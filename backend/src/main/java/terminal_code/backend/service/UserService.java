package terminal_code.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import terminal_code.backend.common.ResourceNotFoundException;
import terminal_code.backend.entity.User;
import terminal_code.backend.repository.UserRepository;
import terminal_code.backend.dto.UserResponse;

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
