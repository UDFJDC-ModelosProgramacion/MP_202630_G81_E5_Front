export const EMPTY_MESSAGE_FORM = { content: '' };

const SENT_DATE_MARGIN_MS = 60 * 1000;

export function messageToFormValues(message) {
  return { content: message?.content ?? '' };
}

// El back rechaza una fecha de envío futura, por eso se resta un minuto.
export function buildMessagePayload(form, now = new Date()) {
  return {
    content: String(form.content ?? '').trim(),
    sentDate: new Date(now.getTime() - SENT_DATE_MARGIN_MS).toISOString(),
  };
}