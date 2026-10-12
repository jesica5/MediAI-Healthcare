package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyOtpRequest {

    @NotBlank(message = "Session temporary token is required")
    @JsonProperty("temp_token")
    private String tempToken;

    @NotBlank(message = "6-digit OTP code is required")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    private String otp;

    public VerifyOtpRequest() {}

    public VerifyOtpRequest(String tempToken, String otp) {
        this.tempToken = tempToken;
        this.otp = otp;
    }

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
