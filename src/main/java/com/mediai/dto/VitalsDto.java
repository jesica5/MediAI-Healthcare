package com.mediai.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class VitalsDto {

    @Min(value = 20, message = "Heart rate must be at least 20 bpm")
    @Max(value = 300, message = "Heart rate cannot exceed 300 bpm")
    private Integer heartRate;

    @Min(value = 4, message = "Respiratory rate must be at least 4 breaths/min")
    @Max(value = 80, message = "Respiratory rate cannot exceed 80 breaths/min")
    private Integer respiratoryRate;

    @Min(value = 40, message = "Systolic BP must be at least 40 mmHg")
    @Max(value = 300, message = "Systolic BP cannot exceed 300 mmHg")
    private Integer systolicBp;

    @Min(value = 20, message = "Diastolic BP must be at least 20 mmHg")
    @Max(value = 200, message = "Diastolic BP cannot exceed 200 mmHg")
    private Integer diastolicBp;

    @DecimalMin(value = "40.0", message = "SpO2 must be at least 40.0%")
    @DecimalMax(value = "100.0", message = "SpO2 cannot exceed 100.0%")
    private Double oxygenSaturation;

    @DecimalMin(value = "30.00", message = "Temperature must be at least 30.00°C")
    @DecimalMax(value = "45.00", message = "Temperature cannot exceed 45.00°C")
    private Double temperatureCelsius;

    @DecimalMin(value = "10.0", message = "Capillary blood glucose must be at least 10.0 mg/dL")
    @DecimalMax(value = "1000.0", message = "Capillary blood glucose cannot exceed 1000.0 mg/dL")
    private Double capillaryBloodGlucose;

    public VitalsDto() {}

    public boolean isBloodPressureLogicallyValid() {
        if (systolicBp != null && diastolicBp != null) {
            return diastolicBp < systolicBp;
        }
        return true;
    }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public Integer getRespiratoryRate() { return respiratoryRate; }
    public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }

    public Integer getSystolicBp() { return systolicBp; }
    public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }

    public Integer getDiastolicBp() { return diastolicBp; }
    public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }

    public Double getOxygenSaturation() { return oxygenSaturation; }
    public void setOxygenSaturation(Double oxygenSaturation) { this.oxygenSaturation = oxygenSaturation; }

    public Double getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(Double temperatureCelsius) { this.temperatureCelsius = temperatureCelsius; }

    public Double getCapillaryBloodGlucose() { return capillaryBloodGlucose; }
    public void setCapillaryBloodGlucose(Double capillaryBloodGlucose) { this.capillaryBloodGlucose = capillaryBloodGlucose; }
}
