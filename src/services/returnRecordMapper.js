import { toDateInputValue } from '../utils/adoptionFormatters';
import { getTodayDay } from '../utils/returnRecordFormatters';

// La devolución nace con la fecha de hoy, como en el mockup.
export const buildEmptyReturnForm = (now = new Date()) => ({ date: getTodayDay(now), reason: '' });

export function returnToFormValues(returnRecord) {
  return {
    date: toDateInputValue(returnRecord?.date),
    reason: returnRecord?.reason ?? '',
  };
}

// Las 12:00 UTC evitan que la zona horaria corra la fecha un día.
export function buildReturnPayload(form) {
  return {
    date: form.date ? `${form.date}T12:00:00.000Z` : null,
    reason: String(form.reason ?? '').trim(),
  };
}

// El back devuelve la hora enviada (12:00 UTC) y el formato de fechas suma 12 horas al mostrarla:
// para no correr el día, la devolución guardada se muestra con el día elegido a medianoche.
export function buildSavedReturnRecord(form, saved) {
  return {
    ...saved,
    date: `${form.date}T00:00:00.000Z`,
    reason: String(form.reason ?? '').trim(),
  };
}
