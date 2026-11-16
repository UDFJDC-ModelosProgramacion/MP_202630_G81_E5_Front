export const LIFE_EVENT_TYPES = ['Vacunación', 'Control', 'Cirugía'];

const TYPE_VARIANTS = {
  Vacunación: 'vaccination',
  Control: 'checkup',
  Cirugía: 'surgery',
};

export function getLifeEventTypeOptions(currentType) {
  return !currentType || LIFE_EVENT_TYPES.includes(currentType)
    ? LIFE_EVENT_TYPES
    : [...LIFE_EVENT_TYPES, currentType];
}

export function getLifeEventTypeVariant(type) {
  return TYPE_VARIANTS[type] ?? 'other';
}