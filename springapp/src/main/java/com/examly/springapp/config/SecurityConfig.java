package com.examly.springapp.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.examly.springapp.security.CustomUserDetailsService;
import com.examly.springapp.security.JwtAccessDeniedHandler;
import com.examly.springapp.security.JwtAuthenticationEntryPoint;
import com.examly.springapp.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private JwtAccessDeniedHandler jwtAccessDeniedHandler;

    // Password Encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Authentication Provider
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // Authentication Manager
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {

        return config.getAuthenticationManager();
    }

    // CORS Configuration
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000"
                        // "http://192.168.56.1:3000",
                        // "http://192.168.56.1:8081"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // Security Filter Chain
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                // Disable CSRF for REST API
                .csrf(csrf -> csrf.disable())

                // Enable CORS
                .cors(Customizer.withDefaults())

                // Allow embedding content (PDFs/videos/etc.) in iframes
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))

                // Authentication Provider
                .authenticationProvider(authenticationProvider())

                // Exception Handling
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        jwtAuthenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        jwtAccessDeniedHandler
                                )
                )

                // Stateless JWT Session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth

                        // Allow CORS preflight requests
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        // Public APIs
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/files/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // Admin & Educator User Reading, Admin Management
                        .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**")
                        .hasAnyRole("ADMIN", "EDUCATOR")
                        .requestMatchers("/api/users", "/api/users/**")
                        .hasRole("ADMIN")

                        // Admin APIs
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Educator APIs
                        .requestMatchers("/api/educator/**")
                        .hasAnyRole("ADMIN", "EDUCATOR")

                        // Student APIs
                        .requestMatchers("/api/student/**")
                        .hasRole("STUDENT")

                        // Proctor APIs
                        .requestMatchers("/api/proctor/**")
                        .hasRole("PROCTOR")

                        // Analyst APIs
                        .requestMatchers("/api/analyst/**")
                        .hasRole("ANALYST")

                        // Everything else requires authentication
                        .anyRequest()
                        .authenticated()
                )

                // HTTP Basic
                .httpBasic(Customizer.withDefaults());

        // JWT Filter
        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}