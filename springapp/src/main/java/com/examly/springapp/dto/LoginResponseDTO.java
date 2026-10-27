package com.examly.springapp.dto;

public class LoginResponseDTO {

    private String token;
    private String message;
    private String role;
    private Long userId;
    private String username;
    private String profilePictureUrl;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String token, String message, String role) {
        this.token = token;
        this.message = message;
        this.role = role;
    }

    public LoginResponseDTO(String token, String message, String role, Long userId, String username) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.userId = userId;
        this.username = username;
    }

    public LoginResponseDTO(String token, String message, String role, Long userId, String username, String profilePictureUrl) {
        this.token = token;
        this.message = message;
        this.role = role;
        this.userId = userId;
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}