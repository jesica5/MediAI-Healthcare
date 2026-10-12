package com.mediai.repository;

import com.mediai.entity.TriageAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriageAssessmentRepository extends JpaRepository<TriageAssessment, String> {

    List<TriageAssessment> findByPatientIdOrderByCreatedAtDesc(String patientId);

    List<TriageAssessment> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT a FROM TriageAssessment a WHERE " +
           "(:status = 'ALL' OR a.status = :status) AND " +
           "(:category = 'ALL' OR a.calculatedCategory = :category) AND " +
           "(:search IS NULL OR LOWER(a.chiefComplaint) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(a.patient.mrnHash) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(a.patient.displayName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<TriageAssessment> findQueueFiltered(
        @Param("status") String status,
        @Param("category") String category,
        @Param("search") String search
    );

    long countByStatus(String status);

    long countByCalculatedCategory(String category);
}
