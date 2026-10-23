const DEFAULT_MESSAGE = 'Ocurrió un error inesperado. Intenta de nuevo.';
const NETWORK_MESSAGE = 'No se pudo conectar con el servidor. Verifica tu conexión.';

export function getErrorMessage(error, fallback = DEFAULT_MESSAGE) {
  if (error?.response) {
  const data = error.response.data;
  return data?.apierror?.message || data?.message || fallback;
}
  if (error?.request) {
    return NETWORK_MESSAGE;
  }
  return fallback;
}

export function isNotFound(error) {
  return error?.response?.status === 404;
}