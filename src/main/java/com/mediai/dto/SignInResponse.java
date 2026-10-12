package com.mediai.dto;

public class SignInResponse {
    private UserDto user;
    private String token;

    public SignInResponse() {}

    public SignInResponse(UserDto user, String token) {
        this.user = user;
        this.token = token;
    }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
