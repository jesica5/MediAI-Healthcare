package com.mediai.repository;

import com.mediai.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, String> {

    List<Feedback> findAllByOrderByCreatedAtDesc();

    long countByRating(int rating);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getAverageRating();

    boolean existsByReferenceIdAndSubmitterRole(String referenceId, String submitterRole);
}
