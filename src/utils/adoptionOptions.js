export const DEFAULT_ADOPTION_STATUS = 'IN_PROGRESS';

export const ADOPTION_STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'RETURNED', label: 'Devuelta' },
];

export function isValidAdoptionStatus(status) {
  return ADOPTION_STATUS_OPTIONS.some((option) => option.value === status);
}

export function getAdoptionStatusLabel(status) {
  const option = ADOPTION_STATUS_OPTIONS.find((item) => item.value === status);
  return option ? option.label : status || '—';
}
