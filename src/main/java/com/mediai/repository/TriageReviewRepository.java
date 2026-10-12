package com.mediai.repository;

import com.mediai.entity.TriageReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageReviewRepository extends JpaRepository<TriageReview, String> {
    Optional<TriageReview> findByAssessmentId(String assessmentId);
    List<TriageReview> findByDoctorIdOrderByReviewedAtDesc(String doctorId);
    long countByIsOverridden(Boolean isOverridden);
}
