package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthStep1Response {

    private String status = "OTP_REQUIRED";

    @JsonProperty("temp_token")
    private String tempToken;

    @JsonProperty("masked_email")
    private String maskedEmail;

    @JsonProperty("delivery_notice")
    private String deliveryNotice;

    @JsonProperty("demo_otp")
    private String demoOtp;

    @JsonProperty("expires_in_seconds")
    private int expiresInSeconds = 300;

    public AuthStep1Response() {}

    public AuthStep1Response(String tempToken, String maskedEmail, String deliveryNotice, String demoOtp, int expiresInSeconds) {
        this.status = "OTP_REQUIRED";
        this.tempToken = tempToken;
        this.maskedEmail = maskedEmail;
        this.deliveryNotice = deliveryNotice;
        this.demoOtp = demoOtp;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }

    public String getMaskedEmail() { return maskedEmail; }
    public void setMaskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; }

    public String getDeliveryNotice() { return deliveryNotice; }
    public void setDeliveryNotice(String deliveryNotice) { this.deliveryNotice = deliveryNotice; }

    public String getDemoOtp() { return demoOtp; }
    public void setDemoOtp(String demoOtp) { this.demoOtp = demoOtp; }

    public int getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(int expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
}
