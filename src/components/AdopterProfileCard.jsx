import { Link } from 'react-router-dom';
import AdopterDataCard from './AdopterDataCard';
import useAdopterDelete from '../hooks/useAdopterDelete';

export default function AdopterProfileCard({ adopter, showEdit = false }) {
const { deleting, error, remove } = useAdopterDelete(adopter);

return (
    <AdopterDataCard adopter={adopter} error={error}>
    {showEdit && (
        <Link to={`/adoptantes/${adopter.id}/editar`} className="btn-outline-brand">
        Editar mis datos
        </Link>
    )}
    <button
        type="button"
        className="btn-outline-brand adopter-delete-btn"
        disabled={deleting}
        onClick={remove}
    >
        Eliminar mi cuenta
    </button>
    </AdopterDataCard>
);
}
