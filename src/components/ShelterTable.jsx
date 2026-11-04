import { Link } from 'react-router-dom';

export default function ShelterTable({ shelters, onDelete, deletingId = null }) {
  const count = `Mostrando ${shelters.length} ${shelters.length === 1 ? 'refugio' : 'refugios'}`;

  return (
    <>
      <div className="pet-table-card">
        <div className="pet-table-scroll">
          <table className="pet-table shelter-table">
            <thead>
              <tr>
                <th scope="col">Refugio</th>
                <th scope="col">Ciudad</th>
                <th scope="col">Mascotas</th>
                <th scope="col">Eventos</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shelters.map((shelter) => (
                <tr key={shelter.id}>
                  <td>
                    <span className="pet-table__name">{shelter.name}</span>
                  </td>
                  <td>{shelter.city}</td>
                  <td>{shelter.petsCount}</td>
                  <td>{shelter.eventsCount}</td>
                  <td>
                    <Link
                      to={`/refugios/${shelter.id}`}
                      className="pet-table__action"
                      aria-label={`Ver detalle de ${shelter.name}`}
                    >
                      Ver detalle
                    </Link>
                    <Link
                      to={`/refugios/${shelter.id}/editar`}
                      className="pet-table__action"
                      aria-label={`Editar ${shelter.name}`}
                    >
                      Editar
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        className="pet-table__action pet-table__action--danger"
                        aria-label={`Eliminar ${shelter.name}`}
                        disabled={deletingId === shelter.id}
                        onClick={() => onDelete(shelter)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="pet-table__count">{count}</p>
    </>
  );
}