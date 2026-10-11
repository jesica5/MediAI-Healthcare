import { AcuityCategory } from '../types/triage';

export interface AcuityConfig {
  code: AcuityCategory;
  priority: number;
  label: string;
  tamilLabel: string;
  colorHex: string;
  bgTailwind: string;
  textTailwind: string;
  borderTailwind: string;
  badgeTailwind: string;
  maxWaitMinutes: number;
  description: string;
}

export const ACUITY_CONFIGS: Record<AcuityCategory, AcuityConfig> = {
  CRITICAL: {
    code: 'CRITICAL',
    priority: 1,
    label: 'Critical (P1)',
    tamilLabel: 'ஆபத்தான நிலை (P1)',
    colorHex: '#E53E3E',
    bgTailwind: 'bg-red-500',
    textTailwind: 'text-red-700',
    borderTailwind: 'border-red-500',
    badgeTailwind: 'bg-red-100 text-red-800 border-red-300',
    maxWaitMinutes: 0,
    description: 'Immediate life threat. Continuous monitoring. 0 min physician evaluation.',
  },
  HIGH: {
    code: 'HIGH',
    priority: 2,
    label: 'High (P2)',
    tamilLabel: 'உயர் முன்னுரிமை (P2)',
    colorHex: '#ED8936',
    bgTailwind: 'bg-orange-500',
    textTailwind: 'text-orange-700',
    borderTailwind: 'border-orange-500',
    badgeTailwind: 'bg-orange-100 text-orange-800 border-orange-300',
    maxWaitMinutes: 15,
    description: 'Emergent condition. High deterioration probability. Assessment within 15-30 min.',
  },
  MODERATE: {
    code: 'MODERATE',
    priority: 3,
    label: 'Moderate (P3)',
    tamilLabel: 'மிதமான நிலை (P3)',
    colorHex: '#ECC94B',
    bgTailwind: 'bg-amber-400',
    textTailwind: 'text-amber-800',
    borderTailwind: 'border-amber-400',
    badgeTailwind: 'bg-amber-100 text-amber-900 border-amber-300',
    maxWaitMinutes: 60,
    description: 'Urgent condition requiring diagnostic investigation. Evaluation within 60 min.',
  },
  LOW: {
    code: 'LOW',
    priority: 4,
    label: 'Low (P4)',
    tamilLabel: 'குறைந்த முன்னுரிமை (P4)',
    colorHex: '#38A169',
    bgTailwind: 'bg-emerald-600',
    textTailwind: 'text-emerald-700',
    borderTailwind: 'border-emerald-600',
    badgeTailwind: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    maxWaitMinutes: 120,
    description: 'Non-urgent ambulatory condition. Routine assessment within 120 min.',
  },
};
