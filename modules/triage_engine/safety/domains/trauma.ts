/**
 * Domain 8: Injury & Trauma
 * Rules:
 * - Pulsatile arterial hemorrhage
 * - Flail chest
 * - Suspected acute spinal cord injury
 * - Traumatic amputation
 * - Acute airway obstruction
 */
import { SymptomVector } from '@/modules/patient_intake/types';
import { RedFlagItem } from '../../types';

export function evaluateTraumaDomain(
  symptoms: SymptomVector
): RedFlagItem[] {
  const flags: RedFlagItem[] = [];
  const domain = 8;
  const domainName = 'Injury & Trauma';
  const clinicalFocus = 'Exsanguinating arterial hemorrhage, acute ventilatory failure, spinal cord injury, amputation';

  const trauma = symptoms.injury_trauma as Record<string, unknown> | undefined;

  // Pulsatile Arterial Hemorrhage
  if (trauma?.bleeding_rate === 'pulsatile') {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TRAUMA_PULSATILE_BLEED',
      observed: 'pulsatile',
      threshold: 'Pulsatile arterial bleeding present',
      clinicalFocus: 'Exsanguinating arterial hemorrhage, rapid hemorrhagic shock',
      message: `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Pulsatile arterial hemorrhage. Immediate life-threatening blood loss.`,
    });
  }

  // Flail Chest
  if (trauma?.flail_chest) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TRAUMA_FLAIL_CHEST',
      observed: true,
      threshold: 'Paradoxical chest wall movement / flail chest',
      clinicalFocus: 'Severe thoracic trauma, paradoxical respiration, acute pulmonary contusion',
      message: `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Flail chest with paradoxical ventilatory compromise.`,
    });
  }

  // Suspected Acute Spinal Cord Injury
  if (trauma?.spinal_injury) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TRAUMA_SPINAL_CORD',
      observed: true,
      threshold: 'Suspected acute spinal cord injury / neurogenic shock',
      clinicalFocus: 'Spinal trauma, neurogenic shock, ascending paralysis',
      message: `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Suspected acute spinal cord injury. Immediate spinal immobilization protocol.`,
    });
  }

  // Traumatic Amputation
  if (trauma?.traumatic_amputation) {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TRAUMA_AMPUTATION',
      observed: true,
      threshold: 'Traumatic limb or appendage amputation',
      clinicalFocus: 'Major extremity amputation, tourniquet protocol',
      message: `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Traumatic amputation. Immediate vascular control required.`,
    });
  }

  // Obstructed Airway
  if (trauma?.airway_patency === 'obstructed') {
    flags.push({
      domain,
      domainName,
      ruleCode: 'TRAUMA_AIRWAY_OBSTRUCTED',
      observed: 'obstructed',
      threshold: 'Airway patency obstructed',
      clinicalFocus: 'Acute mechanical airway occlusion, immediate asphyxiation threat',
      message: `Tier-1 Red Flag [Domain 8 - Injury & Trauma]: Obstructed airway. Total ventilatory emergency.`,
    });
  }

  return flags;
}
