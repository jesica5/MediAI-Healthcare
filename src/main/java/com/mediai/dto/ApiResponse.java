package com.mediai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private T data;
    private Map<String, Object> meta;
    private ApiError error;

    public ApiResponse() {
        this.meta = new HashMap<>();
        this.meta.put("timestamp", Instant.now().toString());
        this.meta.put("version", "v1");
    }

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setData(data);
        return resp;
    }

    public static <T> ApiResponse<T> success(T data, Map<String, Object> additionalMeta) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setData(data);
        if (additionalMeta != null) {
            resp.getMeta().putAll(additionalMeta);
        }
        return resp;
    }

    public static <T> ApiResponse<T> error(String code, String message) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setError(new ApiError(code, message));
        return resp;
    }

    public static <T> ApiResponse<T> error(String code, String message, Object details) {
        ApiResponse<T> resp = new ApiResponse<>();
        resp.setError(new ApiError(code, message, details));
        return resp;
    }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public Map<String, Object> getMeta() { return meta; }
    public void setMeta(Map<String, Object> meta) { this.meta = meta; }

    public ApiError getError() { return error; }
    public void setError(ApiError error) { this.error = error; }

    public static class ApiError {
        private String code;
        private String message;
        private Object details;

        public ApiError() {}
        public ApiError(String code, String message) {
            this.code = code;
            this.message = message;
        }
        public ApiError(String code, String message, Object details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Object getDetails() { return details; }
        public void setDetails(Object details) { this.details = details; }
    }
}
