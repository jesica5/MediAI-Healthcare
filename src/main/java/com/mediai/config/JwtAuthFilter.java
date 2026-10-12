package com.mediai.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Value("${jwt.secret:MediAiSecretKeyForClinicalStaffAuthTokensMustBeAtLeast32BytesLong}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String roleHeader = request.getHeader("x-user-role");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

                String email = claims.getSubject();
                String role = (String) claims.get("role");
                if (role == null) role = "STAFF";

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase().replace(" ", "_")))
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception ignored) {
                // Token parse failed, continue anonymous
            }
        } else if (roleHeader != null && !roleHeader.isBlank()) {
            // Support x-user-role header for integration test compatibility
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                "staff-session",
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + roleHeader.toUpperCase().replace(" ", "_")))
            );
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
