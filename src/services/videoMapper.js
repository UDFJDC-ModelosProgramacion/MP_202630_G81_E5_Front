export const EMPTY_VIDEO_FORM = { url: '' };

export function videoToFormValues(video) {
  return { url: video.url ?? '' };
}

// El back asigna el refugio por la ruta y conserva el del video al editar,
// por eso el payload solo lleva la URL.
export function buildVideoPayload(form) {
  return { url: form.url.trim() };
}

export function buildShelterOptions(shelters, currentId, currentName) {
  const options = shelters.map(({ id, name }) => ({ value: String(id), label: name }));
  if (options.some((option) => option.value === String(currentId))) return options;
  return [{ value: String(currentId), label: currentName ?? `Refugio ${currentId}` }, ...options];
}