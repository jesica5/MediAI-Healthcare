package com.mediai.service;

import com.mediai.entity.Feedback;
import com.mediai.repository.FeedbackRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @PostConstruct
    public void seedInitialFeedback() {
        if (feedbackRepository.count() == 0) {
            submitFeedback(5, "Very fast triage risk estimation. Helpful bilingual explanation.", "PATIENT_INTAKE", "PATIENT", null);
            submitFeedback(4, "TreeSHAP attribution features clearly justify the high acuity categorization.", "PHYSICIAN_WORKSTATION", "DOCTOR", null);
            submitFeedback(5, "Clear patient red flags and smooth emergency queue sorting.", "NURSE_CONSOLE", "NURSE", null);
        }
    }

    @Transactional
    public Feedback submitFeedback(int rating, String comment, String category, String submitterRole, String referenceId) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars");
        }

        // Sanitize comment
        String sanitizedComment = comment != null ? comment.trim() : "";
        if (sanitizedComment.length() > 1000) {
            sanitizedComment = sanitizedComment.substring(0, 1000);
        }

        Feedback feedback = new Feedback(
            UUID.randomUUID().toString(),
            rating,
            sanitizedComment,
            (category != null && !category.isBlank()) ? category : "TRIAGE_SYSTEM",
            (submitterRole != null && !submitterRole.isBlank()) ? submitterRole : "PATIENT",
            referenceId
        );

        return feedbackRepository.save(feedback);
    }

    public Map<String, Object> getFeedbackSummary() {
        long total = feedbackRepository.count();
        Double avg = feedbackRepository.getAverageRating();
        double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            distribution.put(i, feedbackRepository.countByRating(i));
        }

        List<Feedback> all = feedbackRepository.findAllByOrderByCreatedAtDesc();
        List<Feedback> recent = all.stream().limit(10).toList();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFeedbackCount", total);
        summary.put("averageRating", roundedAvg);
        summary.put("ratingDistribution", distribution);
        summary.put("recentFeedbacks", recent);

        return summary;
    }
}
