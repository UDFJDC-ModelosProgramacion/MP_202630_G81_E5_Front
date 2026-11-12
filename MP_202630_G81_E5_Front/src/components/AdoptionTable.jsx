import { Link } from 'react-router-dom';
import AdoptionStatusBadge from './AdoptionStatusBadge';
import { formatPetType } from '../utils/formatters';
import { formatAdoptionDate } from '../utils/adoptionFormatters';
import { getAdoptionPetName } from '../utils/adoptionMessages';

export default function AdoptionTable({ adoptions }) {
  const count = `Mostrando ${adoptions.length} ${adoptions.length === 1 ? 'adopción' : 'adopciones'}`;

  return (
    <>
      <div className="pet-table-card">
        <div className="pet-table-scroll">
          <table className="pet-table adoption-table">
            <thead>
              <tr>
                <th scope="col">Mascota</th>
                <th scope="col">Adoptante</th>
                <th scope="col">Veterinario responsable</th>
                <th scope="col">Fecha</th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="visually-hidden">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {adoptions.map((adoption) => (
                <tr key={adoption.id}>
                  <td>
                    <div className="pet-table__name">{adoption.pet?.name ?? '—'}</div>
                    <div className="pet-table__sub">
                      {adoption.pet ? formatPetType(adoption.pet) : ''}
                    </div>
                  </td>
                  <td>{adoption.adopter?.name ?? '—'}</td>
                  <td>{adoption.responsibleVeterinarian?.name ?? '—'}</td>
                  <td>{formatAdoptionDate(adoption.date)}</td>
                  <td>
                    <AdoptionStatusBadge status={adoption.status} />
                  </td>
                  <td>
                    <Link
                      to={`/adopciones/${adoption.id}`}
                      className="pet-table__action"
                      aria-label={`Ver detalle de la adopción de ${getAdoptionPetName(adoption)}`}
                    >
                      Ver detalle
                    </Link>
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
