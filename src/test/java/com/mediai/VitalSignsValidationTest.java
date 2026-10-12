package com.mediai;

import com.mediai.dto.VitalsDto;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Phase 8: Vital Signs Clinical Validation Tests")
class VitalSignsValidationTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Valid normal vital signs pass validation")
    void testNormalVitalsPass() {
        VitalsDto vitals = new VitalsDto();
        vitals.setHeartRate(72);
        vitals.setRespiratoryRate(16);
        vitals.setSystolicBp(120);
        vitals.setDiastolicBp(80);
        vitals.setOxygenSaturation(98.5);
        vitals.setTemperatureCelsius(37.0);
        vitals.setCapillaryBloodGlucose(110.0);

        Set<ConstraintViolation<VitalsDto>> violations = validator.validate(vitals);
        assertTrue(violations.isEmpty(), "Normal vitals must not have validation violations");
        assertTrue(vitals.isBloodPressureLogicallyValid(), "Diastolic 80 < Systolic 120 must be logically valid");
    }

    @Test
    @DisplayName("Rejects heart rate below 20 bpm or above 300 bpm")
    void testHeartRateLimits() {
        VitalsDto vitalsLow = new VitalsDto();
        vitalsLow.setHeartRate(15);
        Set<ConstraintViolation<VitalsDto>> vLow = validator.validate(vitalsLow);
        assertFalse(vLow.isEmpty(), "Heart rate < 20 bpm must be rejected");

        VitalsDto vitalsHigh = new VitalsDto();
        vitalsHigh.setHeartRate(350);
        Set<ConstraintViolation<VitalsDto>> vHigh = validator.validate(vitalsHigh);
        assertFalse(vHigh.isEmpty(), "Heart rate > 300 bpm must be rejected");
    }

    @Test
    @DisplayName("Rejects SpO2 below 40.0% or above 100.0%")
    void testOxygenSaturationLimits() {
        VitalsDto vitalsLow = new VitalsDto();
        vitalsLow.setOxygenSaturation(35.0);
        assertFalse(validator.validate(vitalsLow).isEmpty());

        VitalsDto vitalsHigh = new VitalsDto();
        vitalsHigh.setOxygenSaturation(105.0);
        assertFalse(validator.validate(vitalsHigh).isEmpty());
    }

    @Test
    @DisplayName("Rejects body temperature below 30.0C or above 45.0C")
    void testTemperatureLimits() {
        VitalsDto vitalsLow = new VitalsDto();
        vitalsLow.setTemperatureCelsius(28.0);
        assertFalse(validator.validate(vitalsLow).isEmpty());

        VitalsDto vitalsHigh = new VitalsDto();
        vitalsHigh.setTemperatureCelsius(48.0);
        assertFalse(validator.validate(vitalsHigh).isEmpty());
    }

    @Test
    @DisplayName("Blood pressure logical check fails when diastolic >= systolic")
    void testBloodPressureLogicalConstraint() {
        VitalsDto vitals = new VitalsDto();
        vitals.setSystolicBp(80);
        vitals.setDiastolicBp(120);

        assertFalse(vitals.isBloodPressureLogicallyValid(), "Diastolic 120 >= Systolic 80 must be logically invalid");
    }
}
