export const CONTENT_MAX_LENGTH = 255;

function validateContent(content) {
  const text = String(content ?? '').trim();
  if (text.length === 0) return 'El mensaje es obligatorio.';
  if (text.length > CONTENT_MAX_LENGTH) {
    return `El mensaje no puede superar los ${CONTENT_MAX_LENGTH} caracteres.`;
  }
  return undefined;
}

export function validateMessage(values) {
  const candidates = { content: validateContent(values.content) };

  return Object.fromEntries(Object.entries(candidates).filter(([, message]) => message));
}