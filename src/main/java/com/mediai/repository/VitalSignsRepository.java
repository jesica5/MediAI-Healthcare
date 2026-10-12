package com.mediai.repository;

import com.mediai.entity.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VitalSignsRepository extends JpaRepository<VitalSigns, String> {
    @Query("SELECT v FROM VitalSigns v WHERE v.patient.id = :patientId ORDER BY v.recordedAt DESC")
    List<VitalSigns> findByPatientIdOrderByRecordedAtDesc(@Param("patientId") String patientId);
}
