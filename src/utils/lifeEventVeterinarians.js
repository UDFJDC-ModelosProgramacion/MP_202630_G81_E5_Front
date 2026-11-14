export function formatVeterinarianOption(veterinarian) {
  return [veterinarian.name, veterinarian.specialty].filter(Boolean).join(' · ');
}

// Evita perder el veterinario del evento si la lista no lo trae (por ejemplo, si falló la carga).
export function withCurrentVeterinarian(veterinarians, current) {
  if (!current || veterinarians.some((veterinarian) => veterinarian.id === current.id)) {
    return veterinarians;
  }
  return [...veterinarians, current];
}