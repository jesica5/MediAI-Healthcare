package com.mediai.controller;

import com.mediai.dto.ApiResponse;
import com.mediai.entity.Notification;
import com.mediai.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(required = false, defaultValue = "ALL") String role
    ) {
        List<Notification> list = notificationService.getNotificationsForRole(role);
        long unread = notificationService.getUnreadCount(role);
        return ResponseEntity.ok(ApiResponse.success(list, Map.of("unreadCount", unread)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(
            @RequestParam(required = false, defaultValue = "ALL") String role
    ) {
        long unread = notificationService.getUnreadCount(role);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", unread)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable String id) {
        Notification updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAllAsRead() {
        int count = notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success(Map.of("markedCount", count, "message", "All notifications marked as read.")));
    }
}
