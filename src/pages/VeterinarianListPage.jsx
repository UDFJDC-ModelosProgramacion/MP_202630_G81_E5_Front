import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianTable from '../components/VeterinarianTable';
import useListDelete from '../hooks/useListDelete';
import useVeterinarians from '../hooks/useVeterinarians';
import { deleteVeterinarian } from '../services/veterinarianService';
import { getVeterinarianDeleteErrorMessage } from '../utils/veterinarianMessages';

export default function VeterinarianListPage() {
  const { veterinarians, loading, error, reload, removeVeterinarian } = useVeterinarians();
  const location = useLocation();
  const { deletingId, feedback, handleDelete } = useListDelete({
    initialFeedback: location.state?.message
      ? { type: 'success', message: location.state.message }
      : null,
    deleteItem: (veterinarian) => deleteVeterinarian(veterinarian.id),
    onRemoved: (veterinarian) => removeVeterinarian(veterinarian.id),
    confirmMessage: (veterinarian) =>
      `¿Eliminar a ${veterinarian.name}? Esta acción no se puede deshacer.`,
    successMessage: (veterinarian) => `Veterinario ${veterinarian.name} eliminado correctamente.`,
    getErrorMessage: getVeterinarianDeleteErrorMessage,
  });

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Veterinarios</h1>
          <p className="page-subtitle">Gestiona el equipo veterinario de los refugios.</p>
        </div>
        <Link to="/veterinarios/nuevo" className="btn-brand">
          + Registrar veterinario
        </Link>
      </div>

      {feedback && <AlertMessage variant={feedback.type}>{feedback.message}</AlertMessage>}

      {loading && <Loader label="Cargando veterinarios..." />}

      {!loading && error && (
        <>
          <AlertMessage>{error}</AlertMessage>
          <button type="button" className="btn-outline-brand" onClick={reload}>
            Reintentar
          </button>
        </>
      )}

      {!loading && !error && veterinarians.length === 0 && (
        <p className="empty-state">Aún no hay veterinarios registrados.</p>
      )}

      {!loading && !error && veterinarians.length > 0 && (
        <VeterinarianTable
          veterinarians={veterinarians}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </section>
  );
}