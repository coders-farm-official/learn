package com.codersfarm.subdomains.repository;

import com.codersfarm.subdomains.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByMagicLinkToken(String token);

    Optional<User> findByPasswordResetToken(String token);
}
