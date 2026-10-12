package com.mediai.repository;

import com.mediai.entity.MedicationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<MedicationRecord, String> {
    @Query("SELECT m FROM MedicationRecord m WHERE m.patient.id = :patientId")
    List<MedicationRecord> findByPatientId(@Param("patientId") String patientId);

    @Query("SELECT m FROM MedicationRecord m WHERE m.patient.id = :patientId AND m.status = :status")
    List<MedicationRecord> findByPatientIdAndStatus(@Param("patientId") String patientId, @Param("status") String status);
}
