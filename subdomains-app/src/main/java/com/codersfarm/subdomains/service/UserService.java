package com.codersfarm.subdomains.service;

import com.codersfarm.subdomains.model.User;
import com.codersfarm.subdomains.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public User register(String email, String rawPassword, String baseUrl) {
        if (userRepository.existsByEmail(email.toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email.toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setVerificationToken(UUID.randomUUID().toString());
        user = userRepository.save(user);

        emailService.sendVerificationEmail(email, user.getVerificationToken(), baseUrl);
        return user;
    }

    @Transactional
    public boolean verifyEmail(String token) {
        Optional<User> opt = userRepository.findByVerificationToken(token);
        if (opt.isEmpty()) return false;

        User user = opt.get();
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
        return true;
    }

    @Transactional
    public void sendMagicLink(String email, String baseUrl) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setMagicLinkToken(token);
            user.setMagicLinkExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
            userRepository.save(user);
            emailService.sendMagicLink(email, token, baseUrl);
        });
    }

    @Transactional
    public Optional<User> authenticateMagicLink(String token) {
        Optional<User> opt = userRepository.findByMagicLinkToken(token);
        if (opt.isEmpty()) return Optional.empty();

        User user = opt.get();
        if (user.getMagicLinkExpiry() == null || user.getMagicLinkExpiry().isBefore(Instant.now())) {
            return Optional.empty();
        }

        user.setMagicLinkToken(null);
        user.setMagicLinkExpiry(null);
        user.setEmailVerified(true);
        user.setLastLogin(Instant.now());
        userRepository.save(user);
        return Optional.of(user);
    }

    @Transactional
    public void requestPasswordReset(String email, String baseUrl) {
        userRepository.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(email, token, baseUrl);
        });
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<User> opt = userRepository.findByPasswordResetToken(token);
        if (opt.isEmpty()) return false;

        User user = opt.get();
        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(Instant.now())) {
            return false;
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
        return true;
    }

    @Transactional
    public void deleteAccount(Long userId) {
        userRepository.deleteById(userId);
    }

    public void recordLogin(User user) {
        user.setLastLogin(Instant.now());
        userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase());
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
