package terminal_code.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import terminal_code.backend.entity.UserPreferences;

import java.util.List;
import java.util.UUID;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, UUID> {
    List<UserPreferences> findByUserId(UUID userId);

    @Modifying
    @Transactional
    void deleteByUserIdAndPreferenceKey(UUID userId, String preferenceKey);
}
