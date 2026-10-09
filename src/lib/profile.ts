import type { ChildProfile, ProfileSection } from '@/types';

export const SECTIONS: ProfileSection[] = ['basic', 'diagnosis', 'conditions', 'medical', 'health', 'daily'];

/** A section counts as complete when it has data, or when the parent explicitly reviewed it (e.g. "none"). */
export function sectionComplete(c: ChildProfile, s: ProfileSection): boolean {
  const reviewed = c.reviewedSections.includes(s);
  switch (s) {
    case 'basic':
      return !!c.name.trim() && !!c.birthDate;
    case 'diagnosis':
      return c.diagnosisStatus !== '';
    case 'conditions':
      return c.conditions.length > 0 || reviewed;
    case 'medical':
      return c.medicalHistory.length > 0 || reviewed;
    case 'health':
      return !!(c.chronicConditions.trim() || c.allergies.trim() || c.medications.trim()) || reviewed;
    case 'daily':
      return c.communicationLevel !== '' && (c.interests.length > 0 || reviewed);
  }
}

export function profileCompletion(c: ChildProfile): { percent: number; missing: ProfileSection[] } {
  const missing = SECTIONS.filter((s) => !sectionComplete(c, s));
  return { percent: Math.round(((SECTIONS.length - missing.length) / SECTIONS.length) * 100), missing };
}
