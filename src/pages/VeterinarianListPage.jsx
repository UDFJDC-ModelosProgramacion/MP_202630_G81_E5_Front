import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Loader from '../components/Loader';
import VeterinarianTable from '../components/VeterinarianTable';
import useVeterinarians from '../hooks/useVeterinarians';
import { isNotFound } from '../services/apiError';
import { deleteVeterinarian } from '../services/veterinarianService';
import { getVeterinarianDeleteErrorMessage } from '../utils/veterinarianMessages';

export default function VeterinarianListPage() {
  const { veterinarians, loading, error, reload, removeVeterinarian } = useVeterinarians();
  const location = useLocation();
  const [feedback, setFeedback] = useState(() =>
    location.state?.message ? { type: 'success', message: location.state.message } : null,
  );
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (veterinarian) => {
    if (
      !window.confirm(`¿Eliminar a ${veterinarian.name}? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    setFeedback(null);
    setDeletingId(veterinarian.id);
    try {
      await deleteVeterinarian(veterinarian.id);
      removeVeterinarian(veterinarian.id);
      setFeedback({
        type: 'success',
        message: `Veterinario ${veterinarian.name} eliminado correctamente.`,
      });
    } catch (deleteError) {
      if (isNotFound(deleteError)) removeVeterinarian(veterinarian.id);
      setFeedback({
        type: 'error',
        message: getVeterinarianDeleteErrorMessage(deleteError, veterinarian),
      });
    } finally {
      setDeletingId(null);
    }
  };

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