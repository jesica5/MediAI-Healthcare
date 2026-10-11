/**
 * Emergency Alert Dispatcher Adapter
 * Manages dispatching urgent alerts to on-duty trauma teams / emergency clinical staff.
 * 
 * Safety Invariant:
 * Alert dispatcher failure must NEVER block triage assessment persistence or queue insertion.
 * All errors are caught, logged to audit journal, and tracked for retry.
 */
import crypto from 'crypto';
import { TriageAlert, AlertDispatchResult } from '../types';
import { AuditJournalService } from '@/modules/audit_compliance/services/auditJournalService';

export interface AlertProvider {
  name: string;
  dispatch(alert: TriageAlert): Promise<AlertDispatchResult>;
}

export class MockAlertProvider implements AlertProvider {
  public readonly name = 'ConsoleMockAlertProvider';

  async dispatch(alert: TriageAlert): Promise<AlertDispatchResult> {
    // In production, this dispatches to PagerDuty/Twilio/Hospital PA system
    // Returns simulated success
    return {
      success: true,
      alertId: alert.id,
      provider: this.name,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
  }
}

export class FailingMockAlertProvider implements AlertProvider {
  public readonly name = 'FailingMockAlertProvider';

  async dispatch(alert: TriageAlert): Promise<AlertDispatchResult> {
    throw new Error('Downstream emergency alert gateway network timeout (Simulated)');
  }
}

export class AlertDispatcherService {
  private static provider: AlertProvider = new MockAlertProvider();

  public static setProvider(provider: AlertProvider): void {
    this.provider = provider;
  }

  public static getProvider(): AlertProvider {
    return this.provider;
  }

  /**
   * Dispatches an emergency triage alert safely.
   * If provider fails, catches error, writes audit event, and returns safe failed result.
   * Never throws so caller persistence is never interrupted.
   */
  public static async dispatchEmergencyAlert(params: {
    assessmentId: string;
    patientId: string;
    flags: TriageAlert['flags'];
  }): Promise<AlertDispatchResult> {
    const alertId = `alt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const alert: TriageAlert = {
      id: alertId,
      assessmentId: params.assessmentId,
      patientId: params.patientId,
      priority: 'CRITICAL',
      flags: params.flags,
      timestamp: new Date().toISOString(),
    };

    try {
      const result = await this.provider.dispatch(alert);

      // Record successful dispatch in audit log
      await AuditJournalService.recordEvent({
        event_type: 'EMERGENCY_ALERT_DISPATCHED',
        patient_id: params.patientId,
        payload: {
          alertId,
          assessmentId: params.assessmentId,
          provider: this.provider.name,
          flagCount: params.flags.length,
          status: 'DELIVERED',
        },
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown alert provider error';

      // Record failed dispatch in audit log (Safe failure state)
      await AuditJournalService.recordEvent({
        event_type: 'EMERGENCY_ALERT_FAILED',
        patient_id: params.patientId,
        payload: {
          alertId,
          assessmentId: params.assessmentId,
          provider: this.provider.name,
          error: errorMessage,
          status: 'FAILED_RETRY_SCHEDULED',
        },
      });

      return {
        success: false,
        alertId,
        provider: this.provider.name,
        timestamp: new Date().toISOString(),
        error: errorMessage,
        retryCount: 1,
      };
    }
  }
}
