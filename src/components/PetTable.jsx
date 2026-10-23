import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatAge, formatPetType } from '../utils/formatters';

export default function PetTable({ pets, onDelete, deletingId = null }) {
  const count = `Mostrando ${pets.length} ${pets.length === 1 ? 'mascota' : 'mascotas'}`;

  return (
    <>
      <div className="pet-table-card">
        <div className="pet-table-scroll">
          <table className="pet-table">
            <thead>
              <tr>
                <th scope="col">Mascota</th>
                <th scope="col">Edad</th>
                <th scope="col">Refugio</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id}>
                  <td>
                    <Link to={`/mascotas/${pet.id}`} className="pet-table__name">
                      {pet.name}
                    </Link>
                    <div className="pet-table__sub">{formatPetType(pet)}</div>
                  </td>
                  <td>{formatAge(pet.age)}</td>
                  <td>{pet.shelter?.name ?? '—'}</td>
                  <td>
                    <StatusBadge available={pet.available} />
                  </td>
                  <td>
                    <a
                      href="#"
                      className="pet-table__action"
                      aria-label={`Fotos de ${pet.name}`}
                      aria-disabled="true"
                      onClick={(event) => event.preventDefault()}
                    >
                      Fotos
                    </a>
                    <Link
                      to={`/mascotas/${pet.id}/editar`}
                      className="pet-table__action"
                      aria-label={`Editar ${pet.name}`}
                    >
                      Editar
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        className="pet-table__action pet-table__action--danger"
                        aria-label={`Eliminar ${pet.name}`}
                        disabled={deletingId === pet.id}
                        onClick={() => onDelete(pet)}
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