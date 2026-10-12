package com.mediai.repository;

import com.mediai.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    @Query("SELECT n FROM Notification n WHERE n.recipientRole = 'ALL' OR n.recipientRole = :role ORDER BY n.createdAt DESC")
    List<Notification> findForRole(@Param("role") String role);

    long countByIsReadFalse();

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.recipientRole = 'ALL' OR n.recipientRole = :role) AND n.isRead = false")
    long countUnreadForRole(@Param("role") String role);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();
}
