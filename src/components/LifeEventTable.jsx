import { Link } from 'react-router-dom';
import { formatEventDate } from '../utils/eventDates';
import { displayValue } from '../utils/formatters';
import LifeEventTypeBadge from './LifeEventTypeBadge';

export default function LifeEventTable({ petId, events, onDelete, deletingId = null }) {
  const count = `Mostrando ${events.length} ${events.length === 1 ? 'evento' : 'eventos'}`;
  const basePath = `/mascotas/${petId}/eventos-de-vida`;

  return (
    <>
      <div className="pet-table-card">
        <div className="pet-table-scroll">
          <table className="pet-table life-event-table">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Tipo</th>
                <th scope="col">Descripción</th>
                <th scope="col">Veterinario</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const label = `${event.type} del ${formatEventDate(event.date)}`;
                return (
                  <tr key={event.id}>
                    <td>
                      <Link to={`${basePath}/${event.id}`} className="pet-table__name">
                        {formatEventDate(event.date)}
                      </Link>
                    </td>
                    <td>
                      <LifeEventTypeBadge type={event.type} />
                    </td>
                    <td>{displayValue(event.description)}</td>
                    <td>{displayValue(event.veterinarian?.name)}</td>
                    <td>
                      <Link
                        to={`${basePath}/${event.id}/editar`}
                        className="pet-table__action"
                        aria-label={`Editar ${label}`}
                      >
                        Editar
                      </Link>
                      {onDelete && (
                        <button
                          type="button"
                          className="pet-table__action pet-table__action--danger"
                          aria-label={`Eliminar ${label}`}
                          disabled={deletingId === event.id}
                          onClick={() => onDelete(event)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="pet-table__count">{count}</p>
    </>
  );
}