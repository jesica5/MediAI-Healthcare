import { describe, it, expect, beforeEach } from 'vitest';
import {
  AlertDispatcherService,
  MockAlertProvider,
  FailingMockAlertProvider,
} from '../services/alertDispatcher';

describe('Emergency Alert Dispatcher Adapter (Specification Section 7)', () => {
  beforeEach(() => {
    // Reset to default mock provider before each test
    AlertDispatcherService.setProvider(new MockAlertProvider());
  });

  it('dispatches an emergency triage alert successfully with mock provider', async () => {
    const result = await AlertDispatcherService.dispatchEmergencyAlert({
      assessmentId: 'ast-test-alert-1',
      patientId: 'pt-test-1',
      flags: [
        {
          domain: 2,
          domainName: 'Respiratory Warning Signs',
          ruleCode: 'RESP_SPO2_LT_90',
          observed: 86,
          threshold: 'SpO2 < 90%',
          clinicalFocus: 'Severe hypoxemia',
          message: 'SpO2 86% < 90%',
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.alertId).toBeDefined();
    expect(result.provider).toBe('ConsoleMockAlertProvider');
  });

  it('safely handles provider failure without throwing (Persistence Independence Invariant)', async () => {
    // Inject failing provider
    AlertDispatcherService.setProvider(new FailingMockAlertProvider());

    // Call must NEVER throw an uncaught exception
    const result = await AlertDispatcherService.dispatchEmergencyAlert({
      assessmentId: 'ast-test-alert-fail',
      patientId: 'pt-test-2',
      flags: [
        {
          domain: 3,
          domainName: 'Cardiac Warning Signs',
          ruleCode: 'CARD_HR_EXTREME_HIGH',
          observed: 165,
          threshold: 'HR > 150 bpm',
          clinicalFocus: 'Severe tachycardia',
          message: 'HR 165 > 150',
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Downstream emergency alert gateway network timeout');
    expect(result.retryCount).toBe(1);
    expect(result.provider).toBe('FailingMockAlertProvider');
  });
});
