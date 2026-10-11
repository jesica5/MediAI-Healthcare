import { AcuityCategory, TriageStatus } from './triage';

export interface DoctorQueueFilter {
  status?: TriageStatus | 'ALL';
  category?: AcuityCategory | 'ALL';
  searchQuery?: string;
  sortBy?: 'priority' | 'time' | 'risk_score';
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorDashboardMetrics {
  pending_review_count: number;
  critical_count: number;
  high_priority_count: number;
  completed_today_count: number;
  overridden_today_count: number;
  avg_review_time_minutes: number;
}

export interface DoctorOverridePayload {
  assessment_id: string;
  doctor_id: string;
  final_category: AcuityCategory;
  override_reason?: string;
  clinical_notes?: string;
}

export interface AnalyticsAggregate {
  category_distribution: {
    category: AcuityCategory;
    count: number;
    percentage: number;
  }[];
  hourly_assessment_trends: {
    hour: string;
    total: number;
    critical: number;
  }[];
  review_velocity: {
    avg_minutes: number;
    pending_count: number;
    completed_count: number;
  };
  override_rate_percent: number;
}
