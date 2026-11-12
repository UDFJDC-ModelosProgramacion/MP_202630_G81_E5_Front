import { Link } from 'react-router-dom';
import { displayValue } from '../utils/formatters';

export default function VeterinarianTable({ veterinarians, onDelete, deletingId = null }) {
  const count = `Mostrando ${veterinarians.length} ${
    veterinarians.length === 1 ? 'veterinario' : 'veterinarios'
  }`;

  return (
    <>
      <div className="pet-table-card">
        <div className="pet-table-scroll">
          <table className="pet-table veterinarian-table">
            <thead>
              <tr>
                <th scope="col">Veterinario</th>
                <th scope="col">Especialidad</th>
                <th scope="col">Refugio</th>
                <th scope="col">Disponibilidad</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {veterinarians.map((veterinarian) => (
                <tr key={veterinarian.id}>
                  <td>
                    <Link to={`/veterinarios/${veterinarian.id}`} className="pet-table__name">
                      {veterinarian.name}
                    </Link>
                    <div className="pet-table__sub">{veterinarian.email}</div>
                  </td>
                  <td>{displayValue(veterinarian.specialty)}</td>
                  <td>{displayValue(veterinarian.shelter?.name)}</td>
                  <td>{displayValue(veterinarian.availability)}</td>
                  <td>
                    <Link
                      to={`/veterinarios/${veterinarian.id}/editar`}
                      className="pet-table__action"
                      aria-label={`Editar ${veterinarian.name}`}
                    >
                      Editar
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        className="pet-table__action pet-table__action--danger"
                        aria-label={`Eliminar ${veterinarian.name}`}
                        disabled={deletingId === veterinarian.id}
                        onClick={() => onDelete(veterinarian)}
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