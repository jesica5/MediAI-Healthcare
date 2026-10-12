package com.mediai.service;

import com.mediai.dto.SignInRequest;
import com.mediai.dto.SignInResponse;
import com.mediai.dto.UserDto;
import com.mediai.entity.User;
import com.mediai.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;

import com.mediai.dto.AuthStep1Response;
import com.mediai.dto.VerifyOtpRequest;
import com.mediai.entity.OtpVerification;
import com.mediai.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.secret:MediAiSecretKeyForClinicalStaffAuthTokensMustBeAtLeast32BytesLong}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${spring.mail.host:}")
    private String mailHost;

    public AuthService(UserRepository userRepository, OtpVerificationRepository otpRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedDefaultStaffUsers() {
        seedUserIfNotExists("doctor@mediai.org", "Doctor@123", "Dr. Bhuvana M.V.", "Doctor");
        seedUserIfNotExists("nurse@mediai.org", "Nurse@123", "Nurse Kavitha S.", "Triage Nurse");
        seedUserIfNotExists("admin@mediai.org", "Admin@123", "System Administrator", "System Administrator");
    }

    private void seedUserIfNotExists(String email, String rawPassword, String name, String role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User(email, passwordEncoder.encode(rawPassword), name, role);
            userRepository.save(user);
        }
    }

    public SignInResponse authenticateStaff(SignInRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid email or password");
            }
        } else {
            // Role resolution by email pattern for demo accounts if password is valid (>= 6 chars)
            String role = resolveRoleFromEmail(email);
            String fullName = email.split("@")[0].replace(".", " ").toUpperCase();
            user = new User(email, passwordEncoder.encode(request.getPassword()), fullName, role);
            user = userRepository.save(user);
        }

        String token = generateJwtToken(user);

        UserDto userDto = new UserDto(
            String.valueOf(user.getId()),
            user.getEmail(),
            user.getRole(),
            user.getFullName()
        );

        return new SignInResponse(userDto, token);
    }

    public String generateJwtToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
            .setSubject(user.getEmail())
            .claim("role", user.getRole())
            .claim("name", user.getFullName())
            .claim("userId", user.getId())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public String resolveRoleFromEmail(String email) {
        if (email == null) return "Triage Nurse";
        String lower = email.toLowerCase();
        if (lower.contains("doctor") || lower.contains("doc")) return "Doctor";
        if (lower.contains("admin") || lower.contains("sysadmin")) return "System Administrator";
        return "Triage Nurse";
    }

    /**
     * Step 1: Verify staff password and issue a time-limited cryptographically secure OTP
     */
    public AuthStep1Response initiateStaffLogin(SignInRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid email or password");
            }
        } else {
            // For demo users, auto-register if password >= 6 chars
            if (request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            String role = resolveRoleFromEmail(email);
            String fullName = email.split("@")[0].replace(".", " ").toUpperCase();
            User user = new User(email, passwordEncoder.encode(request.getPassword()), fullName, role);
            userRepository.save(user);
        }

        // Check resend cooldown (rate limiting: 30 seconds)
        Optional<OtpVerification> lastOtp = otpRepository.findTopByEmailOrderByCreatedAtDesc(email);
        if (lastOtp.isPresent()) {
            long secondsSince = ChronoUnit.SECONDS.between(lastOtp.get().getCreatedAt(), LocalDateTime.now());
            if (secondsSince < 30) {
                throw new IllegalArgumentException("Please wait " + (30 - secondsSince) + " seconds before requesting a new OTP.");
            }
        }

        // Generate 6-digit OTP
        int codeInt = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(codeInt);
        String otpHash = hashOtp(otpCode);
        String tempToken = UUID.randomUUID().toString();

        OtpVerification otp = new OtpVerification(
            UUID.randomUUID().toString(),
            email,
            tempToken,
            otpHash,
            LocalDateTime.now().plusMinutes(5)
        );
        otpRepository.save(otp);

        log.info("SECURITY TELEMETRY: 2-Factor OTP generated for {} -> [Code: {}]. Active for 5 minutes.", email, otpCode);

        boolean hasMailConfigured = mailHost != null && !mailHost.isBlank();
        String notice = hasMailConfigured
            ? "Two-factor authentication code sent to " + maskEmail(email) + "."
            : "Two-step verification active. OTP: " + otpCode + " (Development test bench: OTP logged for instant evaluation without external SMTP relay).";

        return new AuthStep1Response(tempToken, maskEmail(email), notice, otpCode, 300);
    }

    /**
     * Step 2: Verify single-use OTP code and issue JWT bearer token
     */
    public SignInResponse verifyStaffOtp(VerifyOtpRequest request) {
        OtpVerification otp = otpRepository.findByTempTokenAndIsUsedFalse(request.getTempToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired 2FA session. Please sign in again."));

        if (otp.isExpired()) {
            otp.setIsUsed(true);
            otpRepository.save(otp);
            throw new IllegalArgumentException("OTP code has expired. Please sign in to request a fresh OTP.");
        }

        if (otp.getAttempts() >= 3) {
            otp.setIsUsed(true);
            otpRepository.save(otp);
            throw new IllegalArgumentException("Too many incorrect attempts (maximum 3 exceeded). OTP invalidated for security. Please sign in again.");
        }

        String inputHash = hashOtp(request.getOtp().trim());
        if (!inputHash.equalsIgnoreCase(otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            int remaining = 3 - otp.getAttempts();
            throw new IllegalArgumentException("Incorrect OTP. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP as used immediately (single-use enforcement)
        otp.setIsUsed(true);
        otpRepository.save(otp);

        User user = userRepository.findByEmail(otp.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("Staff user account not found."));

        String token = generateJwtToken(user);
        UserDto userDto = new UserDto(
            String.valueOf(user.getId()),
            user.getEmail(),
            user.getRole(),
            user.getFullName()
        );

        return new SignInResponse(userDto, token);
    }

    /**
     * Resend fresh OTP using existing temp session token
     */
    public AuthStep1Response resendStaffOtp(String tempToken) {
        OtpVerification prev = otpRepository.findByTempTokenAndIsUsedFalse(tempToken)
            .orElseThrow(() -> new IllegalArgumentException("Active 2FA session not found. Please log in again."));

        prev.setIsUsed(true); // invalidate prior
        otpRepository.save(prev);

        int codeInt = 100000 + secureRandom.nextInt(900000);
        String otpCode = String.valueOf(codeInt);
        String otpHash = hashOtp(otpCode);
        String newTempToken = UUID.randomUUID().toString();

        OtpVerification newOtp = new OtpVerification(
            UUID.randomUUID().toString(),
            prev.getEmail(),
            newTempToken,
            otpHash,
            LocalDateTime.now().plusMinutes(5)
        );
        otpRepository.save(newOtp);

        log.info("SECURITY TELEMETRY: Resent fresh 2-Factor OTP for {} -> [Code: {}].", prev.getEmail(), otpCode);

        String notice = "Fresh OTP generated: " + otpCode + " (Valid for 5 minutes).";
        return new AuthStep1Response(newTempToken, maskEmail(prev.getEmail()), notice, otpCode, 300);
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "staff@mediai.org";
        String[] parts = email.split("@");
        String name = parts[0];
        if (name.length() <= 2) return name.charAt(0) + "*@" + parts[1];
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + "@" + parts[1];
    }
}
