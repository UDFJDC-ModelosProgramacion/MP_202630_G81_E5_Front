const normalize = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

export function filterAdoptions(adoptions, search = '', status = '') {
  const term = normalize(search);

  return adoptions.filter((adoption) => {
    if (status && adoption.status !== status) return false;
    if (!term) return true;
    return [adoption.pet?.name, adoption.adopter?.name].some((name) =>
      normalize(name).includes(term),
    );
  });
}
