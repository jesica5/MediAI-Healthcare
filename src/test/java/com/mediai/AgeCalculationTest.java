package com.mediai;

import com.mediai.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Phase 7: Dynamic Age Calculation Tests")
class AgeCalculationTest {

    private PatientService patientService;

    @BeforeEach
    void setUp() {
        patientService = new PatientService(Mockito.mock(com.mediai.repository.PatientRepository.class));
    }

    @Test
    @DisplayName("Test case from specification: DOB 15-Oct-2005 on 12-Oct-2026 evaluates to exactly 20 completed years")
    void testSpecificCaseCompletedYears() {
        LocalDate dob = LocalDate.of(2005, 10, 15);
        LocalDate refDate = LocalDate.of(2026, 10, 12);

        int age = patientService.calculateAge(dob, refDate);

        // On 12-Oct-2026, the patient's 21st birthday is in 3 days, so completed age is 20
        assertEquals(20, age, "Completed age must be 20 when birthday has not yet occurred in the reference year");
    }

    @Test
    @DisplayName("Birthday reached on exact date evaluates to completed year")
    void testBirthdayExactDay() {
        LocalDate dob = LocalDate.of(2005, 10, 15);
        LocalDate refDate = LocalDate.of(2026, 10, 15);

        int age = patientService.calculateAge(dob, refDate);
        assertEquals(21, age, "Completed age must be 21 on exact birthday");
    }

    @Test
    @DisplayName("Rejects future Date of Birth with IllegalArgumentException")
    void testFutureDobRejection() {
        LocalDate futureDob = LocalDate.now().plusDays(1);

        assertThrows(IllegalArgumentException.class, () -> {
            patientService.calculateAge(futureDob, LocalDate.now());
        });
    }

    @Test
    @DisplayName("Rejects null Date of Birth")
    void testNullDobRejection() {
        assertThrows(IllegalArgumentException.class, () -> {
            patientService.calculateAge(null, LocalDate.now());
        });
    }
}
