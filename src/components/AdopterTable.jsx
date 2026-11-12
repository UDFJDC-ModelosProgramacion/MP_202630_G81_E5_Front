import { Link } from 'react-router-dom';
import { displayValue } from '../utils/formatters';

export default function AdopterTable({ adopters, onDelete, deletingId = null }) {
const count = `Mostrando ${adopters.length} ${adopters.length === 1 ? 'adoptante' : 'adoptantes'}`;

return (
    <>
    <div className="pet-table-card">
        <div className="pet-table-scroll">
        <table className="pet-table adopter-table">
            <thead>
            <tr>
                <th scope="col">Adoptante</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {adopters.map((adopter) => (
                <tr key={adopter.id}>
                <td>
                    <span className="pet-table__name">{adopter.name}</span>
                </td>
                <td>{adopter.email}</td>
                <td>{displayValue(adopter.phone)}</td>
                <td>
                    <Link
                    to={`/adoptantes/${adopter.id}`}
                    className="pet-table__action"
                    aria-label={`Ver perfil de ${adopter.name}`}
                    >
                    Ver perfil
                    </Link>
                    <Link
                    to={`/adoptantes/${adopter.id}/editar`}
                    className="pet-table__action"
                    aria-label={`Editar ${adopter.name}`}
                    >
                    Editar
                    </Link>
                    {onDelete && (
                    <button
                        type="button"
                        className="pet-table__action pet-table__action--danger"
                        aria-label={`Eliminar ${adopter.name}`}
                        disabled={deletingId === adopter.id}
                        onClick={() => onDelete(adopter)}
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
