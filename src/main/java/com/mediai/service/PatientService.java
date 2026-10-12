package com.mediai.service;

import com.mediai.dto.PatientDto;
import com.mediai.dto.PatientRegistrationRequest;
import com.mediai.entity.Patient;
import com.mediai.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    /**
     * Automatic Age Calculation (Phase 7):
     * Computes completed years using month and day against a reference date.
     */
    public int calculateAge(LocalDate dateOfBirth, LocalDate referenceDate) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Date of Birth is required to calculate age");
        }
        if (referenceDate == null) {
            referenceDate = LocalDate.now();
        }
        if (dateOfBirth.isAfter(referenceDate)) {
            throw new IllegalArgumentException("Date of Birth cannot be in the future");
        }
        return Period.between(dateOfBirth, referenceDate).getYears();
    }

    public int calculateCurrentAge(LocalDate dateOfBirth) {
        return calculateAge(dateOfBirth, LocalDate.now());
    }

    @Transactional
    public PatientDto registerPatient(PatientRegistrationRequest request) {
        LocalDate dob = request.getDateOfBirth();
        if (dob == null) {
            throw new IllegalArgumentException("Date of Birth is mandatory");
        }
        if (dob.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of Birth cannot be in the future");
        }

        String patientId = UUID.randomUUID().toString();
        String mrnHash = generateMrnHash(request.getName(), dob, request.getGender());

        // Simple AES / Hex token simulation for PHI name encryption
        String encryptedName = HexFormat.of().formatHex(request.getName().getBytes(StandardCharsets.UTF_8));

        Patient patient = new Patient(
            patientId,
            mrnHash,
            encryptedName,
            request.getName(),
            dob,
            request.getGender(),
            request.getPrimaryLanguage()
        );

        Patient saved = patientRepository.save(patient);

        int age = calculateCurrentAge(saved.getDateOfBirth());

        PatientDto dto = new PatientDto();
        dto.setId(saved.getId());
        dto.setMrnHash(saved.getMrnHash());
        dto.setDisplayName(saved.getDisplayName());
        dto.setDateOfBirth(saved.getDateOfBirth());
        dto.setAge(age);
        dto.setGender(saved.getGender());
        dto.setPrimaryLanguage(saved.getPrimaryLanguage());
        dto.setCreatedAt(saved.getCreatedAt());
        dto.setSessionToken("pt_token_" + saved.getId() + "_" + System.currentTimeMillis());

        return dto;
    }

    public Optional<Patient> findById(String id) {
        return patientRepository.findById(id);
    }

    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> findByMrnHash(String mrnHash) {
        return patientRepository.findByMrnHash(mrnHash);
    }

    @Transactional
    public PatientDto updatePatient(String id, PatientRegistrationRequest request) {
        Patient existing = patientRepository.findById(id)
            .orElseThrow(() -> new java.util.NoSuchElementException("Patient not found: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            existing.setDisplayName(request.getName());
            existing.setEncryptedName(java.util.HexFormat.of().formatHex(request.getName().getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        }
        if (request.getDateOfBirth() != null) {
            existing.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            existing.setGender(request.getGender());
        }
        if (request.getPrimaryLanguage() != null) {
            existing.setPrimaryLanguage(request.getPrimaryLanguage());
        }

        Patient updated = patientRepository.save(existing);
        int age = calculateCurrentAge(updated.getDateOfBirth());

        PatientDto dto = new PatientDto();
        dto.setId(updated.getId());
        dto.setMrnHash(updated.getMrnHash());
        dto.setDisplayName(updated.getDisplayName());
        dto.setDateOfBirth(updated.getDateOfBirth());
        dto.setAge(age);
        dto.setGender(updated.getGender());
        dto.setPrimaryLanguage(updated.getPrimaryLanguage());
        dto.setCreatedAt(updated.getCreatedAt());
        return dto;
    }

    @Transactional
    public void deleteById(String id) {
        if (!patientRepository.existsById(id)) {
            throw new java.util.NoSuchElementException("Patient not found: " + id);
        }
        patientRepository.deleteById(id);
    }

    private String generateMrnHash(String name, LocalDate dob, String gender) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String raw = (name + "|" + dob + "|" + gender).trim().toLowerCase();
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return "MRN-" + HexFormat.of().formatHex(hash).substring(0, 10).toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            return "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}
