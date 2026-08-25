package com.openclassrooms.etudiant.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {
    private static final String SECRET = "9AF15303B8CD41F98B4EB5A9A9A927E9EDD5C0A2E8BF9AB77BCA2C86C88E6ED";
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3_600_000L);
    }

    @Test
    void generateTokenContainsUsernameAndExpiration() {
        String token = jwtService.generateToken(User.withUsername("alice").password("ignored").roles("USER").build());

        Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();

        assertThat(claims.getSubject()).isEqualTo("alice");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void extractUsernameReturnsTokenSubject() {
        String token = jwtService.generateToken(User.withUsername("alice").password("ignored").build());

        assertThat(jwtService.extractUsername(token)).isEqualTo("alice");
    }

    @Test
    void generatedTokenIsValidForItsUser() {
        var user = User.withUsername("alice").password("ignored").build();
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
        assertThat(jwtService.isTokenValid(token,
                User.withUsername("bob").password("ignored").build())).isFalse();
    }
}
