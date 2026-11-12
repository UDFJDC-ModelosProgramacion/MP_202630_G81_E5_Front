import { formatEventDate } from '../utils/eventDates';
import { displayValue } from '../utils/formatters';

export default function VeterinarianEventList({ events }) {
  return (
    <section className="veterinarian-events" aria-labelledby="veterinarian-events-title">
      <h2 id="veterinarian-events-title" className="veterinarian-events__title">
        Eventos de vida
      </h2>

      {events.length === 0 ? (
        <p className="empty-state">Este veterinario no tiene eventos de vida registrados.</p>
      ) : (
        <ul className="veterinarian-events__list">
          {events.map((event) => (
            <li key={event.id} className="veterinarian-events__item">
              <span className="veterinarian-events__type">{displayValue(event.type)}</span>
              <span className="veterinarian-events__meta">
                {event.date ? formatEventDate(event.date) : '—'}
              </span>
              <p className="veterinarian-events__description">{displayValue(event.description)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}