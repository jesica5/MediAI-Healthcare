package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.dto.SignInRequest;
import com.mediai.dto.SignInResponse;
import com.mediai.service.AuditService;
import com.mediai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final AuditService auditService;

    public AuthController(AuthService authService, AuditService auditService) {
        this.authService = authService;
        this.auditService = auditService;
    }

    @PostMapping("/login-step1")
    public ResponseEntity<ApiResponse<com.mediai.dto.AuthStep1Response>> initiateLogin(
            @Valid @RequestBody SignInRequest request,
            HttpServletRequest httpServletRequest
    ) {
        com.mediai.dto.AuthStep1Response response = authService.initiateStaffLogin(request);

        auditService.logEvent(
            "STAFF_LOGIN_OTP_CHALLENGED",
            null,
            null,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"email\":\"" + request.getEmail() + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<SignInResponse>> verifyOtp(
            @Valid @RequestBody com.mediai.dto.VerifyOtpRequest request,
            HttpServletRequest httpServletRequest
    ) {
        SignInResponse response = authService.verifyStaffOtp(request);

        auditService.logEvent(
            "STAFF_OTP_VERIFIED_SUCCESS",
            response.getUser().getId(),
            null,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"role\":\"" + response.getUser().getRole() + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<com.mediai.dto.AuthStep1Response>> resendOtp(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpServletRequest
    ) {
        String tempToken = body.get("temp_token");
        if (tempToken == null || tempToken.isBlank()) {
            throw new IllegalArgumentException("Session temporary token is required to resend OTP.");
        }
        com.mediai.dto.AuthStep1Response response = authService.resendStaffOtp(tempToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<SignInResponse>> signIn(
            @Valid @RequestBody SignInRequest request,
            HttpServletRequest httpServletRequest
    ) {
        SignInResponse response = authService.authenticateStaff(request);

        auditService.logEvent(
            "STAFF_SIGN_IN_SUCCESS",
            response.getUser().getId(),
            null,
            httpServletRequest.getRemoteAddr(),
            httpServletRequest.getHeader("User-Agent"),
            "{\"role\":\"" + response.getUser().getRole() + "\"}"
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSession(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        boolean authenticated = authHeader != null && authHeader.startsWith("Bearer ");

        Map<String, Object> data = Map.of(
            "authenticated", authenticated,
            "sessionType", authenticated ? "STAFF" : "PATIENT"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/signout")
    public ResponseEntity<ApiResponse<Map<String, String>>> signOut() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Signed out successfully.")));
    }
}
